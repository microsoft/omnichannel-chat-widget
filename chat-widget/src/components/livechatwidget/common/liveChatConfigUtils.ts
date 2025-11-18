import { ConversationMode } from "../../../common/Constants";
import { FacadeChatSDK } from "../../../common/facades/FacadeChatSDK";
import { isNullOrUndefined } from "../../../common/utils";

export const isPostChatSurveyEnabled = async (facadeChatSDK: FacadeChatSDK) : Promise<boolean> => {
    const chatConfig = await facadeChatSDK.getLiveChatConfig();
    const postChatEnabled = chatConfig.LiveWSAndLiveChatEngJoin
        ?.msdyn_postconversationsurveyenable.toString().toLowerCase();
    return postChatEnabled === "true";
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getPostChatSurveyConfig = async (facadeChatSDK: FacadeChatSDK) : Promise<any> => {
    const chatConfig = await facadeChatSDK.getLiveChatConfig();
    const postChatEnabled = chatConfig.LiveWSAndLiveChatEngJoin
        ?.msdyn_postconversationsurveyenable.toString().toLowerCase();
    const agentSurveyMode = chatConfig.LiveWSAndLiveChatEngJoin?.msdyn_postconversationsurveymode?.toString();
    const botSurveyMode = chatConfig.LiveWSAndLiveChatEngJoin?.msdyn_postconversationsurveybotsurveymode?.toString();
    const surveyProvider = chatConfig.LiveWSAndLiveChatEngJoin?.msdyn_surveyprovider?.toString();
    const isConversationalSurveyEnabled = chatConfig.LiveWSAndLiveChatEngJoin?.msdyn_isConversationalPostChatSurveyEnabled?.toString().toLowerCase();
    return {
        postChatEnabled: postChatEnabled === "true",
        agentSurveyMode: agentSurveyMode,
        botSurveyMode: botSurveyMode,
        surveyProvider: surveyProvider,
        isConversationalSurveyEnabled: (isConversationalSurveyEnabled === "true")
    };
};

export const isPersistentChatEnabled = (conversationMode: string | undefined): boolean => {
    if (isNullOrUndefined(conversationMode)) {
        return false;
    }

    return conversationMode?.toString().toLowerCase() === ConversationMode.Persistent;
};
