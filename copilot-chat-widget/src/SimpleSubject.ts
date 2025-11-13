import { ReplaySubject } from "rxjs";

export class SimpleSubject<T> {
    // private idTracker = 0;
    // private localObserverQ: Map<number, (val: T) => void>;
    private replaySubject;
    constructor() {
        // this.localObserverQ = new Map();
        this.replaySubject = new ReplaySubject<T>();
    }

    // public subscribe(observer: (val:T) => void) {
    //     let id = this.idTracker ++;
    //     this.localObserverQ.set(id, observer);
    //     return () => {
    //         if (this.localObserverQ.has(id)) {
    //             this.localObserverQ.delete(id);
    //         }
    //     }
    // }

    // public next(val: T) {
    //     this.localObserverQ.forEach((observer) => {
    //         observer(val);
    //     })
    // }

    public subscribe(observer: (val:T) => void) {
        this.replaySubject.subscribe(observer);
        return this.replaySubject;
    }
    public reset() {
        //if (this.replaySubject) this.replaySubject.unsubscribe();
        this.replaySubject = new ReplaySubject<T>();
    }

    public next(val: T) {
        console.log("debugging: next invoked: ", val);
        if (this.replaySubject) this.replaySubject.next(val);
    }

    public isStopped() {
        return this.replaySubject.isStopped;
    }
}
