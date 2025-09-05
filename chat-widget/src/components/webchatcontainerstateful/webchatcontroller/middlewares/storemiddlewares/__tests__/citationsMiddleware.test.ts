import { createCitationsMiddleware } from "../citationsMiddleware";

describe("createCitationsMiddleware", () => {
    beforeEach(() => {
        // reset global map
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__ocwCitations = {};
    });

    it("populates window.__ocwCitations and replaces activity text when pva:gpt-feedback present", () => {
        const middleware = createCitationsMiddleware();
        const next = jest.fn((a) => a);

        const action: any = {
            payload: {
                activity: {
                    actionType: "DIRECT_LINE/INCOMING_ACTIVITY",
                    channelId: "ACS_CHANNEL",
                    text: '[1]: cite:1 "Title 1"',
                    channelData: {
                        metadata: {
                            "pva:gpt-feedback": JSON.stringify({ summarizationOpenAIResponse: { result: { textCitations: [{ id: "cite:1", title: "Title 1", text: "Body 1" }] } } })
                        }
                    }
                }
            }
        };

        middleware(next)(action);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const map = (window as any).__ocwCitations;
        expect(map["cite:1"]).toBe("Body 1");
        expect(action.payload.activity.text).toContain('cite:1');
        expect(next).toHaveBeenCalledWith(action);
    });
});
