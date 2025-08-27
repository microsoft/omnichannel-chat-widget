import { MessagePayload, ScenarioType, TrackingMessage } from "./Constants";

import { Constants } from "../common/Constants";
import { IActivity } from "botframework-directlinejs";

const DELTA_WITHIN_LIMITS_IN_MS = 250;

/**
 * Determines whether a given activity is a historical message.
 * 
 * This function checks if the activity is a message type and uses a combination
 * of legacy tags and timestamp-based logic to determine if the message is historical.
 * 
 * @param {IActivity} activity - The activity object to evaluate.
 * @param {number} startTime - The start time (in milliseconds since epoch) to compare against.
 * @returns {boolean} - Returns true if the activity is a historical message, false otherwise.
 * 
 * Logic:
 * - If the activity type is not a message, it is not historical.
 * - If the activity contains a legacy history message tag, it is considered historical.
 * - Otherwise, the function extracts a timestamp from the activity ID using `extractTimestampFromId`.
 *   - If the ID is valid and the timestamp is older than the start time, the message is historical.
 */
export const isHistoryMessage = (activity: IActivity, startTime: number): boolean => {

    // Only process message activities
    if (activity?.type !== Constants.message) {
        return false;
    }

    // Prioritize legacy history tag
    if (activity?.channelData?.tags && activity.channelData.tags.includes(Constants.historyMessageTag)) {
        return true;
    }

    const activityId = extractTimestampFromId(activity);
    const isValidId = !isNaN(activityId) && activityId > 0;
    const difference = startTime - activityId;
    // Only consider historical if activityId < startTime and difference >= DELTA_WITHIN_LIMITS_IN_MS
    const isOlderThanStartTime = activityId < startTime && difference >= DELTA_WITHIN_LIMITS_IN_MS;
    const isHistoryById = isValidId && isOlderThanStartTime;

    return isHistoryById;
};

export const extractTimestampFromId = (activity: IActivity): number => {
    const id = activity?.id ?? "";

    // Helper function to get timestamp fallback
    const getTimestampFallback = (): number => {
        const timestamp = new Date(activity?.timestamp ?? "").getTime();
        return isNaN(timestamp) ? 0 : timestamp;
    };

    // Check if ID looks like a UUID (contains dashes or is very long)
    const UUID_LENGTH_THRESHOLD = 13; // Threshold to distinguish UUIDs from epoch timestamps
    if (id.includes("-") || id.length > UUID_LENGTH_THRESHOLD) {
        // Likely UUID, use timestamp instead
        return getTimestampFallback();
    }

    const activityId = parseInt(id);
    // if activity id is not a number, then we use timestamp field
    if (isNaN(activityId)) {
        return getTimestampFallback();
    }

    return activityId;
};


export const buildMessagePayload = (activity: IActivity, userId: string): MessagePayload => {
    return {
        
        // To identify hidden contents vs empty content
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        text: (activity as any)?.text?.length >= 1 ? `*contents hidden (${(activity as any)?.text?.length} chars)*` : "",
        type: activity?.type,
        timestamp: activity?.timestamp,
        userId: userId,
        tags: activity?.channelData?.tags || [],
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
    const role = activity?.from?.role;
    const tags = activity?.channelData?.tags;

    if (role === Constants.userMessageTag) {
        return ScenarioType.UserSendMessageStrategy;
    }

    if ((tags && tags.includes(Constants.systemMessageTag)) || role === Constants.channelMessageTag) {
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



export const maskPayloadText = (payload: MessagePayload): MessagePayload => {

    if (!payload){
        return payload;
    }
    
    return {
        ...payload,
        text: "*contents hidden*"
    };
};