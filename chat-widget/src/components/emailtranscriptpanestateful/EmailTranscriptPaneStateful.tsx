import { LogLevel, TelemetryEvent } from "../../common/telemetry/TelemetryConstants";
import React, { Dispatch, useCallback, useEffect, useState } from "react";
import { announceMessageImmediately, createTimer, findAllFocusableElement, findParentFocusableElementsWithoutChildContainer, formatTemplateString, preventFocusToMoveOutOfElement, setFocusOnElement, setFocusOnSendBox, setTabIndices } from "../../common/utils";

import { DimLayer } from "../dimlayer/DimLayer";
import { FacadeChatSDK } from "../../common/facades/FacadeChatSDK";
import { IChatTranscriptBody } from "./interfaces/IChatTranscriptBody";
import { IEmailTranscriptPaneProps } from "./interfaces/IEmailTranscriptPaneProps";
import { IInputValidationPaneControlProps } from "@microsoft/omnichannel-chat-components/lib/types/components/inputvalidationpane/interfaces/IInputValidationPaneControlProps";
import { ILiveChatWidgetAction } from "../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../contexts/common/ILiveChatWidgetContext";
import { ITimer } from "../../common/interfaces/ITimer";
import { InputValidationPane } from "@microsoft/omnichannel-chat-components";
import { LiveChatWidgetActionType } from "../../contexts/common/LiveChatWidgetActionType";
import { NotificationHandler } from "../webchatcontainerstateful/webchatcontroller/notification/NotificationHandler";
import { NotificationScenarios } from "../webchatcontainerstateful/webchatcontroller/enums/NotificationScenarios";
import { Regex } from "../../common/Constants";
import { TelemetryHelper } from "../../common/telemetry/TelemetryHelper";
import { defaultMiddlewareLocalizedTexts } from "../webchatcontainerstateful/common/defaultProps/defaultMiddlewareLocalizedTexts";
import useChatContextStore from "../../hooks/useChatContextStore";
import useFacadeSDKStore from "../../hooks/useFacadeChatSDKStore";

let uiTimer : ITimer;

