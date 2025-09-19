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
    const { useConnectivityStatus } = hooks;
    const [connectivityStatus] = useConnectivityStatus();

    useEffect(() => {
        if (connectivityStatus === "connected") {

            if (props.persistentChatHistoryEnabled === true) {
                setTimeout(() => {
                    console.log("LOPEZ :: CALLING FETCH");
                    dispatchCustomEvent(ChatWidgetEvents.FETCH_PERSISTENT_CHAT_HISTORY);
                    dispatchCustomEvent(ChatWidgetEvents.ADD_ACTIVITY, {
                        activity: {
                            from: {
                                role: "bot"
                            },
                            timestamp: 0,
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