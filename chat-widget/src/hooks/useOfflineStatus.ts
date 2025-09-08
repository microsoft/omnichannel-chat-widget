import { useSyncExternalStore, useEffect } from "react";
import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { BroadcastEvent } from "../common/telemetry/TelemetryConstants";

// utility for offline status
let offline = !navigator.onLine;
let initialized = false;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach(l => l());

function initSubscriptions() {
    if (initialized) return;
    initialized = true;
    
    try {
        // Listen to browser's native online/offline events
        const handleOnline = () => {
            if (offline) { offline = false; notify(); }
        };
        
        const handleOffline = () => {
            if (!offline) { offline = true; notify(); }
        };
        
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        
        // Also listen to BroadcastService NetworkReconnected event for additional reconnection logic
        BroadcastService.getMessageByEventName(BroadcastEvent.NetworkReconnected).subscribe(() => {
            if (offline) { offline = false; notify(); }
        });
        
        // Update initial state based on current navigator.onLine
        offline = !navigator.onLine;
        
    // eslint-disable-next-line no-empty
    } catch { /* fail silent; remains online */ }
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function getSnapshot() { return offline; }
function getServerSnapshot() { return false; }

export default function useOfflineStatus(): boolean {
    useEffect(() => { initSubscriptions(); }, []);
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
