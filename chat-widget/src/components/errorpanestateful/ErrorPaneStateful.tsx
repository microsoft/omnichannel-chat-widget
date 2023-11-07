import React, { Dispatch, useEffect } from "react";

import { ILiveChatWidgetAction } from "../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../contexts/common/ILiveChatWidgetContext";
import { ILoadingPaneControlProps } from "@microsoft/omnichannel-chat-components/lib/types/components/loadingpane/interfaces/ILoadingPaneControlProps";
import { ILoadingPaneProps } from "@microsoft/omnichannel-chat-components/lib/types/components/loadingpane/interfaces/ILoadingPaneProps";
import { ILoadingPaneStyleProps } from "@microsoft/omnichannel-chat-components/lib/types/components/loadingpane/interfaces/ILoadingPaneStyleProps";
import { LoadingPane } from "@microsoft/omnichannel-chat-components";
import { findAllFocusableElement } from "../../common/utils";
import useChatContextStore from "../../hooks/useChatContextStore";
import { TelemetryHelper } from "../../common/telemetry/TelemetryHelper";
import { LogLevel, TelemetryEvent } from "../../common/telemetry/TelemetryConstants";
import { errorUILoadingPaneStyleProps } from "../loadingpanestateful/common/errorUIStyleProps/errorUILoadingPaneStyleProps";
import { StartChatFailureType } from "../../contexts/common/StartChatFailureType";

export const ErrorPaneStateful = (props: ILoadingPaneProps) => { // TODO how can we expose message here?
    const [state, ]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    
    // const generalStyleProps: IStyle = Object.assign({}, defaultGeneralErrorPaneStyleProps, props.styleProps?.generalStyleProps);

    const errorUIStyleProps: ILoadingPaneStyleProps = {
        ...errorUILoadingPaneStyleProps
    };

    // const styleProps: ILoadingPaneStyleProps = {
    //     ...props.styleProps,
    //     generalStyleProps: generalStyleProps
    // };

    const errorUIControlProps: ILoadingPaneControlProps = {
        ...props?.controlProps,
        id: "oc-lcw-error-pane",
        dir: state.domainStates.globalDir,
        titleText: "We are unable to load chat at this time.",
        subtitleText: "Please try again later.",
        hideSpinner: true,
        hideSpinnerText: true
    };

    // const controlProps: ILoadingPaneControlProps = {
    //     id: "oc-lcw-error-pane",
    //     dir: state.domainStates.globalDir,
    //     hideIcon: true,
    //     hideTitle: true,
    //     hideSpinner: true,
    //     hideSpinnerText: true,
    //     subtitleText: "Error pane with customized string.",
    //     ...props.controlProps
    // };

    console.log("ADAD errorUIControlProps before", errorUIControlProps);

    console.log("ADAD state.domainStates.startChatFailureType", state.domainStates.startChatFailureType);

    if (state.domainStates.startChatFailureType === StartChatFailureType.Authentication) {
        errorUIControlProps.titleText = "Chat authentication has failed.";
        errorUIControlProps.subtitleText = "Please check authentication setup and try again.";
    }

    console.log("ADAD errorUIControlProps after", errorUIControlProps);

    // Move focus to the first button
    useEffect(() => {
        const firstElement: HTMLElement[] | null = findAllFocusableElement(`#${state.domainStates.widgetElementId}`);
        if (firstElement && firstElement[0]) {
            firstElement[0].focus();
        }
        console.log("ADAD new error pane loaded!!!");
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, { Event: TelemetryEvent.StartChatErrorPaneLoaded });
    }, []);
    
    return (
        <LoadingPane
            componentOverrides={props.componentOverrides}
            controlProps={errorUIControlProps}
            styleProps={errorUIStyleProps}
        />
    );
};

export default ErrorPaneStateful;