import "rxjs/add/operator/share";
import "rxjs/add/observable/of";

import {  Message } from "botframework-directlinejs";
import { Observable } from "rxjs/Observable";
import MockAdapter from "./mockadapter";
import { uuidv4 } from "@microsoft/omnichannel-chat-sdk";

export class DemoChatAdapter extends MockAdapter {
    constructor() {
        super();
    }

    // WebChat expects an "echo" activity to confirm the message has been sent successfully
    private postEchoActivity(activity: Message): void {
        const echoActivity: Message = {
            ...activity,
            id: uuidv4(),
            from: {
                ...activity.from,
                id: "usedId",
                name: "User",
                role: "user"
            }
        };

        setTimeout(() => {
            this.activityObserver?.next(echoActivity); // mock message sent activity
        }, 2000);
    }

    public postActivity(activity: Message): Observable<string> {
        if (activity) {
            this.postEchoActivity(activity);
        }

        return Observable.of(activity.id || "");
    }
}