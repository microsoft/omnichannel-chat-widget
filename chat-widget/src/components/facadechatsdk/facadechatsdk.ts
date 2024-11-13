/* eslint-disable @typescript-eslint/no-explicit-any */

import { getAuthClientFunction, handleAuthentication } from "../livechatwidget/common/authHelper";

import ChatConfig from "@microsoft/omnichannel-chat-sdk/lib/core/ChatConfig";
import { IFacadeChatSDKInput } from "./types/IFacadeChatSDKInput";
import { OmnichannelChatSDK } from "@microsoft/omnichannel-chat-sdk";
import { isNullOrEmptyString } from "../../common/utils";

export class FacadeChatSDK {
    private chatSDK: OmnichannelChatSDK;
    private chatConfig: ChatConfig;
    private token!: any | "";
    private expiration = 0;
    private isAuthenticated!: boolean;
    private getAuthToken?: (authClientFunction?: string) => Promise<string | null>;

    constructor(input: IFacadeChatSDKInput) {
        this.chatSDK = input.chatSDK;
        this.chatConfig = input.chatConfig;
        this.getAuthToken = input.getAuthToken;
        this.isAuthenticated = input.isAuthenticated;

        if (this.isAuthenticated) {
            this.setToken();
        }
    }

    private isTokenExpired(): boolean {
        // obtain current time
        const now = Date.now();
        // compare expiration time with current time
        if (now > this.expiration) {
            return false;
        }
        return true;
    }

    private tokenRing(): void {
        if (this.isAuthenticated) {
            if (this.isTokenExpired()) {
                this.isAuthenticated = false;
                this.token = "";
                this.expiration = 0;
                if (this.getAuthToken) {
                    handleAuthentication(this.chatSDK, this.chatConfig, this.getAuthToken);
                    this.setToken();
                }
            }
        }
    }

    private async setToken() {
        const authClientFunction = getAuthClientFunction(this.chatConfig);
        if (this.getAuthToken && authClientFunction) {
            const token = await this.getAuthToken(authClientFunction);
            if (!isNullOrEmptyString(token)) {
                this.token = token;
                // decompose token
                const tokenParts = this.token.split(".");
                // decode token
                const tokenDecoded = JSON.parse(atob(tokenParts[1]));
                console.log("exp => ", tokenDecoded.exp);
                // calculate expiration time
                this.expiration = tokenDecoded.exp * 1000;
            }
        }
    }

    public async initialize(optionalParams: any = {}): Promise<ChatConfig> {
        this.tokenRing();
        return await this.chatSDK.initialize(optionalParams);
    }

    public async getChatReconnectContext(optionalParams: any = {}): Promise<any> {
        this.tokenRing();
        return await this.chatSDK.getChatReconnectContext(optionalParams);
    }

    public async startChat(optionalParams: any = {}): Promise<void> {
        this.tokenRing();
        return await this.chatSDK.startChat(optionalParams);
    }

    public async endChat(): Promise<void> {
        this.tokenRing();
        return await this.chatSDK.endChat();
    }

    public async getCurrentLiveChatContext(): Promise<object> {
        this.tokenRing();
        return await this.chatSDK.getCurrentLiveChatContext();
    }

    public async getConversationDetails(optionalParams: any = {}): Promise<any> {
        this.tokenRing();
        return await this.chatSDK.getConversationDetails(optionalParams);
    }

    public async getPreChatSurvey(parse = true): Promise<any> {
        this.tokenRing();
        return await this.chatSDK.getPreChatSurvey(parse);
    }

    public async getLiveChatConfig(optionalParams?: any): Promise<any> {

        this.tokenRing();
        return await this.chatSDK.getLiveChatConfig(optionalParams);
    }

    public async getChatToken(cached = true, optionalParams?: any): Promise<any> {

        this.tokenRing();
        return await this.chatSDK.getChatToken(cached, optionalParams);
    }

    public async getCallingToken(): Promise<string> {
        this.tokenRing();
        return await this.chatSDK.getCallingToken();
    }

    public async getMessages(): Promise<any | undefined> {
        this.tokenRing();
        return await this.chatSDK.getMessages();
    }

    public async getDataMaskingRules(): Promise<any> { 

        this.tokenRing();
        return await this.chatSDK.getDataMaskingRules();
    }

    public async sendMessage(message: any): Promise<void> {
        this.tokenRing();
        return await this.chatSDK.sendMessage(message);
    }

    public async onNewMessage(onNewMessageCallback: CallableFunction, optionalParams: any | unknown = {}): Promise<void> {
        this.tokenRing();
        return await this.chatSDK.onNewMessage(onNewMessageCallback, optionalParams);
    }

    public async sendTypingEvent(): Promise<void> {
        this.tokenRing();
        return await this.chatSDK.sendTypingEvent();
    }

    public async onTypingEvent(onTypingEventCallback: CallableFunction): Promise<void> {
        this.tokenRing();
        return await this.chatSDK.onTypingEvent(onTypingEventCallback);
    }

    public async onAgentEndSession(onAgentEndSessionCallback: (message: any | any) => void): Promise<void> {

        this.tokenRing();
        return await this.chatSDK.onAgentEndSession(onAgentEndSessionCallback);
    }

    public async uploadFileAttachment(fileInfo: any | File): Promise<any | any> {
        this.tokenRing();
        return await this.chatSDK.uploadFileAttachment(fileInfo);
    }

    public async downloadFileAttachment(fileMetadata: any | any): Promise<Blob> {

        this.tokenRing();
        return await this.chatSDK.downloadFileAttachment(fileMetadata);
    }

    public async emailLiveChatTranscript(body: any, optionalParams: any = {}): Promise<any> { 
        this.tokenRing();
        return await this.chatSDK.emailLiveChatTranscript(body, optionalParams);
    }

    public async getLiveChatTranscript(optionalParams: any = {}): Promise<any> { 

        this.tokenRing();
        return await this.chatSDK.getLiveChatTranscript(optionalParams);
    }

    public async createChatAdapter(optionalParams: any = {}): Promise<unknown> {

        this.tokenRing();
        return await this.chatSDK.createChatAdapter(optionalParams);
    }

    public isVoiceVideoCallingEnabled(): boolean {
        this.tokenRing();
        return this.chatSDK.isVoiceVideoCallingEnabled();
    }

    public async getVoiceVideoCalling(params: any = {}): Promise<any> { 
        this.tokenRing();
        return await this.chatSDK.getVoiceVideoCalling(params);
    }

    public async getPostChatSurveyContext(): Promise<any> { 
        this.tokenRing();
        return await this.chatSDK.getPostChatSurveyContext();
    }

    public async getAgentAvailability(optionalParams: any = {}): Promise<any> { 
        this.tokenRing();
        return await this.chatSDK.getAgentAvailability(optionalParams);
    }

}