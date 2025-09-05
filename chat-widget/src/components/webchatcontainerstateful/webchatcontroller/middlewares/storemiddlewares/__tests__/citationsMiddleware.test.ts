import { createCitationsMiddleware } from "../citationsMiddleware";

describe("createCitationsMiddleware", () => {
    it("dispatches SET_CITATIONS and replaces activity text when pva:gpt-feedback present", () => {
        const dispatch = jest.fn();
    const middleware = createCitationsMiddleware({} as any, dispatch as any);
        const next = jest.fn((a) => a);

        const action: any = {
            payload: {
                activity: {
                    actionType: "DIRECT_LINE/INCOMING_ACTIVITY",
                    channelId: "ACS_CHANNEL",
                    text: "[1]: cite:1 \"Title 1\"",
                    channelData: {
                        metadata: {
                            "pva:gpt-feedback": JSON.stringify({ summarizationOpenAIResponse: { result: { textCitations: [{ id: "cite:1", title: "Title 1", text: "Body 1" }] } } })
                        }
                    }
                }
            }
        };

        middleware(next)(action);

        // dispatch should be called with SET_CITATIONS and the built map
        expect(dispatch).toHaveBeenCalled();
        const dispatched = (dispatch as jest.Mock).mock.calls[0][0];
        expect(dispatched.type).toBeDefined();
        expect(dispatched.payload["cite:1"]).toBe("Body 1");
        expect(action.payload.activity.text).toContain("cite:1");
        expect(next).toHaveBeenCalledWith(action);
    });
});
