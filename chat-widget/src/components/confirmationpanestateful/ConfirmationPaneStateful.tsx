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
import { NotificationHandler } from "../webchatcontainerstateful/webchatcontroller/notification/NotificationHandler";
import { NotificationScenarios } from "../webchatcontainerstateful/webchatcontroller/enums/NotificationScenarios";
import { TelemetryHelper } from "../../common/telemetry/TelemetryHelper";
import useChatAdapterStore from "../../hooks/useChatAdapterStore";
import useChatContextStore from "../../hooks/useChatContextStore";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ConfirmationPaneStateful = (props: IConfirmationPaneStatefulParams) => {

    const initialTabIndexMap: Map<string, number> = new Map();
    let elements: HTMLElement[] | null = [];

    const [state, dispatch]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    const { prepareEndChat } = props;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [adapter,]: [any, (adapter: any) => void] = useChatAdapterStore();

    const controlProps: IConfirmationPaneControlProps = {
        id: "oc-lcw-confirmation-pane",
        dir: state.domainStates.globalDir,
        onConfirm: async () => {
            TelemetryHelper.logActionEvent(LogLevel.INFO, {
                Event: TelemetryEvent.ConfirmationConfirmButtonClicked,
                Description: "Confirmation pane Confirm button clicked"
            });
            dispatch({ type: LiveChatWidgetActionType.SET_SHOW_CONFIRMATION, payload: false });
            try {
                setTabIndices(elements, initialTabIndexMap, true);
                await prepareEndChat(adapter, state);
            } catch (ex) {
                TelemetryHelper.logSDKEvent(LogLevel.ERROR, {
                    Event: TelemetryEvent.GetConversationDetailsCallFailed,
                    ExceptionDetails: {
                        exception: `Get Conversation Details Call Failed : ${ex}`
                    }
                });
                NotificationHandler.notifyError(NotificationScenarios.Connection, "Get Conversation Details Call Failed: " + ex);
            }
        },
        onCancel: () => {
            TelemetryHelper.logActionEvent(LogLevel.INFO, {
                Event: TelemetryEvent.ConfirmationCancelButtonClicked,
                Description: "Confirmation pane Cancel button clicked."
            });
            dispatch({ type: LiveChatWidgetActionType.SET_SHOW_CONFIRMATION, payload: false });
            const previousFocused = state.appStates.previousElementOnFocusBeforeModalOpen;

            if (previousFocused) {
                setFocusOnElement(previousFocused);
                dispatch({ type: LiveChatWidgetActionType.SET_PREVIOUS_FOCUSED_ELEMENT, payload: null });
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
            {!controlProps?.disableDimLayer && <DimLayer brightness={controlProps?.brightnessValueOnDim ?? "0.2"} />}
            <ConfirmationPane
                componentOverrides={props?.componentOverrides}
                controlProps={controlProps}
                styleProps={props?.styleProps} />
        </>
    );
};

export default ConfirmationPaneStateful;