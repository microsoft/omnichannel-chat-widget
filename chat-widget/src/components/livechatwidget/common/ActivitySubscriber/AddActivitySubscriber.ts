import { BroadcastEvent } from "../../../../common/telemetry/TelemetryConstants";
import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import ChatWidgetEvents from "../ChatWidgetEvents";
import { IActivitySubscriber } from "./IActivitySubscriber";
import SecureEventBus from "../../../../common/utils/SecureEventBus";

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
     * Unsubscribe function for the secure event listener
     */
    private unsubscribeFromSecureEvent: (() => void) | null = null;
    
    /**
     * Subscription for PersistentConversationReset event
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private resetEventListener: any;
    
    /**
     * Constructor initializes the `AddActivitySubscriber` and sets up a secure event listener
     * for the `ChatWidgetEvents.ADD_ACTIVITY` event. When the event is triggered, it checks
     * if the event payload contains an `activity` and notifies the observer.
     */
    constructor() {
        const eventBus = SecureEventBus.getInstance();
        
        // Subscribe to the secure event bus instead of global window events
        this.unsubscribeFromSecureEvent = eventBus.subscribe(ChatWidgetEvents.ADD_ACTIVITY, (payload) => {
            
            if (payload?.activity) {
                const activity = payload.activity;
                const activityId = activity.id;

                if (activity.identifier) {
                    if (this.processedActivityIds.has(activity?.identifier)) {
                        return; // Skip processing if already handled
                    }
                    // Add the activity ID to the processed set
                    this.processedActivityIds.add(activity?.identifier);
                }
                
                // Check if activity has an ID and if it has already been processed
                if (activityId) {
                    if (this.processedActivityIds.has(activityId)) {
                        return; // Skip processing if already handled
                    }
                    
                    // Add the activity ID to the processed set
                    this.processedActivityIds.add(activityId);
                }
                
                // Notify the observer with the new activity
                this.observer?.next(activity);
            }
        });
        
        // Subscribe to reset events for cleanup
        this.resetEventListener = BroadcastService.getMessageByEventName(BroadcastEvent.PersistentConversationReset).subscribe(() => {
            this.reset();
            // Clean up the secure event listener when conversation resets
            if (this.unsubscribeFromSecureEvent) {
                this.unsubscribeFromSecureEvent();
                this.unsubscribeFromSecureEvent = null;
            }
            // Unsubscribe from the reset event to prevent accumulation
            if (this.resetEventListener) {
                this.resetEventListener.unsubscribe();
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

    /**
     * Reset the processed activity IDs when a conversation resets
     */
    public reset() {
        this.processedActivityIds.clear();
    }
}