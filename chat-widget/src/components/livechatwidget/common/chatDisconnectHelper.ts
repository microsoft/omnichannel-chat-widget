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
        if (props?.webChatContainerProps?.renderingMiddlewareProps?.hideSendboxOnConversationEnd !== false) {
            setWebChatStyles((styles: StyleOptions) => { return { ...styles, hideSendBox: true }; });
        }
        NotificationHandler.notifyWarning(NotificationScenarios.ChatDisconnect,
            defaultMiddlewareLocalizedTexts.MIDDLEWARE_BANNER_CHAT_DISCONNECT as string);
        TelemetryHelper.logActionEvent(LogLevel.INFO, {
            Event: TelemetryEvent.ChatDisconnected,
            Description: "Chat disconnected"
        });
    }
};

export { handleChatDisconnect };