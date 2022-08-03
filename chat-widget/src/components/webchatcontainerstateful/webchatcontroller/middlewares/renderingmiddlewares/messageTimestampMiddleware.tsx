import { IWebChatAction } from "../../../interfaces/IWebChatAction";
import { WebChatActionType } from "../../enums/WebChatActionType";
import { Constants } from "../../../../../common/Constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
const createMessageTimeStampMiddleware = ({ dispatch }: { dispatch: any }) => (next: any) => (action: IWebChatAction) => {
    if (isApplicable(action)) {
        return next(evaluateTagsAndOverrideTimeStamp(action));
    }
    return next(action);
};

const isApplicable = (action: IWebChatAction): boolean => {
    return action.type === WebChatActionType.DIRECT_LINE_INCOMING_ACTIVITY &&
        isPVAConversation(action) &&
        isPayloadValid(action) &&
        isValidChannel(action);
};

const isPayloadValid = (action: IWebChatAction) => {
    return action?.payload?.activity;
};

const isValidChannel = (action: IWebChatAction): boolean => {
    return action?.payload?.activity?.channelId === Constants.acsChannel;
};

const isPVAConversation = (action: IWebChatAction): boolean => {
    return !isTagIncluded(action, Constants.systemMessageTag) &&
        !isTagIncluded(action, Constants.publicMessageTag) &&
        !isRoleUserOn(action);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isTagIncluded = (action: any, tag: string): boolean => {
    return isDataTagsPresent(action) &&
        action.payload.activity.channelData.tags.includes(tag);

};

const isRoleUserOn = (action: IWebChatAction) => {
    return action?.payload?.activity?.from?.role === Constants.userMessageTag;
};

const overrideTimeStamp = (timestampOriginal: string, timeStampNew: string): string => {
    return isTimestampValid(timeStampNew) ? timeStampNew : timestampOriginal;
};

const isTimestampValid = (timeStamp: string): boolean => {
    const regex = /(\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])(T)(\d{2})(:{1})(\d{2})(:{1})(\d{2})(.\d+)([Z]{1}))/;
    return regex.test(timeStamp);
};

const isDataTagsPresent = (action: IWebChatAction) => {
    return action?.payload?.activity?.channelData?.tags &&
        action.payload.activity.channelData.tags.length > 0;
};

const evaluateTagsAndOverrideTimeStamp = (action: IWebChatAction): IWebChatAction => {
    const tagValue = tagLookup(action, Constants.prefixTimestampTag);

    if (tagValue) {
        const newTimestamp = extractTimeStamp(tagValue);
        action.payload.activity.timestamp = overrideTimeStamp(action.payload.activity.timestamp, newTimestamp);
    }
    return action;
};

const extractTimeStamp = (timeStamp: string): string => {
    if (timeStamp && timeStamp.length > 0) {
        const ts = timeStamp.split(Constants.prefixTimestampTag);
        if (ts && ts.length > 1) {
            return ts[1];
        }
    }
    return timeStamp;
};

const tagLookup = (action: IWebChatAction, tag: string): string | null => {
    if (!isDataTagsPresent(action)) {
        return null;
    }

    const tags = action.payload.activity.channelData.tags;
    let value;

    if (tags && tags.length > 0) {
        for (let i = 0; i < tags.length; i++) {
            value = tags[i];
            if (value && value.indexOf(tag) > -1) {
                return value;
            }
        }
    }
    return null;
};

export default createMessageTimeStampMiddleware;