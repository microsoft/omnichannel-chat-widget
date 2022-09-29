import { Deferred } from "./Deferred";

export class ActivityStreamHandler {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public static restoreDeferred: any = { resolve: () => { return "initialState"; } };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public static restorePromise: Promise<any>;

    /**
     * Use of a deferred pattern, to hold the execution of the activity.
     * 
     * */
    public static cork() {
        ActivityStreamHandler.restoreDeferred = new Deferred();
        ActivityStreamHandler.restorePromise = ActivityStreamHandler.restoreDeferred.promise;
    }

    /**
     * Resolve the promise, releasing it to continue with the execution of the activity.
     * 
     * */
    public static uncork() {
        ActivityStreamHandler.restoreDeferred.resolve();
    }
}