import { IActivitySubscriber } from "./IActivitySubscriber";

export class DefaultActivitySubscriber implements IActivitySubscriber {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public observer: any;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async next(activity: any) {
        this.observer.next(activity);
        return false;
    }
}