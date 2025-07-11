import ChatWidgetEvents from "../ChatWidgetEvents";
import { IActivitySubscriber } from "./IActivitySubscriber";

/**
 * Subscriber that add new activities on-the-fly to WebChat. Activities are not persisted in the chat thread.
 */
export class AddActivitySubscriber implements IActivitySubscriber {
    public observer: any;
    
    constructor() {
        window.addEventListener(ChatWidgetEvents.ADD_ACTIVITY, (event: any) => {
            if (event?.detail?.payload?.activity) {
                this.observer?.next(event.detail.payload.activity);
            }
        });
    }

    public async next(activity: any) {
        return activity;
    }
}