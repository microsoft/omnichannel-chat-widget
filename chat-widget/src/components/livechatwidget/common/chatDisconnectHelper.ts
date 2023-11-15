import { StyleOptions } from "botframework-webchat";
import { NotificationHandler } from "../../webchatcontainerstateful/webchatcontroller/notification/NotificationHandler";
import { NotificationScenarios } from "../../webchatcontainerstateful/webchatcontroller/enums/NotificationScenarios";
import { defaultMiddlewareLocalizedTexts } from "../../webchatcontainerstateful/common/defaultProps/defaultMiddlewareLocalizedTexts";
import { LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { ILiveChatWidgetContext } from "../../../contexts/common/ILiveChatWidgetContext";
import { ILiveChatWidgetProps } from "../interfaces/ILiveChatWidgetProps";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleChatDisconnect = (props: ILiveChatWidgetProps, state: ILiveChatWidgetContext, setWebChatStyles: any) => {
    if (state?.appStates?.chatDisconnectEventReceived) {
        const chatDisconnectMessage = state?.domainStates?.middlewareLocalizedTexts?.MIDDLEWARE_BANNER_CHAT_DISCONNECT ?? defaultMiddlewareLocalizedTexts.MIDDLEWARE_BANNER_CHAT_DISCONNECT;
        if (props?.webChatContainerProps?.renderingMiddlewareProps?.hideSendboxOnConversationEnd !== false) {
            setWebChatStyles((styles: StyleOptions) => { return { ...styles, hideSendBox: true }; });
        }
        NotificationHandler.notifyWarning(NotificationScenarios.ChatDisconnect, chatDisconnectMessage as string);
        TelemetryHelper.logActionEvent(LogLevel.INFO, {
            Event: TelemetryEvent.ChatDisconnectThreadEventReceived,
            Description: "Chat disconnected due to timeout, left or removed."
        });
    }
};

export { handleChatDisconnect };