import { uuidv4 } from "@microsoft/omnichannel-chat-sdk";
import { Activity, Message, User } from "botframework-directlinejs";
import { Subscriber } from "rxjs/Subscriber";

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

// WebChat expects an "echo" activity to confirm the message has been sent successfully
export const postEchoActivity = (activityObserver: Subscriber<Activity> | undefined, activity: Message, user: User, delay = 1000): void => {
    const echoActivity: Message = {
        ...activity,
        id: uuidv4(),
        from: {
            ...activity.from,
            ...user
        }
    };

    setTimeout(() => {
        activityObserver?.next(echoActivity); // mock message sent activity
    }, delay);
};

export const postBotMessageActivity = (activityObserver: Subscriber<Activity> | undefined, text: string, tags = "", delay = 1000) => {
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
            }
        });
    }, delay);
};