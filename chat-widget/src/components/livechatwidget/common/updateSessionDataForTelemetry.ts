import { Dispatch } from "react";
import { ILiveChatWidgetAction } from "../../../contexts/common/ILiveChatWidgetAction";
import LiveChatContext from "@microsoft/omnichannel-chat-sdk/lib/core/LiveChatContext";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { TelemetryManager } from "../../../common/telemetry/TelemetryManager";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateSessionDataForTelemetry = async (chatSDK: any, dispatch: Dispatch<ILiveChatWidgetAction>) => {
    if (chatSDK) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const chatSession: any = await chatSDK.getCurrentLiveChatContext();
        const telemetryData = TelemetryHelper.addSessionDataToTelemetry(chatSession as LiveChatContext, TelemetryManager.InternalTelemetryData);
        dispatch({ type: LiveChatWidgetActionType.SET_TELEMETRY_DATA, payload: telemetryData });
        await updateConversationDataForTelemetry(chatSDK, dispatch);
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const updateConversationDataForTelemetry = async (chatSDK: any, dispatch: Dispatch<ILiveChatWidgetAction>) => {
    if (chatSDK) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const liveWorkItem: any = await chatSDK.getConversationDetails();
        const telemetryData = TelemetryHelper.addConversationDataToTelemetry(liveWorkItem, TelemetryManager.InternalTelemetryData);
        dispatch({ type: LiveChatWidgetActionType.SET_TELEMETRY_DATA, payload: telemetryData });
    }
};