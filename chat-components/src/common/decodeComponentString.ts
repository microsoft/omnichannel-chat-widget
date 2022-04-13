import { BroadcastService, ElementType } from "..";

import { ICustomEvent } from "../interfaces/ICustomEvent";
import { ReactNode } from "react";

export const decodeComponentString = (element: ReactNode | string): ReactNode => {
    if (!element) return null; 
    
    if (typeof element === "string") {
        try {
            const decodedComponent: ReactNode = JSON.parse(element, (_k, v) => {
                const matches = v?.match && v.match(/^\$\$Symbol:(.*)$/);
                return matches ? Symbol.for(matches[1]) : v;
            });
            return decodedComponent;
        } catch {
            const customEvent: ICustomEvent = {
                elementType: ElementType.Utility,
                eventName: "ReactComponentParseFailed"
            };
            BroadcastService.postMessage(customEvent);
            return null;
        }
    } else {
        return element;
    }
};