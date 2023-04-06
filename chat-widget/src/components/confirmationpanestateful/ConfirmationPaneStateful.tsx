import { LogLevel, TelemetryEvent } from "../../common/telemetry/TelemetryConstants";
import { ConfirmationPane } from "@microsoft/omnichannel-chat-components";
import React, { Dispatch, useEffect } from "react";
import { findAllFocusableElement, findParentFocusableElementsWithoutChildContainer, preventFocusToMoveOutOfElement, setFocusOnElement, setFocusOnSendBox, setTabIndices } from "../../common/utils";
import { DimLayer } from "../dimlayer/DimLayer";
import { IConfirmationPaneControlProps } from "@microsoft/omnichannel-chat-components/lib/types/components/confirmationpane/interfaces/IConfirmationPaneControlProps";
import { IConfirmationPaneStatefulParams } from "./interfaces/IConfirmationPaneStatefulParams";
import { ILiveChatWidgetAction } from "../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../contexts/common/ILiveChatWidgetContext";
import { LiveChatWidgetActionType } from "../../contexts/common/LiveChatWidgetActionType";
import { TelemetryHelper } from "../../common/telemetry/TelemetryHelper";
import useChatContextStore from "../../hooks/useChatContextStore";
import { ConfirmationState } from "../../common/Constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ConfirmationPaneStateful = (props: IConfirmationPaneStatefulParams) => {

    const initialTabIndexMap: Map<string, number> = new Map();
    let elements: HTMLElement[] | null = [];

    const [state, dispatch]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    const controlProps: IConfirmationPaneControlProps = {
        id: "oc-lcw-confirmation-pane",
        dir: state.domainStates.globalDir,
        onConfirm: async () => {
            TelemetryHelper.logActionEvent(LogLevel.INFO, {
                Event: TelemetryEvent.ConfirmationConfirmButtonClicked,
                Description: "Confirmation pane Confirm button clicked"
            });
            dispatch({ type: LiveChatWidgetActionType.SET_SHOW_CONFIRMATION, payload: false });
            dispatch({ type: LiveChatWidgetActionType.SET_CONFIRMATION_STATE, payload: ConfirmationState.Ok });
            setTabIndices(elements, initialTabIndexMap, true);
            TelemetryHelper.logActionEvent(LogLevel.INFO, {
                Event: TelemetryEvent.ConversationEndedByCustomer,
                Description: "Conversation is ended by customer."
            });
        },
        onCancel: () => {
            TelemetryHelper.logActionEvent(LogLevel.INFO, {
                Event: TelemetryEvent.ConfirmationCancelButtonClicked,
                Description: "Confirmation pane Cancel button clicked."
            });
            dispatch({ type: LiveChatWidgetActionType.SET_SHOW_CONFIRMATION, payload: false });
            dispatch({ type: LiveChatWidgetActionType.SET_CONFIRMATION_STATE, payload: ConfirmationState.Cancel });
            const previousFocusedElementId = state.appStates.previousElementIdOnFocusBeforeModalOpen;

            if (previousFocusedElementId) {
                setFocusOnElement("#" + previousFocusedElementId);
                dispatch({ type: LiveChatWidgetActionType.SET_PREVIOUS_FOCUSED_ELEMENT_ID, payload: null });
            } else {
                setFocusOnSendBox();
            }

            setTabIndices(elements, initialTabIndexMap, true);
        },
        ...props?.controlProps
    };

    // Move focus to the first button
    useEffect(() => {
        preventFocusToMoveOutOfElement(controlProps.id as string);
        const focusableElements: HTMLElement[] | null = findAllFocusableElement(`#${controlProps.id}`);
        if (focusableElements) {
            focusableElements[0].focus();
        }

        elements = findParentFocusableElementsWithoutChildContainer(controlProps.id as string);
        setTabIndices(elements, initialTabIndexMap, false);
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, { Event: TelemetryEvent.ConfirmationPaneLoaded });
    }, []);

    return (
        <>
            <DimLayer brightness={controlProps?.brightnessValueOnDim ?? "0.2"} />
            <ConfirmationPane
                componentOverrides={props?.componentOverrides}
                controlProps={controlProps}
                styleProps={props?.styleProps} />
        </>
    );
};

export default ConfirmationPaneStateful;