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
import { detectAndCleanXSS } from "../../common/utils/xssUtils";
import useChatContextStore from "../../hooks/useChatContextStore";

let uiTimer : ITimer;

export const OutOfOfficeHoursPaneStateful = (props: IOOOHPaneProps) => {

    useEffect(() => {
        uiTimer = createTimer();
        TelemetryHelper.logLoadingEventToAllTelemetry(LogLevel.INFO, {
            Event: TelemetryEvent.UXOutOfOfficeHoursPaneStart,
            Description: "Out of office hours pane loading started."
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
        
        if (state.domainStates.widgetElementId !== null && state.domainStates.widgetElementId !== undefined && state.domainStates.widgetElementId.trim() !== "") {
            const firstElement: HTMLElement[] | null = findAllFocusableElement(`#${state.domainStates.widgetElementId}`);
            if (firstElement && firstElement[0]) {
                firstElement[0].focus();
            }
        }
        
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, { Event: TelemetryEvent.OutOfOfficePaneLoaded });
        TelemetryHelper.logLoadingEventToAllTelemetry(LogLevel.INFO, {
            Event: TelemetryEvent.UXOutOfOfficeHoursPaneCompleted,
            Description: "Out of office hours pane loading completed.",
            ElapsedTimeInMilliseconds: uiTimer.milliSecondsElapsed
        });
    }, []);
    
    // Enhanced titleText sanitization
    if (controlProps?.titleText) {
        const { cleanText, isXSSDetected } = detectAndCleanXSS(controlProps.titleText);
        
        if (isXSSDetected) {
            TelemetryHelper.logLoadingEventToAllTelemetry(LogLevel.WARN, {
                Event: TelemetryEvent.UXOutOfOfficeHoursPaneCompleted,
                Description: "Potential XSS attempt detected in titleText",
                CustomProperties: {
                    originalText: controlProps.titleText.substring(0, 100), // Log first 100 chars for analysis
                    cleanedText: cleanText.substring(0, 100),
                    userAgent: navigator.userAgent
                }
            });
            controlProps.titleText = FALLBACK_TITLE_TEXT;
        }
        
        TelemetryHelper.logLoadingEventToAllTelemetry(LogLevel.INFO, {
            Event: TelemetryEvent.UXOutOfOfficeHoursPaneCompleted,
            Description: "Sanitized titleText",
            CustomProperties: {
                sanitizedText: cleanText.substring(0, 100) // Log first 100 chars for analysis
            }
        });
        controlProps.titleText = cleanText;
        
        // Additional validation - remove if still contains suspicious content
        if (controlProps.titleText.length === 0 || 
            controlProps.titleText.includes("<") || 
            controlProps.titleText.includes(">") ||
            controlProps.titleText.includes("javascript:") ||
            /on\w+\s*=/gi.test(controlProps.titleText)) {
            
            TelemetryHelper.logLoadingEventToAllTelemetry(LogLevel.ERROR, {
                Event: TelemetryEvent.UXOutOfOfficeHoursPaneCompleted,
                Description: "TitleText failed security validation, using fallback",
                CustomProperties: {
                    failedText: controlProps.titleText
                }
            });
            // Fallback to safe default
            controlProps.titleText = "Thanks for contacting us. You have reached us outside of our operating hours. An agent will respond when we open.";
        }
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