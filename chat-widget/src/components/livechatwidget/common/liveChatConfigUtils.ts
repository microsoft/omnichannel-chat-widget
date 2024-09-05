import { ConversationMode } from "../../../common/Constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isPostChatSurveyEnabled = async (chatSDK: any) : Promise<boolean> => {
    const chatConfig = await chatSDK.getLiveChatConfig();
    const postChatEnabled = chatConfig.LiveWSAndLiveChatEngJoin
        ?.msdyn_postconversationsurveyenable.toString().toLowerCase();
    return postChatEnabled === "true";
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isPersistentChatEnabled = async (chatSDK: any): Promise<boolean> => {
    const chatConfig = await chatSDK.getLiveChatConfig();
    const conversationMode = chatConfig.LiveWSAndLiveChatEngJoin?.msdyn_conversationmode.toString().toLowerCase();
    return conversationMode === ConversationMode.Persistent.toString();
};
