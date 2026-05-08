/**
 * Layer 4 — skip-link / landmark navigation.
 *
 * The widget does not currently emit a "Skip to chat" link or named landmarks
 * inside the chat shell. This spec documents that gap as a `test.todo` so we
 * track it without producing a misleading green bar.
 *
 * When skip links / `<main>` / `<nav>` landmarks are added (likely as part of
 * the L1.2 axe triage), promote these `test.todo` lines to real assertions:
 *   - assert a skip link with `href="#chat-input"` precedes the message log
 *   - assert pressing Enter on it focuses the input
 *   - assert a single `<main>` exists inside the open widget
 *   - assert `<nav>` (header controls) is named via aria-label
 */
describe("Layer 4 skip-link / landmark navigation (gap)", () => {
    test.todo("widget exposes a 'skip to chat input' link reachable from the chat button");
    test.todo("activating skip link moves focus to message input");
    test.todo("open widget exposes a single <main> landmark");
    test.todo("header controls are wrapped in a named landmark (e.g., <nav aria-label='Chat header'>)");
});
