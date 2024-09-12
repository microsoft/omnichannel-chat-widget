import "rxjs/add/operator/share";
import "rxjs/add/observable/of";
import { Message, User } from "botframework-directlinejs";
import { Observable } from "rxjs/Observable";
import MockAdapter from "./mockadapter";
import { uuidv4 } from "@microsoft/omnichannel-chat-sdk";

const customerUser: User = {
    id: "usedId",
    name: "User",
    role: "user"
};

const botUser: User = {
    id: "botId",
    name: "Bot",
    role: "bot"
};

export class DemoChatAdapter extends MockAdapter {
    constructor() {
        super();

        setTimeout(() => {
            this.activityObserver?.next({ // send system message
                id: uuidv4(),
                from: {
                    ...botUser
                },
                text: "You're currently using a demo.",
                type: "message",
                channelData: {
                    tags: "system"
                }
            });

            this.activityObserver?.next({ // send init message from bot
                id: uuidv4(),
                from: {
                    ...botUser
                },
                text: "Type `help` to learn more",
                type: "message"
            });
        }, 1000);
    }

    // WebChat expects an "echo" activity to confirm the message has been sent successfully
    private postEchoActivity(activity: Message, user: User): void {
        const echoActivity: Message = {
            ...activity,
            id: uuidv4(),
            from: {
                ...activity.from,
                ...user
            }
        };

        setTimeout(() => {
            this.activityObserver?.next(echoActivity); // mock message sent activity
        }, 2000);
    }

    public postActivity(activity: Message): Observable<string> {
        if (activity) {
            this.postEchoActivity(activity, customerUser);
        }

        return Observable.of(activity.id || "");
    }
}