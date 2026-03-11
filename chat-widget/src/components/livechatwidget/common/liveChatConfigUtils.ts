import { isNullOrUndefined, parseBooleanFromConfig } from "../../../common/utils";

import { ConversationMode } from "../../../common/Constants";
import { ExtendedChatConfig } from "../../webchatcontainerstateful/interfaces/IExtendedChatConffig";
import { FacadeChatSDK } from "../../../common/facades/FacadeChatSDK";

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

    return conversationMode?.toString() === ConversationMode.Persistent;
};

/**
 * Determines if persistent chat history should be loaded based on all required conditions.
 * 
 * @param extendedChatConfig - The extended chat configuration object
 * @returns true if ALL conditions are met:
 *   1. Conversation mode must be Persistent ("192350001")
 *   2. History is enabled in admin config (msdyn_enablepersistentchatpreviousconversations)
 *   3. History is enabled via feature flag (lcwPersistentChatHistoryEnabled)
 */
export const shouldLoadPersistentChatHistory = (extendedChatConfig: ExtendedChatConfig | undefined): boolean => {
    // CRITICAL: First check if conversation mode is persistent
    // Only persistent mode ("192350001") should allow history loading
    const isPersistentChatEnabledForWidget = 
        isPersistentChatEnabled(extendedChatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_conversationmode);

    if (!isPersistentChatEnabledForWidget) {
        return false;
    }

    // Check if history is enabled in admin config (handles both boolean and string "true"/"false")
    const isHistoryEnabledInConfig = parseBooleanFromConfig(
        extendedChatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_enablepersistentchatpreviousconversations
    );

    if (!isHistoryEnabledInConfig) {
        return false;
    }

    // Check if history is enabled via feature flag (handles both boolean and string "true"/"false")
    const isHistoryEnabledViaFCB = parseBooleanFromConfig(
        extendedChatConfig?.LcwFcbConfiguration?.lcwPersistentChatHistoryEnabled
    );

    return isHistoryEnabledViaFCB;
};
