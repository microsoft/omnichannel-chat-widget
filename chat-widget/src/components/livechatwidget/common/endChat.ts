import { BroadcastEvent, LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";

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
import { PostChatSurveyMode } from "../../postchatsurveypanestateful/enums/PostChatSurveyMode";
import { Constants } from "../../../common/Constants";
import { ICustomEvent } from "@microsoft/omnichannel-chat-components/lib/types/interfaces/ICustomEvent";
import { addDelayInMs, getWidgetEndChatEventName } from "../../../common/utils";
import { getAuthClientFunction, handleAuthentication } from "./authHelper";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prepareEndChat = async (props: ILiveChatWidgetProps, chatSDK: any, setAdapter: any, setWebChatStyles: any, dispatch: Dispatch<ILiveChatWidgetAction>, adapter: any, state: ILiveChatWidgetContext) => {
    const isPostChatEnabled = state.domainStates.liveChatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_postconversationsurveyenable;
    const postChatSurveyMode = state.domainStates.liveChatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_postconversationsurveymode;

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
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let conversationDetails: any = undefined;
    try {
        conversationDetails = await chatSDK.getConversationDetails();
    }
    catch (erorr) {
        TelemetryHelper.logActionEvent(LogLevel.ERROR, {
            Event: TelemetryEvent.GetConversationDetailsException,
            ExceptionDetails: {
                exception: `Failed to get conversation details: ${erorr}`
            }
        });
    }

    if (isPostChatEnabled === "true" && conversationDetails?.canRenderPostChat === Constants.truePascal) {
        const skipEndChatSDK = false;
        const skipCloseChat = true;
        const chatSession = await chatSDK?.getCurrentLiveChatContext();
        await endChat(props, chatSDK, setAdapter, setWebChatStyles, dispatch, adapter, skipEndChatSDK, skipCloseChat, false);
        if (chatSession) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (chatSDK as any).chatToken = chatSession.chatToken ?? {};
            chatSDK.requestId = chatSession.requestId;
        }

        if (postChatSurveyMode === PostChatSurveyMode.Embed) {
            // Only start embedded Postchat workflow if postchat context is set successfully else close chat
            if (state.domainStates.postChatContext) {
                dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.PostchatLoading });
                await addDelayInMs(Constants.PostChatLoadingDurationInMs);
    
                const loadPostChatEvent: ICustomEvent = {
                    eventName: BroadcastEvent.LoadPostChatSurvey,
                };
                BroadcastService.postMessage(loadPostChatEvent);
            } else {
                await endChat(props, chatSDK, setAdapter, setWebChatStyles, dispatch, adapter, true, false, true);
            }
        } else if (postChatSurveyMode === PostChatSurveyMode.Link) {
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.InActive });

            // Disable SendBox
            if (props?.webChatContainerProps?.renderingMiddlewareProps?.hideSendboxOnConversationEnd !== false) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setWebChatStyles((styles: any) => { return { ...styles, hideSendBox: true }; });
            }
        }
        return;
    }
    await endChat(props, chatSDK, setAdapter, setWebChatStyles, dispatch, adapter, false, false, true);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const endChat = async (props: ILiveChatWidgetProps, chatSDK: any, setAdapter: any, setWebChatStyles: any, dispatch: Dispatch<ILiveChatWidgetAction>, adapter: any,
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
        }
    }

    // Need to clear these states immediately when chat ended from OC.
    dispatch({ type: LiveChatWidgetActionType.SET_CUSTOM_CONTEXT, payload: undefined });
    dispatch({ type: LiveChatWidgetActionType.SET_CHAT_TOKEN, payload: undefined });
    dispatch({ type: LiveChatWidgetActionType.SET_LIVE_CHAT_CONTEXT, payload: undefined });
    dispatch({ type: LiveChatWidgetActionType.SET_RECONNECT_ID, payload: undefined });

    if (!skipCloseChat) {
        try {
            adapter?.end();
            setAdapter(undefined);
            setWebChatStyles({ ...defaultWebChatContainerStatefulProps.webChatStyles, ...props.webChatContainerProps?.webChatStyles });
            WebChatStoreLoader.store = null;
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Closed });
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_ENDED_BY_AGENT, payload: false });
            dispatch({ type: LiveChatWidgetActionType.SET_RECONNECT_ID, payload: undefined });
            dispatch({ type: LiveChatWidgetActionType.SET_AUDIO_NOTIFICATION, payload: null });
            dispatch({
                type: LiveChatWidgetActionType.SET_PROACTIVE_CHAT_PARAMS, payload: {
                    proactiveChatBodyTitle: "",
                    proactiveChatEnablePrechat: false,
                    proactiveChatInNewWindow: false
                }
            });
            if (postMessageToOtherTab) {
                const endChatEventName = getWidgetEndChatEventName(
                    chatSDK?.omnichannelConfig?.orgId,
                    chatSDK?.omnichannelConfig?.widgetId,
                    props?.controlProps?.widgetInstanceId ?? "");
                BroadcastService.postMessage({
                    eventName: endChatEventName
                });
            }
        } catch (error) {
            TelemetryHelper.logActionEvent(LogLevel.ERROR, {
                Event: TelemetryEvent.CloseChatMethodException,
                ExceptionDetails: {
                    exception: `Failed to endChat: ${error}`
                }
            });
        } finally {
            dispatch({ type: LiveChatWidgetActionType.SET_UNREAD_MESSAGE_COUNT, payload: 0 });
        }
    }
};

export { prepareEndChat, endChat };