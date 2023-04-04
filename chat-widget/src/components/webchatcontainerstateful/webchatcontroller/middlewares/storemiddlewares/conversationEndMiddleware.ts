/******
 * ConversationEndMiddleware
 * 
 * This middleware is invoked when the conversation is ended by the agent/bot.
 * The callback is then invoked to hide the send box (by default).
 ******/

import { Constants } from "../../../../../common/Constants";
import { DirectLineSenderRole } from "../../enums/DirectLineSenderRole";
import { IWebChatAction } from "../../../interfaces/IWebChatAction";
import { MessageTypes } from "../../enums/MessageType";
import { WebChatActionType } from "../../enums/WebChatActionType";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
const createConversationEndMiddleware = (conversationEndCallback: any) => ({ dispatch }: { dispatch: any }) => (next: any) => (action: IWebChatAction) => {
    if (action?.type == WebChatActionType.DIRECT_LINE_INCOMING_ACTIVITY && action.payload?.activity) {

        const activity = action.payload.activity;

        if (activity.channelId === "ACS_CHANNEL") {
            if (activity.from?.role === DirectLineSenderRole.Bot) {
                if (activity.channelData?.tags?.includes(Constants.systemMessageTag)
                    && (activity.channelData?.tags?.includes(Constants.agentEndConversationMessageTag)
                        || activity.channelData?.tags?.includes(Constants.supervisorForceCloseMessageTag))) {
                    conversationEndCallback();
                }
            }
        } else if (activity.from?.role === DirectLineSenderRole.Channel &&
            activity.channelData?.type === MessageTypes.Thread &&
            activity.channelData?.properties) { // IC3
            if (activity.channelData?.properties?.isdeleted === Constants.truePascal ||
                !activity.channelData?.properties?.containsExternalEntitiesListeningAll) {
                conversationEndCallback();
            }
        }
    }

    return next(action);
};

export default createConversationEndMiddleware;