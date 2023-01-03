import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { clientDataStoreProvider } from "./Common/clientDataStoreProvider";
import { Constants } from "./Common/Constants";

export const registerCacheWidgetStateEvent = async () => {
    BroadcastService.getMessageByEventName(Constants.WidgetStateChangedEventName).subscribe((msg) => {
        clientDataStoreProvider().setData(Constants.WidgetStateDataKey, JSON.stringify(msg.payload), Constants.LocalStorage);
    });
};

export const restoreWidgetStateIfExistInCache = async () => {
    return clientDataStoreProvider().getData(Constants.WidgetStateDataKey, Constants.LocalStorage);
};