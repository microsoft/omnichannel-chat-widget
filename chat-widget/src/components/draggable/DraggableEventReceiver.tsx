import React, { ReactNode, useEffect } from "react";
import DraggableEvent from "./DraggableEvent";

interface DraggableEventReceiverProps {
    /**
     * Unique channel name to send/receive draggable events to prevent event collisions
     */
    channel: string;
    /**
     * React nodes children
     */
    children: ReactNode;
    /**
     * Event handler on receiving draggable events
     *
     * @param event Draggable events
     * @returns
     */
    onEvent: (event: DraggableEvent) => void;
}

/**
 * Component which would listen to DraggableEvent, update the component position or react accordingly.
 *
 * @param props DraggableEventReceiverProps
 * @returns
 */
const DraggableEventReceiver = (props: DraggableEventReceiverProps) => {
    useEffect(() => {
        const listener = (event: MessageEvent) => {
            const { data } = event;
            if (data.channel === props.channel) {
                props.onEvent(data);
            }
        };

        window.addEventListener("message", listener);

        return () => {
            window.removeEventListener("message", listener);
        };
    }, [props]);

    return <> {props.children} </>;
};

export default DraggableEventReceiver;