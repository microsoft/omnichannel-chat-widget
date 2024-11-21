/* eslint-disable @typescript-eslint/no-explicit-any */

import { IFacadeChatSDKInput, PingResponse } from "./types/IFacadeChatSDKInput";
import { LogLevel, TelemetryEvent } from "../telemetry/TelemetryConstants";
import { getAuthClientFunction, handleAuthentication } from "../../components/livechatwidget/common/authHelper";

import ChatConfig from "@microsoft/omnichannel-chat-sdk/lib/core/ChatConfig";
import { OmnichannelChatSDK } from "@microsoft/omnichannel-chat-sdk";
import { TelemetryHelper } from "../telemetry/TelemetryHelper";
import { isNullOrEmptyString } from "../utils";

export class FacadeChatSDK {
    private chatSDK: any;
    private chatConfig: ChatConfig;
    private token!: any | "";
    private expiration = 0;
    private isAuthenticated!: boolean;
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
        const expStr = expiration.toString();
        if ((expStr.indexOf(".") > -1) && expStr.toString().length >= 13) {
            return Math.floor(expiration / 1000);
        }
        return expiration;
    }

    private isTokenExpired(): boolean {
        // obtain current time in seconds
        const now = Math.floor(Date.now() / 1000);
        // compare expiration time with current time
        if (now > this.expiration) {
            return true;
        }
        return false;
    }

    private async setToken(token: string | null): Promise<void> {
        // token must be not null, and must be new
        if (!isNullOrEmptyString(token) && token !== this.token) {
            const instant = Math.floor(Date.now() / 1000);
            this.token = token;
            // decompose token
            const tokenParts = this.token.split(".");
            // decode token
            const tokenDecoded = JSON.parse(atob(tokenParts[1]));
            // calculate expiration time
            this.expiration = this.convertExpiration(tokenDecoded.exp);
            // this is a control , in case the getAuthToken function returns same token
            if (this.expiration > 0 && (this.expiration < instant)) {

                TelemetryHelper.logFacadeChatSDKEvent(LogLevel.ERROR, {
                    Event: TelemetryEvent.FacadeChatSDKEvent,
                    Description: "New token is already expired",
                    ExceptionDetails: {
                        "Instant": instant,
                        "Expiration": this.expiration
                    }
                });

                throw new Error("New token is already expired, with epoch time " + this.expiration);
            }
        } else {

            TelemetryHelper.logFacadeChatSDKEvent(LogLevel.ERROR, {
                Event: TelemetryEvent.FacadeChatSDKEvent,
                Description: "Token is empty or auth function didn't provide a new valid token",
                ExceptionDetails: {
                    "EmptyToken": isNullOrEmptyString(token),
                    "SameToken": token === this.token,
                }
            });

            throw new Error("Token is empty or auth function didn't provide a new valid token");
        }
    }

    private async tokenRing(): Promise<PingResponse> {
        if (this.isAuthenticated) {
            if (this.isTokenExpired()) {
                this.token = "";
                this.expiration = 0;
                if (this.getAuthToken) {
                    try {
                        const ring = await handleAuthentication(this.chatSDK, this.chatConfig, this.getAuthToken);
                        if (ring.result === true && ring.token) {
                            await this.setToken(ring.token);

                            TelemetryHelper.logFacadeChatSDKEvent(LogLevel.INFO, {
                                Event: TelemetryEvent.FacadeChatSDKEvent,
                                Description: "New Token obtained",
                                Data: {
                                    "Token_Expiration": this.expiration
                                }

                            });
                            return { result: true, message: "New Token obtained" };
                        } else {

                            TelemetryHelper.logFacadeChatSDKEvent(LogLevel.ERROR, {
                                Event: TelemetryEvent.FacadeChatSDKEvent,
                                Description: "Token is empty or auth function didn't provide a new valid token",
                                ExceptionDetails: "Token is empty or auth function didn't provide a new valid token"

                            });
                            return {
                                result: false,
                                message: "Token is empty or auth function didn't provide a new valid token"
                            };
                        }

                    } catch (e: any) {

                        TelemetryHelper.logFacadeChatSDKEvent(LogLevel.ERROR, {
                            Event: TelemetryEvent.FacadeChatSDKEvent,
                            Description: "Unexpected error while getting token",
                            ExceptionDetails: e
                        });
                        return { result: false, message: "Unexpected error while getting token" };
                    }
                } else {

                    TelemetryHelper.logFacadeChatSDKEvent(LogLevel.ERROR, {
                        Event: TelemetryEvent.FacadeChatSDKEvent,
                        Description: "GetAuthToken function is not present",
                        ExceptionDetails: "Missing function : " + getAuthClientFunction(this.chatConfig)
                    });
                }
            }
            return { result: true, message: "Token is valid" };
        }

        return { result: true, message: "Authentication no needed" };
    }

    private async withTokenRing<T>(functionName: string, fn: () => Promise<T>): Promise<T> {

        const pingResponse = await this.tokenRing();

        if (pingResponse.result === true) {
            console.log("ELOPEZANAYA :: function name :: executed", functionName);
            return fn();
        }

        console.log("ELOPEZANAYA :: function name :: NOT executed", functionName);
        
        
        TelemetryHelper.logFacadeChatSDKEvent(LogLevel.ERROR, {
            Event: TelemetryEvent.FacadeChatSDKEvent,
            Description: "Authentication failed : Process to get a token failed",
            ExceptionDetails: {
                "Function": functionName,
                "Error": pingResponse.message
            }
        });
        return Promise.reject("Authentication failed : Process to get a token failed for :" + functionName);
    }

    public async initialize(optionalParams: any = {}): Promise<ChatConfig> {
        return this.withTokenRing("initialize", () => this.chatSDK.initialize(optionalParams));
    }

    public async getChatReconnectContext(optionalParams: any = {}): Promise<any> {
        return this.withTokenRing("getChatReconnectContext", () => this.chatSDK.getChatReconnectContext(optionalParams));
    }

    public async startChat(optionalParams: any = {}): Promise<void> {
        return this.withTokenRing("startChat", () => this.chatSDK.startChat(optionalParams));
    }

    public async endChat(): Promise<void> {
        return this.withTokenRing("endChat", () => this.chatSDK.endChat());
    }

    public async getCurrentLiveChatContext(): Promise<object> {
        return this.withTokenRing("getCurrentLiveChatContext", () => this.chatSDK.getCurrentLiveChatContext());
    }

    public async getConversationDetails(optionalParams: any = {}): Promise<any> {
        return this.withTokenRing("getConversationDetails", () => this.chatSDK.getConversationDetails(optionalParams));
    }

    public async getPreChatSurvey(parse = true): Promise<any> {
        return this.withTokenRing("getPreChatSurvey", () => this.chatSDK.getPreChatSurvey(parse));
    }

    public async getLiveChatConfig(optionalParams?: any): Promise<any> {
        return this.withTokenRing("getLiveChatConfig", () => this.chatSDK.getLiveChatConfig(optionalParams));
    }

    public async getChatToken(cached = true, optionalParams?: any): Promise<any> {
        return this.withTokenRing("getChatToken", () => this.chatSDK.getChatToken(cached, optionalParams));
    }

    public async getCallingToken(): Promise<string> {
        return this.withTokenRing("getCallingToken", () => this.chatSDK.getCallingToken());
    }

    public async getMessages(): Promise<any | undefined> {
        return this.withTokenRing("getMessages", () => this.chatSDK.getMessages());
    }

    public async getDataMaskingRules(): Promise<any> {
        return this.withTokenRing("getDataMaskingRules", () => this.chatSDK.getDataMaskingRules());
    }

    public async sendMessage(message: any): Promise<void> {
        return this.withTokenRing("sendMessage", () => this.chatSDK.sendMessage(message));
    }

    public async onNewMessage(onNewMessageCallback: CallableFunction, optionalParams: any | unknown = {}): Promise<void> {
        return this.withTokenRing("onNewMessage", () => this.chatSDK.onNewMessage(onNewMessageCallback, optionalParams));
    }

    public async sendTypingEvent(): Promise<void> {
        return this.withTokenRing("sendTypingEvent", () => this.chatSDK.sendTypingEvent());
    }

    public async onTypingEvent(onTypingEventCallback: CallableFunction): Promise<void> {
        return this.withTokenRing("onTypingEvent", () => this.chatSDK.onTypingEvent(onTypingEventCallback));
    }

    public async onAgentEndSession(onAgentEndSessionCallback: (message: any | any) => void): Promise<void> {
        return this.withTokenRing("onAgentEndSession", () => this.chatSDK.onAgentEndSession(onAgentEndSessionCallback));
    }

    public async uploadFileAttachment(fileInfo: any | File): Promise<any | any> {
        return this.withTokenRing("uploadFileAttachment", () => this.chatSDK.uploadFileAttachment(fileInfo));
    }

    public async downloadFileAttachment(fileMetadata: any | any): Promise<Blob> {
        return this.withTokenRing("downloadFileAttachment", () => this.chatSDK.downloadFileAttachment(fileMetadata));
    }

    public async emailLiveChatTranscript(body: any, optionalParams: any = {}): Promise<any> {
        return this.withTokenRing("emailLiveChatTranscript", () => this.chatSDK.emailLiveChatTranscript(body, optionalParams));
    }

    public async getLiveChatTranscript(optionalParams: any = {}): Promise<any> {
        return this.withTokenRing("getLiveChatTranscript", () => this.chatSDK.getLiveChatTranscript(optionalParams));
    }

    public async createChatAdapter(optionalParams: any = {}): Promise<unknown> {
        return this.withTokenRing("createChatAdapter", () => this.chatSDK.createChatAdapter(optionalParams));
    }

    public async isVoiceVideoCallingEnabled(): Promise<boolean> {
        this.tokenRing();
        return this.chatSDK.isVoiceVideoCallingEnabled();
    }

    public async getVoiceVideoCalling(params: any = {}): Promise<any> {
        return this.withTokenRing("getVoiceVideoCalling", () => this.chatSDK.getVoiceVideoCalling(params));
    }

    public async getPostChatSurveyContext(): Promise<any> {
        return this.withTokenRing("getPostChatSurveyContext", () => this.chatSDK.getPostChatSurveyContext());
    }

    public async getAgentAvailability(optionalParams: any = {}): Promise<any> {
        return this.withTokenRing("getAgentAvailability", () => this.chatSDK.getAgentAvailability(optionalParams));
    }
}


