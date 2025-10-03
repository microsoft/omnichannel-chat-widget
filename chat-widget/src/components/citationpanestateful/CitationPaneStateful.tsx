import { LogLevel, TelemetryEvent } from "../../common/telemetry/TelemetryConstants";
import React, { Dispatch, useEffect, useState } from "react";
import { createTimer, findAllFocusableElement, findParentFocusableElementsWithoutChildContainer, preventFocusToMoveOutOfElement, setTabIndices } from "../../common/utils";

import CitationDim from "./CitationDim";
import { CitationPane } from "@microsoft/omnichannel-chat-components";
import { HtmlAttributeNames } from "../../common/Constants";
import { ICitationPaneStatefulProps } from "./interfaces/ICitationPaneStatefulProps";
import { ILiveChatWidgetAction } from "../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../contexts/common/ILiveChatWidgetContext";
import { ITimer } from "../../common/interfaces/ITimer";
import { LiveChatWidgetActionType } from "../../contexts/common/LiveChatWidgetActionType";
import { TelemetryHelper } from "../../common/telemetry/TelemetryHelper";
import { defaultCitationPaneStyles } from "./common/defaultProps/defaultCitationPaneProps";
import useChatContextStore from "../../hooks/useChatContextStore";

let uiTimer : ITimer;

