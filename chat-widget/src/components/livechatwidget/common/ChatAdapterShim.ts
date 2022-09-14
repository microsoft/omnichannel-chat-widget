import { DefaultActivitySubscriber } from "./ActivitySubscriber/DefaultActivitySubscriber";
import { shareObservable } from "./shareObservable";

export class ChatAdapterShim {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public chatAdapter: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public activityObserver: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private subscribers: any[];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public constructor(chatAdapter: any) {
        this.subscribers = [];
        this.chatAdapter = {
            ...chatAdapter,
            activity$: shareObservable(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                new (window as any).Observable((observer: any) => {
                    this.activityObserver = observer;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const abortController = new (window as any).AbortController();

                    (async () => {
                        try {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            for await (let activity of (chatAdapter as any).activities({ signal: abortController.signal })) {
                                for (const subscriber of [...this.subscribers, new DefaultActivitySubscriber()]) {
                                    subscriber.observer = this.activityObserver;
                                    activity = await subscriber.next(activity);
                                    if (!activity) {
                                        break;
                                    }
                                }
                            }

                            observer.complete();
                        } catch (error) {
                            observer.error(error);
                        }
                    })();

                    return () => {
                        abortController.abort();
                    };
                })
            )
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public addSubscriber(subscriber: any): void {
        this.subscribers.push(subscriber);
    }
}