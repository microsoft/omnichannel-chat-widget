import { Subject } from "rxjs";

export class AttachmentMessageSubject<T> {
    private subscription;
    
    public constructor() {
        this.subscription = new Subject<T>();
    }

    public subscribe(observer: (val:T) => void) {
        this.subscription.subscribe(observer);
    }

    public sendUpdate(val: T) {
        this.subscription.next(val);
    }
}
