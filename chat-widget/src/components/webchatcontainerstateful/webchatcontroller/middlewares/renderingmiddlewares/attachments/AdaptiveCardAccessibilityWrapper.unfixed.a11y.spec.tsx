/* eslint-disable @typescript-eslint/no-explicit-any */

import "@testing-library/jest-dom";

import { act, cleanup, render } from "@testing-library/react";

import AdaptiveCardAccessibilityWrapper from "./AdaptiveCardAccessibilityWrapper";
import React from "react";

/**
 * Repro catchers for adaptive-card BUTTON & COMPACT-DROPDOWN bugs that the
 * existing `AdaptiveCardAccessibilityWrapper` does NOT yet handle:
 *
 *   AB#5905479 — Adaptive-card action buttons are announced as "toggle button"
 *                because the rendered <button role="button" aria-pressed=...>
 *                still carries the toggle/pressed semantics that the
 *                AdaptiveCards renderer leaves on Action.Submit / Action.OpenUrl
 *                buttons.
 *   AB#6304117 — Login button on a sign-in adaptive card has the same wrong
 *                role announcement (likely the same renderer pathway as 5905479).
 *   AB#6304100 — In the prechat country dropdown (compact Input.ChoiceSet),
 *                Narrator announces the selected value twice: once from
 *                aria-labelledby on the <select> and once from the visible
 *                <label for="...">. The wrapper never strips one of the two
 *                labelling sources.
 *
 * The wrapper today only patches `input[type=radio]`; these tests assert it
 * extends to action buttons and compact selects too. They are expected to
 * FAIL until the wrapper grows handlers for those element types.
 */

class MutationObserverMock {
    private callback: MutationCallback;
    constructor(callback: MutationCallback) {
        this.callback = callback;
    }
    observe = jest.fn();
    disconnect = jest.fn();
    trigger(mutations: any[] = []) {
        this.callback(mutations as MutationRecord[], this as unknown as MutationObserver);
    }
}

let observerInstance: MutationObserverMock;

beforeEach(() => {
    observerInstance = undefined as any;
    (global as any).MutationObserver = class extends MutationObserverMock {
        constructor(cb: MutationCallback) {
            super(cb);
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            observerInstance = this;
        }
    };
});

afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
});

const buildActionButton = (text: string): HTMLElement => {
    // Mirrors what AdaptiveCards renders for Action.Submit / Action.OpenUrl /
    // sign-in buttons: a <button class="ac-pushButton"> that the renderer
    // also marks with role="button" AND aria-pressed (the latter is what
    // makes Narrator say "toggle button").
    const wrapper = document.createElement("div");
    wrapper.className = "ac-actionSet";
    const btn = document.createElement("button");
    btn.className = "ac-pushButton";
    btn.setAttribute("role", "button");
    btn.setAttribute("aria-pressed", "false");
    btn.textContent = text;
    wrapper.appendChild(btn);
    return wrapper;
};

const buildCompactChoiceSet = (
    questionLabel: string,
    selectId: string,
    labelId: string,
    options: string[]
): HTMLElement => {
    // Mirrors compact Input.ChoiceSet: a visible <label for="..."> AND a
    // <select aria-labelledby="..."> referencing the same label. Both name
    // sources resolve to `questionLabel`, which Narrator/JAWS read twice.
    const wrapper = document.createElement("div");
    wrapper.className = "ac-input-container";

    const label = document.createElement("label");
    label.id = labelId;
    label.setAttribute("for", selectId);
    label.textContent = questionLabel;

    const select = document.createElement("select");
    select.id = selectId;
    select.setAttribute("aria-labelledby", labelId);
    options.forEach((opt) => {
        const o = document.createElement("option");
        o.value = opt;
        o.textContent = opt;
        select.appendChild(o);
    });

    wrapper.appendChild(label);
    wrapper.appendChild(select);
    return wrapper;
};

describe.skip("AdaptiveCardAccessibilityWrapper — action buttons (AB#5905479 / AB#6304117)", () => {
    it("AB#5905479: Action.Submit-style button must NOT be left with aria-pressed (causes Narrator 'toggle button' announcement)", async () => {
        const { container } = render(
            <AdaptiveCardAccessibilityWrapper>
                <div className="ac-adaptiveCard" />
            </AdaptiveCardAccessibilityWrapper>
        );
        const card = container.querySelector(".ac-adaptiveCard") as HTMLElement;

        await act(async () => {
            card.appendChild(buildActionButton("Submit"));
            observerInstance.trigger();
        });

        const button = container.querySelector("button.ac-pushButton") as HTMLElement;
        expect(button).not.toBeNull();
        // After fix: wrapper strips aria-pressed (and any role="switch"/"checkbox")
        // from action-set buttons so they announce as plain "button".
        expect(button.hasAttribute("aria-pressed")).toBe(false);
        expect(button.getAttribute("role")).not.toBe("switch");
        expect(button.getAttribute("role")).not.toBe("checkbox");
    });

    it("AB#6304117: Login button on a sign-in adaptive card must announce as a plain 'button'", async () => {
        const { container } = render(
            <AdaptiveCardAccessibilityWrapper>
                <div className="ac-adaptiveCard" />
            </AdaptiveCardAccessibilityWrapper>
        );
        const card = container.querySelector(".ac-adaptiveCard") as HTMLElement;

        await act(async () => {
            // The sign-in card renders the same primary action shape as 5905479.
            card.appendChild(buildActionButton("Login"));
            observerInstance.trigger();
        });

        const loginButton = Array.from(container.querySelectorAll("button.ac-pushButton"))
            .find((b) => b.textContent === "Login") as HTMLElement | undefined;
        expect(loginButton).toBeDefined();
        const lb = loginButton as HTMLElement;
        expect(lb.hasAttribute("aria-pressed")).toBe(false);
        // Native <button> with role="button" is harmless, but role="switch"
        // would re-introduce the toggle announcement. Assert it stays clean.
        const role = lb.getAttribute("role");
        expect(role === null || role === "button").toBe(true);
    });
});

