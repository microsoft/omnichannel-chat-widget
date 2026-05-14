/* eslint-disable @typescript-eslint/no-explicit-any */
import "@testing-library/jest-dom/extend-expect";

import { cleanup, render } from "@testing-library/react";

import { BroadcastServiceInitialize } from "../../services/BroadcastService";
import ChatButton from "./ChatButton";
import { IChatButtonProps } from "./interfaces/IChatButtonProps";
import LoadingPane from "../loadingpane/LoadingPane";
import React from "react";
import { defaultChatButtonProps } from "./common/defaultProps/defaultChatButtonProps";
import { defaultLoadingPaneProps } from "../loadingpane/common/defaultProps/defaultLoadingPaneProps";

/**
 * Repro / catcher for AB#6003259 — screen reader announces hidden / irrelevant
 * text such as "blank" while navigating the chat surface. NVDA / JAWS announce
 * "blank" when they encounter:
 *   - an element with an announceable role (button, link, textbox, listitem,
 *     progressbar, etc.) that has an empty accessible name (no aria-label, no
 *     aria-labelledby, no associated <label>, and no own text content), OR
 *   - a live region (`aria-live="polite"` / `aria-live="assertive"`) that is
 *     mounted with empty text content (each tick announces "blank").
 *
 * This catcher walks several rendered LCW surfaces and asserts neither pattern
 * is present. Deterministic DOM contract — no SR needed.
 *
 * Surfaces covered today:
 *   - ChatButton (default props) — regression guard; passes today.
 *   - ChatButton with notification bubble forced visible at unreadCount=0 —
 *     regression guard for the empty-live-region path; passes today.
 *   - LoadingPane (default props) — regression guard; passes today.
 *
 * Scope note: the original bug surfaces inside WebChat-rendered chat session
 * content (message bubbles, attachments, agent-supplied HTML), which is not
 * reachable from chat-components unit tests. The Playwright catcher
 * `automation_tests/e2e/areas/accessibility/blankAnnouncements.spec.ts` on
 * `chore/a11y-tooling-foundation` walks the full a11y tree of a built
 * `dist/out.js` and is the right vehicle for enumerating per-offender fixes.
 * Promote additional surfaces here as they are wired into the catcher harness.
 */

beforeAll(() => {
    BroadcastServiceInitialize("testChannel");
});

afterEach(() => {
    cleanup();
});

const ANNOUNCEABLE_ROLES = new Set([
    "button",
    "link",
    "textbox",
    "combobox",
    "listbox",
    "listitem",
    "menu",
    "menuitem",
    "checkbox",
    "radio",
    "switch",
    "tab",
    "treeitem",
    "option",
    "searchbox",
    "progressbar",
    "alert",
    "status"
]);

const ANNOUNCEABLE_TAGS = new Set([
    "button",
    "a",
    "input",
    "select",
    "textarea"
]);

const isInsideAriaHidden = (el: Element | null): boolean => {
    let cursor: Element | null = el;
    while (cursor) {
        if (cursor.getAttribute("aria-hidden") === "true") return true;
        cursor = cursor.parentElement;
    }
    return false;
};

const accessibleNameOf = (el: Element): string => {
    const ariaLabel = (el.getAttribute("aria-label") || "").trim();
    if (ariaLabel) return ariaLabel;
    const labelledBy = (el.getAttribute("aria-labelledby") || "").trim();
    if (labelledBy) {
        const referenced = labelledBy
            .split(/\s+/)
            .map((id) => document.getElementById(id)?.textContent || "")
            .join(" ")
            .trim();
        if (referenced) return referenced;
    }
    if (el.tagName.toLowerCase() === "input") {
        const id = el.id;
        if (id) {
            const label = document.querySelector<HTMLLabelElement>(`label[for="${CSS.escape(id)}"]`);
            const labelText = label?.textContent?.trim();
            if (labelText) return labelText;
        }
        const placeholder = (el.getAttribute("placeholder") || "").trim();
        if (placeholder) return placeholder;
    }
    if (el.tagName.toLowerCase() === "a") {
        const title = (el.getAttribute("title") || "").trim();
        if (title) return title;
    }
    return (el.textContent || "").trim();
};

const isAnnounceable = (el: Element): boolean => {
    if (isInsideAriaHidden(el)) return false;
    const role = (el.getAttribute("role") || "").toLowerCase();
    if (role === "presentation" || role === "none") return false;
    if (role && ANNOUNCEABLE_ROLES.has(role)) return true;
    if (ANNOUNCEABLE_TAGS.has(el.tagName.toLowerCase())) {
        // <input type="hidden"> is not announceable.
        if (el.tagName.toLowerCase() === "input" &&
            (el.getAttribute("type") || "").toLowerCase() === "hidden") {
            return false;
        }
        return true;
    }
    return false;
};

const findEmptyAnnounceable = (root: HTMLElement): Element[] => {
    return Array.from(root.querySelectorAll("*")).filter(
        (el) => isAnnounceable(el) && accessibleNameOf(el) === ""
    );
};

const findEmptyLiveRegions = (root: HTMLElement): Element[] => {
    return Array.from(root.querySelectorAll("[aria-live]")).filter((el) => {
        if (isInsideAriaHidden(el)) return false;
        const live = (el.getAttribute("aria-live") || "").toLowerCase();
        if (live !== "polite" && live !== "assertive") return false;
        return (el.textContent || "").trim() === "";
    });
};

const summarize = (offenders: Element[]) =>
    offenders.map((el) => ({
        tag: el.tagName.toLowerCase(),
        id: el.id,
        role: el.getAttribute("role"),
        ariaLabel: el.getAttribute("aria-label"),
        ariaLabelledBy: el.getAttribute("aria-labelledby"),
        classes: el.className
    }));

describe("ChatButton — 'blank' / empty-name announcements (AB#6003259 regression guard)", () => {
    it("no announceable role/tag in the chat-button subtree may have an empty accessible name", () => {
        const { container } = render(<ChatButton {...defaultChatButtonProps} />);
        const button = container.firstElementChild as HTMLElement;
        expect(button).not.toBeNull();
        expect(summarize(findEmptyAnnounceable(button))).toEqual([]);
    });

    it("no live region (aria-live=polite/assertive) in the chat-button subtree may be mounted with empty text", () => {
        const props: IChatButtonProps = {
            ...defaultChatButtonProps,
            controlProps: {
                ...defaultChatButtonProps.controlProps,
                unreadMessageCount: "0",
                hideNotificationBubble: false
            }
        };
        const { container } = render(<ChatButton {...props} />);
        const button = container.firstElementChild as HTMLElement;
        expect(button).not.toBeNull();
        expect(summarize(findEmptyLiveRegions(button))).toEqual([]);
    });
});

describe("LoadingPane — 'blank' / empty-name announcements (AB#6003259 regression guard)", () => {
    it("no announceable role/tag in the loading-pane subtree may have an empty accessible name", () => {
        const { container } = render(<LoadingPane {...defaultLoadingPaneProps} />);
        const pane = container.firstElementChild as HTMLElement;
        expect(pane).not.toBeNull();
        expect(summarize(findEmptyAnnounceable(pane))).toEqual([]);
    });

    it("no live region (aria-live=polite/assertive) in the loading-pane subtree may be mounted with empty text", () => {
        const { container } = render(<LoadingPane {...defaultLoadingPaneProps} />);
        const pane = container.firstElementChild as HTMLElement;
        expect(pane).not.toBeNull();
        expect(summarize(findEmptyLiveRegions(pane))).toEqual([]);
    });
});

