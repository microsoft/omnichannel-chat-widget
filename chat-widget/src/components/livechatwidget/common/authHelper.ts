import { LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";

import AuthSettings from "@microsoft/omnichannel-chat-sdk/lib/core/AuthSettings";
import ChatConfig from "@microsoft/omnichannel-chat-sdk/lib/core/ChatConfig";
import { OmnichannelChatSDK } from "@microsoft/omnichannel-chat-sdk";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { WidgetLoadCustomErrorString } from "../../../common/Constants";
import { isNullOrEmptyString } from "../../../common/utils";

/**
 * Check if mid-auth is enabled based on chatConfig.
 * Mid-auth flag lives under LiveWSAndLiveChatEngJoin.msdyn_authenticatedsigninoptional.
 */
const isMidAuthEnabled = (chatConfig: ChatConfig | undefined): boolean => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (chatConfig as any)?.LiveWSAndLiveChatEngJoin?.msdyn_authenticatedsigninoptional;
    return value?.toString?.().toLowerCase?.() === "true";
};

const getAuthClientFunction = (chatConfig: ChatConfig | undefined) => {
    let authClientFunction = undefined;
    if (chatConfig?.LiveChatConfigAuthSettings) {
        authClientFunction = (chatConfig?.LiveChatConfigAuthSettings as AuthSettings)?.msdyn_javascriptclientfunction ?? undefined;
    }
    console.info("[LCW][AuthHelper][getAuthClientFunction] authClientFunction:", authClientFunction);
    return authClientFunction;
};

const handleAuthentication = async (
    chatSDK: OmnichannelChatSDK, 
    chatConfig: ChatConfig | undefined, 
    getAuthToken: ((authClientFunction?: string) => Promise<string | null>) | undefined
) => {
    const midAuthEnabled = isMidAuthEnabled(chatConfig);

    const authClientFunction = getAuthClientFunction(chatConfig);
    if (getAuthToken && authClientFunction) {
        TelemetryHelper.logActionEvent(LogLevel.INFO, { Event: TelemetryEvent.GetAuthTokenCalled });
        
        // Note: getAuthToken() returns null/empty for "no token" cases (doesn't throw)
        // So we check the return value, not catch errors
        const token = await getAuthToken(authClientFunction);
        if (!isNullOrEmptyString(token)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (chatSDK as any).setAuthTokenProvider(async () => {
                return token;
            });
            return {"result": true, "token": token};
        } else {
            // For mid-auth scenarios, empty token means "user not signed in" - this is expected behavior.
            // Return result: true with empty token so caller can decide to proceed unauthenticated.
            if (midAuthEnabled) {
                console.info("[LCW][AuthHelper][handleAuthentication] Empty token received (mid-auth: user not signed in)");
                // Log as INFO, not ERROR - this is expected behavior for mid-auth
                TelemetryHelper.logActionEvent(LogLevel.INFO, { 
                    Event: TelemetryEvent.GetAuthTokenCalled, 
                    Description: "Mid-auth: token provider returned empty; user not signed in" 
                });
                return { "result": true, "token": null };
            }
            
            // For non-mid-auth scenarios, empty token is an error
            TelemetryHelper.logActionEvent(LogLevel.ERROR, { Event: TelemetryEvent.ReceivedNullOrEmptyToken });
            throw new Error(WidgetLoadCustomErrorString.AuthenticationFailedErrorString);
        }
    } else if (chatSDK?.chatSDKConfig?.getAuthToken) {
        const token = await chatSDK.chatSDKConfig?.getAuthToken();
        if (isNullOrEmptyString(token)) {
            // For mid-auth scenarios, empty token from SDK's getAuthToken is also expected
            if (midAuthEnabled) {
                console.info("[LCW][AuthHelper][handleAuthentication] Empty token from SDK (mid-auth: user not signed in)");
                return { "result": true, "token": null };
            }
            
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

export { getAuthClientFunction, handleAuthentication, removeAuthTokenProvider, isMidAuthEnabled };