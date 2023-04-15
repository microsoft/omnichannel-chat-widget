import { LogLevel, TelemetryEvent } from "../../common/telemetry/TelemetryConstants";
import React, { Dispatch, useEffect } from "react";

import { ConversationState } from "../../contexts/common/ConversationState";
import { ILiveChatWidgetAction } from "../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../contexts/common/ILiveChatWidgetContext";
import { IReconnectChatPaneControlProps } from "@microsoft/omnichannel-chat-components/lib/types/components/reconnectchatpane/interfaces/IReconnectChatPaneControlProps";
import { IReconnectChatPaneStatefulParams } from "./interfaces/IReconnectChatPaneStatefulParams";
import { LiveChatWidgetActionType } from "../../contexts/common/LiveChatWidgetActionType";
import { ReconnectChatPane } from "@microsoft/omnichannel-chat-components";
import StartChatOptionalParams from "@microsoft/omnichannel-chat-sdk/lib/core/StartChatOptionalParams";
import { TelemetryHelper } from "../../common/telemetry/TelemetryHelper";
import { setFocusOnElement } from "../../common/utils";
import useChatContextStore from "../../hooks/useChatContextStore";
import useChatSDKStore from "../../hooks/useChatSDKStore";

export const ReconnectChatPaneStateful = (props: IReconnectChatPaneStatefulParams) => {
    const [state, dispatch]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chatSDK: any = useChatSDKStore();
    const { reconnectChatProps, initStartChat } = props;

    const startChat = async (continueChat: boolean) => {
        dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Loading });
        if (continueChat && state.appStates.reconnectId) {
            const optionalParams: StartChatOptionalParams = { reconnectId: state.appStates.reconnectId };
            await initStartChat(optionalParams);
        } else {
            dispatch({ type: LiveChatWidgetActionType.SET_RECONNECT_ID, payload: undefined });
            if (state?.domainStates?.initialChatSdkRequestId) {
                chatSDK.requestId = state?.domainStates?.initialChatSdkRequestId;
            }
            const parseToJson = false;
            const preChatSurveyResponse: string = await chatSDK.getPreChatSurvey(parseToJson);
            if (preChatSurveyResponse) {
                dispatch({ type: LiveChatWidgetActionType.SET_PRE_CHAT_SURVEY_RESPONSE, payload: preChatSurveyResponse });
                dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Prechat });
            } else {
                dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Loading });
                await initStartChat();
            }
        }
    };

    const controlProps: IReconnectChatPaneControlProps = {
        id: "lcw-components-reconnect-chat-pane",
        dir: state.domainStates.globalDir,
        onContinueChat: () => {
            TelemetryHelper.logActionEvent(LogLevel.INFO, {
                Event: TelemetryEvent.ReconnectChatContinueConversation,
                Description: "Reconnect chat continue conversation button clicked."
            });
            startChat(true);
        },
        onStartNewChat: () => {
            TelemetryHelper.logActionEvent(LogLevel.INFO, {
                Event: TelemetryEvent.ReconnectChatStartNewConversation,
                Description: "Reconnect chat start new conversation button clicked."
            });
            startChat(false);
        },
        onMinimize: () => {
            TelemetryHelper.logActionEvent(LogLevel.INFO, {
                Event: TelemetryEvent.ReconnectChatMinimize,
                Description: "Reconnect chat minimized."
            });
            dispatch({ type: LiveChatWidgetActionType.SET_MINIMIZED, payload: true });
        },
        ...reconnectChatProps?.controlProps,
    };

    useEffect(() => {
        setFocusOnElement(document.getElementById(controlProps.id as string) as HTMLElement);
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, { Event: TelemetryEvent.ReconnectChatPaneLoaded });
    }, []);

    return (
        <ReconnectChatPane
            componentOverrides={reconnectChatProps?.componentOverrides}
            controlProps={controlProps}
            styleProps={reconnectChatProps?.styleProps}
        />
    );
};

export default ReconnectChatPaneStateful;