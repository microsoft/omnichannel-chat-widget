import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { StorageType } from "../../Constants";
import { TelemetryManager } from "../../telemetry/TelemetryManager";
import { defaultClientDataStoreProvider } from "./defaultClientDataStoreProvider";

export class defaultCacheManager {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public static InternalCache: any = {};
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const registerBroadcastServiceForStorage = (widgetCacheId: string, ttlInMins: number, storageType: StorageType) => {
    BroadcastService.getMessageByEventName(widgetCacheId)
        .subscribe((msg) => {
            try {
                console.log(`[ ${TelemetryManager.InternalTelemetryData.lcwRuntimeId} ]Setting data to localstorage for widgetCacheId: ${widgetCacheId}`, msg.payload.runtimeId);

                defaultClientDataStoreProvider(ttlInMins, storageType).setData(
                    widgetCacheId,
                    JSON.stringify(msg.payload));
            } catch (error) {
                console.error("Error in setting data to localstorage", error);
            }
        });
};