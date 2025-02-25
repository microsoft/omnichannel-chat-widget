import { LogLevel, TelemetryEvent } from "../../common/telemetry/TelemetryConstants";
import React, { Dispatch, useEffect } from "react";
import { createTimer, findAllFocusableElement } from "../../common/utils";

import { ILiveChatWidgetAction } from "../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../contexts/common/ILiveChatWidgetContext";
import { ILoadingPaneControlProps } from "@microsoft/omnichannel-chat-components/lib/types/components/loadingpane/interfaces/ILoadingPaneControlProps";
import { ILoadingPaneStyleProps } from "@microsoft/omnichannel-chat-components/lib/types/components/loadingpane/interfaces/ILoadingPaneStyleProps";
import { IStyle } from "@fluentui/react";
import { ITimer } from "../../common/interfaces/ITimer";
import { LoadingPane } from "@microsoft/omnichannel-chat-components";
import { TelemetryHelper } from "../../common/telemetry/TelemetryHelper";
import { defaultGeneralLoadingPaneStyleProps } from "./common/defaultStyleProps/defaultgeneralLoadingPaneStyleProps";
import { errorUILoadingPaneStyleProps } from "./common/errorUIStyleProps/errorUILoadingPaneStyleProps";
import useChatContextStore from "../../hooks/useChatContextStore";
import useWindowDimensions from "../../hooks/useWindowDimensions";

let uiTimer : ITimer;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const LoadingPaneStateful = (props: any) => {

    useEffect(() => {
        uiTimer = createTimer();
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
            Event: TelemetryEvent.UXLoadingPaneStart
        });
    }, []);
    
    const [state, ]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    const { loadingPaneProps, startChatErrorPaneProps } = props;

    const generalLoadingPaneStyleProps: IStyle = Object.assign({}, defaultGeneralLoadingPaneStyleProps, loadingPaneProps?.styleProps?.generalStyleProps);
    const loadingPaneStyleProps: ILoadingPaneStyleProps = {
        ...loadingPaneProps?.styleProps,
        generalStyleProps: generalLoadingPaneStyleProps
    };

    const errorUIStyleProps: ILoadingPaneStyleProps = {
        ...errorUILoadingPaneStyleProps
    };

    const loadingPaneControlProps: ILoadingPaneControlProps = {
        id: "oc-lcw-loading-pane",
        dir: state.domainStates.globalDir,
        ...loadingPaneProps?.controlProps
    };

    const errorUIControlProps: ILoadingPaneControlProps = {
        ...loadingPaneProps?.controlProps,
        id: "oc-lcw-alert-pane",
        dir: state.domainStates.globalDir,
        titleText: startChatErrorPaneProps?.controlProps?.titleText ?? "We are unable to load chat at this time.",
        subtitleText: startChatErrorPaneProps?.controlProps?.subtitleText ?? "Please try again later.",
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

        TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
            Event: TelemetryEvent.UXLoadingPaneCompleted,
            ElapsedTimeInMilliseconds: uiTimer.milliSecondsElapsed
        });
        
        return () => {
            TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
                Event: TelemetryEvent.LoadingPaneUnloaded,
                Description: "Loading pane unmount."
            });
        };
        
    }, []);
    
    return (
        <LoadingPane
            componentOverrides={loadingPaneProps?.componentOverrides}
            controlProps={state.appStates.startChatFailed ? errorUIControlProps : loadingPaneControlProps}
            styleProps={state.appStates.startChatFailed ? errorUIStyleProps : loadingPaneStyleProps}
            windowWidth={width}
            windowHeight={height}
        />
    );
};

export default LoadingPaneStateful;