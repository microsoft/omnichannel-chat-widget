import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { StorageType } from "../../Constants";
import { defaultClientDataStoreProvider } from "./defaultClientDataStoreProvider";
import { ILiveChatWidgetExternalStorage } from "../../../contexts/common/ILiveChatWidgetExternalStorage";

export class defaultCacheManager {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public static InternalCache: any = {};
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const registerBroadcastServiceForStorage = (widgetCacheId: string, ttlInMins: number, storageType: StorageType, alternateStorage? : ILiveChatWidgetExternalStorage) => {

    BroadcastService.getMessageByEventName(widgetCacheId)
        .subscribe((msg) => {
            try {
                defaultClientDataStoreProvider(ttlInMins, storageType, alternateStorage?.useExternalStorage).setData(
                    widgetCacheId,
                    JSON.stringify(msg.payload));
            } catch (error) {
                console.error("Error in setting data to localstorage", error);
            }
        });
};