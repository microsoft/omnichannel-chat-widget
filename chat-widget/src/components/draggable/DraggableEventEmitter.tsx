import React, { ReactNode, useCallback } from "react";
import DraggableEvent from "./DraggableEvent";

interface DraggableEventEmitterProps {
    channel: string;
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

    const postMessage = (data: DraggableEvent) => {
        window.postMessage(data, "*");
        window.parent.postMessage(data, "*");
    };

    const dragStart = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
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

    return <div onMouseDown={dragStart} style={{width: "inherit"}}> {props.children} </div>;
};

export default DraggableEventEmitter;