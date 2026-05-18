/* eslint-disable @typescript-eslint/no-explicit-any */
import "@testing-library/jest-dom/extend-expect";

import { cleanup, render } from "@testing-library/react";

import { BroadcastServiceInitialize } from "../../services/BroadcastService";
import ChatButton from "./ChatButton";
import React from "react";
import { defaultChatButtonProps } from "./common/defaultProps/defaultChatButtonProps";

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
 * Catcher contract: in the rendered chat-button subtree, at most ONE element
 * may expose each of the title / subtitle strings as an announceable name
 * source. An "announceable name source" here is:
 *   - an `aria-label` attribute on a focusable / role-bearing element, OR
 *   - a visible `<Label>` (or other text-bearing element) that is NOT
 *     `aria-hidden="true"` and is not nested inside an element that is
 *     `aria-hidden="true"`.
 *
 * Regression guard: in the rendered DOM, the parent role=button Stack owns a
 * single consolidated aria-label (synthesized from title + subtitle, plus
 * unread-count fragment when applicable) and the inner Labels live inside an
 * aria-hidden text container so browse-mode lands on the button exactly once.
 * Override paths (componentOverrides.title/subtitle/textContainer or a
 * consumer-supplied controlProps.ariaLabel) are preserved unchanged so
 * customers who manage their own accessible names are not affected.
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
 * Regression guard for internal tracking — ChatButton must not produce duplicate
 * NVDA / JAWS browse-mode stops. Visible title / subtitle text is excluded
 * from the accessibility tree (aria-hidden) and the button container owns a
 * single consolidated aria-label.
 */
