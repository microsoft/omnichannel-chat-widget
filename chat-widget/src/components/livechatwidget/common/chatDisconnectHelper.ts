import { LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";

import { ILiveChatWidgetContext } from "../../../contexts/common/ILiveChatWidgetContext";
import { ILiveChatWidgetProps } from "../interfaces/ILiveChatWidgetProps";
import { NotificationHandler } from "../../webchatcontainerstateful/webchatcontroller/notification/NotificationHandler";
import { NotificationScenarios } from "../../webchatcontainerstateful/webchatcontroller/enums/NotificationScenarios";
import { StyleOptions } from "botframework-webchat";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { defaultMiddlewareLocalizedTexts } from "../../webchatcontainerstateful/common/defaultProps/defaultMiddlewareLocalizedTexts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleChatDisconnect = (props: ILiveChatWidgetProps, state: ILiveChatWidgetContext, setWebChatStyles: any) => {
    const chatDisconnectState = state?.appStates?.chatDisconnectEventReceived;
    const chatDisconnectMessage = state?.domainStates?.middlewareLocalizedTexts?.MIDDLEWARE_BANNER_CHAT_DISCONNECT ?? defaultMiddlewareLocalizedTexts.MIDDLEWARE_BANNER_CHAT_DISCONNECT;
    const hideSendBoxOnConversationEnd = props?.webChatContainerProps?.renderingMiddlewareProps?.hideSendboxOnConversationEnd;

    switch (chatDisconnectState) {
        case true:
            if (hideSendBoxOnConversationEnd !== false) {
                setWebChatStyles((styles: StyleOptions) => { return { ...styles, hideSendBox: true }; });
            }
            NotificationHandler.notifyWarning(NotificationScenarios.ChatDisconnect, chatDisconnectMessage as string);
            TelemetryHelper.logActionEvent(LogLevel.INFO, {
                Event: TelemetryEvent.ChatDisconnectThreadEventReceived,
                Description: "Chat disconnected due to timeout, left or removed."
            });
            break;
        case false:
            if (hideSendBoxOnConversationEnd !== false) {
                setWebChatStyles((styles: StyleOptions) => { return { ...styles, hideSendBox: false }; });
            }
            break;
        default:
            break;
    }
};

export { handleChatDisconnect };