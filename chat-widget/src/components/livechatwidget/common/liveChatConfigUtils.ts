import { ConversationMode } from "../../../common/Constants";
import { ILiveChatWidgetContext } from "../../../contexts/common/ILiveChatWidgetContext";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isPostChatSurveyEnabled = async (chatSDK: any) : Promise<boolean> => {
    const chatConfig = await chatSDK.getLiveChatConfig();
    const postChatEnabled = chatConfig.LiveWSAndLiveChatEngJoin
        ?.msdyn_postconversationsurveyenable.toString().toLowerCase();
    return postChatEnabled === "true";
};

export const isPersistentChatEnabled = async (state: ILiveChatWidgetContext | undefined): Promise<boolean> => {
    const chatConfig = state?.domainStates.liveChatConfig;
    const conversationMode = chatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_conversationmode.toString().toLowerCase();
    return conversationMode === ConversationMode.Persistent;
};
