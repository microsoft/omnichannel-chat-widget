import { getStateFromCache, getWidgetCacheIdfromProps, isNullOrEmptyString, isUndefinedOrEmpty } from "../common/utils";

import { BroadcastEvent } from "../common/telemetry/TelemetryConstants";
import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { ConversationState } from "../contexts/common/ConversationState";
import { Dispatch } from "react";
import { ILiveChatWidgetAction } from "../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../contexts/common/ILiveChatWidgetContext";
import { ILiveChatWidgetProps } from "../components/livechatwidget/interfaces/ILiveChatWidgetProps";
import { LiveChatWidgetActionType } from "../contexts/common/LiveChatWidgetActionType";
import useChatContextStore from "./useChatContextStore";
import usePreChatStartChat from "./usePreChatStartChat";
import useReconnectChat from "./useReconnectChat";
import useStartChat from "./useStartChat";

const usePrepareStartChat = (props: ILiveChatWidgetProps) => {
    const [state, dispatch]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    const startChat = useStartChat(props);
    const preChatStartChat = usePreChatStartChat(props);
    const reconnectChat = useReconnectChat(props);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const canConnectToExistingChat = async () => {
        // By pass this function in case of popout chat
        if (state?.appStates?.hideStartChatButton === true) {
            return false;
        }

        const persistedState = getStateFromCache(getWidgetCacheIdfromProps(props));

        // Connect to only active chat session
        if (persistedState &&
            !isUndefinedOrEmpty(persistedState?.domainStates?.liveChatContext) &&
            persistedState?.appStates?.conversationState === ConversationState.Active) {
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Loading });
            const optionalParams = { liveChatContext: persistedState?.domainStates?.liveChatContext };
            await startChat(optionalParams);
            return true;
        }

        return false;
    };

    const canStartPopoutChat = async () => {
        if (props.allowSdkChatSupport === false) {
            return false;
        }
    
        const popoutWidgetInstanceId = getWidgetCacheIdfromProps(props, true);
    
        if (!isNullOrEmptyString(popoutWidgetInstanceId)) {
            const persistedState = getStateFromCache(popoutWidgetInstanceId);
    
            if (persistedState &&
                !isUndefinedOrEmpty(persistedState?.domainStates?.liveChatContext) &&
                persistedState?.appStates?.conversationState === ConversationState.Active) {
                // Initiate popout chat
                BroadcastService.postMessage({
                    eventName: BroadcastEvent.InitiateStartChatInPopoutMode
                });
                return true;
            }
        }
        return false;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prepareStartChat = async () => {
        // Reconnect > chat from cache
        await reconnectChat();

        // If chat reconnect has kicked in chat state will become Active or Reconnect. So just exit, else go next
        if (state.appStates.conversationState === ConversationState.Active || state.appStates.conversationState === ConversationState.ReconnectChat) {
            return;
        }

        // Check if there is any active popout chats in cache
        if (await canStartPopoutChat()) {
            return;
        }

        // Can connect to existing chat session
        if (await canConnectToExistingChat()) {
            return;
        }

        await preChatStartChat();
    };

    return prepareStartChat;
};

export default usePrepareStartChat;