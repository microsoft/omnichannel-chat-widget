import React, { ReactNode, useEffect } from "react";
import IDraggableEvent from "./IDraggableEvent";

interface IDraggableEventReceiverProps {
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
    onEvent: (event: IDraggableEvent) => void;
}

/**
 * Component which would listen to DraggableEvent, update the component position or react accordingly.
 *
 * @param props IDraggableEventReceiverProps
 * @returns
 */
const DraggableEventReceiver = (props: IDraggableEventReceiverProps) => {
    useEffect(() => {
        const listener = (event: MessageEvent) => {
            const { data } = event;
            if (data.channel && props.channel && data.channel === props.channel) {
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