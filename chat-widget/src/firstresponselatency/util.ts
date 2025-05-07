import { MessagePayload, ScenarioType, TrackingMessage } from "./Constants";

import { Constants } from "../common/Constants";
import { IActivity } from "botframework-directlinejs";

export const isHistoryMessage = (activity: IActivity, startTime: number) => {
    try {
        if (activity?.type === Constants.message) {
            // this is an old piece of code, probably no longer relevant
            if (activity?.channelData?.tags?.includes(Constants.historyMessageTag)) return true;

            // Id is an epoch time in milliseconds , in utc format, for some reason is in a string format
            if (activity?.id) {
                /// activity.id is an string that contains epoch time in milliseconds
                const activityId = parseInt(activity?.id);

                // if the activity id is not a number, we default to new message
                if (isNaN(activityId)) {
                    return false;
                }

                // if the activity id is less than the start time, it means that the message is a history message
                if (activityId < startTime) {
                    return true;
                }
            }
            // anything else will be considered a new message
            return false;
        }
    } catch (e) {
        // if there is an error in parsing the activity id, we will consider it a new message
        console.error("Error in parsing activity id: ", e);
    }
    return false;
};

export const buildMessagePayload = (activity: IActivity, userId: string): MessagePayload => {
    return {
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
        isChatComplete: false,
    };
};

export const polyfillMessagePayloadForEvent = (activity: IActivity, payload: MessagePayload, conversationId?: string): MessagePayload => {
    return {
        ...payload,
        channelData: activity?.channelData,
        chatId: activity?.conversation?.id,
        conversationId: conversationId,
        Id: activity?.id,
        isChatComplete: false,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        text: (activity as any)?.text,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        attachment: (activity as any)?.attachments?.length >= 1 ? (activity as any)?.attachments : [],
        role: activity?.from?.role,
    };
};

export const getScenarioType = (activity: IActivity): ScenarioType => {
    if (activity?.from?.role === Constants.userMessageTag) {
        return ScenarioType.UserSendMessageStrategy;
    }
    if (activity?.channelData?.tags?.includes(Constants.systemMessageTag)) {
        return ScenarioType.SystemMessageStrategy;
    }
    return ScenarioType.ReceivedMessageStrategy;
};


export const createTrackingMessage = (payload: MessagePayload, type: string): TrackingMessage => {
    return {
        Id: payload.Id,
        role: payload.role,
        timestamp: payload?.timestamp,
        tags: payload.tags,
        messageType: payload.messageType,
        text: payload.text,
        type: type,
        checkTime: new Date().getTime()
    };
};
