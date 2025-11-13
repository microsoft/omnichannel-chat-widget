import { BroadcastEvent, LogLevel, TelemetryEvent } from "../telemetry/TelemetryConstants";
import { ChatAdapter, ChatSDKMessage, GetAgentAvailabilityResponse, GetLiveChatTranscriptResponse, GetPersistentChatHistoryResponse, GetVoiceVideoCallingResponse, IFileInfo, IRawMessage, MaskingRules, OmnichannelChatSDK, VoiceVideoCallingOptionalParams } from "@microsoft/omnichannel-chat-sdk";
import { IFacadeChatSDKInput, PingResponse } from "./types/IFacadeChatSDKInput";
import { getAuthClientFunction, handleAuthentication } from "../../components/livechatwidget/common/authHelper";

import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import ChatAdapterOptionalParams from "@microsoft/omnichannel-chat-sdk/lib/core/messaging/ChatAdapterOptionalParams";
import ChatConfig from "@microsoft/omnichannel-chat-sdk/lib/core/ChatConfig";
import ChatReconnectContext from "@microsoft/omnichannel-chat-sdk/lib/core/ChatReconnectContext";
import ChatReconnectOptionalParams from "@microsoft/omnichannel-chat-sdk/lib/core/ChatReconnectOptionalParams";
import ChatTranscriptBody from "@microsoft/omnichannel-chat-sdk/lib/core/ChatTranscriptBody";
import EmailLiveChatTranscriptOptionaParams from "@microsoft/omnichannel-chat-sdk/lib/core/EmailLiveChatTranscriptOptionalParams";
import EndChatOptionalParams from "@microsoft/omnichannel-chat-sdk/lib/core/EndChatOptionalParams";
import FileMetadata from "@microsoft/omnichannel-amsclient/lib/FileMetadata";
import GetAgentAvailabilityOptionalParams from "@microsoft/omnichannel-chat-sdk/lib/core/GetAgentAvailabilityOptionalParams";
import GetChatTokenOptionalParams from "@microsoft/omnichannel-chat-sdk/lib/core/GetChatTokenOptionalParams";
import GetConversationDetailsOptionalParams from "@microsoft/omnichannel-chat-sdk/lib/core/GetConversationDetailsOptionalParams";
import GetLiveChatConfigOptionalParams from "@microsoft/omnichannel-chat-sdk/lib/core/GetLiveChatConfigOptionalParams";
import GetLiveChatTranscriptOptionalParams from "@microsoft/omnichannel-chat-sdk/lib/core/GetLiveChatTranscriptOptionalParams";
import GetPersistentChatHistoryOptionalParams from "@microsoft/omnichannel-chat-sdk/lib/core/GetPersistentChatHistoryOptionalParams";
import IChatToken from "@microsoft/omnichannel-chat-sdk/lib/external/IC3Adapter/IChatToken";
import IFileMetadata from "@microsoft/omnichannel-ic3core/lib/model/IFileMetadata";
import IMessage from "@microsoft/omnichannel-ic3core/lib/model/IMessage";
import IRawThread from "@microsoft/omnichannel-ic3core/lib/interfaces/IRawThread";
import InitializeOptionalParams from "@microsoft/omnichannel-chat-sdk/lib/core/InitializeOptionalParams";
import LiveWorkItemDetails from "@microsoft/omnichannel-chat-sdk/lib/core/LiveWorkItemDetails";
import OmnichannelMessage from "@microsoft/omnichannel-chat-sdk/lib/core/messaging/OmnichannelMessage";
import OnNewMessageOptionalParams from "@microsoft/omnichannel-chat-sdk/lib/core/messaging/OnNewMessageOptionalParams";
import { ParticipantsRemovedEvent } from "@azure/communication-signaling";
import PostChatContext from "@microsoft/omnichannel-chat-sdk/lib/core/PostChatContext";
import StartChatOptionalParams from "@microsoft/omnichannel-chat-sdk/lib/core/StartChatOptionalParams";
import { TelemetryHelper } from "../telemetry/TelemetryHelper";
import { isNullOrEmptyString } from "../utils";

export class FacadeChatSDK {
    private chatSDK: OmnichannelChatSDK;
    private chatConfig: ChatConfig;
    private token: string | "" | null = "";
    private expiration = 0;
    private isAuthenticated: boolean;
    private getAuthToken?: (authClientFunction?: string) => Promise<string | null>;
    private sdkMocked: boolean;
    private disableReauthentication: boolean;

