import { TelemetryHelper } from "../telemetry/TelemetryHelper";
import { LogLevel, TelemetryEvent } from "../telemetry/TelemetryConstants";

/**
 * SecureEventBus - A private, authenticated event system for internal chat widget communication
 * 
 * This replaces the vulnerable global window event system to prevent external scripts
 * from injecting malicious events into the chat widget.
 * 
 * @example
 * ```typescript
 * const eventBus = SecureEventBus.getInstance();
 * const token = eventBus.getAuthToken();
 * 
 * // Subscribe to an event
 * const unsubscribe = eventBus.subscribe('userMessage', (payload) => {
 *   console.log('Message received:', payload);
 * });
 * 
 * // Dispatch an event
 * eventBus.dispatch('userMessage', { text: 'Hello' }, token);
 * 
 * // Unsubscribe
 * unsubscribe();
 * ```
 */

/**
 * Interface representing an event listener with callback and unique identifier
 */
interface EventListener {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callback: (payload: any) => void;
    id: string;
}

/**
 * SecureEventBus class implementing the singleton pattern for secure event communication.
 * Provides authentication-based event dispatching to prevent unauthorized external access.
 */
class SecureEventBus {
    private static instance: SecureEventBus | null = null;
    private listeners: Map<string, EventListener[]> = new Map();
    private readonly authToken: string;
    private eventCounter = 0;

    /**
     * Private constructor to enforce singleton pattern.
     * Generates a unique authentication token for this session.
     */
    private constructor() {
        // Generate a secure, unique token for this session
        this.authToken = this.generateAuthToken();
    }

    /**
     * Get the singleton instance of SecureEventBus.
     * Creates a new instance if one doesn't exist.
     * 
     * @returns The singleton instance of SecureEventBus
     * 
     * @example
     * ```typescript
     * const eventBus = SecureEventBus.getInstance();
     * ```
     */
    public static getInstance(): SecureEventBus {
        if (!SecureEventBus.instance) {
            SecureEventBus.instance = new SecureEventBus();
        }
        return SecureEventBus.instance;
    }

    /**
     * Generate a cryptographically secure authentication token.
     * Uses crypto.getRandomValues when available, falls back to Math.random.
     * 
     * @private
     * @returns A 64-character hexadecimal string representing the authentication token
     */
    private generateAuthToken(): string {
        const array = new Uint8Array(32);
        if (typeof crypto !== "undefined" && crypto.getRandomValues) {
            crypto.getRandomValues(array);
        } else {
            // Fallback for environments without crypto.getRandomValues
            for (let i = 0; i < array.length; i++) {
                array[i] = Math.floor(Math.random() * 256);
            }
        }
        return Array.from(array, byte => byte.toString(16).padStart(2, "0")).join("");
    }

    /**
     * Get the authentication token for this SecureEventBus instance.
     * This token is required for dispatching events and should only be used internally.
     * 
     * @returns The authentication token string
     * 
     * @example
     * ```typescript
     * const eventBus = SecureEventBus.getInstance();
     * const token = eventBus.getAuthToken();
     * eventBus.dispatch('myEvent', { data: 'value' }, token);
     * ```
     */
    public getAuthToken(): string {
        return this.authToken;
    }

