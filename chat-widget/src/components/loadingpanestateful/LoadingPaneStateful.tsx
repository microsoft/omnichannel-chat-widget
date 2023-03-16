import { LogLevel, TelemetryEvent } from "../../common/telemetry/TelemetryConstants";
import React, { Dispatch, useEffect } from "react";

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
import useWindowDimensions from "../../hooks/useWindowDimensions";
import { errorUILoadingPaneStyleProps } from "./common/errorUIStyleProps/errorUILoadingPaneStyleProps";

export const LoadingPaneStateful = (props: ILoadingPaneProps) => {
    console.log("ADAD LoadingPaneProps", props);
    const [state, ]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
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
        ...props.controlProps,
        id: "oc-lcw-alert-pane",
        dir: state.domainStates.globalDir,
        titleText: "We are unable to load chat at this time.",
        subtitleText: "Please try again later.",
        hideSpinner: true,
        hideSpinnerText: true
    };
    const { height, width } = useWindowDimensions();

    // Move focus to the first button
    useEffect(() => {
        const firstElement: HTMLElement[] | null = findAllFocusableElement(`#${state.domainStates.widgetElementId}`);
        if (firstElement && firstElement[0]) {
            firstElement[0].focus();
        }
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, { Event: TelemetryEvent.LoadingPaneLoaded, Description: "Loading pane loaded." });
    }, []);

    console.log("ADAD state.appStates.isStartChatFailing", state.appStates.isStartChatFailing);
    console.log("ADAD errorUIControlProps", errorUIControlProps);
    console.log("ADAD controlProps", controlProps);
    
    return (
        <LoadingPane
            componentOverrides={props.componentOverrides}
            controlProps={state.appStates.isStartChatFailing ? errorUIControlProps : controlProps}
            styleProps={state.appStates.isStartChatFailing ? errorUIStyleProps : styleProps}
            windowWidth={width}
            windowHeight={height}
        />
    );
};

export default LoadingPaneStateful;