import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { BroadcastEvent } from "../../../common/telemetry/TelemetryConstants";
import { Constants } from "../../../common/Constants";
import type { Dispatch, MutableRefObject } from "react";
import type { ILiveChatWidgetAction } from "../../../contexts/common/ILiveChatWidgetAction";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";
import type OmnichannelMessage from "@microsoft/omnichannel-chat-sdk/lib/core/messaging/OmnichannelMessage";

export const createNewMessageHandler = (
    currentMessageCountRef: MutableRefObject<number>,
    dispatch: Dispatch<ILiveChatWidgetAction>
): ((message: OmnichannelMessage) => void) => (message: OmnichannelMessage): void => {
    if (message.role === Constants.userMessageTag) {
        return;
    }

    currentMessageCountRef.current++;
    dispatch({
        type: LiveChatWidgetActionType.SET_UNREAD_MESSAGE_COUNT,
        payload: currentMessageCountRef.current + 1
    });
    BroadcastService.postMessage({
        eventName: BroadcastEvent.NewMessageNotification
    });
};
