import ChatConfig from "@microsoft/omnichannel-chat-sdk/lib/core/ChatConfig";
import { OmnichannelChatSDK } from "@microsoft/omnichannel-chat-sdk";

export interface IFacadeChatSDKInput {
    chatSDK: OmnichannelChatSDK, 
    chatConfig: ChatConfig, 
    isAuthenticated: boolean, 
    isSDKMocked: boolean,
    getAuthToken?: (authClientFunction?: string) => Promise<string | null>;
}

export interface PingResponse {
    result: boolean;
    message: string;
}