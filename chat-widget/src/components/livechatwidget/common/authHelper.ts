import { LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";

import AuthSettings from "@microsoft/omnichannel-chat-sdk/lib/core/AuthSettings";
import ChatConfig from "@microsoft/omnichannel-chat-sdk/lib/core/ChatConfig";
import { OmnichannelChatSDK } from "@microsoft/omnichannel-chat-sdk";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { WidgetLoadCustomErrorString } from "../../../common/Constants";
import { isNullOrEmptyString } from "../../../common/utils";
import AppInsightsManager from "../../../common/telemetry/appInsights/AppInsightsManager";
import AppInsightsScenarioMarker from "../../../common/telemetry/appInsights/AppInsightsScenarioMarker";
import { AppInsightsEvent } from "../../../common/telemetry/appInsights/AppInsightsEvent";
import { Exception } from "@microsoft/applicationinsights-web";

const getAuthClientFunction = (chatConfig: ChatConfig | undefined) => {
    let authClientFunction = undefined;
    if (chatConfig?.LiveChatConfigAuthSettings) {
        authClientFunction = (chatConfig?.LiveChatConfigAuthSettings as AuthSettings)?.msdyn_javascriptclientfunction ?? undefined;
    }
    return authClientFunction;
};

const handleAuthentication = async (chatSDK: OmnichannelChatSDK, chatConfig: ChatConfig | undefined, getAuthToken: ((authClientFunction?: string) => Promise<string | null>) | undefined) => {

    const authClientFunction = getAuthClientFunction(chatConfig);
    if (getAuthToken && authClientFunction) {
        TelemetryHelper.logActionEvent(LogLevel.INFO, { Event: TelemetryEvent.GetAuthTokenCalled });
        AppInsightsManager.logEvent(AppInsightsScenarioMarker.completeScenario(AppInsightsEvent.GetAuthTokenCalled));
        const token = await getAuthToken(authClientFunction);
        if (!isNullOrEmptyString(token)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (chatSDK as any).setAuthTokenProvider(async () => {
                return token;
            });
            return {"result": true, "token": token};
        } else {
            // instead of returning false, it's more appropiate to thrown an error to force error handling on the caller side
            // this will help to avoid the error to be ignored and the chat to be started
            TelemetryHelper.logActionEvent(LogLevel.ERROR, { Event: TelemetryEvent.ReceivedNullOrEmptyToken });
            AppInsightsManager.logEvent(AppInsightsScenarioMarker.failScenario(AppInsightsEvent.ReceivedNullOrEmptyToken),{
                exceptionDetails: { message: WidgetLoadCustomErrorString.AuthenticationFailedErrorString }
            });
            throw new Error(WidgetLoadCustomErrorString.AuthenticationFailedErrorString);
        }
    } else if (chatSDK?.chatSDKConfig?.getAuthToken) {
        const token = await chatSDK.chatSDKConfig?.getAuthToken();
        if (isNullOrEmptyString(token)) {
            TelemetryHelper.logActionEvent(LogLevel.ERROR, { Event: TelemetryEvent.ReceivedNullOrEmptyToken, Description: "getAuthToken in chat SDK returns empty string" });
            throw new Error(WidgetLoadCustomErrorString.AuthenticationFailedErrorString);
        }
        return { "result": true, token };
    }

    return {
        "result": false, 
        "token": null,
        "error": {
            "message": "No auth client function or getAuthToken function provided",
            "getAuthTokenPresent": getAuthToken ? true : false,
            "authClientFunctionPresent": authClientFunction ? true : false
        }
    };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const removeAuthTokenProvider = (chatSDK: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (chatSDK as any).authenticatedUserToken = null;
};

export { getAuthClientFunction, handleAuthentication, removeAuthTokenProvider };