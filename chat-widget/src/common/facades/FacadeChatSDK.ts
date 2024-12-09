import { ChatSDKMessage, IFileInfo, IRawMessage, OmnichannelChatSDK } from "@microsoft/omnichannel-chat-sdk";
import { IFacadeChatSDKInput, PingResponse } from "./types/IFacadeChatSDKInput";
import { LogLevel, TelemetryEvent } from "../telemetry/TelemetryConstants";
import { getAuthClientFunction, handleAuthentication } from "../../components/livechatwidget/common/authHelper";

import ChatAdapterOptionalParams from "@microsoft/omnichannel-chat-sdk/lib/core/messaging/ChatAdapterOptionalParams";
import ChatConfig from "@microsoft/omnichannel-chat-sdk/lib/core/ChatConfig";
import ChatReconnectContext from "@microsoft/omnichannel-chat-sdk/lib/core/ChatReconnectContext";
import ChatReconnectOptionalParams from "@microsoft/omnichannel-chat-sdk/lib/core/ChatReconnectOptionalParams";
import ChatTranscriptBody from "@microsoft/omnichannel-chat-sdk/lib/core/ChatTranscriptBody";
import EmailLiveChatTranscriptOptionaParams from "@microsoft/omnichannel-chat-sdk/lib/core/EmailLiveChatTranscriptOptionalParams";
import FileMetadata from "@microsoft/omnichannel-amsclient/lib/FileMetadata";
import GetAgentAvailabilityOptionalParams from "@microsoft/omnichannel-chat-sdk/lib/core/GetAgentAvailabilityOptionalParams";
import GetChatTokenOptionalParams from "@microsoft/omnichannel-chat-sdk/lib/core/GetChatTokenOptionalParams";
import GetConversationDetailsOptionalParams from "@microsoft/omnichannel-chat-sdk/lib/core/GetConversationDetailsOptionalParams";
import GetLiveChatConfigOptionalParams from "@microsoft/omnichannel-chat-sdk/lib/core/GetLiveChatConfigOptionalParams";
import GetLiveChatTranscriptOptionalParams from "@microsoft/omnichannel-chat-sdk/lib/core/GetLiveChatTranscriptOptionalParams";
import IChatToken from "@microsoft/omnichannel-chat-sdk/lib/external/IC3Adapter/IChatToken";
import IFileMetadata from "@microsoft/omnichannel-ic3core/lib/model/IFileMetadata";
import IMessage from "@microsoft/omnichannel-ic3core/lib/model/IMessage";
import IRawThread from "@microsoft/omnichannel-ic3core/lib/interfaces/IRawThread";
import InitializeOptionalParams from "@microsoft/omnichannel-chat-sdk/lib/core/InitializeOptionalParams";
import LiveWorkItemDetails from "@microsoft/omnichannel-chat-sdk/lib/core/LiveWorkItemDetails";
import OmnichannelMessage from "@microsoft/omnichannel-chat-sdk/lib/core/messaging/OmnichannelMessage";
import OnNewMessageOptionalParams from "@microsoft/omnichannel-chat-sdk/lib/core/messaging/OnNewMessageOptionalParams";
import { ParticipantsRemovedEvent } from "@azure/communication-signaling";
import StartChatOptionalParams from "@microsoft/omnichannel-chat-sdk/lib/core/StartChatOptionalParams";
import { TelemetryHelper } from "../telemetry/TelemetryHelper";
import { isNullOrEmptyString } from "../utils";
import EndChatOptionalParams from "@microsoft/omnichannel-chat-sdk/lib/core/EndChatOptionalParams";

export class FacadeChatSDK {
    private chatSDK: OmnichannelChatSDK;
    private chatConfig: ChatConfig;
    private token: string | "" | null = "";
    private expiration = 0;
    private isAuthenticated: boolean;
    private getAuthToken?: (authClientFunction?: string) => Promise<string | null>;

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

    constructor(input: IFacadeChatSDKInput) {
        this.chatSDK = input.chatSDK;
        this.chatConfig = input.chatConfig;
        this.getAuthToken = input.getAuthToken;
        this.isAuthenticated = input.isAuthenticated;
    }

