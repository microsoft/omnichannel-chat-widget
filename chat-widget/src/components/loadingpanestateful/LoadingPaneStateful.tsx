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

// export const LoadingPaneStateful = (props: ILoadingPaneProps, startChatErrorPaneProps: IStartChatErrorPaneProps) => {
// export const LoadingPaneStateful = (props: ILoadingPaneStatefulParams) => {
export const LoadingPaneStateful = (props: any) => {
    console.log("ADAD LoadingPaneProps props", props);
    const [state, ]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    const { loadingPaneProps, startChatErrorPaneProps } = props;
    console.log("ADAD loadingPaneProps", loadingPaneProps);
    console.log("ADAD startChatErrorPaneProps", startChatErrorPaneProps);
    const generalLoadingPaneStyleProps: IStyle = Object.assign({}, defaultGeneralLoadingPaneStyleProps, loadingPaneProps.styleProps?.generalStyleProps);
    const loadingPaneStyleProps: ILoadingPaneStyleProps = {
        ...loadingPaneProps.styleProps,
        generalStyleProps: generalLoadingPaneStyleProps
    };
    const errorUIStyleProps: ILoadingPaneStyleProps = {
        ...errorUILoadingPaneStyleProps
    };

    const loadingPaneControlProps: ILoadingPaneControlProps = {
        id: "oc-lcw-loading-pane",
        dir: state.domainStates.globalDir,
        ...loadingPaneProps.controlProps
    };

    const errorUIControlProps: ILoadingPaneControlProps = {
        ...props.controlProps,
        id: "oc-lcw-alert-pane",
        dir: state.domainStates.globalDir,
        titleText: startChatErrorPaneProps.controlProps?.titleText ?? "Chat is failing to load.",
        subtitleText: startChatErrorPaneProps.controlProps?.subtitleText ?? "Please Close the chat and try again.",
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
    console.log("ADAD loadingPaneControlProps", loadingPaneControlProps);
    
    return (
        <LoadingPane
            componentOverrides={loadingPaneProps.componentOverrides}
            controlProps={state.appStates.isStartChatFailing ? errorUIControlProps : loadingPaneControlProps}
            styleProps={state.appStates.isStartChatFailing ? errorUIStyleProps : loadingPaneStyleProps}
            windowWidth={width}
            windowHeight={height}
        />
    );
};

export default LoadingPaneStateful;