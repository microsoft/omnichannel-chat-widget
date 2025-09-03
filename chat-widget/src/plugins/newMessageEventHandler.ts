import { BroadcastEvent, LogLevel, TelemetryEvent } from "../common/telemetry/TelemetryConstants";
import { MessagePayload, ScenarioType } from "../firstresponselatency/Constants";
import { buildMessagePayload, getScenarioType, isHistoryMessage, maskPayloadText, polyfillMessagePayloadForEvent } from "../firstresponselatency/util";

import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { Constants } from "../common/Constants";
import { FirstResponseLatencyTracker } from "../firstresponselatency/FirstResponseLatencyTracker";
import { IActivity } from "botframework-directlinejs";
import { ICustomEvent } from "@microsoft/omnichannel-chat-components/lib/types/interfaces/ICustomEvent";
import { TelemetryHelper } from "../common/telemetry/TelemetryHelper";
import { TelemetryManager } from "../common/telemetry/TelemetryManager";

export const createOnNewAdapterActivityHandler = (chatId: string, userId: string, startTime: number) => {

    // Hooking the message tracker in the listener, a bit invasive but easier to control.
    const firstResponseLatencyTracker = new FirstResponseLatencyTracker();
    // epoch time in utc for when start to listen.
    // We dont longer have a mechanism to know if a message is history or new, so any message older than the time we start listening will be considered a history message.
    // this is a workaround for the fact that we dont have a way to identify if a message is history or new, and it will provide consistency across different scenarios

    let isHistoryMessageReceivedEventRaised = false;

    const onNewAdapterActivityHandler = (activity: IActivity) => {
        raiseMessageEvent(activity);
    };

    const userSendMessageStrategy = (activity: IActivity) => {
        const payload = buildMessagePayload(activity, userId);

        payload.messageType = Constants.userMessageTag;
        
        const newMessageSentEvent: ICustomEvent = {
            eventName: BroadcastEvent.NewMessageSent,
            payload: polyfillMessagePayloadForEvent(activity, payload, TelemetryManager.InternalTelemetryData?.conversationId)
        };

        BroadcastService.postMessage(newMessageSentEvent);

        if (!isHistoryMessage(activity, startTime)) {
            firstResponseLatencyTracker.startClock(payload);
        }

        TelemetryHelper.logActionEventToAllTelemetry(LogLevel.INFO, {
            Event: TelemetryEvent.MessageSent, 
            Description: "New message sent"
        });
    };

    const systemMessageStrategy = (activity: IActivity) => {
        const payload = buildMessagePayload(activity, userId);

        payload.messageType = Constants.systemMessageTag;

        if (isHistoryMessage(activity, startTime)){
            historyMessageStrategy(polyfillMessagePayloadForEvent(activity, payload, TelemetryManager.InternalTelemetryData?.conversationId));
            return;
        }
        
        const newMessageReceivedEvent: ICustomEvent = {
            eventName: BroadcastEvent.NewMessageReceived,
            payload: polyfillMessagePayloadForEvent(activity, payload, TelemetryManager.InternalTelemetryData?.conversationId)
        };

        BroadcastService.postMessage(newMessageReceivedEvent);

        TelemetryHelper.logActionEventToAllTelemetry(LogLevel.INFO, {
            Event: TelemetryEvent.SystemMessageReceived,
            Description: "System message received"
        });
    };

    const historyMessageStrategy = (payload: MessagePayload) => {
        const newMessageReceivedEvent: ICustomEvent = {
            eventName: BroadcastEvent.HistoryMessageReceived,
            payload: payload
        };
        BroadcastService.postMessage(newMessageReceivedEvent);

        if (!isHistoryMessageReceivedEventRaised) {
            // this is needed for reload scenarios, it helps to identify the last message received before the reload
            isHistoryMessageReceivedEventRaised = true;
            TelemetryHelper.logActionEventToAllTelemetry(LogLevel.INFO, {
                Event: TelemetryEvent.RehydrateMessageReceived,
                Description: "History message received",
                CustomProperties: maskPayloadText(payload)
            });
        }
    };

    const isValidMessage = (activity: IActivity) => {

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const messageHasNoText = !(activity as any)?.text;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const messageHasNoTags = !(activity as any)?.channelData || !activity?.channelData?.tags || activity?.channelData?.tags?.length === 0;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const messageHasNoAttachments = !(activity as any)?.attachments || (activity as any)?.attachments.length === 0;

        if (messageHasNoTags && messageHasNoText && messageHasNoAttachments) {
            return false;
        }
        return true;
    };

    const receivedMessageStrategy = (activity: IActivity) => {

        if (!isValidMessage(activity)) return;

        const isHistoryMessageReceived = isHistoryMessage(activity, startTime);
        const payload = buildMessagePayload(activity, userId);

        payload.messageType = Constants.userMessageTag;

        if (isHistoryMessageReceived) {
            historyMessageStrategy(polyfillMessagePayloadForEvent(activity, payload, TelemetryManager.InternalTelemetryData?.conversationId));
            return;
        }

        firstResponseLatencyTracker.stopClock(payload);

        const newMessageReceivedEvent: ICustomEvent = {
            eventName: BroadcastEvent.NewMessageReceived,
            payload: polyfillMessagePayloadForEvent(activity, payload, TelemetryManager.InternalTelemetryData?.conversationId)
        };

        BroadcastService.postMessage(newMessageReceivedEvent);

        TelemetryHelper.logActionEventToAllTelemetry(LogLevel.INFO, {
            Event: TelemetryEvent.MessageReceived,
            Description: "New message received",
            CustomProperties: maskPayloadText(payload)
        });

    };

    const raiseMessageEvent = (activity: IActivity) => {
        if (activity?.type === Constants.message) {
            const scenarioType = getScenarioType(activity);
            switch (scenarioType) {
                case ScenarioType.UserSendMessageStrategy:
                    userSendMessageStrategy(activity);
                    break;
                case ScenarioType.SystemMessageStrategy:
                    systemMessageStrategy(activity);
                    break;
                case ScenarioType.ReceivedMessageStrategy:
                    receivedMessageStrategy(activity);
                    break;
            }
        }
    };
    return onNewAdapterActivityHandler;
};