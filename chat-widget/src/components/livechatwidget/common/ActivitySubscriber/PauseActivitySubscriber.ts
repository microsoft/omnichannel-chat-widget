import { ActivityStreamHandler } from "../ActivityStreamHandler";
import { IActivitySubscriber } from "./IActivitySubscriber";

export class PauseActivitySubscriber implements IActivitySubscriber {
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public observer: any;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async apply(activity: any): Promise<void> {
        console.time("ELOPEZ_BLOCK_ACTIVITY");
        console.log("blocking");
        await ActivityStreamHandler.restorePromise;
        console.timeEnd("ELOPEZ_BLOCK_ACTIVITY");
        console.log("passing");


        return activity;

    }
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    public applicable(activity: any): boolean {

        return true;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async next(activity: any) {
        if (this.applicable(activity)) {
            return await this.apply(activity);
        }
        return activity;
    }
}