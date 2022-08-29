export class Deferred<T> {

    private _promise: Promise<T>;

    private _resolve!: (value: T | PromiseLike<T>) => void;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private _reject: (reason?: any) => void = () => { return; };

    constructor() {
        this._promise = new Promise<T>((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolve = (value?: any | PromiseLike<T>): void => {
        this._resolve(value);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reject = (value?: any | PromiseLike<T>): void => {
        this._reject(value);
    };

    get promise(): Promise<T> {
        return this._promise;
    }
}