import { useSyncExternalStore, useEffect } from "react";
import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { BroadcastEvent } from "../common/telemetry/TelemetryConstants";

// Simple external store for offline status sourced from BroadcastService network events.
let offline = false;
let initialized = false;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach(l => l());

function initSubscriptions() {
    if (initialized) return;
    initialized = true;
    try {
        BroadcastService.getMessageByEventName(BroadcastEvent.NetworkDisconnected).subscribe(() => {
            if (!offline) { offline = true; notify(); }
        });
        BroadcastService.getMessageByEventName(BroadcastEvent.NetworkReconnected).subscribe(() => {
            if (offline) { offline = false; notify(); }
        });
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
