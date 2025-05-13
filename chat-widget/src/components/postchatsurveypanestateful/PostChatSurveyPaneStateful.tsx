import { LogLevel, TelemetryEvent } from "../../common/telemetry/TelemetryConstants";
import React, { Dispatch, useEffect } from "react";

import { ParticipantType } from "../../common/Constants";
import { CustomerVoiceEvents } from "./enums/CustomerVoiceEvents";
import { ILiveChatWidgetAction } from "../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../contexts/common/ILiveChatWidgetContext";
import { IPostChatSurveyPaneControlProps } from "@microsoft/omnichannel-chat-components/lib/types/components/postchatsurveypane/interfaces/IPostChatSurveyPaneControlProps";
import { IPostChatSurveyPaneStatefulProps } from "./interfaces/IPostChatSurveyPaneStatefulProps";
import { IPostChatSurveyPaneStyleProps } from "@microsoft/omnichannel-chat-components/lib/types/components/postchatsurveypane/interfaces/IPostChatSurveyPaneStyleProps";
import { IStyle } from "@fluentui/react";
import { PostChatSurveyMode } from "./enums/PostChatSurveyMode";
import { PostChatSurveyPane } from "@microsoft/omnichannel-chat-components";
import { TelemetryHelper } from "../../common/telemetry/TelemetryHelper";
import { defaultGeneralPostChatSurveyPaneStyleProps } from "./common/defaultStyleProps/defaultgeneralPostChatSurveyPaneStyleProps";
import { findAllFocusableElement } from "../../common/utils";
import useChatContextStore from "../../hooks/useChatContextStore";
import isValidSurveyUrl from "./common/isValidSurveyUrl";

const generateSurveyInviteLink = (surveyInviteLink: string, isEmbed: boolean, locale: string, compact: boolean, showMultiLingual = false) => {
    const surveyLinkParams = new URLSearchParams({
        embed: isEmbed.toString(),
        compact: (compact ?? true).toString(),
        lang: locale ?? "en-us",
        showmultilingual: (showMultiLingual ?? false).toString(),
    });
    return `${surveyInviteLink}&${surveyLinkParams.toString()}`;
};

export const PostChatSurveyPaneStateful = (props: IPostChatSurveyPaneStatefulProps) => {
    const [state]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();

    const generalStyleProps: IStyle = Object.assign({}, defaultGeneralPostChatSurveyPaneStyleProps, props.styleProps?.generalStyleProps,
        { display: state.appStates.isMinimized ? "none" : "contents" });

    let surveyInviteLink = "";
    const surveyMode = (state?.appStates?.selectedSurveyMode === PostChatSurveyMode.Embed);

    if (state.domainStates.postChatContext.botSurveyInviteLink && // Bot survey enabled
        state.appStates.postChatParticipantType === ParticipantType.Bot) { // Only Bot has engaged
        surveyInviteLink = generateSurveyInviteLink(
            state.domainStates.postChatContext.botSurveyInviteLink,
            surveyMode,
            state.domainStates.postChatContext.botFormsProLocale,
            props.isCustomerVoiceSurveyCompact ?? true);
    } else {
        surveyInviteLink = generateSurveyInviteLink(
            state.domainStates.postChatContext.surveyInviteLink,
            surveyMode,
            state.domainStates.postChatContext.formsProLocale,
            props.isCustomerVoiceSurveyCompact ?? true);
    }

    if (props.copilotSurveyContext) {
        surveyInviteLink = `${surveyInviteLink}&mcs_additionalcontext=${JSON.stringify(props.copilotSurveyContext)}`;
    }

    const styleProps: IPostChatSurveyPaneStyleProps = {
        ...props.styleProps,
        generalStyleProps: generalStyleProps
    };

    const controlProps: IPostChatSurveyPaneControlProps = {
        id: "oc-lcw-postchatsurvey-pane",
        surveyURL: props.controlProps?.surveyURL ?? surveyInviteLink,
        ...props.controlProps
    };

    if (controlProps.surveyURL) {
        if (!isValidSurveyUrl(controlProps.surveyURL)) {
            TelemetryHelper.logLoadingEvent(LogLevel.ERROR, {
                Event: TelemetryEvent.PostChatSurveyUrlValidationFailed,
                Description: `${controlProps.surveyURL} is not a valid Survey URL`
            });

            controlProps.surveyURL = "";
        } else {
            TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
                Event: TelemetryEvent.PostChatSurveyUrlValidationCompleted,
                Description: `${controlProps.surveyURL} is a valid Survey URL`
            });
        }
    }

    // Move focus to the first button
    useEffect(() => {
        const firstElement: HTMLElement[] | null = findAllFocusableElement(`#${controlProps.id}`);
        if (firstElement && firstElement[0]) {
            firstElement[0].focus();
        }
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, { Event: TelemetryEvent.PostChatSurveyLoaded });

        //Customer Voice Telemetry Events
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.addEventListener("message", (message: any) => {
            const { data } = message;

            if (!data) return;
            if (data === CustomerVoiceEvents.ResponsePageLoaded) {
                TelemetryHelper.logActionEvent(LogLevel.INFO, { Event: TelemetryEvent.CustomerVoiceResponsePageLoaded });
            } else if (data === CustomerVoiceEvents.FormResponseSubmitted) {
                TelemetryHelper.logActionEventToAllTelemetry(LogLevel.INFO, {
                    Event: TelemetryEvent.CustomerVoiceFormResponseSubmitted
                });
            } else if (data === CustomerVoiceEvents.FormResponseError) {
                TelemetryHelper.logActionEventToAllTelemetry(LogLevel.ERROR, {
                    Event: TelemetryEvent.CustomerVoiceFormResponseError
                });
            }
        });
    }, []);

    return (
        <PostChatSurveyPane
            controlProps={controlProps}
            styleProps={styleProps}
        />
    );
};

export default PostChatSurveyPaneStateful;