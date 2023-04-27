export default interface DraggableEvent {
    channel: string;
    eventName: string;
    offset?: { x: number; y: number };
};