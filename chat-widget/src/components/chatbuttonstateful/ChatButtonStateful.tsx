import { LogLevel, TelemetryEvent } from "../../common/telemetry/TelemetryConstants";
import React, { Dispatch, useEffect, useRef, useState } from "react";

import { ChatButton } from "@microsoft/omnichannel-chat-components";
import { Constants } from "../../common/Constants";
import { ConversationState } from "../../contexts/common/ConversationState";
import { IChatButtonControlProps } from "@microsoft/omnichannel-chat-components/lib/types/components/chatbutton/interfaces/IChatButtonControlProps";
import { IChatButtonStatefulParams } from "./interfaces/IChatButtonStatefulParams";
import { IChatButtonStyleProps } from "@microsoft/omnichannel-chat-components/lib/types/components/chatbutton/interfaces/IChatButtonStyleProps";
import { ILiveChatWidgetAction } from "../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../contexts/common/ILiveChatWidgetContext";
import { LiveChatWidgetActionType } from "../../contexts/common/LiveChatWidgetActionType";
import { TelemetryHelper } from "../../common/telemetry/TelemetryHelper";
import { TelemetryTimers } from "../../common/telemetry/TelemetryManager";
import { defaultOutOfOfficeChatButtonStyleProps } from "./common/styleProps/defaultOutOfOfficeChatButtonStyleProps";
import { setFocusOnElement } from "../../common/utils";
import useChatContextStore from "../../hooks/useChatContextStore";

export const ChatButtonStateful = (props: IChatButtonStatefulParams) => {

    const [state, dispatch]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    const { buttonProps, outOfOfficeButtonProps, startChat } = props;
    //Setting OutOfOperatingHours Flag
    const [outOfOperatingHours, setOutOfOperatingHours] = useState(state.domainStates.liveChatConfig?.LiveWSAndLiveChatEngJoin?.OutOfOperatingHours === "True");
    
    const ref = useRef(() => {return;});
    ref.current = async () => {
        TelemetryHelper.logActionEvent(LogLevel.INFO, {
            Event: TelemetryEvent.LCWChatButtonClicked
        });
        
        if (state.appStates.isMinimized) {
            dispatch({ type: LiveChatWidgetActionType.SET_MINIMIZED, payload: false });
            dispatch({ type: LiveChatWidgetActionType.SET_UNREAD_MESSAGE_COUNT, payload: 0 });
            // If chat is minimized and then unminimized, start a chat if convesation state is closed.
            if (state.appStates.conversationState === ConversationState.Closed) {
                await startChat();
            }
        } else {
            await startChat();
        }
    };

    const outOfOfficeStyleProps: IChatButtonStyleProps = Object.assign({}, defaultOutOfOfficeChatButtonStyleProps, outOfOfficeButtonProps?.styleProps);
    const controlProps: IChatButtonControlProps = {
        id: "oc-lcw-chat-button",
        dir: state.domainStates.globalDir,
        titleText: "Let's Chat!",
        subtitleText: "We're online.",
        hideNotificationBubble: buttonProps?.controlProps?.hideNotificationBubble === true || state.appStates.isMinimized === false,
        unreadMessageCount: state.appStates.unreadMessageCount ? (state.appStates.unreadMessageCount > Constants.maximumUnreadMessageCount ? props.buttonProps?.controlProps?.largeUnreadMessageString : state.appStates.unreadMessageCount.toString()) : "0",
        onClick: () => ref.current(),
        unreadMessageString: props.buttonProps?.controlProps?.unreadMessageString,
        ...buttonProps?.controlProps,
    };

    const outOfOfficeControlProps: IChatButtonControlProps = {
        id: "oc-lcw-chat-button",
        dir: state.domainStates.globalDir,
        titleText: "We're Offline",
        subtitleText: "No agents available",
        onClick: async () => {
            TelemetryHelper.logActionEvent(LogLevel.INFO, {
                Event: TelemetryEvent.LCWChatButtonClicked
            });

            state.appStates.isMinimized && dispatch({ type: LiveChatWidgetActionType.SET_MINIMIZED, payload: false });
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.OutOfOffice });
        },
        unreadMessageString: props.buttonProps?.controlProps?.unreadMessageString,
        ...outOfOfficeButtonProps?.controlProps
    };

    useEffect(() => {
        if (state.appStates.outsideOperatingHours) {
            setOutOfOperatingHours(true);
        }
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
            Event: TelemetryEvent.LCWChatButtonShow,
            ElapsedTimeInMilliseconds: TelemetryTimers.LcwLoadToChatButtonTimer.milliSecondsElapsed
        });

        if (state.uiStates.focusChatButton) {
            setFocusOnElement(document.getElementById(controlProps?.id ?? "oc-lcw-chat-button") as HTMLElement);
        } else {
            dispatch({ type: LiveChatWidgetActionType.SET_FOCUS_CHAT_BUTTON, payload: true });
        }
    }, []);

    return (
        <ChatButton
            componentOverrides={buttonProps?.componentOverrides}
            controlProps={outOfOperatingHours ? outOfOfficeControlProps : controlProps}
            styleProps={outOfOperatingHours ? outOfOfficeStyleProps : buttonProps?.styleProps}
        />
    );
};

export default ChatButtonStateful;