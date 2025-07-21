import { BroadcastService } from "@microsoft/omnichannel-chat-components/lib/types/services/BroadcastService";
import { Constants } from "../../../common/Constants";
import { FacadeChatSDK } from "../../../common/facades/FacadeChatSDK";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";
import { ICustomEvent } from "../../../contexts/common/CustomEventType";
import { ChatSDKMessage } from "@microsoft/omnichannel-chat-sdk";

export const subscribeToSendCustomEvent = (facadeChatSDK: FacadeChatSDK) => {

    const isValidCustomEvent = (payload: object) => {
        if (Constants.customEventName in payload && payload.customEventName && typeof payload.customEventName === Constants.String 
            && Constants.customEventValue in payload && payload.customEventValue) return true;
        return false;
    };

    BroadcastService.getMessageByEventName(Constants.sendCustomEvent).subscribe((event: object) => {

        if (!(Constants.payload in event)) return; 
        console.log("debugging: sendCustomEvent is received", event);
        if (isValidCustomEvent(event.payload as object))
        {
            const customEventPayload = event.payload as ICustomEvent;
            try {
                const customEventValueStr: string = typeof customEventPayload.customEventValue === Constants.String ? customEventPayload.customEventValue as string : JSON.stringify(customEventPayload.customEventValue);
                const customEventName = customEventPayload.customEventName;
                const messageMeta: ICustomEvent = {
                    customEvent: Constants.true,
                    customEventName: customEventName as string,
                    customEventValue: customEventValueStr
                };
                const messagePayload: ChatSDKMessage = {
                    content: "",
                    tags: [Constants.Hidden],
                    metadata: messageMeta,
                    timestamp: new Date()
                };
                facadeChatSDK.sendMessage(messagePayload);
                TelemetryHelper.logActionEventToAllTelemetry(LogLevel.DEBUG, {
                    Event: TelemetryEvent.CustomEventAction,
                    Description: "Sent customEvent.",
                    CustomProperties: {
                        customEventName,
                        lengthCustomEventValue: customEventValueStr.length
                    }
                });
            } catch (error) {
                TelemetryHelper.logActionEventToAllTelemetry(LogLevel.ERROR, {
                    Event: TelemetryEvent.CustomEventAction,
                    Description: "Failed to process CustomEvent.",
                    ExceptionDetails: {
                        error
                    }
                });
            }
        }
    });
};
