import { Message } from "botframework-directlinejs";
import { Observable } from "rxjs/Observable";
import MockAdapter from "./mockadapter";
import { customerUser, postBotMessageActivity, postEchoActivity, postSystemMessageActivity } from "./utils/chatAdapterUtils";

export class DesignerChatAdapter extends MockAdapter {
    constructor() {
        super();

        setTimeout(() => {
            postBotMessageActivity(this.activityObserver, "Id venenatis a condimentum vitae?", undefined, 0);
            this.postUserActivity("Diam donec adipiscing tristique risus nec feugiat in fermentum", 0);
            postSystemMessageActivity(this.activityObserver, "We are finding the best agent for your inquiry, please hold ...", 0);
            postSystemMessageActivity(this.activityObserver, "John has joined the chat", 0);
            postBotMessageActivity(this.activityObserver, "Neque viverra justo nec ultrices dui sapien eget mi proin", undefined, 0);
        }, 1000);
    }

    private postUserActivity(text: string, delay = 1000) {
        setTimeout(() => {
            this.postActivity({
                from: {
                    ...customerUser
                },
                text,
                type: "message",
                timestamp: new Date().toISOString()
            });
        }, delay);
    }

    public postActivity(activity: Message): Observable<string> {
        if (activity) {
            postEchoActivity(this.activityObserver, activity, customerUser);
        }

        return Observable.of(activity.id || "");
    }
}