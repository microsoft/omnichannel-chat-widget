import SecureEventBus from "./SecureEventBus";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dispatchCustomEvent = (name: string, payload?: any) => {
    try {
        const eventBus = SecureEventBus.getInstance();
        const authToken = eventBus.getAuthToken();
        
        // Dispatch through the secure event bus instead of global window
        const success = eventBus.dispatch(name, payload, authToken);
        
        if (!success) {
            console.error("Failed to dispatch secure event:", name);
        }
    } catch (error) {
        console.error("Error dispatching secure custom event:", name, payload, error);
    }
};

export default dispatchCustomEvent;