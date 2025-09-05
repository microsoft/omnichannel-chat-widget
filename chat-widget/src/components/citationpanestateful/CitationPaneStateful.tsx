import { LogLevel, TelemetryEvent } from "../../common/telemetry/TelemetryConstants";
import React, { Dispatch, useEffect, useState } from "react";
import { createTimer, findAllFocusableElement, findParentFocusableElementsWithoutChildContainer, preventFocusToMoveOutOfElement, setTabIndices } from "../../common/utils";
import { defaultCitationContentCSS, defaultCitationPaneStyles } from "./common/defaultProps/defaultCitationPaneProps";

import { DimLayer } from "../dimlayer/DimLayer";
import { ILiveChatWidgetAction } from "../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../contexts/common/ILiveChatWidgetContext";
import { ITimer } from "../../common/interfaces/ITimer";
import { IconButton } from "@fluentui/react";
import { LiveChatWidgetActionType } from "../../contexts/common/LiveChatWidgetActionType";
import { TelemetryHelper } from "../../common/telemetry/TelemetryHelper";
import useChatContextStore from "../../hooks/useChatContextStore";

let uiTimer : ITimer;

export interface ICitationPaneProps {
    id?: string;
    title?: string;
    onClose?: () => void;
    contentHtml?: string;
}

export const CitationPaneStateful = (props: ICitationPaneProps) => {
    useEffect(() => {
        uiTimer = createTimer();
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
            Event: TelemetryEvent.UXConfirmationPaneStart
        });
    }, []);

    const initialTabIndexMap: Map<string, number> = new Map();
    let elements: HTMLElement[] | null = [];

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [state, dispatch]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();

    const controlId = props.id ?? "ocw-citation-pane";

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
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, { Event: TelemetryEvent.ConfirmationPaneLoaded });
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
            Event: TelemetryEvent.UXConfirmationPaneCompleted,
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
                    if (base && (base as any).transform) {
                        // remove centering transform when we compute exact pixel coords
                        delete (base as any).transform;
                    }
                    setPaneStyle(Object.assign({}, base, {
                        left: `${leftPx}px`,
                        top: `${topPx}px`,
                        width: `${widthPx}px`,
                        height: `${heightPx}px`
                    }));
                    // Make the pane visible after the next paint to avoid layout
                    // flashes on initial mount.
                    requestAnimationFrame(() => setIsReady(true));
                    return;
                }
            } catch (e) {
                // ignore
            }

            // fallback
            setPaneStyle(defaultCitationPaneStyles.pane);
            requestAnimationFrame(() => setIsReady(true));
        };

        compute();
        window.addEventListener("resize", compute);
        return () => window.removeEventListener("resize", compute);
    }, []);

    const handleClose = () => {
        if (props.onClose) props.onClose();
        dispatch({ type: LiveChatWidgetActionType.SET_PREVIOUS_FOCUSED_ELEMENT_ID, payload: null });
        setTabIndices(elements, initialTabIndexMap, true);
    };

    // Merge a safe style object for the container and cast to CSSProperties to satisfy TS
    const mergedStyle: React.CSSProperties = Object.assign({ position: "relative" }, paneStyle ?? { position: "fixed" }) as React.CSSProperties;

    // If paneStyle hasn't been computed yet, render the DimLayer so clicks
    // still close overlays but hide the pane itself to avoid flashes.
    const hiddenStyle: React.CSSProperties = { visibility: isReady ? "visible" : "hidden", pointerEvents: isReady ? "auto" : "none" };

    return (
        <>
            <DimLayer brightness="0.2" onClick={handleClose} containerSelector=".webchat__stacked-layout_container" zIndex={10000} />
            <div id={controlId} role="dialog" aria-modal={true} style={Object.assign({}, mergedStyle, hiddenStyle, { display: "flex", flexDirection: "column", zIndex: 10001 })}>
                {/* Header with close button */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div className="ms-Label" style={{ fontWeight: 600 }}>{props.title ?? "Citation"}</div>
                    <IconButton
                        iconProps={{ iconName: "Cancel" }}
                        ariaLabel="Close citation"
                        title="Close"
                        styles={{ root: { marginLeft: 8 } }}
                        onClick={handleClose}
                    />
                </div>

                {/* Scrollable content area styles are provided from defaults to avoid
                    leaking inline styles in the component file. */}
                <style>{defaultCitationContentCSS(controlId)}</style>

                <div className="citation-content" dangerouslySetInnerHTML={{ __html: props.contentHtml ?? "" }} />

                {/* Footer with close button */}
                <div style={{ textAlign: "right", marginTop: 8 }}>
                    <IconButton
                        iconProps={{ iconName: "Cancel" }}
                        ariaLabel="Close citation"
                        title="Close"
                        onClick={handleClose}
                    />
                </div>
            </div>
        </>
    );
};

export default CitationPaneStateful;
