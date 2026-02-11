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

    // Stays true so CASE 1 re-triggers on every startChat to set deferInitialAuth
    private pendingMidAuthUnauthenticatedState = false;

    // Checks msdyn_authenticatedsigninoptional flag in chatConfig
    private isMidAuthEnabled(): boolean {
        const value = (this.chatConfig as ChatConfig)?.LiveWSAndLiveChatEngJoin?.msdyn_authenticatedsigninoptional;
        return value?.toString?.().toLowerCase?.() === "true";
    }

    public isSDKMocked(): boolean {
        return this.sdkMocked;
    }

    public getChatSDK(): OmnichannelChatSDK {
        return this.chatSDK;
    }

    public destroy() {
        this.token = null;
        this.expiration = 0;
        if (this.isMidAuthEnabled()) {
            this.pendingMidAuthUnauthenticatedState = false;
            this.isAuthenticated = true;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (this.chatSDK as any).deferInitialAuth = false;
        }
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

    /**
     * Validates if a token is expired without storing it.
     * Returns true if token is expired or invalid, false if valid.
     */
    private isTokenExpiredByValue(token: string): boolean {
        if (isNullOrEmptyString(token)) {
            return true;
        }

        try {
            const tokenExpiration = this.convertExpiration(this.extractExpFromToken(token) || 0);

            if (tokenExpiration === 0) {
                return false;
            }

            const now = Math.floor(Date.now() / 1000);
            return now > tokenExpiration;
        } catch (e) {
            // If we can't parse the token, consider it invalid/expired
            console.error("[LCW][FacadeChatSDK][isTokenExpiredByValue] Failed to parse token", e);
            return true;
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

        // Token missing or expired - need to get a new one via getAuthToken
        // For mid-auth: getAuthToken receives { isMidAuthEnabled: true } so customer implementations
        // can check portal state and return null for logged-out users
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
            }

            // Mid-auth: no token available - set pending flag for startChat to handle
            const isEmptyTokenWithoutError = isNullOrEmptyString(ring?.token) &&
                (ring?.result === true || (ring?.result === false && !ring?.error));

            if (this.isMidAuthEnabled() && isEmptyTokenWithoutError) {
                // Clear Facade and SDK token state so API calls use unauthenticated endpoints
                this.token = "";
                this.expiration = 0;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (this.chatSDK as any).authenticatedUserToken = null;

                this.pendingMidAuthUnauthenticatedState = true;

                TelemetryHelper.logFacadeChatSDKEventToAllTelemetry(LogLevel.INFO, {
                    Event: TelemetryEvent.NewTokenValidationCompleted,
                    Description: "Mid-auth enabled: no token returned; proceeding as unauthenticated"
                });

                return { result: true, message: "Mid-auth: proceeding as unauthenticated" };
            }

            TelemetryHelper.logFacadeChatSDKEventToAllTelemetry(LogLevel.ERROR, {
                Event: TelemetryEvent.NewTokenValidationFailed,
                Description: ring.error?.message,
                ExceptionDetails: ring?.error
            });
            return {
                result: false,
                message: ring?.error?.message || "Failed to get token"
            };
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

    /**
     * Sets unauthenticated state for mid-auth flow.
     * Clears SDK internal state to prevent reconnection to previous authenticated session.
     */
    private setMidAuthUnauthenticatedState(): void {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sdk = this.chatSDK as any;
        const hadExistingChat = !!sdk.chatToken?.chatId;
        const previousChatId = sdk.chatToken?.chatId;

        this.clearAuthState();

        // Clear SDK internal state for fresh unauthenticated chat
        sdk.chatToken = {};
        sdk.reconnectId = null;
        sdk.requestId = null;
        sdk.sessionId = null;
        sdk.conversation = null;

        if (hadExistingChat) {
            TelemetryHelper.logFacadeChatSDKEventToAllTelemetry(LogLevel.INFO, {
                Event: TelemetryEvent.MidConversationAuthReset,
                Description: "Mid-auth without token: local state cleared",
                Data: { previousChatId }
            });
        }
    }

    /** Clears authentication state in both FacadeChatSDK and underlying SDK */
    private clearAuthState(): void {
        this.token = "";
        this.expiration = 0;
        this.isAuthenticated = false;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this.chatSDK as any).authenticatedUserToken = null;
    }

    /** Handles authentication errors with consistent logging and broadcasting */
    private handleAuthError(logMessage: string, description: string, error: unknown): void {
        console.error(logMessage, error);
        TelemetryHelper.logFacadeChatSDKEventToAllTelemetry(LogLevel.ERROR, {
            Event: TelemetryEvent.MidConversationAuthFailed,
            Description: description,
            ExceptionDetails: { message: (error as Error)?.message }
        });
        BroadcastService.postMessage({
            eventName: BroadcastEvent.OnWidgetError,
            payload: { errorMessage: (error as Error)?.message || description }
        });
    }

    /**
     * Migrates conversation from unauthenticated to authenticated via authenticateChat.
     * Called after startChat() when user has a valid token but the backend conversation
     * was started as unauthenticated.
     */
    private async migrateConversationToAuthenticated(): Promise<void> {
        try {
            await this.chatSDK.authenticateChat(this.token as string, { refreshChatToken: true });
            this.isAuthenticated = true;

            TelemetryHelper.logFacadeChatSDKEventToAllTelemetry(LogLevel.INFO, {
                Event: TelemetryEvent.MidConversationAuthSucceeded,
                Description: "Mid-auth: authenticateChat completed, conversation migrated to authenticated"
            });
        } catch (e) {
            // Non-fatal: Chat is already active via startChat, will retry on next reconnect
            TelemetryHelper.logFacadeChatSDKEventToAllTelemetry(LogLevel.WARN, {
                Event: TelemetryEvent.MidConversationAuthFailed,
                Description: "Mid-auth: authenticateChat returned error after startChat, chat still active",
                ExceptionDetails: { message: (e as Error)?.message }
            });
        }
    }

    /**
     * Configures SDK auth state before startChat.
     * CASE 1: Pending unauthenticated (no token) - sets deferInitialAuth=true
     * CASE 2: Authenticated with valid token - sets SDK token and deferInitialAuth based on scenario
     */
    private async configureMidAuthState(
        isReconnect: boolean,
        wasPreviousSessionAuthenticated: boolean
    ): Promise<{ shouldClearReconnectParams: boolean }> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sdk = this.chatSDK as any;

        // CASE 1: No token available (user not logged in)
        // pendingMidAuthUnauthenticatedState stays true until user logs in (cleared in tokenRing)
        if (this.pendingMidAuthUnauthenticatedState) {
            const shouldClear = this.handlePendingUnauthenticatedState(wasPreviousSessionAuthenticated);
            sdk.deferInitialAuth = true;
            return { shouldClearReconnectParams: shouldClear };
        }

        // CASE 2: Authenticated with valid token
        if (this.isTokenSet() && !this.isTokenExpired()) {
            this.handleAuthenticatedState(isReconnect, wasPreviousSessionAuthenticated);
        }

        return { shouldClearReconnectParams: false };
    }

    /**
     * CASE 1 handler: Returns true if reconnect params should be cleared (Auth -> Unauth transition)
     */
    private handlePendingUnauthenticatedState(wasPreviousSessionAuthenticated: boolean): boolean {
        if (wasPreviousSessionAuthenticated) {
            // Auth -> Unauth: user logged out, clear state for fresh chat
            this.setMidAuthUnauthenticatedState();
            return true;
        }

        // Unauth -> Unauth: keep liveChatContext for reconnection
        this.isAuthenticated = false;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this.chatSDK as any).authenticatedUserToken = null;
        return false;
    }

    /**
     * CASE 2 handler: Sets deferInitialAuth only for reconnects to unauthenticated sessions (need migration).
     * For new chats or reconnects to authenticated sessions, SDK handles auth internally.
     */
    private handleAuthenticatedState(
        isReconnect: boolean,
        wasPreviousSessionAuthenticated: boolean
    ): void {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sdk = this.chatSDK as any;

        sdk.authenticatedUserToken = this.token;

        if (isReconnect && !wasPreviousSessionAuthenticated) {
            sdk.deferInitialAuth = true;
        } else {
            // Reset to prevent inheriting deferInitialAuth=true from a previous unauthenticated chat
            sdk.deferInitialAuth = false;
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
        const midAuthEnabled = this.isMidAuthEnabled();
        const isReconnect = !!optionalParams.liveChatContext || !!optionalParams.reconnectId;
        const wasPreviousSessionAuthenticated = optionalParams.wasAuthenticated === true;

        return this.validateAndExecuteCall("startChat", async () => {

            if (midAuthEnabled) {
                const { shouldClearReconnectParams } = await this.configureMidAuthState(
                    isReconnect,
                    wasPreviousSessionAuthenticated
                );

                if (shouldClearReconnectParams) {
                    delete optionalParams.liveChatContext;
                    delete optionalParams.reconnectId;
                }
            }

            await this.chatSDK.startChat(optionalParams);

            // Migrate to authenticated if needed (reconnects to unauthenticated sessions only)
            const shouldMigrateToAuth = midAuthEnabled &&
                                        isReconnect &&
                                        this.isTokenSet() &&
                                        !this.isTokenExpired() &&
                                        !wasPreviousSessionAuthenticated;

            if (shouldMigrateToAuth) {
                await this.migrateConversationToAuthenticated();
            }

            // Broadcast final auth state after startChat completes (only on state change)
            if (midAuthEnabled) {
                const isAuthenticatedAfterStart = this.isTokenSet() && !this.isTokenExpired();
                const authStateChanged = !isReconnect || (isAuthenticatedAfterStart !== wasPreviousSessionAuthenticated);

                if (authStateChanged) {
                    BroadcastService.postMessage({
                        eventName: isAuthenticatedAfterStart
                            ? BroadcastEvent.MidConversationAuthSucceeded
                            : BroadcastEvent.MidConversationAuthReset,
                        payload: {
                            isAuthenticated: isAuthenticatedAfterStart,
                            isStartChatComplete: true,
                            isReconnect
                        }
                    });
                }
            }
        });
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
                    }
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

    public async authenticateChat(tokenOrProvider: string | (() => Promise<string>), optionalParams: { refreshChatToken?: boolean } = {}): Promise<void> {
        TelemetryHelper.logFacadeChatSDKEventToAllTelemetry(LogLevel.INFO, {
            Event: TelemetryEvent.MidConversationAuthStarted,
            Description: "Authentication started"
        });

        // Resolve token
        let token: string;
        try {
            token = typeof tokenOrProvider === "string" ? tokenOrProvider : await tokenOrProvider();
        } catch (e) {
            this.handleAuthError("FAILED to resolve token", "Failed to resolve authentication token", e);
            throw e;
        }

        // Validate token
        if (this.isTokenExpiredByValue(token)) {
            const isEmpty = isNullOrEmptyString(token);
            const errorMessage = isEmpty
                ? "Authentication failed: Token is empty or null"
                : "Authentication Setup Error: Authentication token is already expired";

            this.token = "";
            this.expiration = 0;

            this.handleAuthError("Token validation failed", isEmpty ? "Token is empty or null" : "Token is already expired", new Error(errorMessage));
            throw new Error(errorMessage);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sdk = this.chatSDK as any;
        const hasChatStarted = !!sdk.chatToken?.chatId;

        try {
            if (hasChatStarted) {
                // SDK's authenticateChat sets sdk.authenticatedUserToken internally
                await this.chatSDK.authenticateChat(token, optionalParams);
            } else {
                // Pre-chat: set the token on SDK directly (authenticateChat not available yet)
                sdk.authenticatedUserToken = token;
            }

            await this.setToken(token);
            this.isAuthenticated = true;

            TelemetryHelper.logFacadeChatSDKEventToAllTelemetry(LogLevel.INFO, {
                Event: TelemetryEvent.MidConversationAuthSucceeded,
                Description: `${hasChatStarted ? "Mid-conversation" : "Pre-chat"} authentication succeeded`
            });

            BroadcastService.postMessage({
                eventName: BroadcastEvent.MidConversationAuthSucceeded,
                payload: { isAuthenticated: true, token, isPreChatAuth: !hasChatStarted }
            });
        } catch (e) {
            if (!hasChatStarted) {
                this.token = "";
                this.expiration = 0;
                sdk.authenticatedUserToken = null;
            }

            const errorMessage = (e as Error)?.message || `${hasChatStarted ? "Mid-conversation" : "Pre-chat"} authentication failed`;
            this.handleAuthError(`${hasChatStarted ? "Mid-chat" : "Pre-chat"} auth FAILED`, errorMessage, e);
            throw e;
        }
    }
}
