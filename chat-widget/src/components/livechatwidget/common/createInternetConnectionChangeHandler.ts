import { BroadcastEvent, LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";

import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { Constants } from "../../../common/Constants";
import { NotificationHandler } from "../../webchatcontainerstateful/webchatcontroller/notification/NotificationHandler";
import { NotificationScenarios } from "../../webchatcontainerstateful/webchatcontroller/enums/NotificationScenarios";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { defaultMiddlewareLocalizedTexts } from "../../webchatcontainerstateful/common/defaultProps/defaultMiddlewareLocalizedTexts";
import { ILiveChatWidgetContext } from "../../../contexts/common/ILiveChatWidgetContext";
import { executeReducer } from "../../../contexts/createReducer";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";


const getRegionBasedInternetTestUrl = (widgetSnippet: string): string | null => {
    if (!widgetSnippet) {
        return null;
    }

    const widgetSnippetSourceRegex = new RegExp("src=\"(https:\\/\\/[\\w-.]+)[\\w-.\\/]+\"");

    const baseCdnUrl = widgetSnippet.match(widgetSnippetSourceRegex)?.[1];
    return baseCdnUrl ? `${baseCdnUrl}${Constants.internetConnectionTestPath}` : null;
};

const isInternetConnected = async (testUrl: string) => {
    try {
        const response = await fetch(testUrl,  {
            method: "GET",
            cache: "no-cache"
        });
        return response.ok;
    } catch {
        return false;
    }
};

export const createInternetConnectionChangeHandler = async (state: ILiveChatWidgetContext) => {
    const handler = async () => {
        const inMemoryState = executeReducer(state, { type: LiveChatWidgetActionType.GET_IN_MEMORY_STATE, payload: null });
        const testUrl = getRegionBasedInternetTestUrl(inMemoryState.domainStates.liveChatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_widgetsnippet);
        const connected = testUrl ? await isInternetConnected(testUrl) : false;
        if (!connected) {
            TelemetryHelper.logActionEvent(LogLevel.WARN, {
                Event: TelemetryEvent.NetworkDisconnected
            });
            NotificationHandler.notifyError(NotificationScenarios.InternetConnection, inMemoryState?.domainStates?.middlewareLocalizedTexts?.MIDDLEWARE_BANNER_NO_INTERNET_CONNECTION ?? defaultMiddlewareLocalizedTexts.MIDDLEWARE_BANNER_NO_INTERNET_CONNECTION as string);
        } else {
            TelemetryHelper.logActionEvent(LogLevel.WARN, {
                Event: TelemetryEvent.NetworkReconnected
            });
            NotificationHandler.notifySuccess(NotificationScenarios.InternetConnection, inMemoryState?.domainStates?.middlewareLocalizedTexts?.MIDDLEWARE_BANNER_INTERNET_BACK_ONLINE ?? defaultMiddlewareLocalizedTexts.MIDDLEWARE_BANNER_INTERNET_BACK_ONLINE as string);
            BroadcastService.postMessage({
                eventName: BroadcastEvent.NetworkReconnected,
            });
        }
    };

    // Checking connection status on online & offline events due to possible false positives
    window.addEventListener("online", () => handler(), false);
    window.addEventListener("offline", () => handler(), false);
};