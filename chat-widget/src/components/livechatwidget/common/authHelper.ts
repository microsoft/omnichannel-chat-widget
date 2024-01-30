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

const getTokenWithRetries = async (accum: number, authClientFunction: string, getAuthToken: ((authClientFunction?: string) => Promise<string | null>) | undefined): Promise<string | null> => {
    let token = null;

    if (getAuthToken && authClientFunction) {
        if (accum < 3) {

            try {
                token = await getAuthToken(authClientFunction);

                if (isNullOrEmptyString(token)) {
                    // an artificial back-off in case of 429
                    await new Promise(resolve => setTimeout(resolve, 300));
                    return await getTokenWithRetries(accum + 1, authClientFunction, getAuthToken);
                } else {
                    return token;
                }
            } catch (error) {
                return null;
            }
        }
    }

    return null;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleAuthentication = async (chatSDK: any, chatConfig: ChatConfig | undefined, getAuthToken: ((authClientFunction?: string) => Promise<string | null>) | undefined) => {
    const authClientFunction = getAuthClientFunction(chatConfig);

    if (getAuthToken && authClientFunction) {

        TelemetryHelper.logActionEvent(LogLevel.INFO, { Event: TelemetryEvent.GetAuthTokenCalled });
        const token = await getTokenWithRetries(0, authClientFunction, getAuthToken);

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