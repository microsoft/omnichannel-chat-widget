import { LogLevel, TelemetryEvent } from "../../common/telemetry/TelemetryConstants";
import React, { Dispatch, useEffect, useState } from "react";

import { ILiveChatWidgetAction } from "../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../contexts/common/ILiveChatWidgetContext";
import { ILoadingPaneControlProps } from "@microsoft/omnichannel-chat-components/lib/types/components/loadingpane/interfaces/ILoadingPaneControlProps";
import { ILoadingPaneProps } from "@microsoft/omnichannel-chat-components/lib/types/components/loadingpane/interfaces/ILoadingPaneProps";
import { ILoadingPaneStyleProps } from "@microsoft/omnichannel-chat-components/lib/types/components/loadingpane/interfaces/ILoadingPaneStyleProps";
import { IStyle } from "@fluentui/react";
import { LoadingPane } from "@microsoft/omnichannel-chat-components";
import { TelemetryHelper } from "../../common/telemetry/TelemetryHelper";
import { defaultGeneralLoadingPaneStyleProps } from "./common/defaultStyleProps/defaultgeneralLoadingPaneStyleProps";
import { findAllFocusableElement } from "../../common/utils";
import useChatContextStore from "../../hooks/useChatContextStore";
import { errorUILoadingPaneStyleProps } from "./common/errorUIStyleProps/errorUILoadingPaneStyleProps";

export const LoadingPaneStateful = (props: ILoadingPaneProps) => {
    const [state, ]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    const [isStartChatFailing, setIsStartChatFailing] = useState(false);
    const generalStyleProps: IStyle = Object.assign({}, defaultGeneralLoadingPaneStyleProps, props.styleProps?.generalStyleProps);
    const styleProps: ILoadingPaneStyleProps = {
        ...props.styleProps,
        generalStyleProps: generalStyleProps
    };
    const errorUIStyleProps: ILoadingPaneStyleProps = {
        ...errorUILoadingPaneStyleProps
    };

    const controlProps: ILoadingPaneControlProps = {
        id: "oc-lcw-loading-pane",
        dir: state.domainStates.globalDir,
        ...props.controlProps
    };

    const errorUIControlProps: ILoadingPaneControlProps = {
        id: "oc-lcw-alert-pane",
        dir: state.domainStates.globalDir,
        titleText: "Chat is failing to load.",
        subtitleText: "Please Close the chat and try again.",
        hideSpinner: true,
        hideSpinnerText: true,
        ...props.controlProps
    };

    // Move focus to the first button
    useEffect(() => {
        const firstElement: HTMLElement[] | null = findAllFocusableElement(`#${state.domainStates.widgetElementId}`);
        if (firstElement && firstElement[0]) {
            firstElement[0].focus();
        }
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, { Event: TelemetryEvent.LoadingPaneLoaded, Description: "Loading pane loaded." });

        if (state.appStates.isStartChatFailing) {
            setIsStartChatFailing(true);
        }
    }, []);
    
    return (
        <LoadingPane
            componentOverrides={props.componentOverrides}
            controlProps={isStartChatFailing ? errorUIControlProps : controlProps}
            styleProps={isStartChatFailing ? errorUIStyleProps : styleProps}
        />
    );
};

export default LoadingPaneStateful;