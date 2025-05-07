import DraggableEventNames from "./DraggableEventNames";
import IDraggableElementPosition from "./IDraggableElementPosition";

interface IDraggableEvent {
    channel: string;
    eventName: DraggableEventNames | string;
    offset?: { x: number; y: number };
    position?: IDraggableElementPosition;
}

export default IDraggableEvent;