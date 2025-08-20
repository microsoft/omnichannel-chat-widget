const dispatchCustomEvent = (name: string, payload?: any) => {
    let event: CustomEvent | null = null;
    const eventDetails = payload ? { detail: { payload } } : undefined;
    try {
        event = new CustomEvent(name, eventDetails);
    } catch {

    }

    if (event) {
        window.dispatchEvent(event);
    }
}

export default dispatchCustomEvent;