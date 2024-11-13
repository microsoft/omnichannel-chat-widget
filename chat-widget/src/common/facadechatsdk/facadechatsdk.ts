/* eslint-disable @typescript-eslint/no-explicit-any */

import { getAuthClientFunction, handleAuthentication } from "../../components/livechatwidget/common/authHelper";

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

    public getChatSDK(): OmnichannelChatSDK {
        return this.chatSDK;
    }

    constructor(input: IFacadeChatSDKInput) {
        this.chatSDK = input.chatSDK;
        this.chatConfig = input.chatConfig;
        this.getAuthToken = input.getAuthToken;
        this.isAuthenticated = input.isAuthenticated;

        if (this.isAuthenticated === true) {
            this.setToken();
        }
    }

    private isTokenExpired(): boolean {
        // obtain current time
        const now = Date.now();
        // compare expiration time with current time
        if (now > this.expiration) {
            return true;
        }
        return false;
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
    
    private withTokenRing<T>(fn: () => Promise<T>): Promise<T> {
        this.tokenRing();
        return fn();
    }

    public initialize(optionalParams: any = {}): Promise<ChatConfig> {
        return this.withTokenRing(() => this.chatSDK.initialize(optionalParams));
    }

    public getChatReconnectContext(optionalParams: any = {}): Promise<any> {
        return this.withTokenRing(() => this.chatSDK.getChatReconnectContext(optionalParams));
    }

    public startChat(optionalParams: any = {}): Promise<void> {
        return this.withTokenRing(() => this.chatSDK.startChat(optionalParams));
    }

    public endChat(): Promise<void> {
        return this.withTokenRing(() => this.chatSDK.endChat());
    }

    public getCurrentLiveChatContext(): Promise<object> {
        return this.withTokenRing(() => this.chatSDK.getCurrentLiveChatContext());
    }

    public getConversationDetails(optionalParams: any = {}): Promise<any> {
        return this.withTokenRing(() => this.chatSDK.getConversationDetails(optionalParams));
    }

    public getPreChatSurvey(parse = true): Promise<any> {
        return this.withTokenRing(() => this.chatSDK.getPreChatSurvey(parse));
    }

    public getLiveChatConfig(optionalParams?: any): Promise<any> {
        return this.withTokenRing(() => this.chatSDK.getLiveChatConfig(optionalParams));
    }

    public getChatToken(cached = true, optionalParams?: any): Promise<any> {
        return this.withTokenRing(() => this.chatSDK.getChatToken(cached, optionalParams));
    }

    public getCallingToken(): Promise<string> {
        return this.withTokenRing(() => this.chatSDK.getCallingToken());
    }

    public getMessages(): Promise<any | undefined> {
        return this.withTokenRing(() => this.chatSDK.getMessages());
    }

    public getDataMaskingRules(): Promise<any> {
        return this.withTokenRing(() => this.chatSDK.getDataMaskingRules());
    }

    public sendMessage(message: any): Promise<void> {
        return this.withTokenRing(() => this.chatSDK.sendMessage(message));
    }

    public onNewMessage(onNewMessageCallback: CallableFunction, optionalParams: any | unknown = {}): Promise<void> {
        return this.withTokenRing(() => this.chatSDK.onNewMessage(onNewMessageCallback, optionalParams));
    }

    public sendTypingEvent(): Promise<void> {
        return this.withTokenRing(() => this.chatSDK.sendTypingEvent());
    }

    public onTypingEvent(onTypingEventCallback: CallableFunction): Promise<void> {
        return this.withTokenRing(() => this.chatSDK.onTypingEvent(onTypingEventCallback));
    }

    public onAgentEndSession(onAgentEndSessionCallback: (message: any | any) => void): Promise<void> {
        return this.withTokenRing(() => this.chatSDK.onAgentEndSession(onAgentEndSessionCallback));
    }

    public uploadFileAttachment(fileInfo: any | File): Promise<any | any> {
        return this.withTokenRing(() => this.chatSDK.uploadFileAttachment(fileInfo));
    }

    public downloadFileAttachment(fileMetadata: any | any): Promise<Blob> {
        return this.withTokenRing(() => this.chatSDK.downloadFileAttachment(fileMetadata));
    }

    public emailLiveChatTranscript(body: any, optionalParams: any = {}): Promise<any> {
        return this.withTokenRing(() => this.chatSDK.emailLiveChatTranscript(body, optionalParams));
    }

    public getLiveChatTranscript(optionalParams: any = {}): Promise<any> {
        return this.withTokenRing(() => this.chatSDK.getLiveChatTranscript(optionalParams));
    }

    public createChatAdapter(optionalParams: any = {}): Promise<unknown> {
        return this.withTokenRing(() => this.chatSDK.createChatAdapter(optionalParams));
    }

    public isVoiceVideoCallingEnabled(): boolean {
        this.tokenRing();
        return this.chatSDK.isVoiceVideoCallingEnabled();
    }

    public getVoiceVideoCalling(params: any = {}): Promise<any> {
        return this.withTokenRing(() => this.chatSDK.getVoiceVideoCalling(params));
    }

    public getPostChatSurveyContext(): Promise<any> {
        return this.withTokenRing(() => this.chatSDK.getPostChatSurveyContext());
    }

    public getAgentAvailability(optionalParams: any = {}): Promise<any> {
        return this.withTokenRing(() => this.chatSDK.getAgentAvailability(optionalParams));
    }
}
