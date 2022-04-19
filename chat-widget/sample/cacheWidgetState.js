import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { contextDataStore } from "./Common/ContextDataStore";
import { Constants } from "./Common/Constants";

export const registerCacheWidgetStateEvent = async () => {
    BroadcastService.getMessageByEventName("ChatWidgetStateChanged").subscribe((msg) => {
        contextDataStore().setData("ChatWidgetStateChanged", JSON.stringify(msg.payload), Constants.LocalStorage);
    });
};

export const restoreWidgetStateIfExistInCache = async () => {
    return contextDataStore().getData("ChatWidgetStateChanged", Constants.LocalStorage);
};