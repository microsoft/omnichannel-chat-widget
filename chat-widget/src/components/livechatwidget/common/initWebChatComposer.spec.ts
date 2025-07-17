import { agentParticipantRemovedCallback } from "./initWebChatComposer";
import { ConversationState } from "../../../contexts/common/ConversationState";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";

describe("agentParticipantRemovedCallback", () => {
    let dispatch: jest.Mock;
    let executeReducer: jest.Mock;
    let facadeChatSDK: any;
    let state: any;

    beforeEach(() => {
        dispatch = jest.fn();
        executeReducer = jest.fn();
        facadeChatSDK = {
            getConversationDetails: jest.fn()
        };
        state = {
            appStates: {
                conversationState: ConversationState.Active
            }
        };
    });

    it("should not dispatch if conversation is already closed", async () => {
        executeReducer.mockReturnValue({ appStates: { conversationState: ConversationState.Closed } });
        await agentParticipantRemovedCallback({
            state,
            dispatch,
            executeReducer,
            facadeChatSDK
        });
        expect(dispatch).not.toHaveBeenCalledWith({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.InActive });
    });

    it("should dispatch InActive and disconnect actions if conversation closes after polling", async () => {
        executeReducer
            .mockReturnValueOnce({ appStates: { conversationState: ConversationState.Active } })
            .mockReturnValueOnce({ appStates: { conversationState: ConversationState.Active } })
            .mockReturnValueOnce({ appStates: { conversationState: ConversationState.Closed } });
        facadeChatSDK.getConversationDetails.mockResolvedValue({ state: "Closed" });
        await agentParticipantRemovedCallback({
            state,
            dispatch,
            executeReducer,
            facadeChatSDK
        });
        expect(dispatch).toHaveBeenCalledWith({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.InActive });
        expect(dispatch).toHaveBeenCalledWith({ type: LiveChatWidgetActionType.SET_CHAT_DISCONNECT_EVENT_RECEIVED, payload: true });
    });

    it("should handle errors gracefully", async () => {
        executeReducer.mockReturnValue({ appStates: { conversationState: ConversationState.Active } });
        facadeChatSDK.getConversationDetails.mockRejectedValue(new Error("fail"));
        await expect(agentParticipantRemovedCallback({
            state,
            dispatch,
            executeReducer,
            facadeChatSDK
        })).resolves.not.toThrow();
    });
});
