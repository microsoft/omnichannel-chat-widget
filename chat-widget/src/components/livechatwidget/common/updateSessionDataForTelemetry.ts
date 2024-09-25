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
export const updateSessionDataForTelemetry = async (chatSDK: any, dispatch: Dispatch<ILiveChatWidgetAction>) => {
    console.time("updateSessionDataForTelemetry");
    await Promise.all([updateTelemetry(chatSDK, dispatch), updateConversationDataForTelemetry(chatSDK, dispatch)]);
    console.timeEnd("updateSessionDataForTelemetry");
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const updateTelemetry = async (chatSDK: any, dispatch: Dispatch<ILiveChatWidgetAction>) => {
    console.time("updateTelemetry");
    if (chatSDK) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const chatSession: any = await chatSDK.getCurrentLiveChatContext();
        const telemetryData = TelemetryHelper.addSessionDataToTelemetry(chatSession as LiveChatContext, TelemetryManager.InternalTelemetryData);
        dispatch({ type: LiveChatWidgetActionType.SET_TELEMETRY_DATA, payload: telemetryData });
        BroadcastService.postMessage({ eventName: BroadcastEvent.UpdateSessionDataForTelemetry, payload: {chatSession}});
    }
    console.timeEnd("updateTelemetry");
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const updateConversationDataForTelemetry = async (chatSDK: any, dispatch: Dispatch<ILiveChatWidgetAction>) => {
    console.time("updateConversationDataForTelemetry");
    if (chatSDK) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const liveWorkItem: any = await getConversationDetailsCall(chatSDK);
        const telemetryData = TelemetryHelper.addConversationDataToTelemetry(liveWorkItem, TelemetryManager.InternalTelemetryData);
        dispatch({ type: LiveChatWidgetActionType.SET_TELEMETRY_DATA, payload: telemetryData });
        BroadcastService.postMessage({ eventName: BroadcastEvent.UpdateConversationDataForTelemetry, payload: {liveWorkItem}});
    }
    console.timeEnd("updateConversationDataForTelemetry");
};