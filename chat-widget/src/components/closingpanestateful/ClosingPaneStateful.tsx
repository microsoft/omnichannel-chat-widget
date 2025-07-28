import { LogLevel, TelemetryEvent } from "../../common/telemetry/TelemetryConstants";
import React, { Dispatch, useEffect } from "react";
import { createTimer, findAllFocusableElement } from "../../common/utils";

import { ClosingPaneConstants } from "../../common/Constants";
import { ILiveChatWidgetAction } from "../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../contexts/common/ILiveChatWidgetContext";
import { ILoadingPaneControlProps } from "@microsoft/omnichannel-chat-components/lib/types/components/loadingpane/interfaces/ILoadingPaneControlProps";
import { ILoadingPaneProps } from "@microsoft/omnichannel-chat-components/lib/types/components/loadingpane/interfaces/ILoadingPaneProps";
import { ILoadingPaneStyleProps } from "@microsoft/omnichannel-chat-components/lib/types/components/loadingpane/interfaces/ILoadingPaneStyleProps";
import { IStyle } from "@fluentui/react";
import { ITimer } from "../../common/interfaces/ITimer";
import { LoadingPane } from "@microsoft/omnichannel-chat-components";
import { TelemetryHelper } from "../../common/telemetry/TelemetryHelper";
import { defaultGeneralLoadingPaneStyleProps } from "../loadingpanestateful/common/defaultStyleProps/defaultgeneralLoadingPaneStyleProps";
import useChatContextStore from "../../hooks/useChatContextStore";
import useWindowDimensions from "../../hooks/useWindowDimensions";

let uiTimer : ITimer;

export const ClosingPaneStateful = (props: ILoadingPaneProps) => {

    useEffect(() => {
        uiTimer = createTimer();
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
            Event: TelemetryEvent.UXLoadingPaneStart
        });
    }, []);
    
    const [state, ]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();

    const generalClosingPaneStyleProps: IStyle = Object.assign({}, defaultGeneralLoadingPaneStyleProps, props.styleProps?.generalStyleProps);
    
    const closingPaneStyleProps: ILoadingPaneStyleProps = {
        ...props.styleProps,
        generalStyleProps: generalClosingPaneStyleProps
    };

    const closingPaneControlProps: ILoadingPaneControlProps = {
        id: ClosingPaneConstants.DefaultClosingPaneId,
        dir: state.domainStates.globalDir,
        titleText: ClosingPaneConstants.DefaultClosingPaneTitleText,
        subtitleText: ClosingPaneConstants.DefaultClosingPaneSubtitleText,
        ...props.controlProps
    };
    
    const { height, width } = useWindowDimensions();

    // Move focus to the first button
    useEffect(() => {
        const firstElement: HTMLElement[] | null = findAllFocusableElement(`#${state.domainStates.widgetElementId}`);
        if (firstElement && firstElement[0]) {
            firstElement[0].focus();
        }
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, { Event: TelemetryEvent.LoadingPaneLoaded, Description: "Closing pane loaded." });

        TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
            Event: TelemetryEvent.UXLoadingPaneCompleted,
            ElapsedTimeInMilliseconds: uiTimer.milliSecondsElapsed
        });
        
        return () => {
            TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
                Event: TelemetryEvent.LoadingPaneUnloaded,
                Description: "Closing pane unmount."
            });
        };
        
    }, []);
    
    return (
        <LoadingPane
            componentOverrides={props.componentOverrides}
            controlProps={closingPaneControlProps}
            styleProps={closingPaneStyleProps}
            windowWidth={width}
            windowHeight={height}
        />
    );
};

export default ClosingPaneStateful;