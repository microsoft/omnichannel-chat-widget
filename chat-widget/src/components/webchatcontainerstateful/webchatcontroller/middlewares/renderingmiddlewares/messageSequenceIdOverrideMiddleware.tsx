import { IWebChatAction } from "../../../interfaces/IWebChatAction";
import { WebChatActionType } from "../../enums/WebChatActionType";
import { Constants } from "../../../../../common/Constants";
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
const createMessageSequenceIdOverrideMiddleware = ({ dispatch }: { dispatch: any }) => (next: any) => (action: IWebChatAction) => {
    if (isApplicable(action)) {
        return next(overrideSequenceIdWithOriginalMessageId(action));
    }
    return next(action);
};

const isApplicable = (action: IWebChatAction): boolean => {

    return action.type === WebChatActionType.DIRECT_LINE_INCOMING_ACTIVITY &&
        isValidChannel(action) &&
        isWebSequenceIdPresent(action) &&
        lookupOriginalMessageId(action) !== undefined;
};

const isValidChannel = (action: IWebChatAction): boolean => {
    return action?.payload?.activity?.channelId === Constants.acsChannel;
};

const isChannelDataPresent = (action: IWebChatAction) => {
    return action?.payload?.activity?.channelData !== undefined && action?.payload?.activity?.channelData !== null;
};

const isWebSequenceIdPresent = (action: IWebChatAction) => {

    if (!isChannelDataPresent(action)) return false;
    const channelData = action.payload.activity.channelData;

    return Object.keys(channelData).some((key) => {
        return (key === Constants.WebchatSequenceIdAttribute);
    });
};

const overrideSequenceIdWithOriginalMessageId = (action: IWebChatAction): IWebChatAction => {
    const originalMessageId = extractOriginalMessageId(action);
    const channelData = action.payload.activity.channelData;

    if (originalMessageId === undefined) return action;

    Object.keys(channelData).forEach(function (key) {
        if (key === Constants.WebchatSequenceIdAttribute && action.payload.activity.channelData[key] !== originalMessageId) {
            action.payload.activity.channelData[key] = originalMessageId;
        }
    });
    return action;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
const extractOriginalMessageId = (action: any): number | undefined => {

    const originalMessageId = lookupOriginalMessageId(action);
    if (typeof originalMessageId !== "string" || originalMessageId === "") {
        return undefined;
    }
    const originalMessageIdResult = parseInt(originalMessageId);
    return isNaN(originalMessageIdResult) ? undefined : originalMessageIdResult;
};

const lookupOriginalMessageId = (action: IWebChatAction) => {
    return action?.payload?.activity?.channelData?.metadata?.OriginalMessageId;
};

export default createMessageSequenceIdOverrideMiddleware;