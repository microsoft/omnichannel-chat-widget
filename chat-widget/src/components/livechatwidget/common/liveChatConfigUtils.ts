import { ConversationMode } from "../../../common/Constants";
import { FacadeChatSDK } from "../../../common/facades/FacadeChatSDK";
import { isNullOrUndefined } from "../../../common/utils";

export const isPostChatSurveyEnabled = async (facadeChatSDK: FacadeChatSDK) : Promise<boolean> => {
    const chatConfig = await facadeChatSDK.getLiveChatConfig();
    const postChatEnabled = chatConfig.LiveWSAndLiveChatEngJoin
        ?.msdyn_postconversationsurveyenable.toString().toLowerCase();
    return postChatEnabled === "true";
};

export const isPersistentChatEnabled = (conversationMode: string | undefined): boolean => {
    if (isNullOrUndefined(conversationMode)) {
        return false;
    }

    return conversationMode?.toString().toLowerCase() === ConversationMode.Persistent;
};
