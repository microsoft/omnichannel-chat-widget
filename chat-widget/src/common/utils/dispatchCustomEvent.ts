// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dispatchCustomEvent = (name: string, payload?: any) => {
    let event: CustomEvent | null = null;
    const eventDetails = payload ? { detail: { payload } } : undefined;
    try {
        event = new CustomEvent(name, eventDetails);
    } catch (error) {

        console.error("Error dispatching custom event:", name, payload, error);
    }

    if (event) {
        window.dispatchEvent(event);
    }
};

export default dispatchCustomEvent;