import { LogLevel, TelemetryEvent } from "../common/telemetry/TelemetryConstants";

import { Dispatch } from "react";
import { ILiveChatWidgetAction } from "../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../contexts/common/ILiveChatWidgetContext";
import { LiveChatWidgetActionType } from "../contexts/common/LiveChatWidgetActionType";
import { LiveWorkItemState } from "../common/Constants";
import { TelemetryHelper } from "../common/telemetry/TelemetryHelper";
import { getConversationDetailsCall } from "../common/utils";
import useChatContextStore from "./useChatContextStore";
import useChatSDKStore from "./useChatSDKStore";

const useCheckConversationValidity = () => {
    const [state, dispatch]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chatSDK: any = useChatSDKStore();

    const checkConversationValidity = async () => {
        const requestIdFromCache = state.domainStates?.liveChatContext?.requestId;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let conversationDetails: any = undefined;

        //Preserve current requestId
        const currentRequestId = chatSDK.requestId ?? "";
        dispatch({ type: LiveChatWidgetActionType.SET_INITIAL_CHAT_SDK_REQUEST_ID, payload: currentRequestId });

        try {
            chatSDK.requestId = requestIdFromCache;
            conversationDetails = await getConversationDetailsCall(chatSDK);

            if (Object.keys(conversationDetails).length === 0) {
                chatSDK.requestId = currentRequestId;
                return false;
            }

            if (conversationDetails.state === LiveWorkItemState.Closed || conversationDetails.state === LiveWorkItemState.WrapUp) {
                dispatch({ type: LiveChatWidgetActionType.SET_LIVE_CHAT_CONTEXT, payload: undefined });
                chatSDK.requestId = currentRequestId;
                return false;
            }

            return true;
        } catch (erorr) {
            TelemetryHelper.logActionEvent(LogLevel.ERROR, {
                Event: TelemetryEvent.GetConversationDetailsException,
                ExceptionDetails: {
                    exception: `Conversation is not valid: ${erorr}`
                }
            });
            chatSDK.requestId = currentRequestId;
            return false;
        }
    };

    return checkConversationValidity;
};

export default useCheckConversationValidity;