    public isSDKMocked(): boolean {
        return this.sdkMocked;
    }

    public getChatSDK(): OmnichannelChatSDK {
        return this.chatSDK;
    }

    public destroy() {
        this.token = null;
        this.expiration = 0;
    }

    public isTokenSet() {
        return !isNullOrEmptyString(this.token);
    }

    constructor(input: IFacadeChatSDKInput, disableReauthentication: boolean) {
        this.chatSDK = input.chatSDK;
        this.chatConfig = input.chatConfig;
        this.getAuthToken = input.getAuthToken;
        this.isAuthenticated = input.isAuthenticated;
        this.sdkMocked = input.isSDKMocked;
        this.disableReauthentication = disableReauthentication;
    }

    //set default expiration to zero, for undefined or missed exp in jwt
    private convertExpiration(expiration = 0): number {
        // Converting expiration to seconds, if contains decimals or is identified as milliseconds
        if (expiration.toString().length === 13) {
            return Math.floor(expiration / 1000);
        }
        // If the epoch value is already in seconds, return it as is
        return expiration;
    }

    private isTokenExpired(): boolean {
        // if expiration is 0, token is not going to be validated ( this is to cover the case of token with no expiration)
        if (this.expiration === 0) {
            return false;
        }

        // obtain current time in seconds
        const now = Math.floor(Date.now() / 1000);

        // compare expiration time with current time
        if (now > this.expiration) {
            console.error("Token is expired", now, this.expiration, now > this.expiration);
            return true;
        }

        return false;
    }

    private enforceBase64Encoding(payload: string): string {
        //base64url when present, switches the "-" and "_" characters with "+" and "/"
        const base64Payload = payload.replace(/-/g, "+").replace(/_/g, "/");
        // since base64 encoding requires padding, we need to add padding to the payload
        return base64Payload.padEnd(base64Payload.length + (4 - base64Payload.length % 4) % 4, "=");
    }

    private extractExpFromToken(token: string): number {

        const tokenParts = token.split(".");
        const last3digits = token.slice(-3);

        // token must have 3 parts as JWT format
        if (tokenParts.length !== 3) {
            TelemetryHelper.logFacadeChatSDKEventToAllTelemetry(LogLevel.ERROR, {
                Event: TelemetryEvent.NewTokenValidationFailed,
                Description: "Invalid token format",
                ExceptionDetails: { message: "Invalid token format, must be in JWT format", token: last3digits }
            });
            throw new Error("Authentication Setup Error: Invalid token format, must be in JWT format");
        }

        try {
            const payload = this.enforceBase64Encoding(tokenParts[1]);
            // decode payload
            const decodedPayload = atob(payload);
            const jsonPayload = JSON.parse(decodedPayload);
            // check if exp is present in payload
            if (jsonPayload) {
                if (jsonPayload.exp) {
                    return jsonPayload.exp;
                }
                return 0;
            }
            TelemetryHelper.logFacadeChatSDKEventToAllTelemetry(LogLevel.ERROR, {
                Event: TelemetryEvent.NewTokenValidationFailed,
                Description: "Invalid token payload",
                ExceptionDetails: { message: "Token payload is not valid JSON", token: last3digits }
            });

            throw new Error("Authentication Setup Error: Invalid token payload, payload is not valid JSON");

        } catch (e) {
            console.error("Authentication Setup Error: Failed to decode token", e);
            TelemetryHelper.logFacadeChatSDKEventToAllTelemetry(LogLevel.ERROR, {
                Event: TelemetryEvent.NewTokenValidationFailed,
                Description: "Failed to decode token",
                ExceptionDetails: { message: "Failed to decode token", token: last3digits }
            });
            throw new Error("Authentication Setup Error: Failed to decode authentication token");
        }
    }

    private async setToken(token: string): Promise<void> {

        // token must be not null, and must be new
        if (!isNullOrEmptyString(token) && token !== this.token) {
            const last3digits = token.slice(-3);
            const instant = Math.floor(Date.now() / 1000);
            this.token = token;
            // calculate expiration time
            this.expiration = this.convertExpiration(this.extractExpFromToken(token) || 0);
            // this is a control , in case the getAuthToken function returns same token
            if (this.expiration > 0 && (this.expiration < instant)) {
                TelemetryHelper.logFacadeChatSDKEventToAllTelemetry(LogLevel.ERROR, {
                    Event: TelemetryEvent.NewTokenValidationFailed,
                    Description: "New token is already expired",
                    ExceptionDetails: {
                        "Instant": instant,
                        "Expiration": this.expiration,
                        "Token": last3digits,
                    }
                });
                throw new Error("Authentication Setup Error: New authentication token is already expired");
            }
        }
    }

