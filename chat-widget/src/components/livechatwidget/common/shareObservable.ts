// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function shareObservable(observable: any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let observers = [] as any[];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let subscription : any;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new (window as any).Observable((observer: any) => {
        if (!subscription) {
            subscription = observable.subscribe({
                complete() {
                    observers.forEach(observer => observer.complete());
                },

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                error(err : any ) {
                    observers.forEach(observer => observer.error(err));
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                next(value : any) {
                    observers.forEach(observer => observer.next(value));
                }
            });
        }
        observers.push(observer);

        return () => {
            observers = observers.filter(o => o !== observer);

            if (!observers.length) {
                subscription.unsubscribe();
                subscription = null;
            }
        };
    });
}