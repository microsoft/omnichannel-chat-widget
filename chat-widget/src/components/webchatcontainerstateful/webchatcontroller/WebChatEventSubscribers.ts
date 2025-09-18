import ChatWidgetEvents from "../../livechatwidget/common/ChatWidgetEvents";
import { Constants } from "../../../common/Constants";
import { IPersistentChatHistoryProps } from "../../livechatwidget/interfaces/IPersistentChatHistoryProps";
import dispatchCustomEvent from "../../../common/utils/dispatchCustomEvent";
import { hooks } from "botframework-webchat-component";
import { useEffect } from "react";

/**
 * Component under Composer to access WebChat hooks and events.
 */
const WebChatEventSubscribers = (props: IPersistentChatHistoryProps) => {
    const { useConnectivityStatus } = hooks; // Hook to get WebChat connectivity status
    const [connectivityStatus] = useConnectivityStatus();

    useEffect(() => {
        if (connectivityStatus === "connected") {
            // Check if persistent chat history is enabled
            if (props.persistentChatHistoryEnabled === true) {
                setTimeout(() => {
                    // Dispatch event to fetch persistent chat history
                    dispatchCustomEvent(ChatWidgetEvents.FETCH_PERSISTENT_CHAT_HISTORY);

                    // Dispatch event to add a bot activity indicating history pull
                    dispatchCustomEvent(ChatWidgetEvents.ADD_ACTIVITY, {
                        activity: {
                            from: {
                                role: "bot"
                            },
                            timestamp: 0, // Placeholder timestamp
                            type: "message",
                            channelData: {
                                tags: [Constants.persistentChatHistoryMessagePullTriggerTag] // Tag for history pull trigger
                            }
                        }
                    });
                }, 2000); // Delay to ensure connectivity is stable
            }
        }
    }, [connectivityStatus, props.persistentChatHistoryEnabled]); // Re-run effect if connectivity status or persistent history flag changes

    return undefined; // No UI rendered by this component
};

export default WebChatEventSubscribers;