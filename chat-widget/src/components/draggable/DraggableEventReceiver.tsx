import React, { ReactNode, useEffect } from "react";
import DraggableEvent from "./DraggableEvent";

interface DraggableEventReceiverProps {
    channel: string;
    children: ReactNode;
    onEvent: (event: DraggableEvent) => void;
}

const DraggableEventReceiver = (props: DraggableEventReceiverProps) => {
    useEffect(() => {
        const listener = (event: MessageEvent) => {
            const { data } = event;
            if (data.channel === props.channel) {
                console.log(data.eventName);
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