import { IImageProps, IStyle } from "@fluentui/react";
import { LogLevel, TelemetryEvent } from "../../common/telemetry/TelemetryConstants";
import React, { Dispatch, Suspense, lazy, useEffect } from "react";

import { ILiveChatWidgetAction } from "../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../contexts/common/ILiveChatWidgetContext";
import { ILoadingPaneControlProps } from "@microsoft/omnichannel-chat-components/lib/types/components/loadingpane/interfaces/ILoadingPaneControlProps";
import { ILoadingPaneStyleProps } from "@microsoft/omnichannel-chat-components/lib/types/components/loadingpane/interfaces/ILoadingPaneStyleProps";
import { IStartChatErrorPaneProps } from "./interfaces/IStartChatErrorPaneProps";
import { LoadingPane } from "@microsoft/omnichannel-chat-components";
import { StartChatErrorPaneConstants } from "../../common/Constants";
import { StartChatFailureType } from "../../contexts/common/StartChatFailureType";
import { TelemetryHelper } from "../../common/telemetry/TelemetryHelper";
import { defaultStartChatErrorPaneGeneralStyleProps } from "./common/defaultStartChatErrorPaneGeneralStyleProps";
import { defaultStartChatErrorPaneIconImageStyleProps } from "./common/defaultStartChatErrorPaneIconImageProps";
import { defaultStartChatErrorPaneIconStyleProps } from "./common/defaultStartChatErrorPaneIconStyleProps";
import { defaultStartChatErrorPaneSubtitleStyleProps } from "./common/defaultStartChatErrorPaneSubtitleStyleProps";
import { defaultStartChatErrorPaneTitleStyleProps } from "./common/defaultStartChatErrorPaneTitleStyleProps";
import { findAllFocusableElement } from "../../common/utils";
import useChatContextStore from "../../hooks/useChatContextStore";

export const StartChatErrorPaneStateful = (startChatErrorPaneProps: IStartChatErrorPaneProps) => {
    const [state, ]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    const LoadingPane = lazy(() => import(/* webpackChunkName: "LoadingPane" */ "@microsoft/omnichannel-chat-components").then(module => ({ default: module.LoadingPane })));

    
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

    let errorPaneTitleText;
    let errorPaneSubtitleText;
    switch (state.domainStates.startChatFailureType) {
        case StartChatFailureType.Unauthorized:
            errorPaneTitleText = startChatErrorPaneProps?.controlProps?.unauthorizedTitleText ?? StartChatErrorPaneConstants.DefaultStartChatErrorUnauthorizedTitleText;
            errorPaneSubtitleText = startChatErrorPaneProps?.controlProps?.unauthorizedSubtitleText ?? StartChatErrorPaneConstants.DefaultStartChatErrorUnauthorizedSubtitleText;
            break;
        case StartChatFailureType.AuthSetupError:
            errorPaneTitleText = startChatErrorPaneProps?.controlProps?.authSetupErrorTitleText ?? StartChatErrorPaneConstants.DefaultStartChatErrorAuthSetupErrorTitleText;
            errorPaneSubtitleText = startChatErrorPaneProps?.controlProps?.authSetupErrorSubtitleText ?? StartChatErrorPaneConstants.DefaultStartChatErrorAuthSetupErrorSubtitleText;
            break;
        default:
            errorPaneTitleText = startChatErrorPaneProps?.controlProps?.titleText ?? StartChatErrorPaneConstants.DefaultStartChatErrorTitleText;
            errorPaneSubtitleText = startChatErrorPaneProps?.controlProps?.subtitleText ?? StartChatErrorPaneConstants.DefaultStartChatErrorSubtitleText;
    }

    const errorUIControlProps: ILoadingPaneControlProps = {
        id: StartChatErrorPaneConstants.DefaultStartChatErrorPaneId,
        dir: state.domainStates.globalDir,
        hideSpinner: true,
        hideSpinnerText: true,
        ...startChatErrorPaneProps?.controlProps,
        titleText: errorPaneTitleText,
        subtitleText: errorPaneSubtitleText,
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
        <Suspense fallback={<div>Loading</div>}>
            <LoadingPane
                componentOverrides={startChatErrorPaneProps?.componentOverrides}
                controlProps={errorUIControlProps}
                styleProps={errorUIStyleProps}
            />
        </Suspense>
    );
};

export default StartChatErrorPaneStateful;