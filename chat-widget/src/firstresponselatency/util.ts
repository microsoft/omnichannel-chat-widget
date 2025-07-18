import { MessagePayload, ScenarioType, TrackingMessage } from "./Constants";

import { Constants } from "../common/Constants";
import { IActivity } from "botframework-directlinejs";

export const isHistoryMessage = (activity: IActivity, startTime: number): boolean => {

    console.error("Checking if message is history message");
    console.error("Activity : ", activity);
    console.error("Activity ID: ", activity?.id);
    console.error("Start Time: ", startTime);
    
    // Only process message activities
    if (activity?.type !== Constants.message) {
        console.error("Not a message activity");
        return false;
    }
    
    // Legacy check for history message tag
    if (activity?.channelData?.tags?.includes(Constants.historyMessageTag)) {
        return true;
    }

    const activityId = extractTimestampFromId(activity);
    // Check if activity ID indicates history message
    if (activityId > 0) {
        const isValidId = !isNaN(activityId);
        const isOlderThanStartTime = activityId < startTime;
        const isHistoryById = isValidId && isOlderThanStartTime;
        
        // If parsing fails or ID is older than start time, it's history
        console.error("Activity ID is valid:", isValidId, "and older than start time:", isOlderThanStartTime);
        return isHistoryById;
    }

    console.error("No activity ID found, defaulting to false");
    return false;
};

export const extractTimestampFromId = (activity: IActivity): number => {
    const id = activity?.id ?? "";
    
    // Helper function to get timestamp fallback
    const getTimestampFallback = (): number => {
        const timestamp = new Date(activity?.timestamp ?? "").getTime();
        return isNaN(timestamp) ? 0 : timestamp;
    };
    
    // Check if ID looks like a UUID (contains dashes or is very long)
    if (id.includes("-") || id.length > 13) {
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
