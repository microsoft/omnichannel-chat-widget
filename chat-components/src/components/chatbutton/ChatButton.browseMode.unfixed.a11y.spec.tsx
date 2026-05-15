/* eslint-disable @typescript-eslint/no-explicit-any */
import "@testing-library/jest-dom/extend-expect";

import { cleanup, render } from "@testing-library/react";

import { BroadcastServiceInitialize } from "../../services/BroadcastService";
import ChatButton from "./ChatButton";
import React from "react";
import { defaultChatButtonControlProps } from "./common/defaultProps/defaultChatButtonControlProps";
import { defaultChatButtonProps } from "./common/defaultProps/defaultChatButtonProps";

const expectedTitle = defaultChatButtonControlProps.titleText as string;
const expectedSubtitle = defaultChatButtonControlProps.subtitleText as string;

/**
 * Repro / catcher for internal tracking — NVDA / JAWS in browse mode (virtual cursor)
 * land on "Let's Chat, We're Online" multiple times when navigating with the
 * down-arrow key.
 *
 * Root cause in code: `ChatButton` renders a Fluent UI `<Stack role="button">`
 * with `tabIndex={0}` whose accessible name is computed from its visible
 * children — a `<Label>` for the title (e.g. "Let's Chat!") and a `<Label>`
 * for the subtitle (e.g. "We're online."). In browse mode, NVDA / JAWS treat
 * the button itself AND each inner text node as separate virtual-cursor stops,
 * each carrying the same announceable name fragments. There is no
 * `aria-label` set by default, and the inner labels are not marked
 * `aria-hidden="true"` (which is what would collapse them into a single
 * announcement under the button container).
 *
 * Catcher contract: the title / subtitle strings must NOT appear as
 * additional announceable name sources in the chat-button subtree (only the
 * single consolidated aria-label on the role=button container should name the
 * button). An "announceable name source" here is:
 *   - an `aria-label` attribute on a focusable / role-bearing element, OR
 *   - a visible `<Label>` (or other text-bearing element) that is NOT
 *     `aria-hidden="true"` and is not nested inside an element that is
 *     `aria-hidden="true"`.
 *
 * Expected to FAIL today: the rendered DOM contains BOTH the title text node
 * AND the subtitle text node as bare visible text, and the parent Stack has
 * no `aria-label` to consolidate them. Browse-mode therefore sees three
 * stops (button, title, subtitle) all carrying the same combined name.
 */

beforeAll(() => {
    BroadcastServiceInitialize("testChannel");
});

afterEach(() => {
    cleanup();
});

const isInsideAriaHidden = (el: Element | null): boolean => {
    let cursor: Element | null = el;
    while (cursor) {
        if (cursor.getAttribute("aria-hidden") === "true") return true;
        cursor = cursor.parentElement;
    }
    return false;
};

const visibleTextElementsMatching = (root: HTMLElement, text: string): Element[] => {
    return Array.from(root.querySelectorAll("*")).filter((el) => {
        if (isInsideAriaHidden(el)) return false;
        // Only count leaf-ish text-bearing elements (don't double-count
        // ancestors whose textContent obviously aggregates children).
        const ownText = Array.from(el.childNodes)
            .filter((n) => n.nodeType === Node.TEXT_NODE)
            .map((n) => (n.textContent || "").trim())
            .join(" ")
            .trim();
        return ownText === text;
    });
};

/**
 * SKIPPED until the source fix lands. Un-skip the describe below to validate
 * the fix to internal tracking; the suite is expected to FAIL today against unfixed
 * source. Mirrors the chat-widget `*.unfixed.a11y.spec.tsx` convention.
 */
describe.skip("ChatButton — browse-mode duplicate stops (internal tracking)", () => {
    it(`title text '${expectedTitle}' must NOT appear as a visible (non-aria-hidden) name source in the chat-button subtree`, () => {
        const { container } = render(<ChatButton {...defaultChatButtonProps} />);
        const button = container.firstElementChild as HTMLElement;
        expect(button).not.toBeNull();

        const titleStops = visibleTextElementsMatching(button, expectedTitle);
        // The visible title should be excluded from the accessibility tree
        // (e.g. via aria-hidden on the text container) so the announced name
        // comes solely from the consolidated aria-label on the button. Any
        // exposed text-bearing element with this exact text creates an
        // additional browse-mode stop and reproduces internal tracking.
        expect(titleStops.length).toBe(0);
    });

    it(`subtitle text '${expectedSubtitle}' must NOT appear as a visible (non-aria-hidden) name source in the chat-button subtree`, () => {
        const { container } = render(<ChatButton {...defaultChatButtonProps} />);
        const button = container.firstElementChild as HTMLElement;
        expect(button).not.toBeNull();

        const subtitleStops = visibleTextElementsMatching(button, expectedSubtitle);
        expect(subtitleStops.length).toBe(0);
    });

    it("the chat-button container must own a single consolidated aria-label so browse mode lands on it once", () => {
        const { container } = render(<ChatButton {...defaultChatButtonProps} />);
        const button = container.firstElementChild as HTMLElement;
        expect(button).not.toBeNull();
        // Either the container has a non-empty aria-label, OR every inner
        // text-bearing descendant is aria-hidden so the computed name comes
        // from the inner text exactly once with no extra browse-mode stops.
        const hasAriaLabel = !!(button.getAttribute("aria-label") || "").trim();
        const innerVisibleText = visibleTextElementsMatching(button, expectedTitle).length
            + visibleTextElementsMatching(button, expectedSubtitle).length;
        // Today: hasAriaLabel === false (default ariaLabel is undefined) AND
        // innerVisibleText > 0. The catcher requires at least one of these
        // to flip.
        expect(hasAriaLabel || innerVisibleText === 0).toBe(true);
    });
});
