import { Constants } from "../../../../common/Constants";
import { BroadcastEvent, LogLevel, TelemetryEvent } from "../../../../common/telemetry/TelemetryConstants";
import { TelemetryHelper } from "../../../../common/telemetry/TelemetryHelper";
import { IActivitySubscriber } from "./IActivitySubscriber";
import { BroadcastService } from "@microsoft/omnichannel-chat-components";

export class HiddenAdaptiveCardActivitySubscriber implements IActivitySubscriber {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public observer: any;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async apply(activity: any): Promise<void> { 
        const { attachments, attachment } = activity;      
        this.observer.next(false); 
        BroadcastService.postMessage( { eventName: BroadcastEvent.NewMessageReceived, payload: { attachments: attachments || [attachment], text: "Custom Event" }});  
        return;      
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    public applicable(activity: any): boolean {
        const { attachments, attachment } = activity;

        // Use `attachments` or `attachment` (whichever exists)
        const cards = attachments || [attachment]; 

        // Check if contentType is "AdaptiveCard"
        const adaptiveCard = cards?.find(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (item: any) => Constants.supportedAdaptiveCardContentTypes.indexOf(item?.contentType) >= 0
        );

        if (adaptiveCard && adaptiveCard.content) {
            const { body } = adaptiveCard.content;

            if (Array.isArray(body)) {
            // Check if all elements in `body` have `isVisible: false`
                const allInvisible = body.every((item) => item.isVisible === false);

                if (allInvisible) {
                    TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
                        Event: TelemetryEvent.HiddenAdaptiveCardMessageReceived,
                        Description: "All elements in AdaptiveCard are invisible"
                    });
                    return true;
                }
            }
        }
        return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async next(activity: any) {
        if (this.applicable(activity)) {
            return await this.apply(activity);
        }
        return activity;
    }
}