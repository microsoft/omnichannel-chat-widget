import { DemoChatAdapter } from "./DemoChatAdapter";
import { MockChatSDK } from "./mockchatsdk";

export class DemoChatSDK extends MockChatSDK {
    constructor() {
        super();
    }

    public createChatAdapter() {
        return new DemoChatAdapter();
    }
}