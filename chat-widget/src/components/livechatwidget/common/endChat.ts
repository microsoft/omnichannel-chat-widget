import { LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";

import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { ConversationState } from "../../../contexts/common/ConversationState";
import { Dispatch } from "react";
import { ILiveChatWidgetAction } from "../../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetProps } from "../interfaces/ILiveChatWidgetProps";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { WebChatStoreLoader } from "../../webchatcontainerstateful/webchatcontroller/WebChatStoreLoader";
import { defaultWebChatContainerStatefulProps } from "../../webchatcontainerstateful/common/defaultProps/defaultWebChatContainerStatefulProps";
import { ILiveChatWidgetContext } from "../../../contexts/common/ILiveChatWidgetContext";
import { getWidgetEndChatEventName } from "../../../common/utils";
import { getAuthClientFunction, handleAuthentication } from "./authHelper";
import { checkPostChatEnabled, initiatePostChat, setWidgetStateToInactive, getPostChatContext } from "./renderSurveyHelpers";
import { ConversationEndEntity } from "../../../contexts/common/ConversationEndEntity";
import { ParticipantType } from "../../../common/Constants";

let currentUUID = "";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prepareEndChat = async (props: ILiveChatWidgetProps, chatSDK: any, state: ILiveChatWidgetContext, dispatch: Dispatch<ILiveChatWidgetAction>, setAdapter: any, setWebChatStyles: any, adapter: any, uuid: string) => {
    try {
        //Handle post chat
        currentUUID = uuid;

        // If post chat is already rendered
        if (state?.appStates?.conversationState === ConversationState.Postchat) {
            //skipEndChatSDK = true as endChat is already called, just proceed to close chat
            await endChat(props, chatSDK, state, dispatch, setAdapter, setWebChatStyles, adapter, true, false, true);
            return;
        }

        //Get the updated post chat context before end chat
        const postchatContext: any = state?.domainStates?.postChatContext;
        console.log("postchatContext:endChat:", JSON.stringify(postchatContext));

        await handleAuthenticationIfEnabled(props, chatSDK);

        const isPostChatEnabled = (postchatContext && checkPostChatEnabled(props, state, dispatch));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let conversationDetails: any;

        //Keep conversation details and postchat context before end chat
        if (isPostChatEnabled) {
            conversationDetails = await getConversationDetails(chatSDK);

            updateParticipantTypes(dispatch, conversationDetails);
        }

        //await setWidgetStateToInactive(props, dispatch, setWebChatStyles);
        //skipEndChatSDK = false, skipCloseChat = true as we still need to render post chat
        await endChat(props, chatSDK, state, dispatch, setAdapter, setWebChatStyles, adapter, false, true, true);

        if (isPostChatEnabled) {
            await initiatePostChat(props, conversationDetails, postchatContext, state, dispatch);
        }

        TelemetryHelper.logActionEvent(LogLevel.ERROR, {
            Event: TelemetryEvent.EndChatSucceeded,
            Description: "End chat succeeded."
        });
    }
    catch (error) {
        TelemetryHelper.logActionEvent(LogLevel.ERROR, {
            Event: TelemetryEvent.EndChatFailed,
            ExceptionDetails: {
                exception: error
            }
        });
    }
    finally {
        //Chat token clean up
        await chatTokenCleanUp(dispatch, state);
        //Close chat widget for any failure in embedded to allow to start new chat
        if (props.controlProps?.hideStartChatButton === false) {
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Closed });
        }
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const endChat = async (props: ILiveChatWidgetProps, chatSDK: any, state: ILiveChatWidgetContext, dispatch: Dispatch<ILiveChatWidgetAction>, setAdapter: any, setWebChatStyles: any, adapter: any,
    skipEndChatSDK?: boolean, skipCloseChat?: boolean, postMessageToOtherTab?: boolean) => {
    if (!skipEndChatSDK) {
        try {
            TelemetryHelper.logSDKEvent(LogLevel.INFO, {
                Event: TelemetryEvent.EndChatSDKCall
            });
            await chatSDK?.endChat();
        } catch (ex) {
            TelemetryHelper.logSDKEvent(LogLevel.ERROR, {
                Event: TelemetryEvent.EndChatSDKCallFailed,
                ExceptionDetails: {
                    exception: ex
                }
            });
            postMessageToOtherTab = false;
        } finally {
            await endChatStateCleanUp(dispatch);
        }
    }

    if (!skipCloseChat) {
        try {
            adapter?.end();

            setAdapter(undefined);

            setWebChatStyles({ ...defaultWebChatContainerStatefulProps.webChatStyles, ...props.webChatContainerProps?.webChatStyles });

            WebChatStoreLoader.store = null;

            await closeChatStateCleanUp(dispatch);

            if (postMessageToOtherTab) {
                const endChatEventName = await getEndChatEventName(chatSDK, props);
                BroadcastService.postMessage({
                    eventName: endChatEventName,
                    payload: currentUUID
                });
            }

            TelemetryHelper.logActionEvent(LogLevel.INFO, {
                Event: TelemetryEvent.CloseChatCall,
                Description: "Chat was closed succesfully"
            });
        } catch (error) {
            TelemetryHelper.logActionEvent(LogLevel.ERROR, {
                Event: TelemetryEvent.CloseChatMethodException,
                ExceptionDetails: {
                    exception: `Failed to endChat: ${error}`
                }
            });
        } finally {
            dispatch({ type: LiveChatWidgetActionType.SET_UNREAD_MESSAGE_COUNT, payload: 0 });
            //Always allow to close the chat for embedded mode irrespective of end chat errors
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Closed });
        }
    }
};

