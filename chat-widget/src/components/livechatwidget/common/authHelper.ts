import { LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";
import ChatConfig from "@microsoft/omnichannel-chat-sdk/lib/core/ChatConfig";
import AuthSettings from "@microsoft/omnichannel-chat-sdk/lib/core/AuthSettings";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { isNullOrEmptyString } from "../../../common/utils";
import { WidgetLoadCustomErrorString } from "../../../common/Constants";

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
        const token = await getAuthToken(authClientFunction);
        if (!isNullOrEmptyString(token)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (chatSDK as any).setAuthTokenProvider(async () => {
                return token;
            });
            return true;
        } else {
            // instead of returning false, it's more appropiate to thrown an error to force error handling on the caller side
            // this will help to avoid the error to be ignored and the chat to be started
            TelemetryHelper.logActionEvent(LogLevel.ERROR, { Event: TelemetryEvent.ReceivedNullOrEmptyToken });
            throw new Error(WidgetLoadCustomErrorString.AuthenticationFailedErrorString);
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