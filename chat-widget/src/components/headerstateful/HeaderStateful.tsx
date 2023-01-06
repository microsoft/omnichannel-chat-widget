import { LogLevel, TelemetryEvent } from "../../common/telemetry/TelemetryConstants";
import React, { Dispatch, useEffect, useRef, useState } from "react";

import { ConversationState } from "../../contexts/common/ConversationState";
import { Header } from "@microsoft/omnichannel-chat-components";
import { IHeaderControlProps } from "@microsoft/omnichannel-chat-components/lib/types/components/header/interfaces/IHeaderControlProps";
import { IHeaderStatefulParams } from "./interfaces/IHeaderStatefulParams";
import { IHeaderStyleProps } from "@microsoft/omnichannel-chat-components/lib/types/components/header/interfaces/IHeaderStyleProps";
import { ILiveChatWidgetAction } from "../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../contexts/common/ILiveChatWidgetContext";
import { LiveChatWidgetActionType } from "../../contexts/common/LiveChatWidgetActionType";
import { TelemetryHelper } from "../../common/telemetry/TelemetryHelper";
import { defaultOutOfOfficeHeaderStyleProps } from "./common/styleProps/defaultOutOfOfficeHeaderStyleProps";
import useChatAdapterStore from "../../hooks/useChatAdapterStore";
import useChatContextStore from "../../hooks/useChatContextStore";

export const HeaderStateful = (props: IHeaderStatefulParams) => {

    const [state, dispatch]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [adapter,]: [any, (adapter: any) => void] = useChatAdapterStore();
    const { headerProps, outOfOfficeHeaderProps, endChat } = props;
    //Setting OutOfOperatingHours Flag
    const [outOfOperatingHours, setOutOfOperatingHours] = useState(state.domainStates.liveChatConfig?.LiveWSAndLiveChatEngJoin?.OutOfOperatingHours === "True");

    const outOfOfficeStyleProps: IHeaderStyleProps = Object.assign({}, defaultOutOfOfficeHeaderStyleProps, outOfOfficeHeaderProps?.styleProps);
    const conversationState = useRef(state.appStates.conversationState);
    const conversationEndedByAgent = useRef(state.appStates.conversationEndedByAgent);
    const controlProps: IHeaderControlProps = {
        id: "oc-lcw-header",
        dir: state.domainStates.globalDir,
        onMinimizeClick: () => {
            TelemetryHelper.logActionEvent(LogLevel.INFO, { Event: TelemetryEvent.HeaderMinimizeButtonClicked, Description: "Header Minimize button clicked." });
            dispatch({ type: LiveChatWidgetActionType.SET_MINIMIZED, payload: true });
        },
        onCloseClick: async () => {
            TelemetryHelper.logActionEvent(LogLevel.INFO, { Event: TelemetryEvent.HeaderCloseButtonClicked, Description: "Header Close button clicked." });
            if (conversationState.current === ConversationState.Active || conversationEndedByAgent.current) {
                dispatch({ type: LiveChatWidgetActionType.SET_SHOW_CONFIRMATION, payload: true });
            } else {
                const skipEndChatSDK = true;
                const skipCloseChat = false;
                const postMessageToOtherTabs = true;
                await endChat(adapter, skipEndChatSDK, skipCloseChat, postMessageToOtherTabs);
            }
            const closeButtonId = props.headerProps?.controlProps?.closeButtonProps?.id ?? `${controlProps.id}-close-button`;
            if (closeButtonId) {
                dispatch({ type: LiveChatWidgetActionType.SET_PREVIOUS_FOCUSED_ELEMENT_ID, payload: closeButtonId });
            }
        },
        ...headerProps?.controlProps,
        hideTitle: (state.appStates.conversationState === ConversationState.Loading && !state.appStates.isStartChatFailing) || state.appStates.conversationState === ConversationState.PostchatLoading || headerProps?.controlProps?.hideTitle,
        hideIcon: (state.appStates.conversationState === ConversationState.Loading && !state.appStates.isStartChatFailing) || state.appStates.conversationState === ConversationState.PostchatLoading || headerProps?.controlProps?.hideIcon,
        hideCloseButton: (state.appStates.conversationState === ConversationState.Loading && !state.appStates.isStartChatFailing) || state.appStates.conversationState === ConversationState.Prechat || state.appStates.conversationState === ConversationState.ReconnectChat || headerProps?.controlProps?.hideCloseButton
    };

    const outOfOfficeControlProps: IHeaderControlProps = {
        id: "oc-lcw-header",
        dir: state.domainStates.globalDir,
        headerTitleProps: {
            text: "We're Offline"
        },
        onMinimizeClick: () => {
            dispatch({ type: LiveChatWidgetActionType.SET_MINIMIZED, payload: true });
        },
        ...outOfOfficeHeaderProps?.controlProps,
        hideCloseButton: state.appStates.conversationState === ConversationState.OutOfOffice || outOfOfficeHeaderProps?.controlProps?.hideCloseButton
    };

    useEffect(() => {
        if (state.appStates.outsideOperatingHours) {
            setOutOfOperatingHours(true);
        }
        if (state.appStates.conversationState) {
            conversationState.current = state.appStates.conversationState;
        }
        conversationEndedByAgent.current = state.appStates.conversationEndedByAgent;
    }, [state.appStates]);


    return (
        <Header
            componentOverrides={headerProps?.componentOverrides}
            controlProps={(outOfOperatingHours || state.appStates.conversationState === ConversationState.OutOfOffice) ? outOfOfficeControlProps : controlProps}
            styleProps={(outOfOperatingHours || state.appStates.conversationState === ConversationState.OutOfOffice) ? outOfOfficeStyleProps : headerProps?.styleProps}
        />
    );
};

export default HeaderStateful;