export const EmailTranscriptPaneStateful = (props: IEmailTranscriptPaneProps) => {
    // this is to ensure the telemetry is set only once and start the load timer
    useEffect(() => {
        uiTimer = createTimer();
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
            Event: TelemetryEvent.UXEmailTranscriptPaneStart
        });
    }, []);

    const initialTabIndexMap: Map<string, number> = new Map();
    let elements: HTMLElement[] | null = [];
    const [state, dispatch]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    
    const [facadeChatSDK]: [FacadeChatSDK | undefined, (facadeChatSDK: FacadeChatSDK) => void] = useFacadeSDKStore();
    const [initialEmail, setInitialEmail] = useState("");
    // restoreFocus=false is used on the submit path: the notification banner
    // (success or error) takes focus via NotificationHandler.setFocusOnNotificationCloseButton,
    // so an intermediate restore to the chat-widget shell would otherwise cause SRs to
    // announce "Enter <widget>" in between the dialog and the banner.
    const closeEmailTranscriptPane = (restoreFocus = true) => {
        dispatch({ type: LiveChatWidgetActionType.SET_SHOW_EMAIL_TRANSCRIPT_PANE, payload: false });
        if (restoreFocus) {
            const previousFocusedElementId = state.appStates.previousElementIdOnFocusBeforeModalOpen;
            if (previousFocusedElementId) {
                setFocusOnElement("#" + previousFocusedElementId);
            } else {
                setFocusOnSendBox();
            }
        }
        dispatch({ type: LiveChatWidgetActionType.SET_PREVIOUS_FOCUSED_ELEMENT_ID, payload: null });
        setTabIndices(elements, initialTabIndexMap, true);
    };

    const onSend = useCallback(async (email: string) => {
        const liveChatContext = state?.domainStates?.liveChatContext;
        closeEmailTranscriptPane(false);
        const chatTranscriptBody: IChatTranscriptBody = {
            emailAddress: email,
            attachmentMessage: props?.attachmentMessage ?? "The following attachment was uploaded during the conversation:"
        };
        try {
            await facadeChatSDK?.emailLiveChatTranscript(chatTranscriptBody, {liveChatContext});
            const successMessage = state?.domainStates?.middlewareLocalizedTexts?.MIDDLEWARE_BANNER_FILE_EMAIL_ADDRESS_RECORDED_SUCCESS ?? defaultMiddlewareLocalizedTexts?.MIDDLEWARE_BANNER_FILE_EMAIL_ADDRESS_RECORDED_SUCCESS as string;
            // Announce from a live region at document.body level so the
            // screen reader speaks the confirmation immediately, without
            // traversing the chat transcript on the way to the banner.
            // Prefix with the explicit state word so SR users hear the outcome
            // (visual users already see a success icon on the banner).
            const successSrPrefix = state?.domainStates?.middlewareLocalizedTexts?.MIDDLEWARE_SR_PREFIX_SUCCESS ?? defaultMiddlewareLocalizedTexts.MIDDLEWARE_SR_PREFIX_SUCCESS as string;
            announceMessageImmediately(`${successSrPrefix}${successMessage}`);
            NotificationHandler.notifySuccess(NotificationScenarios.EmailAddressSaved, successMessage);
            TelemetryHelper.logActionEventToAllTelemetry(LogLevel.INFO, {
                Event: TelemetryEvent.EmailTranscriptSent,
                Description: "Transcript sent to email successfully."
            });
        } catch (ex) {
            TelemetryHelper.logActionEventToAllTelemetry(LogLevel.ERROR, {
                Event: TelemetryEvent.EmailTranscriptFailed,
                Description: "Email transcript failed.",
                ExceptionDetails: {
                    exception: ex
                }
            });
            const message = formatTemplateString(state?.domainStates?.middlewareLocalizedTexts?.MIDDLEWARE_BANNER_FILE_EMAIL_ADDRESS_RECORDED_ERROR ?? defaultMiddlewareLocalizedTexts.MIDDLEWARE_BANNER_FILE_EMAIL_ADDRESS_RECORDED_ERROR as string, [email]);
            const bannerMessage = props?.bannerMessageOnError ?? message;
            const errorSrPrefix = state?.domainStates?.middlewareLocalizedTexts?.MIDDLEWARE_SR_PREFIX_ERROR ?? defaultMiddlewareLocalizedTexts.MIDDLEWARE_SR_PREFIX_ERROR as string;
            announceMessageImmediately(`${errorSrPrefix}${bannerMessage}`);
            NotificationHandler.notifyError(
                NotificationScenarios.EmailTranscriptError,
                bannerMessage);
        }
    }, [props.attachmentMessage, props.bannerMessageOnError, facadeChatSDK, state.domainStates.liveChatContext]);

    const controlProps: IInputValidationPaneControlProps = {
        id: "oclcw-emailTranscriptDialogContainer",
        dir: state.domainStates.globalDir,
        onSend,
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
        const cleanup = preventFocusToMoveOutOfElement(controlProps.id as string);
        const focusableElements: HTMLElement[] | null = findAllFocusableElement(`#${controlProps.id}`);
        if (focusableElements) {
            focusableElements[0].focus();
        }
        elements = findParentFocusableElementsWithoutChildContainer(controlProps.id as string);
        setTabIndices(elements, initialTabIndexMap, false);
        setInitialEmail(state.appStates.preChatResponseEmail);
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, { Event: TelemetryEvent.EmailTranscriptLoaded });

        TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
            Event: TelemetryEvent.UXEmailTranscriptPaneCompleted,
            ElapsedTimeInMilliseconds: uiTimer.milliSecondsElapsed
        });

        return () => {
            // internal tracking: restore parent tab indices on unmount.
            setTabIndices(elements, initialTabIndexMap, true);
            cleanup();
        };
    }, [initialEmail]);

    return (
        <>
            <DimLayer brightness={controlProps?.brightnessValueOnDim ?? "0.2"} />
            <InputValidationPane
                componentOverrides={props.componentOverrides}
                controlProps={controlProps}
                styleProps={props.styleProps} />
        </>
    );
};

export default EmailTranscriptPaneStateful;