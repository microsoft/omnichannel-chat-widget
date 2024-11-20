
export interface IFacadeChatSDKInput {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chatSDK: any, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chatConfig: any, 
    isAuthenticated: boolean, 
    getAuthToken?: (authClientFunction?: string) => Promise<string | null>;
}

export interface PingResponse {
    result: boolean;
    message: string;
}