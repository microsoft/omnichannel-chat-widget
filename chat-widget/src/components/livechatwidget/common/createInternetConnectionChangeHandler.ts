import { Constants } from "../../../common/Constants";
import { NotificationHandler } from "../../webchatcontainerstateful/webchatcontroller/notification/NotificationHandler";
import { NotificationScenarios } from "../../webchatcontainerstateful/webchatcontroller/enums/NotificationScenarios";
import { defaultMiddlewareLocalizedTexts } from "../../webchatcontainerstateful/common/defaultProps/defaultMiddlewareLocalizedTexts";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";

const isInternetConnected = async () => {
    try {
        const response = await fetch(Constants.internetConnectionTestUrl);
        const text = await response.text();
        return text === Constants.internetConnectionTestUrlText;
    } catch {
        return false;
    }
};

export const createInternetConnectionChangeHandler = async () => {
    const handler = async () => {
        const connected = await isInternetConnected();
        if (!connected) {
            TelemetryHelper.logActionEvent(LogLevel.WARN, {
                Event: TelemetryEvent.NetworkDisconnected
            });
            NotificationHandler.notifyError(NotificationScenarios.InternetConnection, defaultMiddlewareLocalizedTexts.MIDDLEWARE_BANNER_NO_INTERNET_CONNECTION as string);
        } else {
            TelemetryHelper.logActionEvent(LogLevel.WARN, {
                Event: TelemetryEvent.NetworkReconnected
            });
            NotificationHandler.notifySuccess(NotificationScenarios.InternetConnection, defaultMiddlewareLocalizedTexts.MIDDLEWARE_BANNER_INTERNET_BACK_ONLINE as string);
        }
    };

    // Checking connection status on online & offline events due to possible false positives
    window.addEventListener("online", () => handler(), false);
    window.addEventListener("offline", () => handler(), false);
};