/* eslint-disable @typescript-eslint/no-explicit-any */

import "@testing-library/jest-dom";

/**
 * Repro catcher for transfer-stale-bot-name — after transfer from a bot/agent to a new
 * live agent, the new agent's first message is announced to the screen
 * reader using the OLD agent's name (e.g. "Bot JO said: hi" when the new
 * agent is "Sara Smith").
 *
 * Root cause: `localizedStringsBotInitialsMiddleware` keeps a module-scoped
 * `currentAgentName` that is only ever overwritten when a NEW non-system
 * incoming activity arrives. WebChat reads `ACTIVITY_BOT_SAID_ALT` to
 * label each activity for the screen reader. Between the transfer system
 * message (which the middleware skips) and the new agent's first activity,
 * the middleware happily exposes the previous agent's name.
 *
 * Fix path: when a transfer system message is observed, reset
 * `currentAgentName` / `currentAgentInitials` to defaults so the next
 * non-system activity recomputes from scratch and never carries the
 * stale name forward.
 *
 * NOTE: This file deliberately uses `jest.isolateModules` to get a fresh
 * copy of the middleware (its module-level state otherwise leaks across
 * the existing test in the sibling `*.test.ts`).
 */

const mockGetIconText = jest.fn();

jest.mock("@microsoft/omnichannel-chat-components", () => ({
    BroadcastService: { postMessage: jest.fn() }
}));

jest.mock("../../../../../common/utils", () => ({
    getIconText: (...args: any[]) => mockGetIconText(...args)
}));

jest.mock("../../../common/defaultStyles/defaultWebChatStyles", () => ({
    defaultWebChatStyles: { botAvatarInitials: "WC" }
}));

const loadFreshMiddleware = () => {
    let mod: any;
    jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        mod = require("./localizedStringsBotInitialsMiddleware");
    });
    return mod;
};

describe("localizedStringsBotInitialsMiddleware — transfer reset (transfer-stale-bot-name)", () => {
    beforeEach(() => {
        mockGetIconText.mockReset();
    });

    const TRANSFER_SYSTEM_TEXT = "Conversation has been transferred to Sara Smith.";

    const sendActivity = (mw: any, activity: any) =>
        mw({ type: "DIRECT_LINE/INCOMING_ACTIVITY", payload: { activity } });

    it("transfer-stale-bot-name: a transfer system message must reset currentAgentName so the next non-system activity does NOT inherit the prior agent's name", () => {
        const mod = loadFreshMiddleware();
        const middleware = mod.localizedStringsBotInitialsMiddleware()({ dispatch: jest.fn() })((a: any) => a);

        // 1. First agent ("Bot JO") sends a normal message — middleware records the name.
        mockGetIconText.mockReturnValue("BJ");
        sendActivity(middleware, { from: { name: "Bot JO", role: "bot" } });

        let strings = mod.getOverriddenLocalizedStrings()({});
        expect(strings.ACTIVITY_BOT_SAID_ALT).toBe("Bot JO said:");

        // 2. A transfer system message arrives. The middleware skips it
        //    today — it should also CLEAR the cached agent name, but
        //    currently does not.
        sendActivity(middleware, {
            from: { name: "System", role: "bot" },
            text: TRANSFER_SYSTEM_TEXT,
            channelData: { tags: ["system"] }
        });

        // 3. Immediately after the transfer system message — but before the
        //    new agent has spoken — anything WebChat renders (e.g. a
        //    typing indicator, the welcome activity) gets labelled with
        //    the *previous* agent's name. After the fix, the strings should
        //    fall back to the default.
        strings = mod.getOverriddenLocalizedStrings()({});
        expect(strings.ACTIVITY_BOT_SAID_ALT).not.toMatch(/Bot JO/i);
    });

    it("transfer-stale-bot-name: a transfer system message that names the new agent must not freeze the OLD name on subsequent activities", () => {
        const mod = loadFreshMiddleware();
        const middleware = mod.localizedStringsBotInitialsMiddleware()({ dispatch: jest.fn() })((a: any) => a);

        mockGetIconText.mockReturnValue("BJ");
        sendActivity(middleware, { from: { name: "Bot JO", role: "bot" } });

        // Transfer system message
        sendActivity(middleware, {
            from: { name: "System", role: "bot" },
            text: TRANSFER_SYSTEM_TEXT,
            channelData: { tags: ["system"] }
        });

        // New agent speaks
        mockGetIconText.mockReturnValue("SS");
        sendActivity(middleware, { from: { name: "Sara Smith", role: "bot" } });

        const strings = mod.getOverriddenLocalizedStrings()({});
        // After the new agent speaks the strings MUST reflect the new name.
        // (This part already works in the current code — it's the window
        //  between transfer and first new activity that's broken — but we
        //  guard it here so the fix doesn't accidentally regress.)
        expect(strings.ACTIVITY_BOT_SAID_ALT).toBe("Sara Smith said:");
        expect(strings.ACTIVITY_BOT_SAID_ALT).not.toMatch(/Bot JO/i);
    });
});
