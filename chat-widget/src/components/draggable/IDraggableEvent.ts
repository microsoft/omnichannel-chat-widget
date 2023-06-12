import DraggableEventNames from "./DraggableEventNames";

interface IDraggableEvent {
    channel: string;
    eventName: DraggableEventNames | string;
    offset?: { x: number; y: number };
    position?: {offsetLeft: number, offsetTop: number};
}

export default IDraggableEvent;