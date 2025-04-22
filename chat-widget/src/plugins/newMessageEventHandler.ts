import { BroadcastEvent, LogLevel, TelemetryEvent } from "../common/telemetry/TelemetryConstants";

import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { Constants } from "../common/Constants";
import { FirstResponseLatencyTracker } from "../firstresponselatency/FirstResponseLatencyTracker";
import { IActivity } from "botframework-directlinejs";
import { ICustomEvent } from "@microsoft/omnichannel-chat-components/lib/types/interfaces/ICustomEvent";
import { TelemetryHelper } from "../common/telemetry/TelemetryHelper";
import { TelemetryManager } from "../common/telemetry/TelemetryManager";
import { isHistoryMessage } from "../firstresponselatency/util";

export const createOnNewAdapterActivityHandler = (chatId: string, userId: string) => {

    // Hooking the message tracker in the listener, a bit invasive but easier to control.
    const firstResponseLatencyTracker = new FirstResponseLatencyTracker();
    // epoch time in utc for when start to listen.
    // We dont longer have a mechanism to know if a message is history or new, so any message older than the time we start listening will be considered a history message.
    // this is a workaround for the fact that we dont have a way to identify if a message is history or new, and it will provide consistency across different scenarios
    const startTime = ( new Date().getTime() - 2000); // 2 seconds in the past, to account for any delay in the message being sent and received
    let isHistoryMessageReceivedEventRasied = false;

    const onNewAdapterActivityHandler = (activity: IActivity) => {
        const historyMessage: boolean = isHistoryMessage(activity, startTime);
        raiseMessageEvent(activity, historyMessage);
    };

    const raiseMessageEvent = (activity: IActivity, isHistoryMessage: boolean) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const polyfillMessagePayloadForEvent = (payload: any) => {
            return {
                ...payload,
                channelData: activity?.channelData,
                chatId: activity?.conversation?.id,
                conversationId: TelemetryManager.InternalTelemetryData?.conversationId,
                id: activity?.id,
                isChatComplete: false,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                text: (activity as any)?.text,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                attachment: (activity as any)?.attachments?.length >= 1 ? (activity as any)?.attachments : [],
                role: activity?.from?.role,
            };
        };

        if (activity?.type === Constants.message) {
            const payload = {
                // To identify hidden contents vs empty content
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                text: (activity as any)?.text?.length >= 1 ? `*contents hidden (${(activity as any)?.text?.length} chars)*` : "",
                type: activity?.type,
                timestamp: activity?.timestamp,
                userId: userId,
                tags: activity?.channelData?.tags,
                messageType: "",
                Id: activity?.id,
                role: activity?.from?.role,
            };

            if (activity?.from?.role === Constants.userMessageTag) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                payload.messageType = Constants.userMessageTag;
                const newMessageSentEvent: ICustomEvent = {
                    eventName: BroadcastEvent.NewMessageSent,
                    payload: polyfillMessagePayloadForEvent(payload)
                };
                BroadcastService.postMessage(newMessageSentEvent);
                if (!isHistoryMessage) {
                    firstResponseLatencyTracker.startClock(payload);
                }

                TelemetryHelper.logActionEvent(LogLevel.INFO, {
                    Event: TelemetryEvent.MessageSent,
                    Description: "New message sent"
                });
            }
            else {
                if (activity?.channelData?.tags?.includes(Constants.systemMessageTag)) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    payload.messageType = Constants.systemMessageTag;
                    TelemetryHelper.logActionEvent(LogLevel.INFO, {
                        Event: TelemetryEvent.SystemMessageReceived,
                        Description: "System message received"
                    });
                }
                else {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const messageHasNoText = !(activity as any)?.text;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const messageHasNoTags = !(activity as any)?.channelData || !activity?.channelData?.tags || activity?.channelData?.tags?.length === 0;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const messageHasNoAttachments = !(activity as any)?.attachments || (activity as any)?.attachments.length === 0;

                    if (messageHasNoTags && messageHasNoText && messageHasNoAttachments) {
                        return;
                    }
                    payload.messageType = Constants.userMessageTag;
                }

                const newMessageReceivedEvent: ICustomEvent = {
                    eventName: isHistoryMessage ? BroadcastEvent.HistoryMessageReceived : BroadcastEvent.NewMessageReceived,
                    payload: polyfillMessagePayloadForEvent(payload)
                };
                BroadcastService.postMessage(newMessageReceivedEvent);
                if (!isHistoryMessage) {
                    firstResponseLatencyTracker.stopClock(payload);
                    TelemetryHelper.logActionEvent(LogLevel.INFO, {
                        Event: TelemetryEvent.MessageReceived,
                        Description: "New message received",
                        CustomProperties: payload
                    });
                } else {
                    
                    if (!isHistoryMessageReceivedEventRasied) {
                        console.log("LOPEZ :: NMS :: NO_BS_TRACKER  :: REHYDRATE : ", activity);
                        // this is needed for reload scenarios, it helps to identify the last message received before the reload
                        //firstResponseLatencyTracker.historyMessage(payload);
                        isHistoryMessageReceivedEventRasied = true;
                        TelemetryHelper.logActionEvent(LogLevel.INFO, {
                            Event: TelemetryEvent.RehydrateMessageReceived,
                            Description: "History message received",
                            CustomProperties: payload
                        });
                    }
                }
            }
        }
    };

    return onNewAdapterActivityHandler;
};