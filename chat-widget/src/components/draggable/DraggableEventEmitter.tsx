import React, { ReactNode, useCallback, useEffect, useState } from "react";
import DraggableEvent from "./DraggableEvent";

interface DraggableEventEmitterProps {
    /**
     * Unique channel name to send/receive draggable events to prevent event collisions
     */
    channel: string;
    /**
     * HTML element ID of the trigger element to send DraggableEvent to update the draggable element position
     */
    elementId: string;
    useIframe?: boolean;
    /**
     * React nodes children
     */
    children: ReactNode;
}

/**
 * Trigger component which would send DraggableEvent to the receiver to update the draggable component position
 *
 * @param props DraggableEventEmitterProps
 * @returns
 */
const DraggableEventEmitter = (props: DraggableEventEmitterProps) => {
    let cursor = { x: 0, y: 0 };
    let offset = { x: 0, y: 0 };
    const [initialized, setInitialized] = useState(false);

    const postMessage = useCallback((data: DraggableEvent) => {
        const targetWindow = props.useIframe ? window.parent : window;
        targetWindow.postMessage(data, "*");
    }, [props.useIframe]);

    const dragStart = useCallback((event: MouseEvent) => {
        postMessage({ channel: props.channel, eventName: "DragStart" });

        cursor = { ...cursor, x: event.screenX, y: event.screenY };
        const dragging = (event: MouseEvent) => {
            event.preventDefault();

            const newX = event.screenX;
            const newY = event.screenY;

            offset = { ...offset, x: newX - cursor.x, y: newY - cursor.y };
            cursor = { ...cursor, x: newX, y: newY };

            postMessage({
                channel: props.channel,
                eventName: "Dragging",
                offset
            });
        };

        const dragEnd = () => {
            postMessage({ channel: props.channel, eventName: "DragEnd" });
            document.removeEventListener("mousemove", dragging);
            document.removeEventListener("mouseup", dragEnd);
        };

        document.addEventListener("mousemove", dragging);
        document.addEventListener("mouseup", dragEnd);
    }, [props.channel, cursor, offset]);

    useEffect(() => {
        if (!initialized && props.elementId) {
            console.log(`[DraggableEventEmitter][Initialize] ${props.elementId}`);
            const element = document.getElementById(props.elementId);
            element?.addEventListener("mousedown", dragStart);
            setInitialized(true);
        }
    }, [dragStart, props.elementId, initialized]);
    return <> {props.children} </>;
};

export default DraggableEventEmitter;