    private async corroborateTokenIsSet(chatSDK: OmnichannelChatSDK): Promise<void> {

        // if getAuthToken is not set, it's because handleAuthentication hasnt being called
        // so we need to call it 
        if (this.isAuthenticated && chatSDK?.chatSDKConfig?.getAuthToken === undefined) {
            handleAuthentication(this.chatSDK, this.chatConfig, this.getAuthToken);
        }
    }
    private async tokenRing(): Promise<PingResponse> {

        if (this.disableReauthentication === true) {
            // Since we are not validating the token anymore, we at least need to check if the token is set
            // no need to validate anything other that the token is set
            await this.corroborateTokenIsSet(this.chatSDK);
            // facade feature is disabled, so we are bypassing the re authentication and let it fail.
            return { result: true, message: "Facade is disabled" };
        }

        // this is needed for storybooks, specifically for reconnect pane which requires authentication bypass
        if (this.sdkMocked === true) {
            return { result: true, message: "Authentication not needed" };
        }

        if (!this.isAuthenticated) {
            return { result: true, message: "Authentication not needed" };
        }

        if (this.isTokenSet() && !this.isTokenExpired()) {
            return { result: true, message: "Token is valid" };
        }

        TelemetryHelper.logFacadeChatSDKEventToAllTelemetry(LogLevel.INFO, {
            Event: TelemetryEvent.NewTokenValidationStarted,
            Description: "Token validation started."
        });

        if (this.getAuthToken === undefined && this.chatSDK.chatSDKConfig?.getAuthToken === undefined) {
            TelemetryHelper.logFacadeChatSDKEventToAllTelemetry(LogLevel.ERROR, {
                Event: TelemetryEvent.NewTokenValidationFailed,
                Description: "GetAuthToken function is not present",
                ExceptionDetails: "Missing function : " + getAuthClientFunction(this.chatConfig)
            });

            return { result: false, message: "GetAuthToken function is not present" };
        }

        // if token is not set, or token is already expired , then go to grab a token
        this.token = "";
        this.expiration = 0;

        try {

            const ring = await handleAuthentication(this.chatSDK, this.chatConfig, this.getAuthToken);

            if (ring?.result === true && ring?.token) {
                await this.setToken(ring.token);

                TelemetryHelper.logFacadeChatSDKEventToAllTelemetry(LogLevel.INFO, {
                    Event: TelemetryEvent.NewTokenValidationCompleted,
                    Description: "New Token obtained",
                    Data: {
                        "Token_Expiration": this.expiration
                    }
                });
                return { result: true, message: "New Token obtained" };
            } else {
                TelemetryHelper.logFacadeChatSDKEventToAllTelemetry(LogLevel.ERROR, {
                    Event: TelemetryEvent.NewTokenValidationFailed,
                    Description: ring.error?.message,
                    ExceptionDetails: ring?.error
                });
                return {
                    result: false,
                    message: ring?.error?.message || "Failed to get token"
                };
            }
        } catch (e: unknown) {
            console.error("Unexpected error while getting token", e);
            TelemetryHelper.logFacadeChatSDKEventToAllTelemetry(LogLevel.ERROR, {
                Event: TelemetryEvent.NewTokenValidationFailed,
                Description: "Unexpected error while getting token",
                ExceptionDetails: e
            });
            return { result: false, message: "Unexpected error while getting token" };
        }
    }

    private async validateAndExecuteCall<T>(functionName: string, fn: () => Promise<T>): Promise<T> {
        const pingResponse = await this.tokenRing();
        if (pingResponse.result === true) {
            return fn();
        }

        const executionErrorMessage = "Authentication Setup Error: Token validation failed - GetAuthToken function is not present";
        //telemetry is already logged in tokenRing, so no need to log again, just return the error and communicate to the console
        console.error(`${executionErrorMessage} Additional details: Process to get a token failed for ${functionName}, ${pingResponse.message}`);
        BroadcastService.postMessage({
            eventName: BroadcastEvent.OnWidgetError,
            payload: {
                errorMessage: executionErrorMessage,
            }
        });
        throw new Error(executionErrorMessage);
    }

