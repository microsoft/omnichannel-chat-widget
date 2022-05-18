import { LogLevel, TelemetryEvent } from "../../common/telemetry/TelemetryConstants";
import React, { Dispatch, useEffect } from "react";

import { ILiveChatWidgetAction } from "../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../contexts/common/ILiveChatWidgetContext";
import { IOOOHPaneControlProps } from "@microsoft/omnichannel-chat-components/lib/types/components/outofofficehourspane/interfaces/IOOOHPaneControlProps";
import { IOOOHPaneProps } from "@microsoft/omnichannel-chat-components/lib/types/components/outofofficehourspane/interfaces/IOOOHPaneProps";
import { IOOOHPaneStyleProps } from "@microsoft/omnichannel-chat-components/lib/types/components/outofofficehourspane/interfaces/IOOOHPaneStyleProps";
import { IStyle } from "@fluentui/react";
import { OutOfOfficeHoursPane } from "@microsoft/omnichannel-chat-components";
import { TelemetryHelper } from "../../common/telemetry/TelemetryHelper";
import { defaultGeneralStyleProps } from "./common/defaultStyleProps/defaultgeneralOOOHPaneStyleProps";
import { findAllFocusableElement } from "../../common/utils";
import useChatContextStore from "../../hooks/useChatContextStore";

export const OutOfOfficeHoursPaneStateful = (props: IOOOHPaneProps) => {
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
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, { Event: TelemetryEvent.OutOfOfficePaneLoaded });
    }, []);
    
    return (
        <OutOfOfficeHoursPane
            componentOverrides={props.componentOverrides}
            controlProps={controlProps}
            styleProps={styleProps}
        />
    );
};

export default OutOfOfficeHoursPaneStateful;