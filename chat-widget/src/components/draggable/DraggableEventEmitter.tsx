import React, { ReactNode, useCallback, useEffect, useState } from "react";
import DraggableEvent from "./DraggableEvent";
import DraggableEventNames from "./DraggableEventNames";

interface DraggableEventEmitterProps {
    /**
     * Unique channel name to send/receive draggable events to prevent event collisions
     */
    channel: string;
    /**
     * React nodes children
     */
    children: ReactNode;
    /**
     * HTML element ID of the trigger element to send DraggableEvent to update the draggable element position
     */
    elementId: string;
    /**
     * Target window to post DraggableEvent messages
     */
    targetWindow?: Window;
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
        const targetWindow = props.targetWindow ?? window;
        targetWindow.postMessage(data, "*");
    }, [props.targetWindow]);

    const dragStart = useCallback((event: MouseEvent) => {
        postMessage({ channel: props.channel, eventName: DraggableEventNames.DragStart });

        cursor = { ...cursor, x: event.screenX, y: event.screenY }; // Cursor init position
        const dragging = (event: MouseEvent) => {
            event.preventDefault();

            const newX = event.screenX;
            const newY = event.screenY;

            offset = { ...offset, x: newX - cursor.x, y: newY - cursor.y }; // Calculate cursor position diff
            cursor = { ...cursor, x: newX, y: newY }; // Update cursor new position

            postMessage({
                channel: props.channel,
                eventName: DraggableEventNames.Dragging,
                offset
            });
        };

        const dragEnd = () => {
            postMessage({ channel: props.channel, eventName: DraggableEventNames.DragEnd });
            document.removeEventListener("mousemove", dragging);
            document.removeEventListener("mouseup", dragEnd);
        };

        document.addEventListener("mousemove", dragging);
        document.addEventListener("mouseup", dragEnd);
    }, [props.channel, cursor, offset]);

    useEffect(() => {
        if (!initialized && props.elementId) {
            const element = document.getElementById(props.elementId);
            element?.addEventListener("mousedown", dragStart);
            setInitialized(true);
        }
    }, [dragStart, props.elementId, initialized]);
    return <> {props.children} </>;
};

export default DraggableEventEmitter;