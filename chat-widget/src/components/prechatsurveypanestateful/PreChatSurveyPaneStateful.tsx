import { HtmlAttributeNames, Regex } from "../../common/Constants";
import { LogLevel, TelemetryEvent } from "../../common/telemetry/TelemetryConstants";
import React, { Dispatch, useEffect } from "react";
import { extractPreChatSurveyResponseValues, findAllFocusableElement, getStateFromCache, getWidgetCacheId, isUndefinedOrEmpty, parseAdaptiveCardPayload } from "../../common/utils";
import MarkdownIt from "markdown-it";
import { ConversationState } from "../../contexts/common/ConversationState";
import { ILiveChatWidgetAction } from "../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../contexts/common/ILiveChatWidgetContext";
import { IPreChatSurveyPaneControlProps } from "@microsoft/omnichannel-chat-components/lib/types/components/prechatsurveypane/interfaces/IPreChatSurveyPaneControlProps";
import { IPreChatSurveyPaneStatefulParams } from "./interfaces/IPreChatSurveyPaneStatefulParams";
import { IPreChatSurveyPaneStyleProps } from "@microsoft/omnichannel-chat-components/lib/types/components/prechatsurveypane/interfaces/IPreChatSurveyPaneStyleProps";
import { IStyle } from "@fluentui/react";
import { LiveChatWidgetActionType } from "../../contexts/common/LiveChatWidgetActionType";
import { PreChatSurveyPane } from "@microsoft/omnichannel-chat-components";
import StartChatOptionalParams from "@microsoft/omnichannel-chat-sdk/lib/core/StartChatOptionalParams";
import { TelemetryHelper } from "../../common/telemetry/TelemetryHelper";
import { defaultGeneralPreChatSurveyPaneStyleProps } from "./common/defaultStyles/defaultGeneralPreChatSurveyPaneStyleProps";
import { defaultPreChatSurveyLocalizedTexts } from "./common/defaultProps/defaultPreChatSurveyLocalizedTexts";
import useChatContextStore from "../../hooks/useChatContextStore";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PreChatSurveyPaneStateful = (props: IPreChatSurveyPaneStatefulParams) => {
    // Set MarkDown global variable to be used for prechat adaptive cards
    window["markdownit"] = MarkdownIt;

    const [state, dispatch]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    const { surveyProps, initStartChat } = props;
    const generalStyleProps: IStyle = Object.assign({}, defaultGeneralPreChatSurveyPaneStyleProps, surveyProps?.styleProps?.generalStyleProps,
        { display: state.appStates.isMinimized ? "none" : "" });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const setPreChatResponseEmail = (preChatResponse: { index: number, label: any, id: any, value: string }[]) => {
        if (preChatResponse) {
            for (let index = 0; index < preChatResponse.length; index++) {
                if ((new RegExp(Regex.EmailRegex)).test(preChatResponse[index].value)) {
                    dispatch({ type: LiveChatWidgetActionType.SET_PRECHAT_RESPONSE_EMAIL, payload: preChatResponse[index].value });
                }
            }
        }
    };

    const getAdaptiveCardPayload = (payload: string, requiredFieldMissingMessage: string) => {
        try {
            return parseAdaptiveCardPayload(payload, requiredFieldMissingMessage);
        } catch (ex) {
            TelemetryHelper.logConfigDataEvent(LogLevel.ERROR, {
                Event: TelemetryEvent.ParseAdaptiveCardFailed,
                Description: "Adaptive Card JSON Parse Failed.",
                ExceptionDetails: {
                    exception: ex
                }
            });
        }
    };

    const requiredFieldMissingMessage = props.surveyProps?.controlProps?.requiredFieldMissingMessage ?? defaultPreChatSurveyLocalizedTexts.PRECHAT_REQUIRED_FIELD_MISSING_MESSAGE;
    const controlProps: IPreChatSurveyPaneControlProps = {
        id: "oc-lcw-prechatsurvey-pane",
        dir: state.domainStates.globalDir,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        payload: getAdaptiveCardPayload(state.domainStates.preChatSurveyResponse, requiredFieldMissingMessage!),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onSubmit: async (values: { index: number, label: any, id: any, value: string }[]) => {
            TelemetryHelper.logActionEvent(LogLevel.INFO, { Event: TelemetryEvent.PrechatSubmitted });
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Loading });

            try {
                const widgetInstanceId = getWidgetCacheId(state.domainStates?.telemetryInternalData?.orgId ?? "",
                    state.domainStates.telemetryInternalData?.widgetId ?? "", state.domainStates.widgetInstanceId ?? "");
                const persistedState = getStateFromCache(widgetInstanceId);
                let optionalParams: StartChatOptionalParams = {};

                //Connect to Active chats and chat is not popout
                if (persistedState &&
                    !isUndefinedOrEmpty(persistedState?.domainStates?.liveChatContext) &&
                    persistedState?.appStates?.conversationState === ConversationState.Active &&
                    state?.appStates?.hideStartChatButton === false) {
                    optionalParams = { liveChatContext: persistedState?.domainStates?.liveChatContext };

                    await initStartChat(optionalParams, persistedState);
                } else {
                    const prechatResponseValues = extractPreChatSurveyResponseValues(state.domainStates.preChatSurveyResponse, values);

                    optionalParams = {
                        preChatResponse: prechatResponseValues
                    };

                    setPreChatResponseEmail(values);

                    await initStartChat(optionalParams);
                }
            } catch (ex) {
                TelemetryHelper.logActionEvent(LogLevel.ERROR, {
                    Event: TelemetryEvent.PreChatSurveyStartChatMethodFailed,
                    Description: "PreChat survey start chat failed.",
                    ExceptionDetails: {
                        exception: `PreChat survey start chat failed: ${ex}`
                    }
                });
            }
        },
        ...surveyProps?.controlProps
    };

    const styleProps: IPreChatSurveyPaneStyleProps = {
        ...surveyProps?.styleProps,
        generalStyleProps: generalStyleProps
    };

    useEffect(() => {
        // Set Aria-Label Attribute for Inputs
        const adaptiveCardElements = document.getElementsByClassName(HtmlAttributeNames.adaptiveCardClassName);
        if (adaptiveCardElements && adaptiveCardElements.length > 0) {
            const children = adaptiveCardElements[0].children;
            let value = "";
            for (let index = 0; index < children.length; index++) {
                const current = children[index];
                if (current && current.className == HtmlAttributeNames.adaptiveCardTextBlockClassName) {
                    value = current.innerHTML;
                    if (current.childElementCount > 0) {
                        const paragraph = current.children[0];
                        if (paragraph.tagName.toLowerCase() == HtmlAttributeNames.pTagName) {
                            value = paragraph.innerHTML;
                        }
                    }
                }

                if (current && current.tagName.toLowerCase() == HtmlAttributeNames.div && current.childElementCount > 0) {
                    const input = current.children[0].children;
                    if (input?.length > 0
                        && input[0].className != HtmlAttributeNames.adaptiveCardToggleInputClassName
                        && input[0].className != HtmlAttributeNames.adaptiveCardActionSetClassName) {
                        input[0].setAttribute(HtmlAttributeNames.ariaLabel, value);
                    }
                }
            }
        }
        // Move focus to the first button
        const firstElement: HTMLElement[] | null = findAllFocusableElement(`#${controlProps.id}`);
        if (firstElement && firstElement[0]) {
            firstElement[0].focus();
        }
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, { Event: TelemetryEvent.PrechatSurveyLoaded });
    }, []);

    return (
        <PreChatSurveyPane
            controlProps={controlProps}
            styleProps={styleProps} />
    );
};

export default PreChatSurveyPaneStateful;