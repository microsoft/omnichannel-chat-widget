import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { getWidgetCacheId } from "../../utils";
import { defaultClientDataStoreProvider } from "./defaultClientDataStoreProvider";

export class defaultCacheManager {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public static InternalCache: any = {};
}

export const registerBroadcastServiceForLocalStorage = (orgid: string, widgetId: string, widgetInstanceId: string) => {
    const widgetCacheId = getWidgetCacheId(orgid, widgetId, widgetInstanceId);
    BroadcastService.getMessageByEventName(widgetCacheId)
        .subscribe((msg) => {
            try {
                defaultClientDataStoreProvider().setData(
                    widgetCacheId,
                    JSON.stringify(msg.payload),
                    "localStorage");
            } catch (error) {
                console.error("Error in setting data to localstorage", error);
            }
        });
};