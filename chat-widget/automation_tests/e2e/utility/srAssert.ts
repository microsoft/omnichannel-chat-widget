/**
 * Screen-reader assertion helper.
 *
 * Wraps Guidepup (https://github.com/guidepup/guidepup) so spec code reads
 * `await expectAnnounced(sr, "Chat, button");` rather than re-implementing
 * the polling loop. Phrases are sourced from
 * `tools/accessibility/nvda-phrases.json` so we have a single source of
 * truth and can update them when NVDA cadence changes.
 *
 * The Guidepup module is required lazily so that specs can import this
 * helper file even when guidepup isn't installed (gives a clearer error
 * than a top-level import failure).
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ScreenReader = any;

export type SrEvent =
    | "chatButtonFocused"
    | "startChatPaneOpened"
    | "messageSent"
    | "messageReceived"
    | "agentTyping"
    | "attachmentSent"
    | "transcriptSuccess"
    | "transcriptError"
    | "endChatConfirm"
    | "reconnectPrompt";

// eslint-disable-next-line @typescript-eslint/no-var-requires
let phrases: Record<SrEvent, string> | null = null;

function loadPhrases(): Record<SrEvent, string> {
    if (phrases) return phrases;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const data = require("../../../../tools/accessibility/nvda-phrases.json");
    phrases = data.events as Record<SrEvent, string>;
    return phrases;
}

/**
 * Returns the canonical phrase NVDA is expected to announce for an event.
 */
export function phraseFor(event: SrEvent): string {
    const all = loadPhrases();
    if (!all[event]) {
        throw new Error(`No NVDA phrase mapping for event "${event}". Add it to tools/accessibility/nvda-phrases.json.`);
    }
    return all[event];
}

/**
 * Asserts the screen reader has spoken `phrase` (case-insensitive substring
 * match on the most recent N items of the spoken-phrase log).
 *
 * Implemented as a polling check (200ms interval) up to `timeoutMs`.
 */
export async function expectAnnounced(
    sr: ScreenReader,
    phrase: string,
    timeoutMs = 5000,
): Promise<void> {
    const target = phrase.toLowerCase();
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const recent: any[] = await sr.spokenPhraseLog();
        if (recent.some((entry) => String(entry).toLowerCase().includes(target))) {
            return;
        }
        await new Promise((r) => setTimeout(r, 200));
    }
    throw new Error(`NVDA did not announce "${phrase}" within ${timeoutMs}ms.`);
}

export async function expectAnnouncedEvent(
    sr: ScreenReader,
    event: SrEvent,
    timeoutMs = 5000,
): Promise<void> {
    return expectAnnounced(sr, phraseFor(event), timeoutMs);
}

/**
 * Lazy Guidepup loader. Throws a clear error message if guidepup is not
 * installed, so specs that import this module without the dep show
 * something readable.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function loadGuidepup(): any {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        return require("@guidepup/guidepup");
    } catch (e) {
        throw new Error(
            "@guidepup/guidepup is not installed. Run `yarn add -D @guidepup/guidepup` " +
            "in chat-widget and re-run after installing NVDA via tools/accessibility/setupNvda.ps1.",
        );
    }
}
