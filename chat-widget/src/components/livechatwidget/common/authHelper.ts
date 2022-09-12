import { LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";
import ChatConfig from "@microsoft/omnichannel-chat-sdk/lib/core/ChatConfig";
import AuthSettings from "@microsoft/omnichannel-chat-sdk/lib/core/AuthSettings";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { isNullOrEmptyString } from "../../../common/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleAuthentication = async (chatSDK: any, chatConfig: ChatConfig | undefined, getAuthToken: ((authClientFunction?: string) => Promise<string | null>) | undefined) => {
    let authClientFunction = undefined;
    if (chatConfig?.LiveChatConfigAuthSettings) {
        authClientFunction = (chatConfig?.LiveChatConfigAuthSettings as AuthSettings)?.msdyn_javascriptclientfunction ?? undefined;
    }
    if (getAuthToken && authClientFunction) {
        TelemetryHelper.logActionEvent(LogLevel.INFO, { Event: TelemetryEvent.GetAuthTokenCalled });
        const token = await getAuthToken(authClientFunction);
        if (!isNullOrEmptyString(token)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (chatSDK as any).setAuthTokenProvider(async () => {
                return token;
            });
        } else {
            TelemetryHelper.logActionEvent(LogLevel.ERROR, { Event: TelemetryEvent.ReceivedNullOrEmptyToken });
        }
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const removeAuthTokenProvider = (chatSDK: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (chatSDK as any).authenticatedUserToken = null;
};

export { handleAuthentication, removeAuthTokenProvider };