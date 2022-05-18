import { LogLevel, TelemetryEvent } from "../../common/telemetry/TelemetryConstants";
import React, { Dispatch, useEffect, useState } from "react";
import { findAllFocusableElement, findParentFocusableElementsWithoutChildContainer, preventFocusToMoveOutOfElement, setFocusOnElement, setFocusOnSendBox, setTabIndices } from "../../common/utils";

import { DimLayer } from "../dimlayer/DimLayer";
import { IChatTranscriptBody } from "./interfaces/IChatTranscriptBody";
import { IEmailTranscriptPaneProps } from "./interfaces/IEmailTranscriptPaneProps";
import { IInputValidationPaneControlProps } from "@microsoft/omnichannel-chat-components/lib/types/components/inputvalidationpane/interfaces/IInputValidationPaneControlProps";
import { ILiveChatWidgetAction } from "../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../contexts/common/ILiveChatWidgetContext";
import { InputValidationPane } from "@microsoft/omnichannel-chat-components";
import { LiveChatWidgetActionType } from "../../contexts/common/LiveChatWidgetActionType";
import { NotificationHandler } from "../webchatcontainerstateful/webchatcontroller/notification/NotificationHandler";
import { NotificationScenarios } from "../webchatcontainerstateful/webchatcontroller/enums/NotificationScenarios";
import { Regex } from "../../common/Constants";
import { TelemetryHelper } from "../../common/telemetry/TelemetryHelper";
import useChatContextStore from "../../hooks/useChatContextStore";
import useChatSDKStore from "../../hooks/useChatSDKStore";

export const EmailTranscriptPaneStateful = (props: IEmailTranscriptPaneProps) => {
    const initialTabIndexMap: Map<string, number> = new Map();
    let elements: HTMLElement[] | null = [];
    const [state, dispatch]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chatSDK: any = useChatSDKStore();
    const [initialEmail, setInitialEmail] = useState("");
    const closeEmailTranscriptPane = () => {
        dispatch({ type: LiveChatWidgetActionType.SET_SHOW_EMAIL_TRANSCRIPT_PANE, payload: false });
        const previousFocused = state.appStates.previousElementOnFocusBeforeModalOpen;
        if (previousFocused) {
            setFocusOnElement(previousFocused);
        } else {
            setFocusOnSendBox();
        }
        dispatch({ type: LiveChatWidgetActionType.SET_PREVIOUS_FOCUSED_ELEMENT, payload: null });
        setTabIndices(elements, initialTabIndexMap, true);
    };

    const controlProps: IInputValidationPaneControlProps = {
        id: "oclcw-emailTranscriptDialogContainer",
        dir: state.domainStates.globalDir,
        onSend: async (email: string) => {
            closeEmailTranscriptPane();
            const chatTranscriptBody: IChatTranscriptBody = {
                emailAddress: email,
                attachmentMessage: props?.attachmentMessage ?? "The following attachment was uploaded during the conversation:"
            };
            try {
                await chatSDK?.emailLiveChatTranscript(chatTranscriptBody);
                TelemetryHelper.logActionEvent(LogLevel.INFO, {
                    Event: TelemetryEvent.EmailTranscriptSent,
                    Description: "Transcript sent to email successfully."
                });
            } catch (ex) {
                TelemetryHelper.logActionEvent(LogLevel.ERROR, {
                    Event: TelemetryEvent.EmailTranscriptFailed,
                    ExceptionDetails: {
                        exception: ex
                    }
                });
                NotificationHandler.notifyError(
                    NotificationScenarios.EmailTranscriptError,
                    props?.bannerMessageOnError ?? "Email transcript to " + email + " failed.");
            }
        },
        onCancel: () => {
            TelemetryHelper.logActionEvent(LogLevel.INFO, { Event: TelemetryEvent.EmailTranscriptCancelButtonClicked, Description: "Email Transcript cancel button clicked." });
            closeEmailTranscriptPane();
        },
        checkInput: function (input: string) {
            return (new RegExp(Regex.EmailRegex)).test(input);
        },
        ...props.controlProps,
        inputInitialText: props.controlProps?.inputInitialText ?? initialEmail
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
        setInitialEmail(state.appStates.preChatResponseEmail);
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, { Event: TelemetryEvent.EmailTranscriptLoaded });
    }, [initialEmail]);

    return (
        <>
            {!controlProps?.disableDimLayer && <DimLayer brightness={controlProps?.brightnessValueOnDim ?? "0.2"} />}
            <InputValidationPane
                componentOverrides={props.componentOverrides}
                controlProps={controlProps}
                styleProps={props.styleProps} />
        </>
    );
};

export default EmailTranscriptPaneStateful;