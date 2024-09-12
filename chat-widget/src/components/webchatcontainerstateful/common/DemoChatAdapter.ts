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
            this.postSystemMessageActivity("You're currently using a demo.", 0);
            this.postBotActivity("Type `/help` to learn more", 0); // send init message from bot
        }, 1000);
    }

    private postBotActivity(text: string, delay = 1000): void {
        setTimeout(() => {
            this.activityObserver?.next({
                id: uuidv4(),
                from: {
                    ...botUser
                },
                text: "Type `/help` to learn more",
                type: "message"
            });
        }, delay);
    }

    // WebChat expects an "echo" activity to confirm the message has been sent successfully
    private postEchoActivity(activity: Message, user: User, delay = 1000): void {
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
        }, delay);
    }

    private postBotCommandsActivity(delay = 1000) {
        setTimeout(() => {
            this.activityObserver?.next({
                id: uuidv4(),
                from: {
                    ...botUser
                },
                type: "message",
                attachments: [
                    {
                        contentType: "application/vnd.microsoft.card.thumbnail",
                        content: {
                            buttons: [
                                {
                                    title: "Send system message",
                                    type: "imBack",
                                    value: "send system message"
                                },
                                {
                                    title: "Send typing",
                                    type: "imBack",
                                    value: "send typing"
                                },
                                {
                                    title: "Send bot message",
                                    type: "imBack",
                                    value: "send bot message"
                                }
                            ],
                            title: "Commands"
                        }
                    }
                ]
            });
        }, delay);
    }

    private postBotMessageActivity(text: string, tags = "", delay = 1000) {
        setTimeout(() => {
            this.activityObserver?.next({
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
    }

    private postSystemMessageActivity(text: string, delay = 1000) {
        this.postBotMessageActivity(text, "system", delay);
    }

    private postBotTypingActivity(delay = 1000) {
        setTimeout(() => {
            this.activityObserver?.next({
                id: uuidv4(),
                from: {
                    ...botUser
                },
                type: "typing"
            });
        }, delay);
    }

    public postActivity(activity: Message): Observable<string> {
        if (activity) {
            this.postEchoActivity(activity, customerUser);

            switch(activity.text) {
                case "/help":
                    this.postBotCommandsActivity();
                    break;
                case "send system message":
                    this.postSystemMessageActivity("Contoso has joined the chat.");
                    break;
                case "send typing":
                    this.postBotTypingActivity();
                    break;
                case "send bot message":
                    this.postBotMessageActivity("Hi, how can I help you?");
            }
        }

        return Observable.of(activity.id || "");
    }
}