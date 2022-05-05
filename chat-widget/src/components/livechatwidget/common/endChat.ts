import { LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";

import { ConversationState } from "../../../contexts/common/ConversationState";
import { Dispatch } from "react";
import { ILiveChatWidgetAction } from "../../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetProps } from "../interfaces/ILiveChatWidgetProps";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";
import { NotificationHandler } from "../../webchatcontainerstateful/webchatcontroller/notification/NotificationHandler";
import { NotificationScenarios } from "../../webchatcontainerstateful/webchatcontroller/enums/NotificationScenarios";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { WebChatStoreLoader } from "../../webchatcontainerstateful/webchatcontroller/WebChatStoreLoader";
import { defaultWebChatContainerStatefulProps } from "../../webchatcontainerstateful/common/defaultProps/defaultWebChatContainerStatefulProps";
import { BroadcastService } from "@microsoft/omnichannel-chat-components";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const endChat = async (props: ILiveChatWidgetProps, chatSDK: any, setAdapter: any, setWebChatStyles: any, dispatch: Dispatch<ILiveChatWidgetAction>, adapter: any) => {
    try {
        TelemetryHelper.logConfigDataEvent(LogLevel.INFO, {
            Event: TelemetryEvent.EndChatSDKCall
        });
        await chatSDK?.endChat();
        adapter?.end();
        setAdapter(undefined);
        setWebChatStyles({...defaultWebChatContainerStatefulProps.webChatStyles, ...props.webChatContainerProps?.webChatStyles});
        WebChatStoreLoader.store = null;
        dispatch({type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Closed});
        dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_ENDED_BY_AGENT, payload: false });
        dispatch({ type: LiveChatWidgetActionType.SET_RECONNECT_ID, payload: undefined });
        dispatch({type: LiveChatWidgetActionType.SET_AUDIO_NOTIFICATION, payload: null});
        dispatch({ type: LiveChatWidgetActionType.SET_CHAT_TOKEN, payload: undefined });
        BroadcastService.postMessage({
            eventName: "EndChat"
        });
    } catch (ex) {
        TelemetryHelper.logSDKEvent(LogLevel.ERROR, {
            Event: TelemetryEvent.EndChatSDKCallFailed,
            ExceptionDetails: {
                exception: ex
            }
        });
        NotificationHandler.notifyError(NotificationScenarios.Connection, "End Chat Call Failed: " + ex);
    }
};