    /**
     * Dispatch an event with authentication to all registered listeners.
     * Verifies the authentication token before dispatching to prevent unauthorized access.
     * 
     * @param eventName - The name of the event to dispatch
     * @param payload - The data to send with the event (optional)
     * @param token - Authentication token (must match the internal token)
     * @returns true if event was successfully dispatched, false if unauthorized or error occurred
     * 
     * @example
     * ```typescript
     * const eventBus = SecureEventBus.getInstance();
     * const token = eventBus.getAuthToken();
     * 
     * // Dispatch with payload
     * const success = eventBus.dispatch('userAction', { action: 'click', target: 'button' }, token);
     * 
     * // Dispatch without payload
     * eventBus.dispatch('windowClosed', undefined, token);
     * ```
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public dispatch(eventName: string, payload?: any, token?: string): boolean {
        // Verify authentication token
        if (token !== this.authToken) {
            TelemetryHelper.logActionEvent(LogLevel.ERROR, {
                Event: TelemetryEvent.SecureEventBusUnauthorizedDispatch,
                Description: `Unauthorized event dispatch attempt blocked: ${eventName}`,
                ExceptionDetails: {
                    eventName,
                    providedToken: token ? "provided" : "missing",
                    expectedToken: "secured"
                }
            });
            return false;
        }

        const listeners = this.listeners.get(eventName);
        if (!listeners || listeners.length === 0) {
            return true; // No listeners, but not an error
        }

        // Dispatch to all registered listeners
        try {
            listeners.forEach(listener => {
                try {
                    listener.callback(payload);
                } catch (error) {
                    TelemetryHelper.logActionEvent(LogLevel.ERROR, {
                        Event: TelemetryEvent.SecureEventBusListenerError,
                        Description: `Error in event listener for event: ${eventName}`,
                        ExceptionDetails: error
                    });
                }
            });
            return true;
        } catch (error) {
            TelemetryHelper.logActionEvent(LogLevel.ERROR, {
                Event: TelemetryEvent.SecureEventBusDispatchError,
                Description: `Error dispatching event: ${eventName}`,
                ExceptionDetails: error
            });
            return false;
        }
    }

    /**
     * Subscribe to an event with a callback function.
     * The callback will be executed whenever the specified event is dispatched.
     * 
     * @param eventName - The name of the event to listen for
     * @param callback - The function to execute when the event is fired
     * @returns A function that can be called to unsubscribe from the event
     * 
     * @example
     * ```typescript
     * const eventBus = SecureEventBus.getInstance();
     * 
     * // Subscribe to an event
     * const unsubscribe = eventBus.subscribe('chatMessage', (message) => {
     *   console.log('New message:', message.text);
     *   console.log('From user:', message.userId);
     * });
     * 
     * // Later, unsubscribe
     * unsubscribe();
     * ```
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public subscribe(eventName: string, callback: (payload: any) => void): () => void {
        const listenerId = `listener_${++this.eventCounter}`;
        
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
        }

        const listeners = this.listeners.get(eventName);
        if (!listeners) {
            throw new Error(`Listeners for event "${eventName}" not found.`);
        }
        const listener: EventListener = { callback, id: listenerId };
        listeners.push(listener);

        // Return unsubscribe function
        return () => {
            const currentListeners = this.listeners.get(eventName);
            if (currentListeners) {
                const index = currentListeners.findIndex(l => l.id === listenerId);
                if (index !== -1) {
                    currentListeners.splice(index, 1);
                }
                
                // Clean up empty listener arrays
                if (currentListeners.length === 0) {
                    this.listeners.delete(eventName);
                }
            }
        };
    }

    /**
     * Remove all listeners for a specific event.
     * This completely removes the event from the internal listeners map.
     * 
     * @param eventName - The name of the event to remove all listeners for
     * 
     * @example
     * ```typescript
     * const eventBus = SecureEventBus.getInstance();
     * 
     * // Remove all listeners for 'chatClosed' event
     * eventBus.removeAllListeners('chatClosed');
     * ```
     */
    public removeAllListeners(eventName: string): void {
        this.listeners.delete(eventName);
    }

    /**
     * Clear all listeners for all events.
     * This resets the entire event bus to its initial state.
     * Useful for cleanup during application shutdown or testing.
     * 
     * @example
     * ```typescript
     * const eventBus = SecureEventBus.getInstance();
     * 
     * // Clear all event listeners
     * eventBus.clear();
     * ```
     */
    public clear(): void {
        this.listeners.clear();
    }

    /**
     * Get the number of listeners for a specific event.
     * Useful for debugging and monitoring purposes.
     * 
     * @param eventName - The name of the event to count listeners for
     * @returns The number of listeners registered for the event
     * 
     * @example
     * ```typescript
     * const eventBus = SecureEventBus.getInstance();
     * 
     * // Check how many listeners are registered for 'userAction'
     * const count = eventBus.getListenerCount('userAction');
     * console.log(`${count} listeners registered for userAction`);
     * ```
     */
    public getListenerCount(eventName: string): number {
        return this.listeners.get(eventName)?.length || 0;
    }

    /**
     * Get all registered event names.
     * Returns an array of event names that currently have listeners.
     * Useful for debugging and monitoring purposes.
     * 
     * @returns An array of event names that have registered listeners
     * 
     * @example
     * ```typescript
     * const eventBus = SecureEventBus.getInstance();
     * 
     * // Get all registered events
     * const events = eventBus.getRegisteredEvents();
     * console.log('Active events:', events);
     * // Output: ['userAction', 'chatMessage', 'windowResize']
     * ```
     */
    public getRegisteredEvents(): string[] {
        return Array.from(this.listeners.keys());
    }
}

export default SecureEventBus;