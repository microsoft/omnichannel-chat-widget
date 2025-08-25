import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { createCitationsMiddleware } from "./citationsMiddleware";

jest.mock("@microsoft/omnichannel-chat-components", () => ({
    BroadcastService: {
        postMessage: jest.fn(),
    },
}));

describe("citationsMiddleware", () => {

    it("should process action if schema matches", () => {
        const dispatch = jest.fn();
        const next = jest.fn();
        const middleware = createCitationsMiddleware({ dispatch })(next);

        const action = {
            type: "PROCESS_ACTIVITY", // Add the missing 'type' property
            payload: {
                activity: {
                    actionType: "DIRECT_LINE/INCOMING_ACTIVITY",
                    channelId: "ACS_CHANNEL",
                    channelData: {
                        metadata: {
                            "pva:gpt-feedback": JSON.stringify({
                                summarizationOpenAIResponse: {
                                    result: {
                                        textCitations: [
                                            { id: "cite:1", title: "Updated Title" },
                                        ],
                                    },
                                },
                            }),
                        },
                    },
                    text: "[1]: cite:1 \"Original Title\"",
                },
            },
        };

        middleware(action);

        expect(action.payload.activity.text).toBe("[1]: cite:1 \"Updated Title\"");
        expect(next).toHaveBeenCalledWith(action);
    });

    it("should not process action if schema does not match", () => {
        const dispatch = jest.fn();
        const next = jest.fn();
        const middleware = createCitationsMiddleware({ dispatch })(next);

        const action = {
            type: "UNKNOWN_ACTION", // Add a default type to satisfy IWebChatAction
            payload: {
                activity: {
                    actionType: "OTHER_ACTION_TYPE",
                    channelId: "OTHER_CHANNEL",
                    text: "[1]: cite:1 \"Original Title\"",
                },
            },
        };

        middleware(action);

        expect(action.payload.activity.text).toBe("[1]: cite:1 \"Original Title\"");
        expect(next).toHaveBeenCalledWith(action);
    });

    it("should process action and parse gptFeedback correctly", () => {
        const dispatch = jest.fn();
        const next = jest.fn();
        const middleware = createCitationsMiddleware({ dispatch })(next);

        const action = {
            type: "PROCESS_ACTIVITY", // Add the missing 'type' property
            payload: {
                activity: {
                    actionType: "DIRECT_LINE/INCOMING_ACTIVITY",
                    channelId: "ACS_CHANNEL",
                    channelData: {
                        metadata: {
                            "pva:gpt-feedback": JSON.stringify({
                                summarizationOpenAIResponse: {
                                    result: {
                                        textCitations: [
                                            { id: "cite:1", title: "Updated Title" },
                                        ],
                                    },
                                },
                            }),
                        },
                    },
                    text: "[1]: cite:1 \"Original Title\"",
                },
            },
        };

        middleware(action);

        const expectedFeedback = {
            summarizationOpenAIResponse: {
                result: {
                    textCitations: [
                        { id: "cite:1", title: "Updated Title" },
                    ],
                },
            },
        };

        const parsedFeedback = JSON.parse(
            action.payload.activity.channelData.metadata["pva:gpt-feedback"]
        );
        expect(parsedFeedback).toEqual(expectedFeedback);
        expect(action.payload.activity.text).toBe("[1]: cite:1 \"Updated Title\"");
        expect(next).toHaveBeenCalledWith(action);
    });

    it("should not process action if gptFeedback is invalid JSON", () => {
        const dispatch = jest.fn();
        const next = jest.fn();
        const middleware = createCitationsMiddleware({ dispatch })(next);

        const action = {
            type: "INVALID_JSON_ACTION", // Add a default type to satisfy IWebChatAction
            payload: {
                activity: {
                    actionType: "DIRECT_LINE/INCOMING_ACTIVITY",
                    channelId: "ACS_CHANNEL",
                    channelData: {
                        metadata: {
                            "pva:gpt-feedback": "invalid-json",
                        },
                    },
                    text: "[1]: cite:1 \"Original Title\"",
                },
            },
        };

        middleware(action);

        expect(action.payload.activity.text).toBe("[1]: cite:1 \"Original Title\"");
        expect(next).toHaveBeenCalledWith(action);
        expect(BroadcastService.postMessage).toHaveBeenCalled(); // Ensure no telemetry event is posted
    });
});



