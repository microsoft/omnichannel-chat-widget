import { Message } from "botframework-directlinejs";
import { Observable } from "rxjs/Observable";
import MockAdapter from "./mockadapter";
import { customerUser, postBotMessageActivity, postEchoActivity, postSystemMessageActivity } from "./utils/chatAdapterUtils";

export class DesignerChatAdapter extends MockAdapter {
    constructor() {
        super();

        setTimeout(() => {
            postBotMessageActivity(this.activityObserver, "Thank you for contacting us! How can I help you today?", undefined, 0);
            this.postUserActivity("I need to change my address.", 0);
            postBotMessageActivity(this.activityObserver, "Okay, let me connect you with a live agent.", undefined, 100);
            postSystemMessageActivity(this.activityObserver, "John has joined the chat", 100);
            postBotMessageActivity(this.activityObserver, "I'd be happy to help you update your account.", undefined, 100);
        }, 1000);
    }

    private postUserActivity(text: string, delay = 1000) {
        setTimeout(() => {
            postEchoActivity(this.activityObserver, {
                text,
                from: {
                    ...customerUser
                },
                type: "message"
            }, customerUser, 0);
        }, delay);
    }

    public postActivity(activity: Message): Observable<string> {
        if (activity) {
            postEchoActivity(this.activityObserver, activity, customerUser);
        }

        return Observable.of(activity.id || "");
    }
}