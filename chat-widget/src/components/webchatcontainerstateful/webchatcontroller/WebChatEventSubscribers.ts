import { useEffect } from "react";
import { hooks } from 'botframework-webchat-component';
import dispatchCustomEvent from '../../../common/utils/dispatchCustomEvent';
import ChatWidgetEvents from "../../livechatwidget/common/ChatWidgetEvents";

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
        if (connectivityStatus === 'connected') {
            if (props.persistentChatHistoryEnabled === true) {
                setTimeout(() => {
                    dispatchCustomEvent(ChatWidgetEvents.FETCH_PERSISTENT_CHAT_HISTORY);
                }, 2000);
            }
        }
    }, [connectivityStatus, props.persistentChatHistoryEnabled]);

    return undefined;
}

export default WebChatEventSubscribers;