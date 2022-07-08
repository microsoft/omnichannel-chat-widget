import { BroadcastEvent, LogLevel, TelemetryEvent } from "../common/telemetry/TelemetryConstants";

import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { Constants } from "../common/Constants";
import { IActivity } from "botframework-directlinejs";
import { ICustomEvent } from "@microsoft/omnichannel-chat-components/lib/types/interfaces/ICustomEvent";
import { TelemetryHelper } from "../common/telemetry/TelemetryHelper";

export const createOnNewAdapterActivityHandler = (chatId: string, userId: string) => {
    const onNewAdapterActivityHandler = (activity: IActivity) => {
        const isActivityMessage: boolean = activity?.type === Constants.message;
        const isNotHistoryMessage: boolean = isActivityMessage && !activity?.channelData?.tags?.includes(Constants.historyMessageTag) && !activity?.channelData?.fromList;

        if (isNotHistoryMessage) {
            raiseMessageEvent(activity);
        }
    };

    const raiseMessageEvent = (activity: IActivity) => {
        if (activity?.type === Constants.message) {
            const payload = {
                // To identify hidden contents vs empty content
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                text: (activity as any)?.text?.length >= 1 ? `*contents hidden (${(activity as any)?.text?.length})chars*` : "",
                type: activity?.type,
                timestamp: activity?.timestamp,
                userId: userId,
                tags: activity?.channelData?.tags,
                messageType: "",
            };

            if (activity?.from?.role === Constants.userMessageTag) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                payload.messageType = Constants.userMessageTag;
                const newMessageSentEvent: ICustomEvent = {
                    eventName: BroadcastEvent.NewMessageSent,
                    payload: payload
                };
                BroadcastService.postMessage(newMessageSentEvent);

                TelemetryHelper.logActionEvent(LogLevel.INFO, {
                    Event: TelemetryEvent.MessageSent,
                    Description: "New message sent"
                });
            }
            else {
                if (activity?.channelData?.tags?.includes(Constants.systemMessageTag)) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    payload.messageType = Constants.systemMessageTag;
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
                    eventName: BroadcastEvent.NewMessageReceived,
                    payload: payload
                };
                BroadcastService.postMessage(newMessageReceivedEvent);

                TelemetryHelper.logActionEvent(LogLevel.INFO, {
                    Event: TelemetryEvent.MessageReceived,
                    Description: "New message received",
                    Data: payload
                });
            }
        }
    };

    return onNewAdapterActivityHandler;
};