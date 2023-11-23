import { LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";
import ChatConfig from "@microsoft/omnichannel-chat-sdk/lib/core/ChatConfig";
import AuthSettings from "@microsoft/omnichannel-chat-sdk/lib/core/AuthSettings";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { isNullOrEmptyString } from "../../../common/utils";

const getAuthClientFunction = (chatConfig: ChatConfig | undefined) => {
    let authClientFunction = undefined;
    if (chatConfig?.LiveChatConfigAuthSettings) {
        authClientFunction = (chatConfig?.LiveChatConfigAuthSettings as AuthSettings)?.msdyn_javascriptclientfunction ?? undefined;
    }
    return authClientFunction;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleAuthentication = async (chatSDK: any, chatConfig: ChatConfig | undefined, getAuthToken: ((authClientFunction?: string) => Promise<string | null>) | undefined) => {
    const authClientFunction = getAuthClientFunction(chatConfig);
    if (getAuthToken && authClientFunction) {
        TelemetryHelper.logActionEvent(LogLevel.INFO, { Event: TelemetryEvent.GetAuthTokenCalled });
        // ADAD technically AuthTokenProviderFailure covered here too, exception will be raised to be caught outside + lcw:error, and returns empty token TODO validate
        const token = await getAuthToken(authClientFunction); // ADAD UndefinedAuthTokenProvider covered here, exception will be raised to be caught outside + lcw:error, and returns empty token
        if (!isNullOrEmptyString(token)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (chatSDK as any).setAuthTokenProvider(async () => {
                return token;
            });
            return true;
        } else {
            TelemetryHelper.logActionEvent(LogLevel.ERROR, { Event: TelemetryEvent.ReceivedNullOrEmptyToken });
            return false;
        }
    }
    return false;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const removeAuthTokenProvider = (chatSDK: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (chatSDK as any).authenticatedUserToken = null;
};

export { getAuthClientFunction, handleAuthentication, removeAuthTokenProvider };