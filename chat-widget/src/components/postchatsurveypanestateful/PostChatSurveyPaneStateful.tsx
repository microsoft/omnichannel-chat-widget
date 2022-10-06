import { LogLevel, TelemetryEvent } from "../../common/telemetry/TelemetryConstants";
import React, { Dispatch, useEffect } from "react";

import { ILiveChatWidgetAction } from "../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../contexts/common/ILiveChatWidgetContext";
import { IPostChatSurveyPaneControlProps } from "@microsoft/omnichannel-chat-components/lib/types/components/postchatsurveypane/interfaces/IPostChatSurveyPaneControlProps";
import { IPostChatSurveyPaneProps } from "@microsoft/omnichannel-chat-components/lib/types/components/postchatsurveypane/interfaces/IPostChatSurveyPaneProps";
import { IPostChatSurveyPaneStyleProps } from "@microsoft/omnichannel-chat-components/lib/types/components/postchatsurveypane/interfaces/IPostChatSurveyPaneStyleProps";
import { IStyle } from "@fluentui/react";
import { PostChatSurveyPane } from "@microsoft/omnichannel-chat-components";
import { TelemetryHelper } from "../../common/telemetry/TelemetryHelper";
import { defaultGeneralPostChatSurveyPaneStyleProps } from "./common/defaultStyleProps/defaultgeneralPostChatSurveyPaneStyleProps";
import { findAllFocusableElement } from "../../common/utils";
import useChatContextStore from "../../hooks/useChatContextStore";
import { PostChatSurveyMode } from "./enums/PostChatSurveyMode";

export const PostChatSurveyPaneStateful = (props: IPostChatSurveyPaneProps) => {
    const [state]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    const postChatSurveyMode = state.domainStates.liveChatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_postconversationsurveymode;
    const generalStyleProps: IStyle = Object.assign({}, defaultGeneralPostChatSurveyPaneStyleProps, props.styleProps?.generalStyleProps,
        {display: state.appStates.isMinimized ? "none" : ""});
    let surveyInviteLink = "";
    if (state.domainStates.postChatContext.surveyInviteLink) {
        surveyInviteLink = state.domainStates.postChatContext.surveyInviteLink + "&embed=" + (postChatSurveyMode === PostChatSurveyMode.Embed).toString() + "&compact=true" + "&lang=" + (state.domainStates.postChatContext.formsProLocale ?? "en") + "&showmultilingual=false";
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
    }, []);
    
    return (
        <PostChatSurveyPane
            controlProps={controlProps}
            styleProps={styleProps}
        />
    );
};

export default PostChatSurveyPaneStateful;