    private convertExpiration(expiration: number): number {
        // if expiration is not an integer, then it is in milliseconds, convert it to seconds
        const expStr = Number.isInteger(expiration);
        if (!expStr) {
            return Math.floor(expiration / 1000);
        }
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
            return true;
        }
        return false;
    }

    private async setToken(token: string): Promise<void> {
        // token must be not null, and must be new
        if (!isNullOrEmptyString(token) && token !== this.token) {
            const instant = Math.floor(Date.now() / 1000);
            this.token = token;
            // decompose token
            const tokenParts = this.token?.split(".");

            if (!tokenParts || tokenParts.length === 0) {
                TelemetryHelper.logFacadeChatSDKEvent(LogLevel.ERROR, {
                    Event: TelemetryEvent.NewTokenFailed,
                    Description: "Invalid token format",
                    ExceptionDetails: "Token must be in JWT format"
                });
                throw new Error("Invalid token format, must be in JWT format");
            }
            // decode token
            const tokenDecoded = JSON.parse(atob(tokenParts[1]));
            // calculate expiration time
            this.expiration = this.convertExpiration(tokenDecoded.exp);
            // this is a control , in case the getAuthToken function returns same token
            if (this.expiration > 0 && (this.expiration < instant)) {

                TelemetryHelper.logFacadeChatSDKEvent(LogLevel.ERROR, {
                    Event: TelemetryEvent.NewTokenExpired,
                    Description: "New token is already expired",
                    ExceptionDetails: {
                        "Instant": instant,
                        "Expiration": this.expiration
                    }
                });
                throw new Error("New token is already expired, with epoch time " + this.expiration);
            }
        }
    }

    private async tokenRing(): Promise<PingResponse> {

        if (!this.isAuthenticated) {
            return { result: true, message: "Authentication not needed" };
        }

        if (this.isTokenSet() && !this.isTokenExpired()) {
            return { result: true, message: "Token is valid" };
        }

        if (this.getAuthToken) {
            TelemetryHelper.logFacadeChatSDKEvent(LogLevel.ERROR, {
                Event: TelemetryEvent.NewTokenFailed,
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
            if (ring.result === true && ring.token) {
                await this.setToken(ring.token);

                TelemetryHelper.logFacadeChatSDKEvent(LogLevel.INFO, {
                    Event: TelemetryEvent.NewTokenSuccess,
                    Description: "New Token obtained",
                    Data: {
                        "Token_Expiration": this.expiration
                    }

                });
                return { result: true, message: "New Token obtained" };
            } else {

                console.error("Failed to get token", ring);

                TelemetryHelper.logFacadeChatSDKEvent(LogLevel.ERROR, {
                    Event: TelemetryEvent.NewTokenFailed,
                    Description: ring.error?.message,
                    ExceptionDetails: ring.error

                });
                return {
                    result: false,
                    message: ring.error?.message || "Failed to get token"
                };
            }

        } catch (e: unknown) {

            console.error("Unexpected error while getting token", e);

            TelemetryHelper.logFacadeChatSDKEvent(LogLevel.ERROR, {
                Event: TelemetryEvent.NewTokenFailed,
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

        //telemetry is already logged in tokenRing, so no need to log again, just return the error and communicate to the console
        console.error("Authentication failed : Process to get a token failed for :" + functionName, pingResponse.message);

        throw new Error("Authentication failed : Process to get a token failed for :" + functionName + " : " + pingResponse.message);
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

    public async endChat(optionalParams : EndChatOptionalParams = {}): Promise<void> {
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async getDataMaskingRules(): Promise<any> {
        return this.validateAndExecuteCall("getDataMaskingRules", () => this.chatSDK.getDataMaskingRules());
    }

    public async sendMessage(message: ChatSDKMessage): Promise<void> {
        return this.validateAndExecuteCall("sendMessage", () => this.chatSDK.sendMessage(message));
    }

    public async onNewMessage(onNewMessageCallback: CallableFunction, optionalParams: OnNewMessageOptionalParams | unknown = {}): Promise<void> {
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async emailLiveChatTranscript(body: ChatTranscriptBody, optionalParams: EmailLiveChatTranscriptOptionaParams = {}): Promise<any> {
        return this.validateAndExecuteCall("emailLiveChatTranscript", () => this.chatSDK.emailLiveChatTranscript(body, optionalParams));
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async getLiveChatTranscript(optionalParams: GetLiveChatTranscriptOptionalParams = {}): Promise<any> {
        return this.validateAndExecuteCall("getLiveChatTranscript", () => this.chatSDK.getLiveChatTranscript(optionalParams));
    }

    public async createChatAdapter(optionalParams: ChatAdapterOptionalParams = {}): Promise<unknown> {
        return this.validateAndExecuteCall("createChatAdapter", () => this.chatSDK.createChatAdapter(optionalParams));
    }

    public async isVoiceVideoCallingEnabled(): Promise<boolean> {
        this.tokenRing();
        return this.chatSDK.isVoiceVideoCallingEnabled();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async getVoiceVideoCalling(params: any = {}): Promise<any> {
        return this.validateAndExecuteCall("getVoiceVideoCalling", () => this.chatSDK.getVoiceVideoCalling(params));
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async getPostChatSurveyContext(): Promise<any> {
        return this.validateAndExecuteCall("getPostChatSurveyContext", () => this.chatSDK.getPostChatSurveyContext());
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async getAgentAvailability(optionalParams: GetAgentAvailabilityOptionalParams = {}): Promise<any> {
        return this.validateAndExecuteCall("getAgentAvailability", () => this.chatSDK.getAgentAvailability(optionalParams));
    }


}


