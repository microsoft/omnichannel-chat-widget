import { BroadcastEvent, LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";
import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { Dispatch } from "react";
import { FacadeChatSDK } from "../../../common/facades/FacadeChatSDK";
import { ILiveChatWidgetAction } from "../../../contexts/common/ILiveChatWidgetAction";
import LiveChatContext from "@microsoft/omnichannel-chat-sdk/lib/core/LiveChatContext";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { TelemetryManager } from "../../../common/telemetry/TelemetryManager";
import { getConversationDetailsCall } from "../../../common/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateTelemetryData = async (facadeChatSDK: FacadeChatSDK, dispatch: Dispatch<ILiveChatWidgetAction>) => {
    // startChat no longer waits for this, so the next chat can start (chatSDKStateCleanUp assigns a new requestId)
    // before these calls resolve. Results for an earlier chat must not overwrite the current chat's data.
    // endChat also assigns a new requestId, so the chat that just ended still applies its own results.
    const requestId = facadeChatSDK?.getChatSDK()?.requestId;
    try {
        // load it concurrently, this will reduce the load time
        await Promise.all([updateSessionDataForTelemetry(facadeChatSDK, dispatch, requestId), updateConversationDataForTelemetry(facadeChatSDK, dispatch, requestId)]);
    } catch (error) {
        TelemetryHelper.logSDKEvent(LogLevel.ERROR, {
            Event: TelemetryEvent.UpdateTelemetryDataFailed,
            ExceptionDetails: {
                exception: `Update telemetry data failed: ${error}`
            }
        });
    }
};

// The requestId alone isn't enough: endChat also replaces it. Only the next chat's startChat gets a new chat token
// (endChat and chatSDKStateCleanUp clear it), so drop the result only when the SDK holds that next chat.
const isFromEarlierChat = (facadeChatSDK: FacadeChatSDK, requestId: string | undefined) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chatSDK = facadeChatSDK.getChatSDK() as any;
    return chatSDK?.requestId !== requestId && !!chatSDK?.chatToken?.chatId;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const updateSessionDataForTelemetry = async (facadeChatSDK: FacadeChatSDK, dispatch: Dispatch<ILiveChatWidgetAction>, requestId: string | undefined) => {
    if (facadeChatSDK && facadeChatSDK.getChatSDK()) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const chatSession: any = await facadeChatSDK.getCurrentLiveChatContext();
        if (isFromEarlierChat(facadeChatSDK, requestId)) {
            return;
        }
        const telemetryData = TelemetryHelper.addSessionDataToTelemetry(chatSession as LiveChatContext, TelemetryManager.InternalTelemetryData);
        dispatch({ type: LiveChatWidgetActionType.SET_TELEMETRY_DATA, payload: telemetryData });
        BroadcastService.postMessage({ eventName: BroadcastEvent.UpdateSessionDataForTelemetry, payload: {chatSession}});
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const updateConversationDataForTelemetry = async (facadeChatSDK: FacadeChatSDK, dispatch: Dispatch<ILiveChatWidgetAction>, requestId: string | undefined) => {
    if (facadeChatSDK && facadeChatSDK.getChatSDK()) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const liveWorkItem: any = await getConversationDetailsCall(facadeChatSDK);
        if (isFromEarlierChat(facadeChatSDK, requestId)) {
            return;
        }
        const telemetryData = TelemetryHelper.addConversationDataToTelemetry(liveWorkItem, TelemetryManager.InternalTelemetryData);
        dispatch({ type: LiveChatWidgetActionType.SET_TELEMETRY_DATA, payload: telemetryData });
        BroadcastService.postMessage({ eventName: BroadcastEvent.UpdateConversationDataForTelemetry, payload: {liveWorkItem}});
    }
};