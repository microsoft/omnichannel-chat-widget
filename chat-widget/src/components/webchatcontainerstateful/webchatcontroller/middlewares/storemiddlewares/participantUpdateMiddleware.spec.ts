import * as participantUpdateMiddleware from "./participantUpdateMiddleware";
import { WebChatActionType } from "../../enums/WebChatActionType";

describe("participantUpdateMiddleware", () => {
    let state: any;
    let dispatch: jest.Mock;
    let facadeChatSDK: any;
    let next: jest.Mock;
    let middleware: any;

    beforeEach(() => {
        state = {
            domainStates: {},
            appStates: {}
        };
        dispatch = jest.fn();
        facadeChatSDK = {
            getConversationDetails: jest.fn()
        };
        next = jest.fn();
    });

    it("should handle participant removed event", async () => {
        const action = {
            type: WebChatActionType.DIRECT_LINE_INCOMING_ACTIVITY,
            payload: {
                activity: {
                    channelId: "ACS_CHANNEL",
                    channelData: {
                        type: "Thread",
                        members: [
                            {
                                tag: "left"
                            }
                        ]
                    }
                }
            }
        };
        const fakeParticipantAdd = jest.fn();
        const fakeParticipantRemove = jest.fn();

        
        middleware = participantUpdateMiddleware.createParticipantUpdateMiddleware(state, dispatch, facadeChatSDK, fakeParticipantAdd, fakeParticipantRemove)()(next);
        middleware(action);
        // You can add more expectations here based on your implementation
        expect(fakeParticipantRemove).toHaveBeenCalled();
        expect(fakeParticipantAdd).not.toHaveBeenCalled();
    });

    it("should handle participant removed event", async () => {
        const action = {
            type: WebChatActionType.DIRECT_LINE_INCOMING_ACTIVITY,
            payload: {
                activity: {
                    channelId: "ACS_CHANNEL",
                    channelData: {
                        type: "Thread",
                        members: [
                            {
                                tag: "joined"
                            }
                        ]
                    }
                }
            }
        };
        const fakeParticipantAdd = jest.fn();
        const fakeParticipantRemove = jest.fn();

        
        middleware = participantUpdateMiddleware.createParticipantUpdateMiddleware(state, dispatch, facadeChatSDK, fakeParticipantAdd, fakeParticipantRemove)()(next);
        middleware(action);
        // You can add more expectations here based on your implementation
        expect(fakeParticipantRemove).not.toHaveBeenCalled();
        expect(fakeParticipantAdd).toHaveBeenCalled();
    });
});
