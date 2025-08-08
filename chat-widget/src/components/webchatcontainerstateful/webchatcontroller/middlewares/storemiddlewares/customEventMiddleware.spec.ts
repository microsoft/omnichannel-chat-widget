import { WebChatActionType } from "../../enums/WebChatActionType";
import createCustomEventMiddleware, { isValidCustomEvent } from "./customEventMiddleware";
describe("CustomEventMiddlewar test", () => {
    it("verify correct message is posted to broadcast service", () => {
        const fakeBroadcastService = {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            postMessage: jest.fn().mockImplementation((_val) => {
                return;
            })
        };
        const fakeNext = jest.fn().mockReturnValue({});

        const fakeAction = {
            type:  WebChatActionType.DIRECT_LINE_INCOMING_ACTIVITY,
            payload: {
                activity: {
                    id: "testId",
                    content: "abc",
                    channelData: {
                        metadata: {
                            customEvent: "true",
                            customEventName: "testCustomEventName",
                            customEventValue: "testCustomEventValue"
                        }
                    },
                    from: {
                        role: "Bot"
                    }
                }
            }
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        createCustomEventMiddleware(fakeBroadcastService as any)()(fakeNext)(fakeAction as any);
        expect(fakeBroadcastService.postMessage).toHaveBeenCalledWith({
            eventName: "onCustomEvent",
            payload: {
                messageId: "testId",
                customEventName: "testCustomEventName",
                customEventValue: "testCustomEventValue"
            }
        });
        expect(fakeNext).not.toHaveBeenCalled();
    });

    it("verify isValidCustomEvent return true for valid input", () => {
        const activity = {
            channelData: {
                metadata: {
                    customEvent: "true",
                    customEventName: "testEvent",
                    customEventValue: "testValue"
                }
            },
            from: {
                role: "bot"
            }
        };

        const res = isValidCustomEvent(activity);
        expect(res).toBe(true);
    });

    it("verify isValidCustomEvent return true for valid input", () => {
        const activity = {
            channelData: {
                metadata: {
                    customEvent: "true",
                    customEventName: "testEvent",
                    customEventValue: "testValue"
                }
            },
            from: {
                role: "bot"
            }
        };

        const res = isValidCustomEvent(activity);
        expect(res).toBe(true);
    });

    it("verify isValidCustomEvent return true for valid input", () => {
        const activity = {
            channelData: {
                metadata: {
                    customEvent: "true",
                    customEventName: "testEvent"
                }
            },
            from: {
                role: "bot"
            }
        };

        const res = isValidCustomEvent(activity);
        expect(res).toBe(false);
    });
});
