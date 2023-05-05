import DraggableEventNames from "./DraggableEventNames";

interface DraggableEvent {
    channel: string;
    eventName: DraggableEventNames | string;
    offset?: { x: number; y: number };
    position?: {offsetLeft: number, offsetTop: number};
}

export default DraggableEvent;