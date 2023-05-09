import React, { Dispatch, ReactNode, useCallback, useEffect, useState } from "react";
import DraggableEventReceiver from "./DraggableEventReceiver";
import DraggableElementPosition from "./DraggableElementPosition";
import DraggableEvent from "./DraggableEvent";
import DraggableEventNames from "./DraggableEventNames";
import useChatContextStore from "../../hooks/useChatContextStore";
import { ILiveChatWidgetContext } from "../../contexts/common/ILiveChatWidgetContext";
import { ILiveChatWidgetAction } from "../../contexts/common/ILiveChatWidgetAction";
import { ConversationState } from "../../contexts/common/ConversationState";

interface DraggableChatWidgetProps {
    disable?: boolean;
    channel?: string;
    elementId: string;
    children: ReactNode;
}

const DraggableChatWidget = (props: DraggableChatWidgetProps) => {
    const [state, dispatch]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    const [initialPosition, setInitializePosition] = useState({offsetLeft: 0, offsetTop: 0});
    const [position, setPosition] = useState({offsetLeft: 0, offsetTop: 0});
    const [delta, setDelta] = useState({left: 0, top: 0});

    const calculateOffsetsWithinViewport = useCallback((id: string, offset) => {
        const draggableElement: HTMLElement | null = document.getElementById(id);
        const positionRelativeToViewport = (draggableElement as HTMLElement).getBoundingClientRect();

        let offsetLeft = offset.offsetLeft;
        let offsetTop = offset.offsetTop;

        // Restrict widget being within viewport
        if (positionRelativeToViewport.x < 0) {
            offsetLeft = 0 - delta.left;
        }

        if (positionRelativeToViewport.y < 0) {
            offsetTop = 0 - delta.top;
        }

        if (positionRelativeToViewport.x + positionRelativeToViewport.width > window.innerWidth) {
            offsetLeft = window.innerWidth - positionRelativeToViewport.width - delta.left;
        }

        if (positionRelativeToViewport.y + positionRelativeToViewport.height > window.innerHeight) {
            offsetTop = window.innerHeight - positionRelativeToViewport.height - delta.top;
        }

        (draggableElement as HTMLElement).style.left = `${offsetLeft}px`;
        (draggableElement as HTMLElement).style.top = `${offsetTop}px`;

        setPosition({offsetLeft, offsetTop});
    }, [delta]);

    const resetPosition = useCallback(() => {
        const offsetLeft = initialPosition.offsetLeft;
        const offsetTop = initialPosition.offsetTop;

        const position = {offsetLeft, offsetTop};
        const draggableElement: HTMLElement | null = document.getElementById(props.elementId);
        (draggableElement as HTMLElement).style.left = `${position.offsetLeft}px`;
        (draggableElement as HTMLElement).style.top = `${position.offsetTop}px`;

        setPosition(position);
    }, [initialPosition]);

    useEffect(() => {
        if (props.disable !== false) {
            return;
        }

        const setInitialPosition = () => {
            const draggableElement: HTMLElement | null = document.getElementById(props.elementId);
            const offsetLeft = (draggableElement as HTMLElement).offsetLeft as number;
            const offsetTop = (draggableElement as HTMLElement).offsetTop as number;
            setInitializePosition({offsetLeft, offsetTop});
        };

        const calculateOffsets = () => {
            const draggableElement: HTMLElement | null = document.getElementById(props.elementId);
            const offsetLeft = (draggableElement as HTMLElement).offsetLeft as number;
            const offsetTop = (draggableElement as HTMLElement).offsetTop as number;
            setPosition({offsetLeft, offsetTop});

            const positionRelativeToViewport = (draggableElement as HTMLElement).getBoundingClientRect();
            const left = positionRelativeToViewport.left - offsetLeft;
            const top = positionRelativeToViewport.top - offsetTop;
            setDelta({left, top});

            calculateOffsetsWithinViewport(props.elementId, {offsetLeft, offsetTop});
        };

        setInitialPosition();
        calculateOffsets();

        window.addEventListener("resize", calculateOffsets);

        return () => {
            window.removeEventListener("resize", calculateOffsets);
        };
    }, [props.disable]);

    useEffect(() => {
        if (props.disable !== false) {
            return;
        }

        // Resets widget to original position on widget minimized and closed
        if (state.appStates.isMinimized) {
            resetPosition();
        } else if (state.appStates.conversationState == ConversationState.Closed) {
            resetPosition();
        }
    }, [props.disable, state.appStates.isMinimized, state.appStates.conversationState, initialPosition]);

    const onEvent = useCallback((event: DraggableEvent) => {
        if (event.eventName === DraggableEventNames.Dragging) {
            if (event.offset) {
                const offsetLeft = position.offsetLeft + event.offset.x;
                const offsetTop = position.offsetTop + event.offset.y;

                // Update position via DOM manipulation to prevent <Stack/> continuously rendering on style change causing high CPU spike
                const draggableElement: HTMLElement | null = document.getElementById(props.elementId);
                (draggableElement as HTMLElement).style.left = `${offsetLeft}px`;
                (draggableElement as HTMLElement).style.top = `${offsetTop}px`;

                setPosition({offsetLeft, offsetTop});
                calculateOffsetsWithinViewport(props.elementId, {offsetLeft, offsetTop});
            }
        }
    }, [position]);

    if (props.disable) {
        return (
            <>
                {props.children}
            </>
        );
    }

    return (
        <>
            <DraggableEventReceiver channel={props.channel?? "lcw"} onEvent={onEvent}>
                {props.children}
            </DraggableEventReceiver>
        </>
    );
};

export default DraggableChatWidget;