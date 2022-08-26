
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
        console.log("ELOPEZANAYA cork in action");
        ActivityStreamHandler.restoreDeferred = new Deferred();
        ActivityStreamHandler.restorePromise = ActivityStreamHandler.restoreDeferred.promise;
    }

    /**
     * Resolve the promise, releasing it to continue with the execution of the activity.
     * 
     * */
    public static uncork() {
        console.log("ELOPEZANAYA uncork in action");

        ActivityStreamHandler.restoreDeferred.resolve();
    }

    /**
     * Tracking minimize event to detect when to hold messages by calling cork method.
     * We are no tracking onMaximixe event.
     * */
    public static subscribeEvents() {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        window.addEventListener("lcw:onMinimize", (e) => ActivityStreamHandler.cork());
    }
}
