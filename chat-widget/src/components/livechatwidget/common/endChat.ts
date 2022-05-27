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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prepareEndChat = async (props: ILiveChatWidgetProps, chatSDK: any, setAdapter: any, setWebChatStyles: any, dispatch: Dispatch<ILiveChatWidgetAction>, adapter: any, state: ILiveChatWidgetContext) => {
    const isPostChatEnabled = state.domainStates.liveChatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_postconversationsurveyenable;
    const postChatSurveyMode = state.domainStates.liveChatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_postconversationsurveymode;
    const conversationDetails = await chatSDK.getConversationDetails();
    if (isPostChatEnabled === "true" && conversationDetails?.canRenderPostChat === Constants.truePascal) {
        const skipEndChatSDK = false;
        const skipCloseChat = true;
        await endChat(props, chatSDK, setAdapter, setWebChatStyles, dispatch, adapter, skipEndChatSDK, skipCloseChat);
        if (postChatSurveyMode === PostChatSurveyMode.Embed) {
            const loadPostChatEvent: ICustomEvent = {
                eventName: BroadcastEvent.LoadPostChatSurvey,
            };
            BroadcastService.postMessage(loadPostChatEvent);
        } else if (postChatSurveyMode === PostChatSurveyMode.Link) {
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.InActive });
        }
    } else {
        await endChat(props, chatSDK, setAdapter, setWebChatStyles, dispatch, adapter);
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const endChat = async (props: ILiveChatWidgetProps, chatSDK: any, setAdapter: any, setWebChatStyles: any, dispatch: Dispatch<ILiveChatWidgetAction>, adapter: any, skipEndChatSDK?: boolean, skipCloseChat?: boolean) => {
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
        }
    }
    if (!skipCloseChat) {
        try {
            adapter?.end();
            setAdapter(undefined);
            setWebChatStyles({...defaultWebChatContainerStatefulProps.webChatStyles, ...props.webChatContainerProps?.webChatStyles});
            WebChatStoreLoader.store = null;
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Closed });
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_ENDED_BY_AGENT, payload: false });
            dispatch({ type: LiveChatWidgetActionType.SET_RECONNECT_ID, payload: undefined });
            dispatch({ type: LiveChatWidgetActionType.SET_AUDIO_NOTIFICATION, payload: null });
            dispatch({ type: LiveChatWidgetActionType.SET_CHAT_TOKEN, payload: undefined });
            dispatch({ type: LiveChatWidgetActionType.SET_LIVE_CHAT_CONTEXT, payload: undefined });
            BroadcastService.postMessage({
                eventName: BroadcastEvent.EndChat
            });
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