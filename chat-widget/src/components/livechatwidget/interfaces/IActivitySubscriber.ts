export interface IActivitySubscriber {
    // Observer object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    observer: any;

    // Handler to pass next activity
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    next(activity: any): Promise<any>;

    // Condition whether to modify activity
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    applicable?(activity: any): boolean;

    // Modify activity
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apply?(activity: any): Promise<any>;
}