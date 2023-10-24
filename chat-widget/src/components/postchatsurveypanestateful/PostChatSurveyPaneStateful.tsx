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

const generateSurveyInviteLink = (surveyInviteLink: string, isEmbed: boolean, locale: string, compact: boolean, showMultiLingual = false) => {
    const surveyLink = `${surveyInviteLink}
            &embed=${isEmbed.toString()}
            &compact=${compact.toString() ?? "true"}
            &lang=${locale ?? "en-us"}
            &showmultilingual=${showMultiLingual.toString() ?? "false"}`;
    return surveyLink;
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

    const styleProps: IPostChatSurveyPaneStyleProps = {
        ...props.styleProps,
        generalStyleProps: generalStyleProps
    };

    const controlProps: IPostChatSurveyPaneControlProps = {
        id: "oc-lcw-postchatsurvey-pane",
        surveyURL: props.controlProps?.surveyURL ?? surveyInviteLink,
        ...props.controlProps
    };

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
                TelemetryHelper.logActionEvent(LogLevel.INFO, { Event: TelemetryEvent.CustomerVoiceFormResponseSubmitted });
            } else if (data === CustomerVoiceEvents.FormResponseError) {
                TelemetryHelper.logActionEvent(LogLevel.ERROR, { Event: TelemetryEvent.CustomerVoiceFormResponseError });
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