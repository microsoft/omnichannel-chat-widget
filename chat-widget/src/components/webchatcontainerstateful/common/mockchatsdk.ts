import { ParticipantType } from "../../../common/Constants";
import MockAdapter from "./mockadapter";

export class MockChatSDK {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected sleep = (ms: any) => new Promise(r => setTimeout(r, ms));

    public isMockModeOn = true;

    public omnichannelConfig = {
        widgetId: "00000000-0000-0000-0000-000000000000",
        orgId: "00000000-0000-0000-0000-000000000000",
        orgUrl: "https://contoso.crm.dynamics.com",
    }

    public async initialize() {
        return this.getLiveChatConfig();
    }

    public async startChat() {
        await this.sleep(1000);
    }

    public endChat() {
        return null;
    }

    public getChatToken() {
        return null;
    }

    public createChatAdapter() {
        return new MockAdapter();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public getPreChatSurvey(parseToJson: boolean) {
        return "";
    }

    public getConversationDetails() {
        return {
            State: "Active",
            conversationId:"",
            canRenderPostChat:"",
            participantType: ParticipantType.User
        };
    }

    public getCurrentLiveChatContext() {
        return {
            chatToken: {},
            requestId: ""
        };
    }

    public onNewMessage() {
        return null;
    }

    public getChatReconnectContext() {
        return {
            reconnectId: "123"
        };
    }

    public getVoiceVideoCalling() {
        return null;
    }

    public getLiveChatConfig() {
        return {
            LiveWSAndLiveChatEngJoin: {
                msdyn_postconversationsurveyenable: "true",
                msdyn_conversationmode: "192350000"
            }
        };
    }

    public sendTypingEvent() {
        return null;
    }
}