import { DesignerChatAdapter } from "./DesignerChatAdapter";
import { MockChatSDK } from "./mockchatsdk";

export class DesignerChatSDK extends MockChatSDK {
    constructor() {
        super();
    }

    public createChatAdapter() {
        return new DesignerChatAdapter();
    }

    public getLiveChatConfig() {
        return {
            LiveWSAndLiveChatEngJoin: {
                msdyn_postconversationsurveyenable: "false",
                msdyn_conversationmode: "192350000"
            }
        };
    }
}
