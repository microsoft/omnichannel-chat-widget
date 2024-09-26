import { DesignerChatAdapter } from "./DesignerChatAdapter";
import { MockChatSDK } from "./mockchatsdk";

export class DesignerChatSDK extends MockChatSDK {
    constructor() {
        super();
    }

    public createChatAdapter() {
        return new DesignerChatAdapter();
    }
}