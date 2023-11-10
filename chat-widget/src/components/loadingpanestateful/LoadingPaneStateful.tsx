import { LogLevel, TelemetryEvent } from "../../common/telemetry/TelemetryConstants";
import React, { Dispatch, useEffect } from "react";

import { ILiveChatWidgetAction } from "../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../contexts/common/ILiveChatWidgetContext";
import { ILoadingPaneControlProps } from "@microsoft/omnichannel-chat-components/lib/types/components/loadingpane/interfaces/ILoadingPaneControlProps";
import { ILoadingPaneStyleProps } from "@microsoft/omnichannel-chat-components/lib/types/components/loadingpane/interfaces/ILoadingPaneStyleProps";
import { IStyle } from "@fluentui/react";
import { LoadingPane } from "@microsoft/omnichannel-chat-components";
import { TelemetryHelper } from "../../common/telemetry/TelemetryHelper";
import { defaultGeneralLoadingPaneStyleProps } from "./common/defaultStyleProps/defaultgeneralLoadingPaneStyleProps";
import { findAllFocusableElement } from "../../common/utils";
import useChatContextStore from "../../hooks/useChatContextStore";
import useWindowDimensions from "../../hooks/useWindowDimensions";
import { ILoadingPaneProps } from "@microsoft/omnichannel-chat-components/lib/types/components/loadingpane/interfaces/ILoadingPaneProps";

export const LoadingPaneStateful = (loadingPaneProps: ILoadingPaneProps) => {
    const [state, ]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();

    const generalLoadingPaneStyleProps: IStyle = Object.assign({}, defaultGeneralLoadingPaneStyleProps, loadingPaneProps?.styleProps?.generalStyleProps);
    const loadingPaneStyleProps: ILoadingPaneStyleProps = {
        ...loadingPaneProps?.styleProps,
        generalStyleProps: generalLoadingPaneStyleProps
    };

    const loadingPaneControlProps: ILoadingPaneControlProps = {
        id: "oc-lcw-loading-pane",
        dir: state.domainStates.globalDir,
        ...loadingPaneProps?.controlProps
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
    
    return (
        <LoadingPane
            componentOverrides={loadingPaneProps?.componentOverrides}
            controlProps={loadingPaneControlProps}
            styleProps={loadingPaneStyleProps}
            windowWidth={width}
            windowHeight={height}
        />
    );
};

export default LoadingPaneStateful;