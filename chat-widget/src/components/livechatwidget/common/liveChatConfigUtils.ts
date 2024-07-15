
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isPostChatSurveyEnabled = async (chatSDK: any) : Promise<boolean> => {
    const chatConfig = await chatSDK.getLiveChatConfig();
    const postChatenabled = chatConfig.LiveWSAndLiveChatEngJoin
        ?.msdyn_postconversationsurveyenable.toString().toLowerCase();
    return postChatenabled === "true";
};