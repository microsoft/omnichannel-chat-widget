/* eslint-disable @typescript-eslint/no-explicit-any */
import "@testing-library/jest-dom";

/**
 * Repro / regression catcher for agent-profile-name — NVDA does not announce the
 * agent's profile name on agent messages. Web Chat's default
 * `ACTIVITY_BOT_SAID_ALT` uses the bot avatar initials ("Bot WC said:")
 * which gives the screen reader no useful identification.
 *
 * The bot-initials middleware (PR #907 fix for bot-initials-prior-fix) was supposed to
 * resolve this for the BOT role. This catcher extends coverage to the
 * AGENT role: when the activity arrives with `role: "agent"` (or any
 * non-user, non-system role), the middleware must still update
 * `currentAgentName` so `ACTIVITY_BOT_SAID_ALT` reads e.g. "Sara Smith said:".
 *
 * If the middleware silently skips agent-role activities, this fails.
 *
 * TODO(agent-profile-name): the original 2022 bug very likely surfaces in WebChat's
 * activity-rendering pipeline (NVDA virtual-cursor reading order), not in
 * the middleware. This catcher is therefore a regression GUARD on the
 * middleware contract — it currently passes. Real verification needs an
 * NVDA pass against a live agent transcript. See BUG_STATUS.md.
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

describe("localizedStringsBotInitialsMiddleware — agent profile name (agent-profile-name)", () => {
    beforeEach(() => {
        mockGetIconText.mockReset();
    });

    const sendActivity = (mw: any, activity: any) =>
        mw({ type: "DIRECT_LINE/INCOMING_ACTIVITY", payload: { activity } });

    it("agent-profile-name: ACTIVITY_BOT_SAID_ALT must reflect the agent's profile name when activity.from.role is 'agent'", () => {
        const mod = loadFreshMiddleware();
        const middleware = mod.localizedStringsBotInitialsMiddleware()({ dispatch: jest.fn() })((a: any) => a);

        mockGetIconText.mockReturnValue("SS");
        sendActivity(middleware, { from: { name: "Sara Smith", role: "agent" } });

        const strings = mod.getOverriddenLocalizedStrings()({});
        expect(strings.ACTIVITY_BOT_SAID_ALT).toBe("Sara Smith said:");
        // The default initials fallback (which produces "WC said:") must not survive.
        expect(strings.ACTIVITY_BOT_SAID_ALT).not.toMatch(/^WC /);
    });

    it("agent-profile-name: ACTIVITY_BOT_ATTACHED_ALT must also use the agent profile name", () => {
        const mod = loadFreshMiddleware();
        const middleware = mod.localizedStringsBotInitialsMiddleware()({ dispatch: jest.fn() })((a: any) => a);

        mockGetIconText.mockReturnValue("MR");
        sendActivity(middleware, { from: { name: "Maria Rodriguez", role: "agent" } });

        const strings = mod.getOverriddenLocalizedStrings()({});
        expect(strings.ACTIVITY_BOT_ATTACHED_ALT).toBe("Maria Rodriguez attached:");
    });
});
