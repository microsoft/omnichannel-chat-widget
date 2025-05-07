import React, { ReactNode, useCallback, useEffect, useState } from "react";
import IDraggableEvent from "./IDraggableEvent";
import DraggableEventNames from "./DraggableEventNames";

interface IDraggableEventEmitterProps {
    /**
     * Unique channel name to send/receive draggable events to prevent event collisions
     */
    channel: string;
    /**
     * React nodes children
     */
    children: ReactNode;
    /**
     * HTML element ID of the trigger element to send IDraggableEvent to update the draggable element position
     */
    elementId: string;
    /**
     * Target window to post IDraggableEvent messages
     */
    targetWindow?: Window;
}

/**
 * Trigger component which would send IDraggableEvent to the receiver to update the draggable component position
 *
 * @param props IDraggableEventEmitterProps
 * @returns
 */
const DraggableEventEmitter = (props: IDraggableEventEmitterProps) => {
    const [initialized, setInitialized] = useState(false);

    const postMessage = useCallback((data: IDraggableEvent) => {
        const targetWindow = props.targetWindow ?? window;
        targetWindow.postMessage(data, "*");
    }, [props.targetWindow]);

    const dragStart = useCallback((event: MouseEvent) => {
        postMessage({ channel: props.channel, eventName: DraggableEventNames.DragStart });

        let cursor = { x: event.screenX, y: event.screenY }; // Cursor init position
        const dragging = (event: MouseEvent) => {
            event.preventDefault();

            const newX = event.screenX;
            const newY = event.screenY;

            const offset = { x: newX - cursor.x, y: newY - cursor.y }; // Calculate cursor position diff
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
    }, [props.channel]);

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