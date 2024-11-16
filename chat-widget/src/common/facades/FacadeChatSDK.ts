/* eslint-disable @typescript-eslint/no-explicit-any */

import ChatConfig from "@microsoft/omnichannel-chat-sdk/lib/core/ChatConfig";
import { IFacadeChatSDKInput } from "./types/IFacadeChatSDKInput";
import { OmnichannelChatSDK } from "@microsoft/omnichannel-chat-sdk";
import { handleAuthentication } from "../../components/livechatwidget/common/authHelper";
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

    constructor(input: IFacadeChatSDKInput) {
        console.log("New Facade Object");
        this.chatSDK = input.chatSDK;
        this.chatConfig = input.chatConfig;
        this.getAuthToken = input.getAuthToken;
        this.isAuthenticated = input.isAuthenticated;
    }

    private isTokenExpired(): boolean {
        // obtain current time
        const now = Date.now();
        // compare expiration time with current time
        console.log("ELOPEZANAYA :: expiration ", this.expiration);
        console.log("ELOPEZANAYA :: now ", now);
        if (now > this.expiration) {
            console.log("ELOPEZANAYA :: Token expired");
            return true;
        }
        console.log("ELOPEZANAYA :: Token is ok");

        return false;
    }

    private async setToken(token: string | null): Promise<void> {

        console.log("ELOPEZANAYA :: setToken ", token);
        console.log("ELOPEZANAYA :: this.token ", this.token);

        // token must be not null, and must be new
        if (!isNullOrEmptyString(token) && token !== this.token) {
            console.log("ELOPEZANAYA :: new token obtained ", token);
            this.token = token;
            // decompose token
            const tokenParts = this.token.split(".");
            // decode token
            const tokenDecoded = JSON.parse(atob(tokenParts[1]));
            // calculate expiration time
            this.expiration = tokenDecoded.exp * 1000;

            if (this.expiration < Date.now()) {
                throw new Error("New token is already expired");
            }
        } else {
            throw new Error("Token is empty or expired, auth function dint provide a new valid token");
        }

    }
    private async tokenRing(): Promise<boolean> {
        if (this.isAuthenticated) {
            console.log("ELOPEZANAYA :: tokenRing :: isAuthenticated");
            if (this.isTokenExpired()) {
                console.log("ELOPEZANAYA : requesting a new token");
                this.token = "";
                this.expiration = 0;
                if (this.getAuthToken) {
                    try {
                        const ring = await handleAuthentication(this.chatSDK, this.chatConfig, this.getAuthToken);
                        if (ring.result === true && ring.token) {
                            this.setToken(ring.token);
                            return true;
                        }
                        return false;
                    } catch (e) {
                        return false;
                    }
                }
            }
            return true;
        }
        return true;
    }

    private async withTokenRing<T>(fn: () => Promise<T>): Promise<T> {
        console.log("facade in action");
        if (await this.tokenRing()) {
            return fn();
        }
        console.error("Authentication not possible, so holding any interaction with backend");
        return Promise.reject("Authentication failed");
    }

    public async initialize(optionalParams: any = {}): Promise<ChatConfig> {
        return this.withTokenRing(() => this.chatSDK.initialize(optionalParams));
    }

    public async getChatReconnectContext(optionalParams: any = {}): Promise<any> {
        return this.withTokenRing(() => this.chatSDK.getChatReconnectContext(optionalParams));
    }

    public async startChat(optionalParams: any = {}): Promise<void> {
        return this.withTokenRing(() => this.chatSDK.startChat(optionalParams));
    }

    public async endChat(): Promise<void> {
        return this.withTokenRing(() => this.chatSDK.endChat());
    }

    public async getCurrentLiveChatContext(): Promise<object> {
        return this.withTokenRing(() => this.chatSDK.getCurrentLiveChatContext());
    }

    public async getConversationDetails(optionalParams: any = {}): Promise<any> {
        return this.withTokenRing(() => this.chatSDK.getConversationDetails(optionalParams));
    }

    public async getPreChatSurvey(parse = true): Promise<any> {
        return this.withTokenRing(() => this.chatSDK.getPreChatSurvey(parse));
    }

    public async getLiveChatConfig(optionalParams?: any): Promise<any> {
        return this.withTokenRing(() => this.chatSDK.getLiveChatConfig(optionalParams));
    }

    public async getChatToken(cached = true, optionalParams?: any): Promise<any> {
        return this.withTokenRing(() => this.chatSDK.getChatToken(cached, optionalParams));
    }

    public async getCallingToken(): Promise<string> {
        return this.withTokenRing(() => this.chatSDK.getCallingToken());
    }

    public async getMessages(): Promise<any | undefined> {
        return this.withTokenRing(() => this.chatSDK.getMessages());
    }

    public async getDataMaskingRules(): Promise<any> {
        return this.withTokenRing(() => this.chatSDK.getDataMaskingRules());
    }

    public async sendMessage(message: any): Promise<void> {
        return this.withTokenRing(() => this.chatSDK.sendMessage(message));
    }

    public async onNewMessage(onNewMessageCallback: CallableFunction, optionalParams: any | unknown = {}): Promise<void> {
        return this.withTokenRing(() => this.chatSDK.onNewMessage(onNewMessageCallback, optionalParams));
    }

    public async sendTypingEvent(): Promise<void> {
        return this.withTokenRing(() => this.chatSDK.sendTypingEvent());
    }

    public async onTypingEvent(onTypingEventCallback: CallableFunction): Promise<void> {
        return this.withTokenRing(() => this.chatSDK.onTypingEvent(onTypingEventCallback));
    }

    public async onAgentEndSession(onAgentEndSessionCallback: (message: any | any) => void): Promise<void> {
        return this.withTokenRing(() => this.chatSDK.onAgentEndSession(onAgentEndSessionCallback));
    }

    public async uploadFileAttachment(fileInfo: any | File): Promise<any | any> {
        return this.withTokenRing(() => this.chatSDK.uploadFileAttachment(fileInfo));
    }

    public async downloadFileAttachment(fileMetadata: any | any): Promise<Blob> {
        return this.withTokenRing(() => this.chatSDK.downloadFileAttachment(fileMetadata));
    }

    public async emailLiveChatTranscript(body: any, optionalParams: any = {}): Promise<any> {
        return this.withTokenRing(() => this.chatSDK.emailLiveChatTranscript(body, optionalParams));
    }

    public async getLiveChatTranscript(optionalParams: any = {}): Promise<any> {
        return this.withTokenRing(() => this.chatSDK.getLiveChatTranscript(optionalParams));
    }

    public async createChatAdapter(optionalParams: any = {}): Promise<unknown> {
        return this.withTokenRing(() => this.chatSDK.createChatAdapter(optionalParams));
    }

    public async isVoiceVideoCallingEnabled(): Promise<boolean> {
        console.log("facade in action 3");

        this.tokenRing();
        return this.chatSDK.isVoiceVideoCallingEnabled();
    }

    public async getVoiceVideoCalling(params: any = {}): Promise<any> {
        return this.withTokenRing(() => this.chatSDK.getVoiceVideoCalling(params));
    }

    public async getPostChatSurveyContext(): Promise<any> {
        return this.withTokenRing(() => this.chatSDK.getPostChatSurveyContext());
    }

    public async getAgentAvailability(optionalParams: any = {}): Promise<any> {
        return this.withTokenRing(() => this.chatSDK.getAgentAvailability(optionalParams));
    }
}
