import { ElementType } from "../common/Constants";

export interface ICustomEvent {
    eventName: string,
    elementType?: ElementType | any,
    elementId?: string,
    payload?: any,
}