const endChatStateCleanUp = async (dispatch: Dispatch<ILiveChatWidgetAction>) => {
    // Need to clear these states immediately when chat ended from OC.
    dispatch({ type: LiveChatWidgetActionType.SET_CUSTOM_CONTEXT, payload: undefined });
    dispatch({ type: LiveChatWidgetActionType.SET_CHAT_TOKEN, payload: undefined });
    dispatch({ type: LiveChatWidgetActionType.SET_LIVE_CHAT_CONTEXT, payload: undefined });
    dispatch({ type: LiveChatWidgetActionType.SET_RECONNECT_ID, payload: undefined });
    dispatch({ type: LiveChatWidgetActionType.SET_CHAT_DISCONNECT_EVENT_RECEIVED, payload: false });
};

const closeChatStateCleanUp = async (dispatch: Dispatch<ILiveChatWidgetAction>) => {
    dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Closed });
    dispatch({ type: LiveChatWidgetActionType.SET_POST_CHAT_WORKFLOW_IN_PROGRESS, payload: false });
    dispatch({ type: LiveChatWidgetActionType.SET_SHOULD_USE_BOT_SURVEY, payload: false });
    dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_ENDED_BY_AGENT_EVENT_RECEIVED, payload: false });
    dispatch({ type: LiveChatWidgetActionType.SET_RECONNECT_ID, payload: undefined });
    dispatch({ type: LiveChatWidgetActionType.SET_AUDIO_NOTIFICATION, payload: null });
    dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_ENDED_BY, payload: undefined });

    dispatch({
        type: LiveChatWidgetActionType.SET_PROACTIVE_CHAT_PARAMS, payload: {
            proactiveChatBodyTitle: "",
            proactiveChatEnablePrechat: false,
            proactiveChatInNewWindow: false
        }
    });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleAuthenticationIfEnabled = async (props: ILiveChatWidgetProps, chatSDK: any) => {
    //Unable to end chat if token has expired
    if (props.getAuthToken) {
        const authClientFunction = getAuthClientFunction(props.chatConfig);
        if (props.getAuthToken && authClientFunction) {
            // set auth token to chat sdk before end chat
            const authSuccess = await handleAuthentication(chatSDK, props.chatConfig, props.getAuthToken);
            if (!authSuccess) {
                TelemetryHelper.logActionEvent(LogLevel.ERROR, {
                    Event: TelemetryEvent.GetAuthTokenFailed,
                    ExceptionDetails: {
                        exception: "Unable to get auth token during end chat"
                    }
                });
                throw new Error("handleAuthenticationIfEnabled:Failed to get authentication token");
            }
        }
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const chatTokenCleanUp = async (dispatch: Dispatch<ILiveChatWidgetAction>, state: ILiveChatWidgetContext) => {
    //Just do cleanup here
    dispatch({ type: LiveChatWidgetActionType.SET_CHAT_TOKEN, payload: undefined });
    dispatch({ type: LiveChatWidgetActionType.SET_LIVE_CHAT_CONTEXT, payload: undefined });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getEndChatEventName = async (chatSDK: any, props: ILiveChatWidgetProps) => {
    return getWidgetEndChatEventName(
        chatSDK?.omnichannelConfig?.orgId,
        chatSDK?.omnichannelConfig?.widgetId,
        props?.controlProps?.widgetInstanceId ?? "");
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getConversationDetails = async (chatSDK: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let conversationDetails: any = undefined;
    try {
        conversationDetails = await chatSDK.getConversationDetails();
        console.log(`conversationDetails:${JSON.stringify(conversationDetails)}`);
    } catch (error) {
        TelemetryHelper.logSDKEvent(LogLevel.ERROR, {
            Event: TelemetryEvent.GetConversationDetailsCallFailed,
            ExceptionDetails: {
                exception: `Get Conversation Details Call Failed : ${error}`
            }
        });
    }

    return conversationDetails;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const updateParticipantTypes = async (dispatch: Dispatch<ILiveChatWidgetAction>, conversationDetails: any) => {
    if (conversationDetails?.participantType === ParticipantType.User) {
        dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_ENDED_BY, payload: ConversationEndEntity.Agent });
    } else if (conversationDetails?.participantType === ParticipantType.Bot)
        dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_ENDED_BY, payload: ConversationEndEntity.Bot });
};

export { prepareEndChat, endChat };