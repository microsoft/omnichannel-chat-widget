import { Activity, Attachment, AttachmentLayout, CardAction, Message, User } from "botframework-directlinejs";

import { Subscriber } from "rxjs/Subscriber";
import { uuidv4 } from "@microsoft/omnichannel-chat-sdk";

export const customerUser: User = {
    id: "usedId",
    name: "User",
    role: "user"
};

export const botUser: User = {
    id: "botId",
    name: "Bot",
    role: "bot"
};

export const agentUser: User = {
    id: "AgentId",
    name: "John",
    role: "bot"
};

// WebChat expects an "echo" activity to confirm the message has been sent successfully
export const postEchoActivity = (activityObserver: Subscriber<Activity> | undefined, activity: Message, user: User, delay = 1000): void => {
    const echoActivity: Message = {
        ...activity,
        id: uuidv4(),
        from: {
            ...activity.from,
            ...user
        },
        timestamp: new Date().toISOString()
    };

    setTimeout(() => {
        activityObserver?.next(echoActivity); // mock message sent activity
    }, delay);
};

export const postBotMessageActivity = (activityObserver: Subscriber<Activity> | undefined, text: string, tags = "", delay = 1000): void => {
    setTimeout(() => {
        activityObserver?.next({
            id: uuidv4(),
            from: {
                ...botUser
            },
            text,
            type: "message",
            channelData: {
                tags
            },
            timestamp: new Date().toISOString()
        });
    }, delay);
};

export const postAgentMessageActivity = (activityObserver: Subscriber<Activity> | undefined, text: string, tags = "", delay = 1000): void => {
    setTimeout(() => {
        activityObserver?.next({
            id: uuidv4(),
            from: {
                ...agentUser
            },
            text,
            type: "message",
            channelData: {
                tags
            },
            timestamp: new Date().toISOString()
        });
    }, delay);
};

export const postSystemMessageActivity = (activityObserver: Subscriber<Activity> | undefined, text: string, delay = 1000): void => {
    postBotMessageActivity(activityObserver, text, "system", delay);
};

export const postBotTypingActivity = (activityObserver: Subscriber<Activity> | undefined, delay = 1000): void => {
    setTimeout(() => {
        activityObserver?.next({
            id: uuidv4(),
            from: {
                ...botUser
            },
            type: "typing"
        });
    }, delay);
};

export const postBotAttachmentActivity = (activityObserver: Subscriber<Activity> | undefined, attachments: Attachment[] = [], delay = 1000): void => {
    setTimeout(() => {
        activityObserver?.next({
            id: uuidv4(),
            from: {
                ...botUser
            },
            attachments,
            type: "message",
            timestamp: new Date().toISOString()
        });
    }, delay);
};

export const postAgentAttachmentActivity = (activityObserver: Subscriber<Activity> | undefined, attachments: Attachment[] = [], delay = 1000, attachmentLayout?: AttachmentLayout): void => {
    setTimeout(() => {
        activityObserver?.next({
            id: uuidv4(),
            from: {
                ...agentUser
            },
            attachments,
            attachmentLayout,
            type: "message",
            timestamp: new Date().toISOString()
        });
    }, delay);
};

export const postAgentSuggestedActionsActivity = (
    activityObserver: Subscriber<Activity> | undefined, 
    text: string, 
    suggestedActions: { actions: CardAction[]; to?: string[]; },
    delay = 1000
): void => {
    setTimeout(() => {
        activityObserver?.next({
            id: uuidv4(),
            from: {
                ...agentUser
            },
            text,
            type: "message",
            suggestedActions,
            timestamp: new Date().toISOString()
        });
    }, delay);
};