import React, { Dispatch, useEffect } from "react";

import { ILiveChatWidgetAction } from "../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../contexts/common/ILiveChatWidgetContext";
import { ILoadingPaneControlProps } from "@microsoft/omnichannel-chat-components/lib/types/components/loadingpane/interfaces/ILoadingPaneControlProps";
import { ILoadingPaneProps } from "@microsoft/omnichannel-chat-components/lib/types/components/loadingpane/interfaces/ILoadingPaneProps";
import { ILoadingPaneStyleProps } from "@microsoft/omnichannel-chat-components/lib/types/components/loadingpane/interfaces/ILoadingPaneStyleProps";
import { IStyle } from "@fluentui/react";
import { LoadingPane } from "@microsoft/omnichannel-chat-components";
import { defaultGeneralPostChatLoadingPaneStyleProps } from "./common/defaultgeneralPostChatLoadingPaneStyleProps";
import { findAllFocusableElement } from "../../common/utils";
import useChatContextStore from "../../hooks/useChatContextStore";
import { TelemetryHelper } from "../../common/telemetry/TelemetryHelper";
import { LogLevel, TelemetryEvent } from "../../common/telemetry/TelemetryConstants";

export const PostChatLoadingPaneStateful = (props: ILoadingPaneProps) => {
    const [state, ]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    
    const generalStyleProps: IStyle = Object.assign({}, defaultGeneralPostChatLoadingPaneStyleProps, props.styleProps?.generalStyleProps);

    const styleProps: ILoadingPaneStyleProps = {
        ...props.styleProps,
        generalStyleProps: generalStyleProps
    };

    const controlProps: ILoadingPaneControlProps = {
        id: "oc-lcw-postchatloading-pane",
        dir: state.domainStates.globalDir,
        hideIcon: true,
        hideTitle: true,
        hideSpinner: true,
        hideSpinnerText: true,
        subtitleText: "Please take a moment to give us feedback about your chat experience. We are loading the survey for you now.",
        ...props.controlProps
    };

    // Move focus to the first button
    useEffect(() => {
        const firstElement: HTMLElement[] | null = findAllFocusableElement(`#${state.domainStates.widgetElementId}`);
        if (firstElement && firstElement[0]) {
            firstElement[0].focus();
        }
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, { Event: TelemetryEvent.PostChatSurveyLoadingPaneLoaded });
    }, []);
    
    return (
        <LoadingPane
            componentOverrides={props.componentOverrides}
            controlProps={controlProps}
            styleProps={styleProps}
        />
    );
};

export default PostChatLoadingPaneStateful;