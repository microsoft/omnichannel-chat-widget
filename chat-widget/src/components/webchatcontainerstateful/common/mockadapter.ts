import "rxjs/add/operator/share";
import "rxjs/add/observable/of";

import { Activity, ConnectionStatus, Message } from "botframework-directlinejs";

import { BehaviorSubject } from "rxjs";
import { Observable } from "rxjs/Observable";
import { Subscriber } from "rxjs/Subscriber";
import { uuidv4 } from "@microsoft/omnichannel-chat-sdk";

export default class MockAdapter {
    public activityObserver?: Subscriber<Activity>;

    public activity$: Observable<Activity>;
    public connectionStatus$: BehaviorSubject<ConnectionStatus> = new BehaviorSubject<ConnectionStatus>(ConnectionStatus.Uninitialized);

    constructor() {
        this.activity$ = (new Observable<Activity>((observer: Subscriber<Activity>) => {
            this.activityObserver = observer;
            Promise.resolve()
                .then(async () => {
                    this.connectionStatus$.next(ConnectionStatus.Online);
                    try {
                        if (this.connectionStatus$) {
                            this.connectionStatus$.next(ConnectionStatus.Online);
                        }
                    } catch (err) {
                        this.connectionStatus$.next(ConnectionStatus.FailedToConnect);
                        console.error(err);
                    }
                });
        })
        ).share();
    }

    public postActivity(activity: Message): Observable<string> {
        if (activity) {
            let modActivity: Message;
            let typingActivity: Activity;
            const userId = "userId", botId = "botId";

            if (activity.text?.startsWith(":")) {
                modActivity = {
                    ...activity,
                    id: uuidv4(),
                    from: {
                        ...activity.from,
                        id: botId,
                        name: "Bot",
                        role: "bot"
                    },
                    text: activity.text.substr(1)
                };
                
                typingActivity = {
                    id: uuidv4(),
                    from: {
                        id: uuidv4(),
                        name: "Bot",
                        role: "bot"
                    },
                    type: "typing"
                };

                this.activityObserver?.next(modActivity); // mock echo message
                this.activityObserver?.next(typingActivity); // mock typing
            } else {
                modActivity = {
                    ...activity,
                    id: uuidv4(),
                    from: {
                        ...activity.from,
                        id: userId,
                        name: "User",
                        role: "user"
                    }
                };

                this.activityObserver?.next(modActivity); // mock message sent
            }
        }

        return Observable.of(activity.id || "");
    }

    public end() {
        return;
    }
}