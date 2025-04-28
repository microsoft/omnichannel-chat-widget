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
import AppInsightsManager from "../../../common/telemetry/appInsights/AppInsightsManager";
import AppInsightsScenarioMarker from "../../../common/telemetry/appInsights/AppInsightsScenarioMarker";
import { AppInsightsEvent } from "../../../common/telemetry/appInsights/AppInsightsEvent";

const isInternetConnected = async () => {
    try {
        const response = await fetch(Constants.internetConnectionTestUrl);
        const text = await response.text();
        return text === Constants.internetConnectionTestUrlText;
    } catch {
        return false;
    }
};

export const createInternetConnectionChangeHandler = async (state: ILiveChatWidgetContext) => {
    const handler = async () => {
        const connected = await isInternetConnected();
        const inMemoryState = executeReducer(state, { type: LiveChatWidgetActionType.GET_IN_MEMORY_STATE, payload: null });
        if (!connected) {
            TelemetryHelper.logActionEvent(LogLevel.WARN, {
                Event: TelemetryEvent.NetworkDisconnected
            });
            AppInsightsManager.logEvent(AppInsightsScenarioMarker.completeScenario(AppInsightsEvent.NetworkDisconnected));
            NotificationHandler.notifyError(NotificationScenarios.InternetConnection, inMemoryState?.domainStates?.middlewareLocalizedTexts?.MIDDLEWARE_BANNER_NO_INTERNET_CONNECTION ?? defaultMiddlewareLocalizedTexts.MIDDLEWARE_BANNER_NO_INTERNET_CONNECTION as string);
        } else {
            TelemetryHelper.logActionEvent(LogLevel.WARN, {
                Event: TelemetryEvent.NetworkReconnected
            });
            AppInsightsManager.logEvent(AppInsightsScenarioMarker.completeScenario(AppInsightsEvent.NetworkReconnected));
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