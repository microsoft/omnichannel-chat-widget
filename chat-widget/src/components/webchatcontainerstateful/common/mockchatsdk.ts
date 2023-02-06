import MockAdapter from "./mockadapter";

export class MockChatSDK {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected sleep = (ms: any) => new Promise(r => setTimeout(r, ms));

    public isMockModeOn = true;

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
        return {};
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
}