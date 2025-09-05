import { LogLevel, TelemetryEvent } from "../../common/telemetry/TelemetryConstants";
import React, { Dispatch, useEffect, useState } from "react";
import { createTimer, findAllFocusableElement, findParentFocusableElementsWithoutChildContainer, preventFocusToMoveOutOfElement, setTabIndices } from "../../common/utils";

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
    // stays within the widget and scrolls only vertically.
    const [paneStyle, setPaneStyle] = useState<React.CSSProperties | null>(null);

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
    // fall back to the previous centered-but-higher placement.
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
                    setPaneStyle({
                        position: "fixed",
                        left: `${leftPx}px`,
                        top: `${topPx}px`,
                        width: `${widthPx}px`,
                        height: `${heightPx}px`,
                        overflowY: "auto",
                        overflowX: "hidden",
                        background: "#fff",
                        padding: 16,
                        borderRadius: 6,
                        zIndex: 10001,
                        boxSizing: "border-box"
                    });
                    return;
                }
            } catch (e) {
                // ignore
            }

            // fallback
            setPaneStyle({
                position: "fixed",
                left: "50%",
                top: "18%",
                transform: "translateX(-50%)",
                background: "#fff",
                width: "85%",
                height: "85%",
                overflowY: "auto",
                overflowX: "hidden",
                padding: 16,
                borderRadius: 6,
                zIndex: 10001,
                boxSizing: "border-box"
            });
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

    return (
        <>
            <DimLayer brightness="0.2" onClick={handleClose} />
            <div id={controlId} role="dialog" aria-modal={true} style={mergedStyle}>
                {/* Close button in the upper-right corner */}
                <IconButton
                    iconProps={{ iconName: "Cancel" }}
                    ariaLabel="Close citation"
                    title="Close"
                    styles={{ root: { position: "absolute", right: 8, top: 8 } }}
                    onClick={handleClose}
                />

                <div style={{ fontWeight: 600, marginBottom: 8 }}>{props.title ?? "Citation"}</div>
                <div style={{ marginBottom: 12, overflowX: "hidden", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: props.contentHtml ?? "" }} />
                <div style={{ textAlign: "right" }}>
                    <IconButton
                        iconProps={{ iconName: "Cancel" }}
                        ariaLabel="Close citation"
                        title="Close"
                        styles={{ root: { float: "right" } }}
                        onClick={handleClose}
                    />
                </div>
            </div>
        </>
    );
};

export default CitationPaneStateful;
