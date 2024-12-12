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
import { ConfirmationState } from "../../common/Constants";
import DraggableEventEmitter from "../draggable/DraggableEventEmitter";

export const HeaderStateful = (props: IHeaderStatefulParams) => {

    const [state, dispatch]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [adapter,]: [any, (adapter: any) => void] = useChatAdapterStore();
    const { headerProps, outOfOfficeHeaderProps, endChat } = props;
    //Setting OutOfOperatingHours Flag
    const [outOfOperatingHours, setOutOfOperatingHours] = useState(state.domainStates.liveChatConfig?.LiveWSAndLiveChatEngJoin?.OutOfOperatingHours === "True");

    const outOfOfficeStyleProps: IHeaderStyleProps = Object.assign({}, defaultOutOfOfficeHeaderStyleProps, outOfOfficeHeaderProps?.styleProps);

    // For some reason state object is not getting updated values in this component
    const localConfirmationPaneState = useRef(state?.domainStates?.confirmationState);

    const controlProps: IHeaderControlProps = {
        id: "oc-lcw-header",
        dir: state.domainStates.globalDir,
        onMinimizeClick: () => {
            TelemetryHelper.logActionEvent(LogLevel.INFO, { Event: TelemetryEvent.HeaderMinimizeButtonClicked, Description: "Header Minimize button clicked." });
            dispatch({ type: LiveChatWidgetActionType.SET_MINIMIZED, payload: true });
            dispatch({ type: LiveChatWidgetActionType.SET_UNREAD_MESSAGE_COUNT, payload: 0 });
        },
        onCloseClick: async () => {
            TelemetryHelper.logActionEvent(LogLevel.INFO, { Event: TelemetryEvent.HeaderCloseButtonClicked, Description: "Header Close button clicked." });

            if (localConfirmationPaneState.current !== ConfirmationState.Ok) {
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
        hideTitle: (state.appStates.conversationState === ConversationState.Loading && !state.appStates.startChatFailed) || state.appStates.conversationState === ConversationState.PostchatLoading || headerProps?.controlProps?.hideTitle,
        hideIcon: (state.appStates.conversationState === ConversationState.Loading && !state.appStates.startChatFailed) || state.appStates.conversationState === ConversationState.PostchatLoading || headerProps?.controlProps?.hideIcon,
        hideCloseButton: (state.appStates.conversationState === ConversationState.Loading && !state.appStates.startChatFailed) || state.appStates.conversationState === ConversationState.PostchatLoading || state.appStates.conversationState === ConversationState.Prechat || state.appStates.conversationState === ConversationState.ReconnectChat || headerProps?.controlProps?.hideCloseButton
    };

    const outOfOfficeControlProps: IHeaderControlProps = {
        id: "oc-lcw-header",
        dir: state.domainStates.globalDir,
        headerTitleProps: {
            text: "We're Offline"
        },
        onMinimizeClick: () => {
            TelemetryHelper.logActionEvent(LogLevel.INFO, { Event: TelemetryEvent.HeaderMinimizeButtonClicked, Description: "Header Minimize button clicked." });
            dispatch({ type: LiveChatWidgetActionType.SET_MINIMIZED, payload: true });
        },
        ...outOfOfficeHeaderProps?.controlProps,
        hideCloseButton: state.appStates.conversationState === ConversationState.OutOfOffice || outOfOfficeHeaderProps?.controlProps?.hideCloseButton
    };

    useEffect(() => {
        if (state.appStates.outsideOperatingHours) {
            setOutOfOperatingHours(true);
        }
    }, []);

    useEffect(() => {
        localConfirmationPaneState.current = state?.domainStates?.confirmationState;
    }, [state?.domainStates?.confirmationState]);

    const draggableEventEmitterProps = {
        channel: props.draggableEventChannel ?? "lcw",
        elementId: (outOfOperatingHours || state.appStates.conversationState === ConversationState.OutOfOffice) ? outOfOfficeControlProps.id as string : controlProps.id as string,
        targetWindow: props.draggableEventEmitterTargetWindow ?? window
    };

    if (props.draggable === true) {
        const styleProps = (outOfOperatingHours || state.appStates.conversationState === ConversationState.OutOfOffice) ? outOfOfficeStyleProps : headerProps?.styleProps;
        const draggableSelectors = {
            "&:hover": {
                cursor: "move"
            }
        };

        const selectors = Object.assign({}, (styleProps as any)?.generalStyleProps?.selectors || {}, draggableSelectors); // eslint-disable-line @typescript-eslint/no-explicit-any
        const generalStyleProps = Object.assign({}, styleProps?.generalStyleProps, {selectors});
        const draggableStyleProps = Object.assign({}, styleProps, {generalStyleProps});

        return (
            <DraggableEventEmitter {...draggableEventEmitterProps}>
                <Header
                    componentOverrides={headerProps?.componentOverrides}
                    controlProps={(outOfOperatingHours || state.appStates.conversationState === ConversationState.OutOfOffice) ? outOfOfficeControlProps : controlProps}
                    styleProps={draggableStyleProps}
                />
            </DraggableEventEmitter>
        );
    }

    return (
        <Header
            componentOverrides={headerProps?.componentOverrides}
            controlProps={(outOfOperatingHours || state.appStates.conversationState === ConversationState.OutOfOffice) ? outOfOfficeControlProps : controlProps}
            styleProps={(outOfOperatingHours || state.appStates.conversationState === ConversationState.OutOfOffice) ? outOfOfficeStyleProps : headerProps?.styleProps}
        />
    );
};

export default HeaderStateful;