import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { clientDataStoreProvider } from "./Common/clientDataStoreProvider.js";
import { Constants } from "./Common/Constants.js";

export const registerCacheWidgetStateEvent = async () => {
    BroadcastService.getMessageByEventName(Constants.WidgetStateChangedEventName).subscribe((msg) => {
        clientDataStoreProvider().setData(Constants.WidgetStateDataKey, JSON.stringify(msg.payload), Constants.LocalStorage);
    });
};

export const restoreWidgetStateIfExistInCache = async () => {
    return clientDataStoreProvider().getData(Constants.WidgetStateDataKey, Constants.LocalStorage);
};