import { BroadcastEvent, LogLevel, TelemetryEvent } from "../common/telemetry/TelemetryConstants";
import { checkContactIdError, isNullOrEmptyString } from "../common/utils";
import { handleAuthentication, removeAuthTokenProvider } from "../components/livechatwidget/common/authHelper";
import { hasReconnectId, isReconnectEnabled, redirectPage } from "../components/livechatwidget/common/reconnectChatHelper";

import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import ChatConfig from "@microsoft/omnichannel-chat-sdk/lib/core/ChatConfig";
import { ConversationState } from "../contexts/common/ConversationState";
import { Dispatch } from "react";
import { ICustomEvent } from "@microsoft/omnichannel-chat-components/lib/types/interfaces/ICustomEvent";
import { ILiveChatWidgetAction } from "../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../contexts/common/ILiveChatWidgetContext";
import { ILiveChatWidgetProps } from "../components/livechatwidget/interfaces/ILiveChatWidgetProps";
import { IReconnectChatContext } from "../components/reconnectchatpanestateful/interfaces/IReconnectChatContext";
import { IReconnectChatOptionalParams } from "../components/reconnectchatpanestateful/interfaces/IReconnectChatOptionalParams";
import { LiveChatWidgetActionType } from "../contexts/common/LiveChatWidgetActionType";
import StartChatOptionalParams from "@microsoft/omnichannel-chat-sdk/lib/core/StartChatOptionalParams";
import { TelemetryHelper } from "../common/telemetry/TelemetryHelper";
import useChatContextStore from "./useChatContextStore";
import useChatSDKStore from "./useChatSDKStore";
import useStartChat from "./useStartChat";

const useReconnectChat = (props: ILiveChatWidgetProps) => {
    const [state, dispatch]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chatSDK: any = useChatSDKStore();
    const startChat = useStartChat(props);

    const getChatReconnectContext = async (chatConfig: ChatConfig | undefined, isAuthenticatedChat: boolean) => {
        try {
            TelemetryHelper.logSDKEvent(LogLevel.INFO, {
                Event: TelemetryEvent.GetChatReconnectContextSDKCallStarted,
                Description: "Reconnect context SDK call started"
            });
    
            const chatReconnectOptionalParams: IReconnectChatOptionalParams = {
                reconnectId: props.reconnectChatPaneProps?.reconnectId
            };
            // Get auth token for getting chat reconnect context
            if (isAuthenticatedChat) {
                await handleAuthentication(chatSDK, chatConfig, props.getAuthToken);
            }
            const reconnectChatContext = await chatSDK?.getChatReconnectContext(chatReconnectOptionalParams);
            if (isAuthenticatedChat) {
                // remove auth token after reconnectId is fetched
                // AuthToken will be reset later at start chat
                removeAuthTokenProvider(chatSDK);
            }
            return reconnectChatContext;
        }
        catch (error) {
            checkContactIdError(error);
            TelemetryHelper.logSDKEvent(LogLevel.ERROR, {
                Event: TelemetryEvent.GetChatReconnectContextSDKCallFailed,
                ExceptionDetails: {
                    exception: error
                }
            });
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const setReconnectIdAndStartChat = async (isAuthenticatedChat: boolean, reconnectId: string) => {
        if (!isAuthenticatedChat) {
            const startUnauthenticatedReconnectChat: ICustomEvent = {
                eventName: BroadcastEvent.StartUnauthenticatedReconnectChat,
            };
            BroadcastService.postMessage(startUnauthenticatedReconnectChat);
        }
        const optionalParams: StartChatOptionalParams = { reconnectId: reconnectId };

        dispatch({ type: LiveChatWidgetActionType.SET_RECONNECT_ID, payload: reconnectId });
        dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Loading });

        await startChat(optionalParams);
    };

    const reconnectChat = async () => {
        if (!isReconnectEnabled(props.chatConfig)) return;
    
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isAuthenticatedChat = !!(props.chatConfig?.LiveChatConfigAuthSettings as any)?.msdyn_javascriptclientfunction;
    
        // Get chat reconnect context
        const reconnectChatContext: IReconnectChatContext = await getChatReconnectContext(props.chatConfig, isAuthenticatedChat);
    
        // Redirect if enabled
        if (reconnectChatContext?.redirectURL) {
            redirectPage(reconnectChatContext.redirectURL, !!props.reconnectChatPaneProps?.redirectInSameWindow);
            return;
        }
    
        if (hasReconnectId(reconnectChatContext)) {
            // If reconnect id is provided in props, don't show reconnect pane
            if (props.reconnectChatPaneProps?.reconnectId && !isNullOrEmptyString(props.reconnectChatPaneProps?.reconnectId)) {
                await setReconnectIdAndStartChat(isAuthenticatedChat, reconnectChatContext.reconnectId ?? "");
                return;
            }
    
            // Show reconnect pane
            state.appStates.conversationState = ConversationState.ReconnectChat;
            dispatch({ type: LiveChatWidgetActionType.SET_RECONNECT_ID, payload: reconnectChatContext.reconnectId ?? "" });
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.ReconnectChat });
            return;
        }
    };

    return reconnectChat;
};

export default useReconnectChat;