export const CitationPaneStateful = (props: ICitationPaneStatefulProps) => {
    useEffect(() => {
        uiTimer = createTimer();
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
            Event: TelemetryEvent.UXCitationPaneStart
        });
    }, []);

    const initialTabIndexMap: Map<string, number> = new Map();
    let elements: HTMLElement[] | null = [];

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [state, dispatch]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();

    // Use props.id if provided, otherwise fall back to default
    const controlId = props.id || HtmlAttributeNames.ocwCitationPaneClassName;

    // Pane style computed to match the webchat widget container bounds so the pane
    // stays within the widget and scrolls only vertically. We also track an
    // "isReady" flag so we don't render the pane contents until the style is
    // computed — this prevents a transient render that can appear as a flicker.
    const [paneStyle, setPaneStyle] = useState<React.CSSProperties | null>(null);
    const [isReady, setIsReady] = useState(false);

    // Move focus to the container
    useEffect(() => {
        preventFocusToMoveOutOfElement(controlId as string);
        const focusableElements: HTMLElement[] | null = findAllFocusableElement(`#${controlId}`);
        requestAnimationFrame(() => {
            if (focusableElements && focusableElements.length > 0 && focusableElements[0]) {
                focusableElements[0].focus({ preventScroll: true });
            }
        });

        elements = findParentFocusableElementsWithoutChildContainer(controlId as string);
        setTabIndices(elements, initialTabIndexMap, false);
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, { Event: TelemetryEvent.CitationPaneLoaded });
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
            Event: TelemetryEvent.UXCitationPaneCompleted,
            ElapsedTimeInMilliseconds: uiTimer.milliSecondsElapsed
        });
    }, []);

    // Compute the widget bounds and set pane style accordingly (95% of widget size
    // and centered inside the widget). If the widget container can't be found,
    // fall back to the default pane styles from defaultCitationPaneProps.
    useEffect(() => {
        const compute = () => {
            try {
                const container = document.querySelector(".webchat__stacked-layout_container") as HTMLElement | null;
                if (container) {
                    const rect = container.getBoundingClientRect();
                    const widthPx = Math.round(rect.width * 0.95);
                    const heightPx = Math.round(rect.height * 0.95);
                    const leftPx = Math.round(rect.left + (rect.width - widthPx) / 2);
                    const topPx = Math.round(rect.top + (rect.height - heightPx) / 2);
                    // Clone defaults and remove transform so explicit left/top pixel
                    // coordinates are respected and the pane stays within the
                    // widget bounds.
                    const base = Object.assign({}, defaultCitationPaneStyles.pane) as React.CSSProperties;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    if (base && (base as any).transform) {
                        // remove centering transform when we compute exact pixel coords
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        delete (base as any).transform;
                    }
                    
                    // Merge user styles first, then computed positioning to ensure proper positioning
                    const computedStyle = {
                        left: `${leftPx}px`,
                        top: `${topPx}px`,
                        width: `${widthPx}px`,
                        height: `${heightPx}px`
                    };
                    
                    // Apply user styles first, then override with computed positioning
                    const generalProps = props.styleProps?.generalStyleProps;
                    const userStyles = generalProps && typeof generalProps === "object" ? 
                        Object.assign({}, generalProps) as React.CSSProperties : {};
                    // Remove positioning properties from user styles that would interfere
                    delete userStyles.position;
                    delete userStyles.left;
                    delete userStyles.top;
                    delete userStyles.width;
                    delete userStyles.height;
                    
                    setPaneStyle(Object.assign({}, base, userStyles, computedStyle));
                    // Make the pane visible after the next paint to avoid layout
                    // flashes on initial mount.
                    requestAnimationFrame(() => setIsReady(true));
                    return;
                }
            } catch (e) {
                // ignore
            }

            // fallback - merge defaults with user-provided styles but preserve positioning
            const generalProps = props.styleProps?.generalStyleProps;
            const userStyles = generalProps && typeof generalProps === "object" ? 
                Object.assign({}, generalProps) as React.CSSProperties : {};
            // Remove positioning properties from user styles for fallback
            delete userStyles.position;
            delete userStyles.left;
            delete userStyles.top;
            delete userStyles.width;
            delete userStyles.height;
            
            const fallbackStyle = Object.assign({}, defaultCitationPaneStyles.pane, userStyles);
            setPaneStyle(fallbackStyle);
            requestAnimationFrame(() => setIsReady(true));
        };

        compute();
        window.addEventListener("resize", compute);
        return () => window.removeEventListener("resize", compute);
    }, [props.styleProps?.generalStyleProps]);

    const handleClose = () => {
        if (props.onClose) props.onClose();
        dispatch({ type: LiveChatWidgetActionType.SET_PREVIOUS_FOCUSED_ELEMENT_ID, payload: null });
        setTabIndices(elements, initialTabIndexMap, true);
    };

    // Merge a safe style object for the container and cast to CSSProperties to satisfy TS
    const baseStyle: React.CSSProperties = Object.assign({ position: "relative" }, paneStyle ?? { position: "fixed" }) as React.CSSProperties;

    // If paneStyle hasn't been computed yet, render the DimLayer so clicks
    // still close overlays but hide the pane itself to avoid flashes.
    const hiddenStyle: React.CSSProperties = { visibility: isReady ? "visible" : "hidden", pointerEvents: isReady ? "auto" : "none" };

    // Default wrapper styles - these control the positioning container
    const defaultWrapperStyles: React.CSSProperties = {
        display: "flex",
        flexDirection: "column",
        zIndex: 10001
    };

    // Wrapper styles for the positioning container
    const wrapperStyles = Object.assign({}, baseStyle, hiddenStyle, defaultWrapperStyles);

    // Merge the computed positioning styles with user's generalStyleProps for the CitationPane
    const mergedStyleProps = props.styleProps ? {
        ...props.styleProps,
        generalStyleProps: Object.assign({}, props.styleProps.generalStyleProps)
    } : undefined;

    const controlProps = {
        id: controlId,
        dir: state.domainStates.globalDir,
        titleText: props.title,
        contentHtml: props.contentHtml,
        brightnessValueOnDim: "0.2", // Default brightness
        onClose: handleClose,
        ...props?.controlProps // User props override defaults
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    return (
        <>
            <CitationDim brightness={controlProps.brightnessValueOnDim} />
            <div style={wrapperStyles}>
                <CitationPane 
                    controlProps={controlProps} 
                    styleProps={mergedStyleProps} />
            </div>
        </>
    );
};

export default CitationPaneStateful;
