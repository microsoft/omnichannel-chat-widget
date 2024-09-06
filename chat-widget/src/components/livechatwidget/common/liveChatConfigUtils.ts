import { ConversationMode } from "../../../common/Constants";
import { isNullOrUndefined } from "../../../common/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isPostChatSurveyEnabled = async (chatSDK: any) : Promise<boolean> => {
    const chatConfig = await chatSDK.getLiveChatConfig();
    const postChatEnabled = chatConfig.LiveWSAndLiveChatEngJoin
        ?.msdyn_postconversationsurveyenable.toString().toLowerCase();
    return postChatEnabled === "true";
};

export const isPersistentChatEnabled = async (conversationMode: string | undefined): Promise<boolean> => {
    if (isNullOrUndefined(conversationMode)) {
        return false;
    }

    return conversationMode?.toString().toLowerCase() === ConversationMode.Persistent;
};
