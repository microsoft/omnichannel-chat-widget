import { BroadcastEvent } from "../../../common/telemetry/TelemetryConstants";
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
    // load it concurrently, this will reduce the load time
    await Promise.all([updateSessionDataForTelemetry(facadeChatSDK, dispatch), updateConversationDataForTelemetry(facadeChatSDK, dispatch)]);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const updateSessionDataForTelemetry = async (facadeChatSDK: FacadeChatSDK, dispatch: Dispatch<ILiveChatWidgetAction>) => {
    if (facadeChatSDK && facadeChatSDK.getChatSDK()) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const chatSession: any = await facadeChatSDK.getCurrentLiveChatContext();
        const telemetryData = TelemetryHelper.addSessionDataToTelemetry(chatSession as LiveChatContext, TelemetryManager.InternalTelemetryData);
        dispatch({ type: LiveChatWidgetActionType.SET_TELEMETRY_DATA, payload: telemetryData });
        BroadcastService.postMessage({ eventName: BroadcastEvent.UpdateSessionDataForTelemetry, payload: {chatSession}});
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const updateConversationDataForTelemetry = async (facadeChatSDK: FacadeChatSDK, dispatch: Dispatch<ILiveChatWidgetAction>) => {
    if (facadeChatSDK && facadeChatSDK.getChatSDK()) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const liveWorkItem: any = await getConversationDetailsCall(facadeChatSDK);
        const telemetryData = TelemetryHelper.addConversationDataToTelemetry(liveWorkItem, TelemetryManager.InternalTelemetryData);
        dispatch({ type: LiveChatWidgetActionType.SET_TELEMETRY_DATA, payload: telemetryData });
        BroadcastService.postMessage({ eventName: BroadcastEvent.UpdateConversationDataForTelemetry, payload: {liveWorkItem}});
    }
};