    public async initialize(optionalParams: InitializeOptionalParams = {}): Promise<ChatConfig> {
        return this.validateAndExecuteCall("initialize", () => this.chatSDK.initialize(optionalParams));
    }

    public async getChatReconnectContext(optionalParams: ChatReconnectOptionalParams = {}): Promise<ChatReconnectContext> {
        return this.validateAndExecuteCall("getChatReconnectContext", () => this.chatSDK.getChatReconnectContext(optionalParams));
    }

    public async startChat(optionalParams: StartChatOptionalParams = {}): Promise<void> {
        return this.validateAndExecuteCall("startChat", () => this.chatSDK.startChat(optionalParams));
    }

    public async endChat(optionalParams: EndChatOptionalParams = {}): Promise<void> {
        return this.validateAndExecuteCall("endChat", () => this.chatSDK.endChat(optionalParams));
    }

    public async getCurrentLiveChatContext(): Promise<object> {
        return this.validateAndExecuteCall("getCurrentLiveChatContext", () => this.chatSDK.getCurrentLiveChatContext());
    }

    public async getConversationDetails(optionalParams: GetConversationDetailsOptionalParams = {}): Promise<LiveWorkItemDetails> {
        return this.validateAndExecuteCall("getConversationDetails", () => this.chatSDK.getConversationDetails(optionalParams));
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async getPreChatSurvey(parse = true): Promise<any> {
        //prechat survey is obtained from config object, which is not required to be authenticated
        // removing the tokenRing function from this call for backward compatibility
        // TODO ::  wrap this function around authentication
        return this.chatSDK.getPreChatSurvey(parse);
    }

    public async getLiveChatConfig(optionalParams?: GetLiveChatConfigOptionalParams): Promise<ChatConfig> {
        return this.validateAndExecuteCall("getLiveChatConfig", () => this.chatSDK.getLiveChatConfig(optionalParams));
    }

    public async getChatToken(cached = true, optionalParams?: GetChatTokenOptionalParams): Promise<IChatToken> {
        return this.validateAndExecuteCall("getChatToken", () => this.chatSDK.getChatToken(cached, optionalParams));
    }

    public async getCallingToken(): Promise<string> {
        return this.validateAndExecuteCall("getCallingToken", () => this.chatSDK.getCallingToken());
    }

    public async getMessages(): Promise<IMessage[] | OmnichannelMessage[] | undefined> {
        return this.validateAndExecuteCall("getMessages", () => this.chatSDK.getMessages());
    }

    public async getDataMaskingRules(): Promise<MaskingRules> {
        return this.validateAndExecuteCall("getDataMaskingRules", () => this.chatSDK.getDataMaskingRules());
    }

    public async sendMessage(message: ChatSDKMessage): Promise<void | OmnichannelMessage> {
        return this.validateAndExecuteCall("sendMessage", () => this.chatSDK.sendMessage(message));
    }

    public async onNewMessage(onNewMessageCallback: CallableFunction, optionalParams: OnNewMessageOptionalParams = { disablePolling: false }): Promise<void> {
        return this.validateAndExecuteCall("onNewMessage", () => this.chatSDK.onNewMessage(onNewMessageCallback, optionalParams));
    }

    public async sendTypingEvent(): Promise<void> {
        return this.validateAndExecuteCall("sendTypingEvent", () => this.chatSDK.sendTypingEvent());
    }

    public async onTypingEvent(onTypingEventCallback: CallableFunction): Promise<void> {
        return this.validateAndExecuteCall("onTypingEvent", () => this.chatSDK.onTypingEvent(onTypingEventCallback));
    }

    public async onAgentEndSession(onAgentEndSessionCallback: (message: IRawThread | ParticipantsRemovedEvent) => void): Promise<void> {
        return this.validateAndExecuteCall("onAgentEndSession", () => this.chatSDK.onAgentEndSession(onAgentEndSessionCallback));
    }

    public async uploadFileAttachment(fileInfo: IFileInfo | File): Promise<IRawMessage | OmnichannelMessage> {
        return this.validateAndExecuteCall("uploadFileAttachment", () => this.chatSDK.uploadFileAttachment(fileInfo));
    }

    public async downloadFileAttachment(fileMetadata: FileMetadata | IFileMetadata): Promise<Blob> {
        return this.validateAndExecuteCall("downloadFileAttachment", () => this.chatSDK.downloadFileAttachment(fileMetadata));
    }

    public async emailLiveChatTranscript(body: ChatTranscriptBody, optionalParams: EmailLiveChatTranscriptOptionaParams = {}): Promise<void> {
        return this.validateAndExecuteCall("emailLiveChatTranscript", () => this.chatSDK.emailLiveChatTranscript(body, optionalParams));
    }

    public async getLiveChatTranscript(optionalParams: GetLiveChatTranscriptOptionalParams = {}): Promise<GetLiveChatTranscriptResponse> {
        return this.validateAndExecuteCall("getLiveChatTranscript", () => this.chatSDK.getLiveChatTranscript(optionalParams));
    }

    // response from origin is unknown, but this definition breaks create adapter for shimAdapter, switching to any until type is returned from origin
    public async createChatAdapter(optionalParams: ChatAdapterOptionalParams = {}): Promise<ChatAdapter> {
        return this.validateAndExecuteCall("createChatAdapter", () => this.chatSDK.createChatAdapter(optionalParams));
    }

    public async isVoiceVideoCallingEnabled(): Promise<boolean> {
        this.tokenRing();
        return this.chatSDK.isVoiceVideoCallingEnabled();
    }

    public async getVoiceVideoCalling(params: VoiceVideoCallingOptionalParams = {}): Promise<GetVoiceVideoCallingResponse> {
        return this.validateAndExecuteCall("getVoiceVideoCalling", () => this.chatSDK.getVoiceVideoCalling(params));
    }

    public async getPostChatSurveyContext(): Promise<PostChatContext> {
        return this.validateAndExecuteCall("getPostChatSurveyContext", () => this.chatSDK.getPostChatSurveyContext());
    }

    public async getAgentAvailability(optionalParams: GetAgentAvailabilityOptionalParams = {}): Promise<GetAgentAvailabilityResponse> {
        return this.validateAndExecuteCall("getAgentAvailability", () => this.chatSDK.getAgentAvailability(optionalParams));
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async getReconnectableChats(reconnectableChatsParams: any = {}): Promise<any> {

        /**
         * 
         * This is a particular case, we dont expose getReconnectableChats in the SDK,
         * The only way to use is by tunneling directly from the SDK to OCSDK,
         * 
         * In case of prechat, the function is called before any formal authentication is made, 
         * this is an specific case for persistent chats, to prevent the survey be loaded again for an on going chat,
         * 
         * In this case, we check for existance of the token , otherwise we perform the authentication, error is propagated in case of issues.
         * 
         * Once the token is obtained , this will be added to the params to call the function.
         * 
         * This is a particular case, should not be taken as pattern.
         *
         */

        if (this.token === null || this.token === "") {
            // If token is not set, try to get it using tokenRing
            const pingResponse = await this.tokenRing();
            if (pingResponse.result === false) {
                const errorMessage = "Authentication Setup Error: Token validation failed for reconnectable chats";
                //telemetry is already logged in tokenRing, so no need to log again, just return the error and communicate to the console
                console.error(`Authentication failed: Process to get a token failed for getReconnectableChats, ${pingResponse.message}`);
                BroadcastService.postMessage({
                    eventName: BroadcastEvent.OnWidgetError,
                    payload: {
                        errorMessage: errorMessage,
                    }
                });
                throw new Error(errorMessage);
            }
        }
        
        // Always override the token in params regardless of how getReconnectableChats was called
        reconnectableChatsParams.authenticatedUserToken = this.token;
        
        return this.validateAndExecuteCall("getReconnectableChats", () => this.chatSDK.OCClient.getReconnectableChats(reconnectableChatsParams));

    }

    public async fetchPersistentConversationHistory(getPersistentChatHistoryOptionalParams: GetPersistentChatHistoryOptionalParams = {}): Promise<GetPersistentChatHistoryResponse> {
        return this.validateAndExecuteCall("getPersistentChatHistory", () => this.chatSDK.getPersistentChatHistory(getPersistentChatHistoryOptionalParams));
    }

    public async sendReadReceipt(messageId: string): Promise<void> {
        return this.validateAndExecuteCall("sendReadReceipt", () => this.chatSDK.sendReadReceipt(messageId));
    }
}
