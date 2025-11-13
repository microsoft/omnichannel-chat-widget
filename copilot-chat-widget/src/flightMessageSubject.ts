import { Subject } from "rxjs";

export class FlightMessageSubject<T> {
    private subscription;
    
    public constructor() {
        this.subscription = new Subject<T>();
    }

    public subscribe(observer: (val:T) => void) {
        this.subscription.subscribe(observer);
    }

    public sendFlightMessage(val: T) {
        this.subscription.next(val);
    }
}
