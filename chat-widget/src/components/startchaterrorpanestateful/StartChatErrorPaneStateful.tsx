import React, { Dispatch, useEffect } from "react";
import { IStyle, IImageProps } from "@fluentui/react";

import { ILiveChatWidgetAction } from "../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../contexts/common/ILiveChatWidgetContext";
import { ILoadingPaneControlProps } from "@microsoft/omnichannel-chat-components/lib/types/components/loadingpane/interfaces/ILoadingPaneControlProps";
import { ILoadingPaneStyleProps } from "@microsoft/omnichannel-chat-components/lib/types/components/loadingpane/interfaces/ILoadingPaneStyleProps";
import { LoadingPane } from "@microsoft/omnichannel-chat-components";
import { findAllFocusableElement } from "../../common/utils";
import useChatContextStore from "../../hooks/useChatContextStore";
import { TelemetryHelper } from "../../common/telemetry/TelemetryHelper";
import { LogLevel, TelemetryEvent } from "../../common/telemetry/TelemetryConstants";
import { defaultStartChatErrorPaneGeneralStyleProps } from "./common/defaultStartChatErrorPaneGeneralStyleProps";
import { defaultStartChatErrorPaneTitleStyleProps } from "./common/defaultStartChatErrorPaneTitleStyleProps";
import { defaultStartChatErrorPaneSubtitleStyleProps } from "./common/defaultStartChatErrorPaneSubtitleStyleProps";
import { defaultStartChatErrorPaneIconStyleProps } from "./common/defaultStartChatErrorPaneIconStyleProps";
import { defaultStartChatErrorPaneIconImageStyleProps } from "./common/defaultStartChatErrorPaneIconImageProps";
import { IStartChatErrorPaneProps } from "./interfaces/IStartChatErrorPaneProps";
import { StartChatErrorPaneConstants } from "../../common/Constants";

export const StartChatErrorPaneStateful = (startChatErrorPaneProps: IStartChatErrorPaneProps) => {
    const [state, ]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    
    const generalStyleProps: IStyle = Object.assign({}, defaultStartChatErrorPaneGeneralStyleProps, startChatErrorPaneProps?.styleProps?.generalStyleProps);
    const titleStyleProps: IStyle = Object.assign({}, defaultStartChatErrorPaneTitleStyleProps, startChatErrorPaneProps?.styleProps?.titleStyleProps);
    const subtitleStyleProps: IStyle = Object.assign({}, defaultStartChatErrorPaneSubtitleStyleProps, startChatErrorPaneProps?.styleProps?.subtitleStyleProps);
    const iconStyleProps: IStyle = Object.assign({}, defaultStartChatErrorPaneIconStyleProps, startChatErrorPaneProps?.styleProps?.iconStyleProps);
    const iconImageProps: IImageProps = Object.assign({}, defaultStartChatErrorPaneIconImageStyleProps, startChatErrorPaneProps?.styleProps?.iconImageProps);

    const errorUIStyleProps: ILoadingPaneStyleProps = {
        generalStyleProps: generalStyleProps,
        titleStyleProps: titleStyleProps,
        subtitleStyleProps: subtitleStyleProps,
        iconStyleProps: iconStyleProps,
        iconImageProps: iconImageProps,
    };

    const errorPaneTitleText = startChatErrorPaneProps?.controlProps?.titleText ?? StartChatErrorPaneConstants.DefaultStartChatErrorTitleText;
    const errorPaneSubtitleText = startChatErrorPaneProps?.controlProps?.subtitleText ?? StartChatErrorPaneConstants.DefaultStartChatErrorSubtitleText;

    const errorUIControlProps: ILoadingPaneControlProps = {
        id: StartChatErrorPaneConstants.DefaultStartChatErrorPaneId,
        dir: state.domainStates.globalDir,
        titleText: errorPaneTitleText,
        subtitleText: errorPaneSubtitleText,
        hideSpinner: true,
        hideSpinnerText: true,
        ...startChatErrorPaneProps?.controlProps,
    };

    // Move focus to the first button
    useEffect(() => {
        const firstElement: HTMLElement[] | null = findAllFocusableElement(`#${state.domainStates.widgetElementId}`);
        if (firstElement && firstElement[0]) {
            firstElement[0].focus();
        }
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, { Event: TelemetryEvent.StartChatErrorPaneLoaded, Description: "Start chat error pane loaded." });
    }, []);
    
    return (
        <LoadingPane
            componentOverrides={startChatErrorPaneProps?.componentOverrides}
            controlProps={errorUIControlProps}
            styleProps={errorUIStyleProps}
        />
    );
};

export default StartChatErrorPaneStateful;