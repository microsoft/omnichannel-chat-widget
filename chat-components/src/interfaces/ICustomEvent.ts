import { ElementType } from "../common/Constants";

export interface ICustomEvent {
    eventName: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    elementType?: ElementType | any,
    elementId?: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any,
}