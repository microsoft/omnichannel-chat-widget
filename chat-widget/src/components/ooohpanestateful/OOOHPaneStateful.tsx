import { LogLevel, TelemetryEvent } from "../../common/telemetry/TelemetryConstants";
import React, { Dispatch, useEffect } from "react";
import { createTimer, findAllFocusableElement } from "../../common/utils";

import { ILiveChatWidgetAction } from "../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../contexts/common/ILiveChatWidgetContext";
import { IOOOHPaneControlProps } from "@microsoft/omnichannel-chat-components/lib/types/components/outofofficehourspane/interfaces/IOOOHPaneControlProps";
import { IOOOHPaneProps } from "@microsoft/omnichannel-chat-components/lib/types/components/outofofficehourspane/interfaces/IOOOHPaneProps";
import { IOOOHPaneStyleProps } from "@microsoft/omnichannel-chat-components/lib/types/components/outofofficehourspane/interfaces/IOOOHPaneStyleProps";
import { IStyle } from "@fluentui/react";
import { ITimer } from "../../common/interfaces/ITimer";
import { OutOfOfficeHoursPane } from "@microsoft/omnichannel-chat-components";
import { TelemetryHelper } from "../../common/telemetry/TelemetryHelper";
import { defaultGeneralStyleProps } from "./common/defaultStyleProps/defaultgeneralOOOHPaneStyleProps";
import useChatContextStore from "../../hooks/useChatContextStore";
import DOMPurify from "dompurify";

let uiTimer : ITimer;
export const OutOfOfficeHoursPaneStateful = (props: IOOOHPaneProps) => {

    useEffect(() => {
        uiTimer = createTimer();
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
            Event: TelemetryEvent.UXOOHPaneStart,
            LogToAppInsights: false
        });
    }, []);

    const [state, ]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    
    const generalStyleProps: IStyle = Object.assign({}, defaultGeneralStyleProps, props.styleProps?.generalStyleProps);
    
    const styleProps: IOOOHPaneStyleProps = {
        ...props.styleProps,
        generalStyleProps: generalStyleProps
    };

    const controlProps: IOOOHPaneControlProps = {
        id: "oc-lcw-outofofficehours-pane",
        dir: state.domainStates.globalDir,
        ...props.controlProps
    };

    // Move focus to the first button
    useEffect(() => {
        const firstElement: HTMLElement[] | null = findAllFocusableElement(`#${state.domainStates.widgetElementId}`);
        if (firstElement && firstElement[0]) {
            firstElement[0].focus();
        }
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, { 
            Event: TelemetryEvent.OutOfOfficePaneLoaded,
            LogToAppInsights: false
        });
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
            Event: TelemetryEvent.UXOOHPaneCompleted,
            ElapsedTimeInMilliseconds: uiTimer.milliSecondsElapsed,
            LogToAppInsights: true
        });
    }, []);
    
    if (controlProps?.titleText) {
        controlProps.titleText = DOMPurify.sanitize(controlProps.titleText);
    }

    return (
        <OutOfOfficeHoursPane
            componentOverrides={props.componentOverrides}
            controlProps={controlProps}
            styleProps={styleProps}
        />
    );
};

export default OutOfOfficeHoursPaneStateful;