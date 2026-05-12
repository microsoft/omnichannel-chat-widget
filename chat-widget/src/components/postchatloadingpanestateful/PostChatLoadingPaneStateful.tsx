import { LogLevel, TelemetryEvent } from "../../common/telemetry/TelemetryConstants";
import React, { Dispatch, useEffect, useState } from "react";
import { createTimer, findAllFocusableElement } from "../../common/utils";

import { ILiveChatWidgetAction } from "../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../contexts/common/ILiveChatWidgetContext";
import { ILoadingPaneControlProps } from "@microsoft/omnichannel-chat-components/lib/types/components/loadingpane/interfaces/ILoadingPaneControlProps";
import { ILoadingPaneProps } from "@microsoft/omnichannel-chat-components/lib/types/components/loadingpane/interfaces/ILoadingPaneProps";
import { ILoadingPaneStyleProps } from "@microsoft/omnichannel-chat-components/lib/types/components/loadingpane/interfaces/ILoadingPaneStyleProps";
import { IStyle } from "@fluentui/react";
import { ITimer } from "../../common/interfaces/ITimer";
import { LoadingPane } from "@microsoft/omnichannel-chat-components";
import { TelemetryHelper } from "../../common/telemetry/TelemetryHelper";
import { defaultGeneralPostChatLoadingPaneStyleProps } from "./common/defaultgeneralPostChatLoadingPaneStyleProps";
import useChatContextStore from "../../hooks/useChatContextStore";

let uiTimer : ITimer;

type LoadingPaneLiveRegionControlProps = ILoadingPaneControlProps & {
    "aria-atomic": "true";
    "aria-live": "polite";
};

export const PostChatLoadingPaneStateful = (props: ILoadingPaneProps) => {
    const defaultSubtitleText = "Please take a moment to give us feedback about your chat experience. We are loading the survey for you now.";
    const subtitleText = props.controlProps?.subtitleText ?? defaultSubtitleText;
    const [announcedSubtitleText, setAnnouncedSubtitleText] = useState("");

    useEffect(() => {
        uiTimer = createTimer();
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
            Event: TelemetryEvent.UXPostChatLoadingPaneStart
        });
    }, []);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setAnnouncedSubtitleText(subtitleText);
        }, 0);

        return () => window.clearTimeout(timeout);
    }, [subtitleText]);

    const [state, ]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    
    const generalStyleProps: IStyle = Object.assign({}, defaultGeneralPostChatLoadingPaneStyleProps, props.styleProps?.generalStyleProps);

    const styleProps: ILoadingPaneStyleProps = {
        ...props.styleProps,
        generalStyleProps: generalStyleProps
    };

    const controlProps: LoadingPaneLiveRegionControlProps = {
        id: "oc-lcw-postchatloading-pane",
        dir: state.domainStates.globalDir,
        hideIcon: true,
        hideTitle: true,
        hideSpinner: true,
        hideSpinnerText: true,
        ...props.controlProps,
        role: "status",
        "aria-live": "polite",
        "aria-atomic": "true",
        subtitleText: announcedSubtitleText
    };

    // Move focus to the first button
    useEffect(() => {
        const firstElement: HTMLElement[] | null = findAllFocusableElement(`#${state.domainStates.widgetElementId}`);
        if (firstElement && firstElement[0]) {
            firstElement[0].focus();
        }
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, { Event: TelemetryEvent.PostChatSurveyLoadingPaneLoaded });
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
            Event: TelemetryEvent.UXPostChatLoadingPaneCompleted,
            ElapsedTimeInMilliseconds: uiTimer.milliSecondsElapsed
        });
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
