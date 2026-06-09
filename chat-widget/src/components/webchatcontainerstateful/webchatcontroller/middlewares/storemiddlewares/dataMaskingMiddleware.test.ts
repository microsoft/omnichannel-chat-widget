import "@testing-library/jest-dom";
import createDataMaskingMiddleware from "./dataMaskingMiddleware";
import { IDataMaskingInfo } from "../../../interfaces/IDataMaskingInfo";
import { WebChatActionType } from "../../enums/WebChatActionType";
import { IWebChatAction } from "../../../interfaces/IWebChatAction";

jest.mock("../../../../../common/telemetry/TelemetryHelper", () => ({
    TelemetryHelper: {
        logActionEvent: jest.fn()
    }
}));

const buildAction = (text: string): IWebChatAction => ({
    type: WebChatActionType.WEB_CHAT_SEND_MESSAGE,
    payload: { text }
});

const buildInfo = (rules: Record<string, string>, maskForCustomer = true): IDataMaskingInfo => ({
    dataMaskingRules: rules,
    setting: { msdyn_maskforcustomer: maskForCustomer }
});

const runMiddleware = (info: IDataMaskingInfo, action: IWebChatAction): IWebChatAction => {
    const next = jest.fn((a) => a);
    createDataMaskingMiddleware(info)({ dispatch: jest.fn() })(next)(action);
    return next.mock.calls[0][0] as IWebChatAction;
};

describe("dataMaskingMiddleware", () => {
    describe("existing masking behaviour", () => {
        it("replaces matched content with # mid-message", () => {
            const info = buildInfo({ rule1: "\\d{4}" });
            const result = runMiddleware(info, buildAction("call me at 5551"));
            expect(result.payload.text).toBe("call me at ####");
        });

        it("replaces all non-overlapping matches in a message", () => {
            const info = buildInfo({ rule1: "\\d{4}" });
            const result = runMiddleware(info, buildAction("5551 and 9999 done"));
            expect(result.payload.text).toBe("\\#### and #### done");
        });

        it("applies multiple rules sequentially", () => {
            const info = buildInfo({ r1: "\\d+" });
            const result = runMiddleware(info, buildAction("hello 123"));
            expect(result.payload.text).toBe("hello ###");
        });

        it("leaves text unchanged when no rule matches", () => {
            const info = buildInfo({ rule1: "\\d{4}" });
            const result = runMiddleware(info, buildAction("no digits here"));
            expect(result.payload.text).toBe("no digits here");
        });

        it("handles case-insensitive matching", () => {
            const info = buildInfo({ rule1: "abc" });
            // "ABC hello abc" → "### hello ###" → leading ### escaped → "\### hello ###"
            const result = runMiddleware(info, buildAction("ABC hello abc"));
            expect(result.payload.text).toBe("\\### hello ###");
        });

        it("breaks out safely when a rule matches the empty string", () => {
            const info = buildInfo({ rule1: ".*" });
            const result = runMiddleware(info, buildAction("hello"));
            expect(result.payload.text).toBeDefined();
        });

        it("passes action unchanged when msdyn_maskforcustomer is false", () => {
            const info = buildInfo({ rule1: "\\d{4}" }, false);
            const result = runMiddleware(info, buildAction("1234 secret"));
            expect(result.payload.text).toBe("1234 secret");
        });

        it("passes action unchanged when dataMaskingRules is empty", () => {
            const info = buildInfo({});
            const result = runMiddleware(info, buildAction("1234 secret"));
            expect(result.payload.text).toBe("1234 secret");
        });

        it("does not mask incoming activities", () => {
            const info = buildInfo({ rule1: "\\d{4}" });
            const action: IWebChatAction = {
                type: WebChatActionType.DIRECT_LINE_INCOMING_ACTIVITY,
                payload: { text: "1234 agent message" }
            };
            const next = jest.fn((a) => a);
            createDataMaskingMiddleware(info)({ dispatch: jest.fn() })(next)(action);
            expect(next.mock.calls[0][0].payload.text).toBe("1234 agent message");
        });
    });

    describe("trimmed-at-start fix — escape leading # to prevent markdown heading rendering", () => {
        it("escapes # at message start so masked content is not hidden as a heading", () => {
            const info = buildInfo({ rule1: "\\d{4}" });
            const result = runMiddleware(info, buildAction("1234 is my PIN"));
            expect(result.payload.text).toBe("\\#### is my PIN");
        });

        it("escapes # when the entire message is masked", () => {
            const info = buildInfo({ rule1: "\\d{4}" });
            const result = runMiddleware(info, buildAction("1234"));
            expect(result.payload.text).toBe("\\####");
        });

        it("escapes # on every line of a multi-line message", () => {
            const info = buildInfo({ rule1: "\\d{4}" });
            const result = runMiddleware(info, buildAction("1234\n5678 world"));
            expect(result.payload.text).toBe("\\####\n\\#### world");
        });

        it("does not escape # that appears mid-line", () => {
            const info = buildInfo({ rule1: "\\d{4}" });
            const result = runMiddleware(info, buildAction("PIN is 1234 here"));
            expect(result.payload.text).toBe("PIN is #### here");
        });

        it("does not escape # that appears mid-line from user input", () => {
            const info = buildInfo({ rule1: "\\d{4}" });
            const result = runMiddleware(info, buildAction("call #help desk 1234"));
            expect(result.payload.text).toBe("call #help desk ####");
        });
    });
});
