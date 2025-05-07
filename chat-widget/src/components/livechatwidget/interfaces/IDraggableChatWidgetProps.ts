export interface IDraggableChatWidgetProps {
    /**
     * Whether to enable Draggable Chat Widget.
     */
    disabled?: boolean;
    /**
     * To specify whether the iframe is used to drag. The IDraggableEvent would be posted to the parent window if set to true.
     */
    targetIframe?: boolean;
}