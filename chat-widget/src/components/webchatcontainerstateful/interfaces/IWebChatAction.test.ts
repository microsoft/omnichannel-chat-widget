import { isWebChatAction } from "./IWebChatAction";

describe("isWebChatAction", () => {
    it("accepts payload-less Web Chat actions", () => {
        expect(isWebChatAction({ type: "__BOT_INITIALS_UPDATED__" })).toBe(true);
    });

    it("rejects values without a string action type", () => {
        expect(isWebChatAction({ payload: {} })).toBe(false);
        expect(isWebChatAction({ type: 1 })).toBe(false);
        expect(isWebChatAction(null)).toBe(false);
    });
});
