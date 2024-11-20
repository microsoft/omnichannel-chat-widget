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

    public destroy() {
        this.token = null;
        this.expiration = 0;
    }

    public isTokenSet(){
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
        if ( (expStr.indexOf(".") > -1)  && expStr.toString().length >= 13) {
            return Math.floor(expiration / 1000);
        }
        return expiration;
    }


    private isTokenExpired(): boolean {
        // obtain current time in seconds
        const now = Math.floor(Date.now()/ 1000);
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
                throw new Error("New token is already expired, with epoch time " + this.expiration);
            }
        } else {
            throw new Error("Token is empty or auth function didn't provide a new valid token");
        }
    }

    private async tokenRing(): Promise<boolean> {
        if (this.isAuthenticated) {
            if (this.isTokenExpired()) {
                this.token = "";
                this.expiration = 0;
                if (this.getAuthToken) {
                    try {
                        const ring = await handleAuthentication(this.chatSDK, this.chatConfig, this.getAuthToken);
                        if (ring.result === true && ring.token) {
                            await this.setToken(ring.token);
                            return true;
                        } else {
                            console.log("ELOPEZANAYA :: Result of ring is empty =>", ring);
                        }
                        return false;
                    } catch (e) {
                        console.error("ELOPEZANAYA :: tokenRing :: error while getting new token", e);
                        return false;
                    }
                } else {
                    console.error("ELOPEZANAYA :: GetAuthToken missing");
                }
            }
            return true;
        } else {
            console.log("ELOPEZANAYA :: not authenticated");
        }
        return true;
    }

    private async withTokenRing<T>(fn: () => Promise<T>): Promise<T> {

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