describe("ChatButton — browse-mode duplicate stops (internal tracking)", () => {
    it("title text 'Let's Chat!' must NOT appear as a visible (non-aria-hidden) name source in the chat-button subtree", () => {
        const { container } = render(<ChatButton {...defaultChatButtonProps} />);
        const button = container.firstElementChild as HTMLElement;
        expect(button).not.toBeNull();

        const titleStops = visibleTextElementsMatching(button, "Let's Chat!");
        // The visible title should be excluded from the accessibility tree
        // (e.g. via aria-hidden on the text container) so the announced name
        // comes solely from the consolidated aria-label on the button. Any
        // exposed text-bearing element with this exact text creates an
        // additional browse-mode stop and reproduces internal tracking.
        expect(titleStops.length).toBe(0);
    });

    it("subtitle text 'We're online.' must NOT appear as a visible (non-aria-hidden) name source in the chat-button subtree", () => {
        const { container } = render(<ChatButton {...defaultChatButtonProps} />);
        const button = container.firstElementChild as HTMLElement;
        expect(button).not.toBeNull();

        const subtitleStops = visibleTextElementsMatching(button, "We're online.");
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
        const innerVisibleText = visibleTextElementsMatching(button, "Let's Chat!").length
            + visibleTextElementsMatching(button, "We're online.").length;
        // Today: hasAriaLabel === false (default ariaLabel is undefined) AND
        // innerVisibleText > 0. The catcher requires at least one of these
        // to flip.
        expect(hasAriaLabel || innerVisibleText === 0).toBe(true);
    });

    it("the synthesized aria-label includes the unread-count fragment when hideNotificationBubble=false and unreadMessageCount > 0", () => {
        const props = {
            ...defaultChatButtonProps,
            controlProps: {
                ...defaultChatButtonProps.controlProps,
                hideNotificationBubble: false,
                unreadMessageCount: "3",
                ariaLabelUnreadMessageString: "you have new messages",
                titleText: "Let's Chat!",
                subtitleText: "We're online."
            }
        };
        const { container } = render(<ChatButton {...props} />);
        const button = container.firstElementChild as HTMLElement;
        const ariaLabel = button.getAttribute("aria-label") || "";
        expect(ariaLabel).toContain("3");
        expect(ariaLabel).toContain("you have new messages");
        expect(ariaLabel).toContain("Let's Chat!");
        expect(ariaLabel).toContain("We're online.");
    });

    it("a consumer-supplied controlProps.ariaLabel wins over the synthesized label", () => {
        const props = {
            ...defaultChatButtonProps,
            controlProps: {
                ...defaultChatButtonProps.controlProps,
                ariaLabel: "Talk to a live agent"
            }
        };
        const { container } = render(<ChatButton {...props} />);
        const button = container.firstElementChild as HTMLElement;
        expect(button.getAttribute("aria-label")).toBe("Talk to a live agent");
    });

    it("componentOverrides.textContainer preserves consumer-rendered visible text (synthesis is skipped)", () => {
        const customText = "My custom chat text";
        const props = {
            ...defaultChatButtonProps,
            componentOverrides: {
                textContainer: (
                    <div id="my-custom-text">{customText}</div>
                ) as unknown as string
            }
        };
        const { container } = render(<ChatButton {...props} />);
        const button = container.firstElementChild as HTMLElement;
        // The custom text MUST remain visible in the a11y tree so consumers
        // who replace the text container keep their announced text.
        const customStops = visibleTextElementsMatching(button, customText);
        expect(customStops.length).toBeGreaterThan(0);
        // And the button must NOT carry a synthesized aria-label that would
        // override the consumer's content.
        const ariaLabel = (button.getAttribute("aria-label") || "").trim();
        expect(ariaLabel).toBe("");
    });

    it("componentOverrides.title preserves consumer-rendered visible title (synthesis is skipped)", () => {
        const customTitle = "Custom override title";
        const props = {
            ...defaultChatButtonProps,
            componentOverrides: {
                title: (
                    <span id="my-custom-title">{customTitle}</span>
                ) as unknown as string
            }
        };
        const { container } = render(<ChatButton {...props} />);
        const button = container.firstElementChild as HTMLElement;
        const customStops = visibleTextElementsMatching(button, customTitle);
        expect(customStops.length).toBeGreaterThan(0);
        const ariaLabel = (button.getAttribute("aria-label") || "").trim();
        expect(ariaLabel).toBe("");
    });

    // Regression guard for the strict string-equality slip-throughs that
    // brittle `unreadMessageCount !== "0"` allowed: values that coerce to
    // numeric 0 (or non-numeric noise) must NOT render the bubble nor pollute
    // the synthesized aria-label with a "0 you have new messages" fragment.
    describe.each([
        ["padded zero (' 0 ')", " 0 "],
        ["decimal zero ('0.0')", "0.0"],
        ["empty string ('')", ""],
        ["non-numeric ('abc')", "abc"]
    ])("zero-equivalent unreadMessageCount: %s", (_label, value) => {
        it("does NOT render the notification bubble", () => {
            const props = {
                ...defaultChatButtonProps,
                controlProps: {
                    ...defaultChatButtonProps.controlProps,
                    hideNotificationBubble: false,
                    unreadMessageCount: value,
                    ariaLabelUnreadMessageString: "you have new messages"
                }
            };
            const { container } = render(<ChatButton {...props} />);
            const bubble = container.querySelector("[id$='-notification-bubble']");
            expect(bubble).toBeNull();
        });

        it("does NOT inject the unread-count fragment into the synthesized aria-label", () => {
            const props = {
                ...defaultChatButtonProps,
                controlProps: {
                    ...defaultChatButtonProps.controlProps,
                    hideNotificationBubble: false,
                    unreadMessageCount: value,
                    ariaLabelUnreadMessageString: "you have new messages"
                }
            };
            const { container } = render(<ChatButton {...props} />);
            const button = container.firstElementChild as HTMLElement;
            const ariaLabel = button.getAttribute("aria-label") || "";
            expect(ariaLabel).not.toContain("you have new messages");
            // and the raw zero-equivalent must not leak into the label
            if (value.trim().length > 0) {
                expect(ariaLabel).not.toContain(value.trim());
            }
        });
    });
});
