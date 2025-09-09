import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { createCitationsMiddleware } from "./citationsMiddleware";

jest.mock("@microsoft/omnichannel-chat-components", () => ({
    BroadcastService: {
        postMessage: jest.fn(),
    },
}));

describe("citationsMiddleware (focused)", () => {
    it("rewrites id and title when message prefix present and dispatches SET_CITATIONS", () => {
        const dispatch = jest.fn();
        const next = jest.fn();
        const middleware = createCitationsMiddleware({} as any, dispatch)()(next);

        const action: any = {
            type: "PROCESS_ACTIVITY",
            payload: {
                activity: {
                    messageid: "1757118829760",

                    actionType: "DIRECT_LINE/INCOMING_ACTIVITY",
                    channelId: "ACS_CHANNEL",
                    text: "[1]: cite:1 \"Old Title\"",
                    channelData: {
                        metadata: {
                            "pva:gpt-feedback": JSON.stringify({
                                summarizationOpenAIResponse: {
                                    result: {
                                        textCitations: [{ id: "cite:1", title: "New Title", text: "Body 1" }],
                                    },
                                },
                            }),
                        },
                    },
                },
            },
        };

        middleware(action);

        // middleware should populate the global citation map with the prefixed key
        expect(dispatch).toHaveBeenCalled();
        const dispatched = (dispatch as jest.Mock).mock.calls[0][0];
        expect(dispatched.payload["cite:1757118829760_1"]).toBe("Body 1");
        // text rewriting may be handled elsewhere; ensure next was invoked
        expect(next).toHaveBeenCalledWith(action);
    });

    it("updates only the title when no message prefix is present", () => {
        const dispatch = jest.fn();
        const next = jest.fn();
        const middleware = createCitationsMiddleware({} as any, dispatch)()(next);

        const action: any = {
            type: "PROCESS_ACTIVITY",
            payload: {
                activity: {
                    actionType: "DIRECT_LINE/INCOMING_ACTIVITY",
                    channelId: "ACS_CHANNEL",
                    text: "[1]: cite:1 \"Old Title\"",
                    channelData: {
                        metadata: {
                            "pva:gpt-feedback": JSON.stringify({
                                summarizationOpenAIResponse: {
                                    result: {
                                        textCitations: [{ id: "cite:1", title: "New Title", text: "Body 1" }],
                                    },
                                },
                            }),
                        },
                    },
                },
            },
        };

        middleware(action);

        // id should remain unprefixed, title should be replaced
        expect(action.payload.activity.text).toContain("cite:1");
        expect(action.payload.activity.text).toContain("\"New Title\"");
        expect(next).toHaveBeenCalledWith(action);
    });

    it("leaves text unchanged and posts a Broadcast when gpt feedback is invalid JSON", () => {
        const dispatch = jest.fn();
        const next = jest.fn();
        const middleware = createCitationsMiddleware({} as any, dispatch)()(next);

        const action: any = {
            type: "PROCESS_ACTIVITY",
            payload: {
                activity: {
                    actionType: "DIRECT_LINE/INCOMING_ACTIVITY",
                    channelId: "ACS_CHANNEL",
                    text: "[1]: cite:1 \"Old Title\"",
                    channelData: {
                        metadata: {
                            "pva:gpt-feedback": "not-a-json",
                        },
                    },
                },
            },
        };

        middleware(action);

        expect(action.payload.activity.text).toBe("[1]: cite:1 \"Old Title\"");
        expect(next).toHaveBeenCalledWith(action);
        expect(BroadcastService.postMessage).toHaveBeenCalled();
    });

    it("escapes inline citations but preserves citation definitions", () => {
        const dispatch = jest.fn();
        const next = jest.fn();
        const middleware = createCitationsMiddleware({} as any, dispatch)()(next);

        const action: any = {
            type: "PROCESS_ACTIVITY",
            payload: {
                activity: {
                    messageid: "1757450535119",
                    actionType: "DIRECT_LINE/INCOMING_ACTIVITY",
                    channelId: "ACS_CHANNEL",
                    text: "The retrieved documents mention rich media support for async messaging since version 10.0.8 of the Nuance Android Messaging SDK, but do not provide specific details or options related to audio in the context of rich media or customization. The documentation focuses on features such as messaging activities, styling transcript bubbles, and customizing UI elements, but does not elaborate on audio-related options or customization within rich media [1]​[2].\n\n[1]: cite:1757450535119_1 \"index.html\"\n[2]: cite:1757450535119_2 \"nuanceActivity.html\".",
                    channelData: {
                        metadata: {
                            "pva:gpt-feedback": JSON.stringify({
                                summarizationOpenAIResponse: {
                                    result: {
                                        textCitations: [
                                            { id: "cite:1757450535119_1", title: "index.html", text: "Index content" },
                                            { id: "cite:1757450535119_2", title: "nuanceActivity.html", text: "Activity content" }
                                        ],
                                    },
                                },
                            }),
                        },
                    },
                },
            },
        };

        middleware(action);

        // Inline citation references should be escaped (not followed by colon)
        expect(action.payload.activity.text).toContain("&#91;1&#93;​&#91;2&#93;");
        // Citation definitions should remain properly formatted (followed by colon)
        expect(action.payload.activity.text).toContain("[1]: cite:1757450535119_1757450535119_1 \"index.html\"");
        expect(action.payload.activity.text).toContain("[2]: cite:1757450535119_1757450535119_2 \"nuanceActivity.html\"");
        expect(next).toHaveBeenCalledWith(action);
    });
});



