export interface IDraggableChatWidgetProps {
    /**
     * Whether to enable Draggable Chat Widget.
     */
    disable?: boolean;
    /**
     * To specify whether the iframe is used to drag. The DraggableEvent would be posted to the parent window if set to true.
     */
    targetIframe?: boolean;
}