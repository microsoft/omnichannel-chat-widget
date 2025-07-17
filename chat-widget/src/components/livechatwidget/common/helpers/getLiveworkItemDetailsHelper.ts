import LiveWorkItemDetails from "@microsoft/omnichannel-chat-sdk/lib/core/LiveWorkItemDetails";
import { FacadeChatSDK } from "../../../../common/facades/FacadeChatSDK";
import GetConversationDetailsOptionalParams from "@microsoft/omnichannel-chat-sdk/lib/core/GetConversationDetailsOptionalParams";

let lastInvoked = 0;
let pendingPromise: Promise<LiveWorkItemDetails>;
export function getLiveWorkItemDetailsDebounce(facadeChatSdk: FacadeChatSDK, optionalParams?:  GetConversationDetailsOptionalParams, threshold = 1000) {
    const now = Date.now();
    if (now - lastInvoked > threshold || !pendingPromise) {
        pendingPromise = facadeChatSdk.getConversationDetails(optionalParams);
        lastInvoked = now;
    }
    return pendingPromise;
}
