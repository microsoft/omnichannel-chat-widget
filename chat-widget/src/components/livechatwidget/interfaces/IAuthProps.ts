export interface IAuthProps {
    authClientFunction?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setAuthTokenProviderToChatSdk?: (chatSDK: any, authClientFunction?: string) => Promise<void>;
} 