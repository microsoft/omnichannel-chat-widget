import { LogLevel, TelemetryEvent } from "../../common/telemetry/TelemetryConstants";
import React, { Dispatch, useEffect, useRef, useState } from "react";
import { createTimer, setFocusOnElement } from "../../common/utils";

import { ChatButton } from "@microsoft/omnichannel-chat-components";
import { Constants } from "../../common/Constants";
import { ConversationState } from "../../contexts/common/ConversationState";
import { IChatButtonControlProps } from "@microsoft/omnichannel-chat-components/lib/types/components/chatbutton/interfaces/IChatButtonControlProps";
import { IChatButtonStatefulParams } from "./interfaces/IChatButtonStatefulParams";
import { IChatButtonStyleProps } from "@microsoft/omnichannel-chat-components/lib/types/components/chatbutton/interfaces/IChatButtonStyleProps";
import { ILiveChatWidgetAction } from "../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../contexts/common/ILiveChatWidgetContext";
import { ITimer } from "../../common/interfaces/ITimer";
import { LiveChatWidgetActionType } from "../../contexts/common/LiveChatWidgetActionType";
import { TelemetryHelper } from "../../common/telemetry/TelemetryHelper";
import { TelemetryTimers } from "../../common/telemetry/TelemetryManager";
import { defaultOutOfOfficeChatButtonStyleProps } from "./common/styleProps/defaultOutOfOfficeChatButtonStyleProps";
import useChatContextStore from "../../hooks/useChatContextStore";

let uiTimer : ITimer;
export const ChatButtonStateful = (props: IChatButtonStatefulParams) => {

    // this is to ensure the telemetry is set only once and start the load timer
    useEffect(() => {
        uiTimer = createTimer();
        TelemetryHelper.logLoadingEventToAllTelemetry(LogLevel.INFO, {
            Event: TelemetryEvent.UXLCWChatButtonLoadingStart,
            Description: "Chat button loading started"
        });
    }, []);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [state, dispatch]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    const { buttonProps, outOfOfficeButtonProps, startChat } = props;
    //Setting OutOfOperatingHours Flag
    //Setting OutOfOperatingHours Flag - to string conversion to normalize the value (could be boolean from other states or string directly from config)
    // Initialize with the current state value to prevent visual flicker
    const [outOfOperatingHours, setOutOfOperatingHours] = useState(() => {
        return state.appStates.conversationState === ConversationState.Closed && state.appStates.outsideOperatingHours;
    });
    const ref = useRef(() => {return;});

    ref.current = async () => {

        TelemetryHelper.logActionEventToAllTelemetry(LogLevel.INFO, {
            Event: TelemetryEvent.LCWChatButtonClicked,
            Description: "Chat button click action started"
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

        TelemetryHelper.logActionEventToAllTelemetry(LogLevel.INFO, {
            Event: TelemetryEvent.LCWChatButtonActionCompleted,
            Description: "Chat button action completed"
        });
    };

    const outOfOfficeStyleProps: IChatButtonStyleProps = Object.assign({}, defaultOutOfOfficeChatButtonStyleProps, outOfOfficeButtonProps?.styleProps);
    
    const controlProps: IChatButtonControlProps = {
        ...buttonProps?.controlProps,
        id: "oc-lcw-chat-button",
        dir: state.domainStates.globalDir,
        titleText: "Let's Chat!",
        subtitleText: "We're online.",
        hideNotificationBubble: buttonProps?.controlProps?.hideNotificationBubble === true || state.appStates.isMinimized === false,
        unreadMessageCount: state.appStates.unreadMessageCount ? (state.appStates.unreadMessageCount > Constants.maximumUnreadMessageCount ? props.buttonProps?.controlProps?.largeUnreadMessageString : state.appStates.unreadMessageCount.toString()) : "0",
        unreadMessageString: props.buttonProps?.controlProps?.unreadMessageString,
        // Regular chat button onClick - this will always take precedence
        onClick: () => ref.current()
    };

    const outOfOfficeControlProps: IChatButtonControlProps = {
        // Only take specific properties from outOfOfficeButtonProps, never onClick
        id: "oc-lcw-chat-button",
        dir: state.domainStates.globalDir,
        titleText: outOfOfficeButtonProps?.controlProps?.titleText || "We're Offline",
        subtitleText: outOfOfficeButtonProps?.controlProps?.subtitleText || "No agents available",
        unreadMessageString: props.buttonProps?.controlProps?.unreadMessageString,
        // Copy any other safe properties but explicitly exclude onClick
        ...(outOfOfficeButtonProps?.controlProps && (() => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { onClick, titleText, subtitleText, id, dir, ...rest } = outOfOfficeButtonProps.controlProps;
            return rest;
        })()),
        // Out-of-office specific onClick - this will ALWAYS take precedence
        onClick: () => {
            if (state.appStates.isMinimized) {
                dispatch({ type: LiveChatWidgetActionType.SET_MINIMIZED, payload: false });
            }
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.OutOfOffice });
        }
    };

    useEffect(() => {
        
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
            Event: TelemetryEvent.LCWChatButtonShow,
            ElapsedTimeInMilliseconds: TelemetryTimers.LcwLoadToChatButtonTimer.milliSecondsElapsed
        });

        if (state.uiStates.focusChatButton) {
            setFocusOnElement(document.getElementById(controlProps?.id ?? "oc-lcw-chat-button") as HTMLElement);
        } else {
            dispatch({ type: LiveChatWidgetActionType.SET_FOCUS_CHAT_BUTTON, payload: true });
        }

        TelemetryHelper.logLoadingEventToAllTelemetry(LogLevel.INFO, {
            Event: TelemetryEvent.UXLCWChatButtonLoadingCompleted,
            Description: "Chat button loading completed",
            ElapsedTimeInMilliseconds: uiTimer.milliSecondsElapsed
        }); 
    }, []);

    useEffect(() => {
        if (state.appStates.conversationState === ConversationState.Closed) {   
            // If the conversation state is closed, check if we are outside operating hours
            const isOutsideOperatingHours = state.appStates.outsideOperatingHours;
            setOutOfOperatingHours(isOutsideOperatingHours);
        } else {
            // If conversation state is not Closed, we should not be in out-of-office mode
            if (outOfOperatingHours) {
                setOutOfOperatingHours(false);
            }
        }     
    }, [state.appStates.conversationState, state.appStates.outsideOperatingHours, state.appStates.isMinimized]);


    return (
        <ChatButton
            componentOverrides={buttonProps?.componentOverrides}
            controlProps={outOfOperatingHours ? outOfOfficeControlProps : controlProps}
            styleProps={outOfOperatingHours ? outOfOfficeStyleProps : buttonProps?.styleProps}
        />
    );
};

export default ChatButtonStateful;