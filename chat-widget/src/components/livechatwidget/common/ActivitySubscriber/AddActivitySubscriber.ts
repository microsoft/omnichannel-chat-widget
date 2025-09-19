import ChatWidgetEvents from "../ChatWidgetEvents";
import { IActivitySubscriber } from "./IActivitySubscriber";

/**
 * The `AddActivitySubscriber` class is responsible for subscribing to the `ADD_ACTIVITY` event
 * from the `ChatWidgetEvents` and notifying an observer when a new activity is added.
 * 
 * This class implements the `IActivitySubscriber` interface and acts as a bridge between
 * the event system and the observer pattern.
 */
export class AddActivitySubscriber implements IActivitySubscriber {
    /**
     * The observer that will be notified when a new activity is added.
     * This is expected to be an object with a `next` method, such as an RxJS `Observer`.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public observer: any;
    
    /**
     * Set to track processed activity IDs to prevent duplicate processing.
     */
    private processedActivityIds: Set<string> = new Set();
    
    /**
     * Constructor initializes the `AddActivitySubscriber` and sets up an event listener
     * for the `ChatWidgetEvents.ADD_ACTIVITY` event. When the event is triggered, it checks
     * if the event payload contains an `activity` and notifies the observer.
     */
    constructor() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.addEventListener(ChatWidgetEvents.ADD_ACTIVITY, (event: any) => {
            // Check if the event contains the expected payload and activity
            if (event?.detail?.payload?.activity) {
                const activity = event.detail.payload.activity;
                const activityId = activity.id;
                
                // Check if activity has an ID and if it has already been processed
                if (activityId) {
                    if (this.processedActivityIds.has(activityId)) {
                        console.error(`Duplicate activity detected with ID: ${activityId}. Skipping processing.`);
                        return;
                    }
                    
                    // Add the activity ID to the processed set
                    this.processedActivityIds.add(activityId);
                }
                
                // Notify the observer with the new activity
                this.observer?.next(activity);
            }
        });
    }

    /**
     * The `next` method is a placeholder for processing the activity.
     * This method can be overridden or extended as needed.
     * 
     * @param activity - The activity object to process.
     * @returns The activity object (asynchronously).
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async next(activity: any) {
        return activity;
    }
}