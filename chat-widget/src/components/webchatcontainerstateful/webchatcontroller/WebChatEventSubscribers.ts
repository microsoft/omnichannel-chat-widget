import ChatWidgetEvents from "../../livechatwidget/common/ChatWidgetEvents";
import { Constants } from "../../../common/Constants";
import dispatchCustomEvent from "../../../common/utils/dispatchCustomEvent";
import { hooks } from "botframework-webchat-component";
import { useEffect } from "react";

interface WebChatEventSubscribersProps {
    persistentChatHistoryEnabled?: boolean;
}

/**
 * Component under Composer to access WebChat hooks and events.
 */
const WebChatEventSubscribers = (props: WebChatEventSubscribersProps) => {
    const { useConnectivityStatus } = hooks;
    const [connectivityStatus] = useConnectivityStatus();

    useEffect(() => {
        if (connectivityStatus === "connected") {
            if (props.persistentChatHistoryEnabled === true) {
                setTimeout(() => {
                    dispatchCustomEvent(ChatWidgetEvents.FETCH_PERSISTENT_CHAT_HISTORY);
                    dispatchCustomEvent(ChatWidgetEvents.ADD_ACTIVITY, {
                        activity: {
                            from: {
                                role: "bot"
                            },
                            timestamp: 0, // Set to 0 to stay at the top of the chat history
                            type: "message",
                            channelData: {
                                tags: [Constants.persistentChatHistoryMessagePullTriggerTag]
                            }
                        }
                    });
                }, 2000);
            }
        }
    }, [connectivityStatus, props.persistentChatHistoryEnabled]);

    return undefined;
};

export default WebChatEventSubscribers;