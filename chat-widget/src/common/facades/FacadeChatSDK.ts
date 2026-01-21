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
    
    // Flag set by tokenRing() when mid-auth fallback to unauthenticated is needed
    // This defers the actual state change to startChat() where we can check if it's a reconnect
    private pendingMidAuthUnauthenticatedState = false;
    
    /**
     * Mid-auth enabled check based on chatConfig.
     * Mid-auth flag lives under LiveWSAndLiveChatEngJoin.msdyn_authenticatedsigninoptional.
     */
    private isMidAuthEnabled(): boolean {
        const value = (this.chatConfig as any)?.LiveWSAndLiveChatEngJoin?.msdyn_authenticatedsigninoptional;
        return value?.toString?.().toLowerCase?.() === "true";
    }

    public isSDKMocked(): boolean {
        return this.sdkMocked;
    }

    public getChatSDK(): OmnichannelChatSDK {
        return this.chatSDK;
    }

    public destroy() {
        console.info("[LCW][FacadeChatSDK][destroy] Clearing authentication state");
        this.token = null;
        this.expiration = 0;
    }

    public isTokenSet() {
        console.info("[LCW][FacadeChatSDK][isTokenSet] invoked");
        return !isNullOrEmptyString(this.token);
    }

    constructor(input: IFacadeChatSDKInput, disableReauthentication: boolean) {
        console.info("[LCW][FacadeChatSDK][constructor]", {
            hasGetAuthToken: !!input.getAuthToken,
            isAuthenticated: input.isAuthenticated,
            isSDKMocked: input.isSDKMocked,
            disableReauthentication: disableReauthentication
        });
        this.chatSDK = input.chatSDK;
        this.chatConfig = input.chatConfig;
        this.getAuthToken = input.getAuthToken;
        this.isAuthenticated = input.isAuthenticated;
        this.sdkMocked = input.isSDKMocked;
        this.disableReauthentication = disableReauthentication;
    }

    //set default expiration to zero, for undefined or missed exp in jwt
    private convertExpiration(expiration = 0): number {
        console.info("[LCW][FacadeChatSDK][convertExpiration] invoked with expiration:", expiration);
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
        console.info("[LCW][FacadeChatSDK][setToken] invoked");
        // token must be not null, and must be new
        if (!isNullOrEmptyString(token) && token !== this.token) {
            console.info("[LCW][FacadeChatSDK][setToken] setting new token");
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
     * Validates if a token is expired without storing it
     * @param token JWT token to validate
     * @returns true if token is valid (not expired), false if expired
     */
    private isTokenExpiredByValue(token: string): boolean {
        if (isNullOrEmptyString(token)) {
            return true;
        }
        
        try {
            const tokenExpiration = this.convertExpiration(this.extractExpFromToken(token) || 0);
            
            // If expiration is 0, token doesn't have expiration - consider it valid
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
        console.info("[LCW][FacadeChatSDK][corroborateTokenIsSet]", {
            isAuthenticated: this.isAuthenticated,
            hasChatSDKConfigGetAuthToken: !!chatSDK?.chatSDKConfig?.getAuthToken
        });

        // if getAuthToken is not set, it's because handleAuthentication hasnt being called
        // so we need to call it 
        if (this.isAuthenticated && chatSDK?.chatSDKConfig?.getAuthToken === undefined) {
            console.info("[LCW][FacadeChatSDK][corroborateTokenIsSet] calling handleAuthentication");
            handleAuthentication(this.chatSDK, this.chatConfig, this.getAuthToken);
        }
    }
    private async tokenRing(): Promise<PingResponse> {

        // Use console logging for local debugging (telemetry can be delayed/filtered).
        console.info("[LCW][FacadeChatSDK][tokenRing] START", {
            disableReauthentication: this.disableReauthentication,
            sdkMocked: this.sdkMocked,
            isAuthenticated: this.isAuthenticated,
            isTokenSet: this.isTokenSet(),
            isMidAuthEnabled: this.isMidAuthEnabled()
        });

        // Reset the pending flag at the start of each tokenRing call
        this.pendingMidAuthUnauthenticatedState = false;

        if (this.disableReauthentication === true) {
            console.info("[LCW][FacadeChatSDK][tokenRing] BRANCH: disableReauthentication=true");
            // Since we are not validating the token anymore, we at least need to check if the token is set
            // no need to validate anything other that the token is set
            await this.corroborateTokenIsSet(this.chatSDK);
            // facade feature is disabled, so we are bypassing the re authentication and let it fail.
            return { result: true, message: "Facade is disabled" };
        }

        // this is needed for storybooks, specifically for reconnect pane which requires authentication bypass
        if (this.sdkMocked === true) {
            console.info("[LCW][FacadeChatSDK][tokenRing] BRANCH: sdkMocked=true");
            return { result: true, message: "Authentication not needed" };
        }

        // If isAuthenticated is false, authentication is not required for this chat
        // This covers: unauthenticated chats, mid-auth before user authenticates, etc.
        if (!this.isAuthenticated) {
            console.info("[LCW][FacadeChatSDK][tokenRing] BRANCH: isAuthenticated=false - authentication not required for this chat");
            return { result: true, message: "Authentication not needed" };
        }

        if (this.isTokenSet() && !this.isTokenExpired()) {
            console.info("[LCW][FacadeChatSDK][tokenRing] BRANCH: token is set and valid");
            return { result: true, message: "Token is valid" };
        }

        console.info("[LCW][FacadeChatSDK][tokenRing] BRANCH: auth required - need to get token", {
            authClientFunction: getAuthClientFunction(this.chatConfig),
            hasPropGetAuthToken: this.getAuthToken !== undefined,
            hasSdkGetAuthToken: this.chatSDK?.chatSDKConfig?.getAuthToken !== undefined,
        });

        TelemetryHelper.logFacadeChatSDKEventToAllTelemetry(LogLevel.INFO, {
            Event: TelemetryEvent.NewTokenValidationStarted,
            Description: "Token validation started."
        });

        if (this.getAuthToken === undefined && this.chatSDK.chatSDKConfig?.getAuthToken === undefined) {
            console.info("[LCW][FacadeChatSDK][tokenRing] ERROR: GetAuthToken function is not present", {
                getAuthTokenFromProps: this.getAuthToken,
                getAuthTokenFromSDK: this.chatSDK.chatSDKConfig?.getAuthToken,
                authClientFunction: getAuthClientFunction(this.chatConfig)
            });
            
            TelemetryHelper.logFacadeChatSDKEventToAllTelemetry(LogLevel.ERROR, {
                Event: TelemetryEvent.NewTokenValidationFailed,
                Description: "GetAuthToken function is not present",
                ExceptionDetails: "Missing function : " + getAuthClientFunction(this.chatConfig)
            });

            return { result: false, message: "GetAuthToken function is not present" };
        }

        console.info("[LCW][FacadeChatSDK][tokenRing] invoking handleAuthentication", {
            using: this.getAuthToken !== undefined ? "props.getAuthToken" : "chatSDK.chatSDKConfig.getAuthToken",
            authClientFunction: getAuthClientFunction(this.chatConfig)
        });

        // if token is not set, or token is already expired , then go to grab a token
        this.token = "";
        this.expiration = 0;

        try {
            console.info("[LCW][FacadeChatSDK][tokenRing] calling handleAuthentication...");
            const ring = await handleAuthentication(this.chatSDK, this.chatConfig, this.getAuthToken);

            console.info("[LCW][FacadeChatSDK][tokenRing] handleAuthentication returned", {
                result: ring?.result,
                hasToken: !!ring?.token,
                tokenLength: ring?.token?.length || 0,
                error: ring?.error
            });

            if (ring?.result === true && ring?.token) {
                await this.setToken(ring.token);

                console.info("[LCW][FacadeChatSDK][tokenRing] SUCCESS: New Token obtained", {
                    expiration: this.expiration
                });

                TelemetryHelper.logFacadeChatSDKEventToAllTelemetry(LogLevel.INFO, {
                    Event: TelemetryEvent.NewTokenValidationCompleted,
                    Description: "New Token obtained",
                    Data: {
                        "Token_Expiration": this.expiration
                    }
                });
                return { result: true, message: "New Token obtained" };
            }

            // Mid-auth fallback: if mid-auth is enabled and handleAuthentication returned without a valid token,
            // set flag to defer state change to startChat() where we can check if it's a reconnect
            const isEmptyTokenWithoutError = isNullOrEmptyString(ring?.token) && 
                (ring?.result === true || (ring?.result === false && !ring?.error));
            
            if (this.isMidAuthEnabled() && isEmptyTokenWithoutError) {
                console.info("[LCW][FacadeChatSDK][tokenRing] Mid-auth enabled and no token returned - setting pending flag", {
                    result: ring?.result,
                    hasError: !!ring?.error
                });

                this.pendingMidAuthUnauthenticatedState = true;

                // Log as INFO since this is expected behavior for mid-auth
                TelemetryHelper.logFacadeChatSDKEventToAllTelemetry(LogLevel.INFO, {
                    Event: TelemetryEvent.NewTokenValidationCompleted,
                    Description: "Mid-auth enabled: no token returned; pending unauthenticated state"
                });

                return { result: true, message: "Mid-auth: no token returned; pending unauthenticated state" };
            }

            console.info("[LCW][FacadeChatSDK][tokenRing] FAILED: handleAuthentication did not return token", {
                result: ring?.result,
                errorMessage: ring?.error?.message
            });
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
     * Sets the state for mid-auth unauthenticated flow.
     * Called ONLY for new chats (not reconnects) when mid-auth is enabled but no token is available.
     * This prepares the SDK to start chat without authentication.
     */
    private setMidAuthUnauthenticatedState(): void {
        console.info("[LCW][FacadeChatSDK][setMidAuthUnauthenticatedState] Setting up unauthenticated state for mid-auth (new chat)");
        
        // Clear FacadeChatSDK and SDK auth state
        this.clearAuthState();
        
        // Clear additional SDK internal state for clean unauthenticated start
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sdk = this.chatSDK as any;
        sdk.chatToken = {};
        sdk.reconnectId = null;
        
        console.info("[LCW][FacadeChatSDK][setMidAuthUnauthenticatedState] State cleared for unauthenticated flow");

        // Broadcast to clear cached context for new unauthenticated chat
        BroadcastService.postMessage({
            eventName: BroadcastEvent.MidConversationAuthReset,
            payload: {
                isAuthenticated: false,
                reason: "Starting new unauthenticated chat",
                clearLiveChatContext: true
            }
        });
    }

    /**
     * Clears authentication state in both FacadeChatSDK and underlying SDK
     */
    private clearAuthState(): void {
        this.token = "";
        this.expiration = 0;
        this.isAuthenticated = false;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this.chatSDK as any).authenticatedUserToken = null;
    }

    /**
     * Handles authentication errors with consistent logging and broadcasting
     */
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

    private async validateAndExecuteCall<T>(functionName: string, fn: () => Promise<T>): Promise<T> {
        console.info(`[LCW][FacadeChatSDK][${functionName}] validateAndExecuteCall START`);
        const pingResponse = await this.tokenRing();
        
        console.info(`[LCW][FacadeChatSDK][${functionName}] tokenRing returned`, {
            result: pingResponse.result,
            message: pingResponse.message
        });

        if (pingResponse.result === true) {
            console.info(`[LCW][FacadeChatSDK][${functionName}] Executing SDK function...`);
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
        
        console.info("[LCW][FacadeChatSDK][startChat] START", {
            isAuthenticated: this.isAuthenticated,
            hasToken: this.isTokenSet(),
            isMidAuthEnabled: midAuthEnabled,
            hasLiveChatContext: !!optionalParams.liveChatContext
        });
        
        return this.validateAndExecuteCall("startChat", async () => {
            // MID-AUTH SPECIFIC: Only modify deferInitialAuth and auth state when mid-auth is enabled
            // This ensures existing behavior is not affected when mid-auth is disabled
            if (midAuthEnabled) {
                if (this.pendingMidAuthUnauthenticatedState) {
                    // For mid-auth: if no token is available, start as unauthenticated
                    // This handles the case where user was in an authenticated chat but logged out
                    console.info("[LCW][FacadeChatSDK][startChat] Mid-auth enabled - applying unauthenticated state for new chat");
                    this.setMidAuthUnauthenticatedState();
                    this.pendingMidAuthUnauthenticatedState = false;
                    (optionalParams as any).deferInitialAuth = true;
                    
                    // CRITICAL: Clear liveChatContext to prevent reconnect attempt with old authenticated chat
                    if (optionalParams.liveChatContext) {
                        console.info("[LCW][FacadeChatSDK][startChat] Clearing liveChatContext - cannot reconnect to auth chat without token");
                        delete (optionalParams as any).liveChatContext;
                    }
                } else if (this.isAuthenticated && this.isTokenSet() && !this.isTokenExpired()) {
                    // Mid-auth with valid token: authenticated flow
                    console.info("[LCW][FacadeChatSDK][startChat] Mid-auth enabled - authenticated flow with valid token");
                    (this.chatSDK as any).authenticatedUserToken = this.token;
                    (optionalParams as any).deferInitialAuth = false;
                }
            }
            // ELSE: EXISTING BEHAVIOR (mid-auth disabled)
            
            console.info("[LCW][FacadeChatSDK][startChat] Calling SDK startChat", {
                isAuthenticated: this.isAuthenticated,
                deferInitialAuth: (optionalParams as any)?.deferInitialAuth,
                hasLiveChatContext: !!optionalParams.liveChatContext
            });
            
            return this.chatSDK.startChat(optionalParams);
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
        const logPrefix = "[LCW][FacadeChatSDK][authenticateChat]";
        
        console.info(`${logPrefix} START`, { tokenOrProviderType: typeof tokenOrProvider });
        TelemetryHelper.logFacadeChatSDKEventToAllTelemetry(LogLevel.INFO, {
            Event: TelemetryEvent.MidConversationAuthStarted,
            Description: "Authentication started"
        });

        // Resolve token
        let token: string;
        try {
            token = typeof tokenOrProvider === "string" ? tokenOrProvider : await tokenOrProvider();
        } catch (e) {
            this.handleAuthError(`${logPrefix} FAILED to resolve token`, "Failed to resolve authentication token", e);
            throw e;
        }

        // Validate token
        if (this.isTokenExpiredByValue(token)) {
            const isEmpty = isNullOrEmptyString(token);
            const errorMessage = isEmpty 
                ? "Authentication failed: Token is empty or null"
                : "Authentication Setup Error: Authentication token is already expired";
            
            // Clear stale auth state if chat hasn't started
            if (!(this.chatSDK as any).chatToken?.chatId) {
                this.clearAuthState();
            }
            
            this.handleAuthError(`${logPrefix} Token validation failed`, isEmpty ? "Token is empty or null" : "Token is already expired", new Error(errorMessage));
            throw new Error(errorMessage);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const hasChatStarted = !!(this.chatSDK as any).chatToken?.chatId;

        try {
            if (hasChatStarted) {
                // MID-CONVERSATION AUTHENTICATION
                await this.chatSDK.authenticateChat(token, optionalParams);
            }
            
            // Common success path for both pre-chat and mid-chat
            await this.setToken(token);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (this.chatSDK as any).authenticatedUserToken = token;
            this.isAuthenticated = true;
            
            console.info(`${logPrefix} ${hasChatStarted ? "Mid-chat" : "Pre-chat"} auth SUCCESS`);
            TelemetryHelper.logFacadeChatSDKEventToAllTelemetry(LogLevel.INFO, {
                Event: TelemetryEvent.MidConversationAuthSucceeded,
                Description: `${hasChatStarted ? "Mid-conversation" : "Pre-chat"} authentication succeeded`
            });
            BroadcastService.postMessage({
                eventName: BroadcastEvent.MidConversationAuthSucceeded,
                payload: { isAuthenticated: true, token, isPreChatAuth: !hasChatStarted }
            });
        } catch (e) {
            // Clean up on failure only for pre-chat
            if (!hasChatStarted) {
                this.clearAuthState();
            }
            
            const errorMessage = (e as Error)?.message || `${hasChatStarted ? "Mid-conversation" : "Pre-chat"} authentication failed`;
            this.handleAuthError(`${logPrefix} ${hasChatStarted ? "Mid-chat" : "Pre-chat"} auth FAILED`, errorMessage, e);
            throw e;
        }
    }
}