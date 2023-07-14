import { ConversationState } from "../contexts/common/ConversationState";
import { Dispatch } from "react";
import { ILiveChatWidgetAction } from "../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../contexts/common/ILiveChatWidgetContext";
import { ILiveChatWidgetProps } from "../components/livechatwidget/interfaces/ILiveChatWidgetProps";
import { LiveChatWidgetActionType } from "../contexts/common/LiveChatWidgetActionType";
import StartChatOptionalParams from "@microsoft/omnichannel-chat-sdk/lib/core/StartChatOptionalParams";
import useChatContextStore from "./useChatContextStore";
import useChatSDKStore from "./useChatSDKStore";
import useStartChat from "./useStartChat";

const usePreChatStartChat = (props: ILiveChatWidgetProps) => {
    const [state, dispatch]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    const startChat = useStartChat(props);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chatSDK: any = useChatSDKStore();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const preChatStartChat = async () => {
        // Setting Proactive chat settings
        const isProactiveChat = state.appStates.conversationState === ConversationState.ProactiveChat;
        const isPreChatEnabledInProactiveChat = state.appStates.proactiveChatStates.proactiveChatEnablePrechat;

        // Getting prechat Survey Context
        const parseToJson = false;
        const preChatSurveyResponse: string = await chatSDK.getPreChatSurvey(parseToJson);
        const showPrechat = isProactiveChat ? preChatSurveyResponse && isPreChatEnabledInProactiveChat : (preChatSurveyResponse && !props?.controlProps?.hidePreChatSurveyPane);
    
        if (showPrechat) {
            dispatch({ type: LiveChatWidgetActionType.SET_PRE_CHAT_SURVEY_RESPONSE, payload: preChatSurveyResponse });
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Prechat });
            return;
        }
    
        // Initiate start chat
        dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Loading });
        const optionalParams: StartChatOptionalParams = { isProactiveChat };
        await startChat(optionalParams, undefined);
    };

    return preChatStartChat;
};

export default usePreChatStartChat;