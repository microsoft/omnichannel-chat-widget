import { BroadcastService, decodeComponentString, encodeComponentString } from "@microsoft/omnichannel-chat-components";
import { getWidgetCacheId, getWidgetEndChatEventName } from "./common/utils";

import { ConversationState } from "./contexts/common/ConversationState";
import useChatContextStore from "./hooks/useChatContextStore";
import useChatSDKStore from "./hooks/useChatSDKStore";
import useFacadeChatSDKStore from "./hooks/useFacadeChatSDKStore";

export { default as LiveChatWidget } from "./components/livechatwidget/LiveChatWidget";
export { getMockChatSDKIfApplicable } from "./components/livechatwidget/common/getMockChatSDKIfApplicable";
export { getWidgetCacheId, getWidgetEndChatEventName, ConversationState };
export { LiveChatWidgetMockType } from "./components/livechatwidget/interfaces/IMockProps";

export { encodeComponentString, decodeComponentString, BroadcastService, useChatSDKStore, useChatContextStore, useFacadeChatSDKStore };
export * from "./components/webchatcontainerstateful/webchatcontroller/middlewares/renderingmiddlewares";