describe.skip("AdaptiveCardAccessibilityWrapper — compact dropdowns (AB#6304100)", () => {
    it("AB#6304100: compact Input.ChoiceSet must not have BOTH aria-labelledby and a visible <label for> announce", async () => {
        const { container } = render(
            <AdaptiveCardAccessibilityWrapper>
                <div className="ac-adaptiveCard" />
            </AdaptiveCardAccessibilityWrapper>
        );
        const card = container.querySelector(".ac-adaptiveCard") as HTMLElement;

        await act(async () => {
            card.appendChild(
                buildCompactChoiceSet(
                    "Country",
                    "country-select",
                    "country-label",
                    ["United States", "Canada", "Mexico"]
                )
            );
            observerInstance.trigger();
        });

        const select = container.querySelector("select#country-select") as HTMLElement;
        const label = container.querySelector("label[for='country-select']") as HTMLElement;
        expect(select).not.toBeNull();
        expect(label).not.toBeNull();

        // After fix: exactly one of the two label sources must remain
        // announce-able. Either `aria-labelledby` is removed, or the <label>
        // is hidden via aria-hidden (or its `for=` is dropped). The select
        // must still have an accessible name.
        const selectStillLabelled = select.hasAttribute("aria-labelledby");
        const labelStillAnnounced =
            label.getAttribute("aria-hidden") !== "true" &&
            label.getAttribute("for") === "country-select";

        expect(selectStillLabelled && labelStillAnnounced).toBe(false);
        // ...and the select must retain SOME accessible name.
        const hasName =
            select.hasAttribute("aria-label") ||
            select.hasAttribute("aria-labelledby") ||
            !!container.querySelector("label[for='country-select']:not([aria-hidden='true'])");
        expect(hasName).toBe(true);
    });
});

describe.skip("AdaptiveCardAccessibilityWrapper — TalkBack labels on non-radio elements (AB#5929337 regression guard)", () => {
    it("AB#5929337: Input.Text fields inside an adaptive card must not have BOTH visible <label> and aria-label that duplicate (TalkBack reads twice)", async () => {
        // Best-effort regression catcher: TalkBack double-reads when both an
        // associated <label> AND aria-label resolve to the same string. This
        // catcher is a DOM proxy — true verification requires a TalkBack pass.
        const { container } = render(
            <AdaptiveCardAccessibilityWrapper>
                <div className="ac-adaptiveCard" />
            </AdaptiveCardAccessibilityWrapper>
        );
        const card = container.querySelector(".ac-adaptiveCard") as HTMLElement;

        await act(async () => {
            const wrapper = document.createElement("div");
            wrapper.className = "ac-input-container";
            const label = document.createElement("label");
            label.id = "name-lbl";
            label.setAttribute("for", "name-input");
            label.textContent = "Name";
            const input = document.createElement("input");
            input.type = "text";
            input.id = "name-input";
            input.setAttribute("aria-label", "Name");
            input.setAttribute("aria-labelledby", "name-lbl");
            wrapper.appendChild(label);
            wrapper.appendChild(input);
            card.appendChild(wrapper);
            observerInstance.trigger();
        });

        const input = container.querySelector("input#name-input") as HTMLElement;
        // After fix: at most ONE of {aria-label, aria-labelledby pointing to
        // a visible <label for=...>} resolves to "Name".
        const ariaLabel = input.getAttribute("aria-label");
        const ariaLabelledBy = input.getAttribute("aria-labelledby");
        const visibleLabel = container.querySelector(
            "label[for='name-input']:not([aria-hidden='true'])"
        );
        const sources = [
            ariaLabel,
            ariaLabelledBy && (document.getElementById(ariaLabelledBy)?.textContent || "").trim(),
            visibleLabel?.textContent?.trim()
        ].filter(Boolean);
        const duplicates = sources.filter((s) => s === "Name").length;
        expect(duplicates).toBeLessThanOrEqual(1);
    });
});
