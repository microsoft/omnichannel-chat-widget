import { BroadcastEvent, LogLevel, TelemetryEvent } from "../../common/telemetry/TelemetryConstants";
import React, { Dispatch, useEffect, useState } from "react";
import { createTimer, setFocusOnElement } from "../../common/utils";

import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { Constants } from "../../common/Constants";
import { ConversationState } from "../../contexts/common/ConversationState";
import { ICustomEvent } from "@microsoft/omnichannel-chat-components/lib/types/interfaces/ICustomEvent";
import { ILiveChatWidgetAction } from "../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../contexts/common/ILiveChatWidgetContext";
import { IProactiveChatPaneControlProps } from "@microsoft/omnichannel-chat-components/lib/types/components/proactivechatpane/interfaces/IProactiveChatPaneControlProps";
import { LiveChatWidgetActionType } from "../../contexts/common/LiveChatWidgetActionType";
import { ProactiveChatPane } from "@microsoft/omnichannel-chat-components";
import { TelemetryHelper } from "../../common/telemetry/TelemetryHelper";
import { TelemetryTimers } from "../../common/telemetry/TelemetryManager";
import useChatContextStore from "../../hooks/useChatContextStore";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ProactiveChatPaneStateful = (props: any) => {
    const [state, dispatch]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    const { proactiveChatProps, startChat } = props;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [timeoutRemoved, setTimeoutRemoved] = useState(false);

    const handleProactiveChatInviteTimeout = () => {
        if (!timeoutRemoved) {
            setTimeoutRemoved(true);
            dispatch({
                type: LiveChatWidgetActionType.SET_PROACTIVE_CHAT_PARAMS, payload: {
                    proactiveChatBodyTitle: "",
                    proactiveChatEnablePrechat: false,
                    proactiveChatInNewWindow: false
                }
            });
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Closed });
            TelemetryHelper.logActionEvent(LogLevel.INFO, {
                Event: TelemetryEvent.ProactiveChatRejected,
                ElapsedTimeInMilliseconds: TelemetryTimers.LcwLoadToChatButtonTimer.milliSecondsElapsed,
                Description: "Proactive chat invitation timed out."
            });
        }
    };

    const controlProps: IProactiveChatPaneControlProps = {
        id: "oc-lcw-proactivechat",
        dir: state.domainStates.globalDir,
        onStart: async () => {
            setTimeoutRemoved(true);
            TelemetryHelper.logActionEvent(LogLevel.INFO, {
                Event: TelemetryEvent.ProactiveChatAccepted,
                Description: "Proactive chat accepted."
            });
            if (state.appStates.proactiveChatStates.proactiveChatInNewWindow) {
                // TODO: BroadcastService: replace with the sdk broadcast service, when in place
                const startPopoutChatEvent: ICustomEvent = {
                    eventName: BroadcastEvent.ProactiveChatStartPopoutChat,
                    payload: {
                        enablePrechat: state?.appStates?.proactiveChatStates?.proactiveChatEnablePrechat === true
                    }
                };
                BroadcastService.postMessage(startPopoutChatEvent);
                dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Closed });
            } else if (state.domainStates.liveChatConfig?.LiveWSAndLiveChatEngJoin?.OutOfOperatingHours === "True") {
                dispatch({ type: LiveChatWidgetActionType.SET_OUTSIDE_OPERATING_HOURS, payload: true });
                dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.OutOfOffice });
            } else {
                const proactiveChatStarted: ICustomEvent = {
                    eventName: BroadcastEvent.ProactiveChatStartChat,
                };
                BroadcastService.postMessage(proactiveChatStarted);
                await startChat();
            }
        },
        onClose: () => {
            setTimeoutRemoved(true);
            TelemetryHelper.logActionEvent(LogLevel.INFO, {
                Event: TelemetryEvent.ProactiveChatClosed,
                Description: "Proactive chat closed."
            });
            dispatch({
                type: LiveChatWidgetActionType.SET_PROACTIVE_CHAT_PARAMS, payload: {
                    proactiveChatBodyTitle: "",
                    proactiveChatEnablePrechat: false,
                    proactiveChatInNewWindow: false
                }
            });
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Closed });
        },
        ...proactiveChatProps?.controlProps,
        bodyTitleText: state.appStates.proactiveChatStates.proactiveChatBodyTitle ? 
            state.appStates.proactiveChatStates.proactiveChatBodyTitle : 
            proactiveChatProps?.controlProps?.bodyTitleText
    };

    useEffect(() => {
        setFocusOnElement(document.getElementById(controlProps.id + "-startbutton" as string) as HTMLElement);
        TelemetryTimers.ProactiveChatScreenTimer = createTimer();
        const timeoutEvent = setTimeout(() => {
            handleProactiveChatInviteTimeout();
        }, proactiveChatProps?.ProactiveChatInviteTimeoutInMs ?? Constants.ProactiveChatInviteTimeoutInMs);
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, { Event: TelemetryEvent.ProactiveChatPaneLoaded });
        return () => {
            clearTimeout(timeoutEvent);
        };
    }, []);

    return (
        <ProactiveChatPane
            componentOverrides={proactiveChatProps?.componentOverrides}
            controlProps={controlProps}
            styleProps={proactiveChatProps?.styleProps}
        />
    );
};

export default ProactiveChatPaneStateful;