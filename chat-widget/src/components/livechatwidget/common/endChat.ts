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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prepareEndChat = async (props: ILiveChatWidgetProps, chatSDK: any, setAdapter: any, setWebChatStyles: any, dispatch: Dispatch<ILiveChatWidgetAction>, adapter: any, state: ILiveChatWidgetContext) => {
    const isPostChatEnabled = state.domainStates.liveChatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_postconversationsurveyenable;
    const postChatSurveyMode = state.domainStates.liveChatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_postconversationsurveymode;

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
        await endChat(props, chatSDK, setAdapter, setWebChatStyles, dispatch, adapter, skipEndChatSDK, skipCloseChat, true);

        if (postChatSurveyMode === PostChatSurveyMode.Embed) {
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.PostchatLoading });
            await addDelayInMs(Constants.PostChatLoadingDurationInMs);

            const loadPostChatEvent: ICustomEvent = {
                eventName: BroadcastEvent.LoadPostChatSurvey,
            };
            BroadcastService.postMessage(loadPostChatEvent);
        } else if (postChatSurveyMode === PostChatSurveyMode.Link) {
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.InActive });
        }
        return;
    }
    await endChat(props, chatSDK, setAdapter, setWebChatStyles, dispatch, adapter, false, false, true);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const endChat = async (props: ILiveChatWidgetProps, chatSDK: any, setAdapter: any, setWebChatStyles: any, dispatch: Dispatch<ILiveChatWidgetAction>, adapter: any, skipEndChatSDK?: boolean, skipCloseChat?: boolean, postMessageToOtherTab?: boolean) => {
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
    dispatch({ type: LiveChatWidgetActionType.SET_CHAT_TOKEN, payload: undefined });
    dispatch({ type: LiveChatWidgetActionType.SET_LIVE_CHAT_CONTEXT, payload: undefined });

    if (!skipCloseChat) {
        try {
            adapter?.end();
            setAdapter(undefined);
            setWebChatStyles({ ...defaultWebChatContainerStatefulProps.webChatStyles, ...props.webChatContainerProps?.webChatStyles });
            WebChatStoreLoader.store = null;
            dispatch({ type: LiveChatWidgetActionType.SET_POSTCHAT_LOADING, payload: false });
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Closed });
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_ENDED_BY_AGENT, payload: false });
            dispatch({ type: LiveChatWidgetActionType.SET_RECONNECT_ID, payload: undefined });
            dispatch({ type: LiveChatWidgetActionType.SET_AUDIO_NOTIFICATION, payload: null });
            dispatch({ type: LiveChatWidgetActionType.SET_UNREAD_MESSAGE_COUNT, payload: 0 });
            dispatch({
                type: LiveChatWidgetActionType.SET_PROACTIVE_CHAT_PARAMS, payload: {
                    proactiveChatBodyTitle: "",
                    proactiveChatEnablePrechat: false,
                    proactiveChatInNewWindow: false
                }
            });
            if (postMessageToOtherTab) {
                const endChatEventName = getWidgetEndChatEventName(chatSDK?.omnichannelConfig?.orgId, chatSDK?.omnichannelConfig?.widgetId);
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
        }
    }
};

export { prepareEndChat, endChat };