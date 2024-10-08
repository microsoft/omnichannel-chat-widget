import { BroadcastEvent } from "../../../common/telemetry/TelemetryConstants";
import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { Dispatch } from "react";
import { ILiveChatWidgetAction } from "../../../contexts/common/ILiveChatWidgetAction";
import LiveChatContext from "@microsoft/omnichannel-chat-sdk/lib/core/LiveChatContext";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { TelemetryManager } from "../../../common/telemetry/TelemetryManager";
import { getConversationDetailsCall } from "../../../common/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateTelemetryData = async (chatSDK: any, dispatch: Dispatch<ILiveChatWidgetAction>) => {
    // load it concurrently, this will reduce the load time
    await Promise.all([updateSessionDataForTelemetry(chatSDK, dispatch), updateConversationDataForTelemetry(chatSDK, dispatch)]);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const updateSessionDataForTelemetry = async (chatSDK: any, dispatch: Dispatch<ILiveChatWidgetAction>) => {
    if (chatSDK) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const chatSession: any = await chatSDK.getCurrentLiveChatContext();
        const telemetryData = TelemetryHelper.addSessionDataToTelemetry(chatSession as LiveChatContext, TelemetryManager.InternalTelemetryData);
        dispatch({ type: LiveChatWidgetActionType.SET_TELEMETRY_DATA, payload: telemetryData });
        BroadcastService.postMessage({ eventName: BroadcastEvent.UpdateSessionDataForTelemetry, payload: {chatSession}});
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const updateConversationDataForTelemetry = async (chatSDK: any, dispatch: Dispatch<ILiveChatWidgetAction>, maxAttempts = 3, attempt = 1) => {
    if (chatSDK) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const liveWorkItem: any = await getConversationDetailsCall(chatSDK);
        if (liveWorkItem.conversationId) {
            const telemetryData = TelemetryHelper.addConversationDataToTelemetry(liveWorkItem, TelemetryManager.InternalTelemetryData);
            dispatch({ type: LiveChatWidgetActionType.SET_TELEMETRY_DATA, payload: telemetryData });
            BroadcastService.postMessage({ eventName: BroadcastEvent.UpdateConversationDataForTelemetry, payload: {liveWorkItem}});
        } else if (attempt < maxAttempts) {
            // If liveWorkItem is empty and retry attempts remain, try again
            setTimeout(async () => {
                await updateConversationDataForTelemetry(chatSDK, dispatch, maxAttempts, attempt + 1);
            }, 2000); // Retry after 2 seconds
        }
    }
};