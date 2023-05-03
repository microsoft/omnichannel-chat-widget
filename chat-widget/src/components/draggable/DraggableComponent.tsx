import React, { ReactNode, useCallback, useEffect } from "react";
import DraggableEventReceiver from "./DraggableEventReceiver";
import DraggableElementPosition from "./DraggableElementPosition";
import DraggableEvent from "./DraggableEvent";

interface DraggableComponentProps {
    elementId: string;
    children: ReactNode;
}

const DraggableComponent = (props: DraggableComponentProps) => {
    const position: DraggableElementPosition = {offsetLeft: 0, offsetTop: 0};
    const delta = {left: 0, top: 0};

    const calculateOffsetsWithinViewport = (id: string) => {
        const draggableElement: HTMLElement | null = document.getElementById(id);
        const positionRelativeToViewport = (draggableElement as HTMLElement).getBoundingClientRect();

        // Restrict widget being within viewport
        if (positionRelativeToViewport.x < 0) {
            position.offsetLeft = 0 - delta.left;
        }

        if (positionRelativeToViewport.y < 0) {
            position.offsetTop = 0 - delta.top;
        }

        if (positionRelativeToViewport.x + positionRelativeToViewport.width > window.innerWidth) {
            position.offsetLeft = window.innerWidth - positionRelativeToViewport.width - delta.left;
        }

        if (positionRelativeToViewport.y + positionRelativeToViewport.height > window.innerHeight) {
            position.offsetTop = window.innerHeight - positionRelativeToViewport.height - delta.top;
        }

        (draggableElement as HTMLElement).style.left = `${position.offsetLeft}px`;
        (draggableElement as HTMLElement).style.top = `${position.offsetTop}px`;
    };

    useEffect(() => {
        console.log("[DraggableComponent]");
        const calculateOffsets = () => {
            const draggableElement: HTMLElement | null = document.getElementById(props.elementId);
            position.offsetLeft = (draggableElement as HTMLElement).offsetLeft as number;
            position.offsetTop = (draggableElement as HTMLElement).offsetTop as number;

            console.log("[calculateOffsets]");
            console.log(draggableElement);

            const positionRelativeToViewport = (draggableElement as HTMLElement).getBoundingClientRect();
            delta.left = positionRelativeToViewport.left - position.offsetLeft;
            delta.top = positionRelativeToViewport.top - position.offsetTop;

            calculateOffsetsWithinViewport(props.elementId);
        };

        calculateOffsets();

        window.addEventListener("resize", calculateOffsets);

        return () => {
            window.removeEventListener("resize", calculateOffsets);
        };
    }, []);

    const onEvent = useCallback((event: DraggableEvent) => {
        if (event.eventName === "Dragging") {
            console.log("[Dragging]");
            console.log(event.offset);
            position.offsetLeft += event.offset!.x;
            position.offsetTop += event.offset!.y;
            console.log(position);

            // Update position via DOM manipulation to prevent <Stack/> continuously rendering on style change causing high CPU spike
            const draggableElement: HTMLElement | null = document.getElementById(props.elementId);
            (draggableElement as HTMLElement).style.left = `${position.offsetLeft}px`;
            (draggableElement as HTMLElement).style.top = `${position.offsetTop}px`;

            calculateOffsetsWithinViewport(props.elementId);
        }
    }, []);

    return (
        <>
            <DraggableEventReceiver channel="lcw" onEvent={onEvent}>
                {props.children}
            </DraggableEventReceiver>
        </>
    );
};

export default DraggableComponent;