import { BroadcastService, decodeComponentString, encodeComponentString } from "@microsoft/omnichannel-chat-components";

import useChatContextStore from "./hooks/useChatContextStore";
import useChatSDKStore from "./hooks/useChatSDKStore";
import { getWidgetCacheId, getWidgetEndChatEventName } from "./common/utils";
import { ConversationState } from "./contexts/common/ConversationState";
export { default as LiveChatWidget } from "./components/livechatwidget/LiveChatWidget";

export { getMockChatSDKIfApplicable } from "./components/livechatwidget/common/getMockChatSDKIfApplicable";
export { encodeComponentString, decodeComponentString, BroadcastService, useChatSDKStore, useChatContextStore };
export { getWidgetCacheId, getWidgetEndChatEventName, ConversationState };