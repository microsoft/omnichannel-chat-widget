/* eslint-disable @typescript-eslint/no-explicit-any */

import "@testing-library/jest-dom";

import { act, cleanup, render } from "@testing-library/react";

import AdaptiveCardAccessibilityWrapper from "./AdaptiveCardAccessibilityWrapper";
import React from "react";

/**
 * Repro catchers for adaptive-card BUTTON & COMPACT-DROPDOWN bugs that the
 * existing `AdaptiveCardAccessibilityWrapper` does NOT yet handle:
 *
 *   action-button-toggle — Adaptive-card action buttons are announced as "toggle button"
 *                because the rendered <button role="button" aria-pressed=...>
 *                still carries the toggle/pressed semantics that the
 *                AdaptiveCards renderer leaves on Action.Submit / Action.OpenUrl
 *                buttons.
 *   login-button-toggle — Login button on a sign-in adaptive card has the same wrong
 *                role announcement (likely the same renderer pathway as 5905479).
 *   dropdown-double-label — In the prechat country dropdown (compact Input.ChoiceSet),
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
    select.className = "ac-input ac-multichoiceInput";
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

describe("AdaptiveCardAccessibilityWrapper — action buttons (action-button-toggle / login-button-toggle)", () => {
    it("action-button-toggle: Action.Submit-style button must NOT be left with aria-pressed (causes Narrator 'toggle button' announcement)", async () => {
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
        // After fix: wrapper strips aria-pressed and role="switch" from plain
        // action-set buttons so they announce as plain "button".
        expect(button.hasAttribute("aria-pressed")).toBe(false);
        expect(button.getAttribute("role")).not.toBe("switch");
    });

    it("login-button-toggle: Login button on a sign-in adaptive card must announce as a plain 'button'", async () => {
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

    it("Action.ToggleVisibility-style buttons keep aria-pressed semantics", async () => {
        const { container } = render(
            <AdaptiveCardAccessibilityWrapper>
                <div className="ac-actionSet">
                    <button className="ac-pushButton" role="switch" aria-pressed="true" aria-controls="details">
                        Show details
                    </button>
                </div>
            </AdaptiveCardAccessibilityWrapper>
        );

        await act(async () => {
            observerInstance.trigger();
        });

        const toggleButton = container.querySelector("button.ac-pushButton") as HTMLElement;
        expect(toggleButton).toHaveAttribute("aria-pressed", "true");
        expect(toggleButton).toHaveAttribute("role", "switch");
    });

    it("does not strip role=checkbox without a dedicated scenario", async () => {
        const { container } = render(
            <AdaptiveCardAccessibilityWrapper>
                <div className="ac-actionSet">
                    <button className="ac-pushButton" role="checkbox" aria-checked="false">
                        Subscribe
                    </button>
                </div>
            </AdaptiveCardAccessibilityWrapper>
        );

        await act(async () => {
            observerInstance.trigger();
        });

        const checkboxButton = container.querySelector("button.ac-pushButton") as HTMLElement;
        expect(checkboxButton).toHaveAttribute("role", "checkbox");
        expect(checkboxButton).toHaveAttribute("aria-checked", "false");
    });
});

describe("AdaptiveCardAccessibilityWrapper — compact dropdowns (dropdown-double-label)", () => {
    it("dropdown-double-label: compact Input.ChoiceSet must not have BOTH aria-labelledby and a visible <label for> announce", async () => {
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

    it("dropdown-double-label: composite aria-labelledby values are preserved", async () => {
        const { container } = render(
            <AdaptiveCardAccessibilityWrapper>
                <div className="ac-adaptiveCard" />
            </AdaptiveCardAccessibilityWrapper>
        );
        const card = container.querySelector(".ac-adaptiveCard") as HTMLElement;

        await act(async () => {
            const choiceSet = buildCompactChoiceSet(
                "Country",
                "country-select",
                "country-label",
                ["United States", "Canada", "Mexico"]
            );
            const required = document.createElement("span");
            required.id = "country-required";
            required.textContent = "required";
            choiceSet.appendChild(required);
            const select = choiceSet.querySelector("select") as HTMLSelectElement;
            select.setAttribute("aria-labelledby", "country-label country-required");
            card.appendChild(choiceSet);
            observerInstance.trigger();
        });

        const select = container.querySelector("select#country-select") as HTMLElement;
        expect(select).toHaveAttribute("aria-labelledby", "country-label country-required");
    });

    it("dropdown-double-label: non-ChoiceSet selects keep aria-labelledby", async () => {
        const { container } = render(
            <AdaptiveCardAccessibilityWrapper>
                <div className="ac-adaptiveCard">
                    <label id="custom-label" htmlFor="custom-select">Custom select</label>
                    <select id="custom-select" aria-labelledby="custom-label" />
                </div>
            </AdaptiveCardAccessibilityWrapper>
        );

        await act(async () => {
            observerInstance.trigger();
        });

        const select = container.querySelector("select#custom-select") as HTMLElement;
        expect(select).toHaveAttribute("aria-labelledby", "custom-label");
    });

    it("dropdown-double-label: hidden labels do not cause aria-labelledby removal", async () => {
        const { container } = render(
            <AdaptiveCardAccessibilityWrapper>
                <div className="ac-adaptiveCard" />
            </AdaptiveCardAccessibilityWrapper>
        );
        const card = container.querySelector(".ac-adaptiveCard") as HTMLElement;

        await act(async () => {
            const choiceSet = buildCompactChoiceSet(
                "Country",
                "country-select",
                "country-label",
                ["United States", "Canada", "Mexico"]
            );
            const label = choiceSet.querySelector("label") as HTMLLabelElement;
            label.setAttribute("aria-hidden", "true");
            card.appendChild(choiceSet);
            observerInstance.trigger();
        });

        const select = container.querySelector("select#country-select") as HTMLElement;
        expect(select).toHaveAttribute("aria-labelledby", "country-label");
    });
});

// AB#5929337 — TalkBack reads adaptive-card element labels TWICE.
// PR #911 patched the radio case via `aria-hidden` on label/spacer siblings,
// but every other Input.* type (Text, Date, Number, Toggle, ChoiceSet expanded
// non-radio) is still rendered with BOTH an associated <label for> AND an
// aria-label / aria-labelledby resolving to the same string. TalkBack walks
// each accessibility node independently and reads the duplicated name.
//
// These cases are deterministic DOM-contract assertions: the wrapper's
// post-mutation output must expose at most one announce-able name source per
// input. They are expected to FAIL today because the wrapper only handles
// `input[type=radio]`.
describe.skip("AdaptiveCardAccessibilityWrapper — TalkBack duplicate labels on non-radio elements (AB#5929337)", () => {
    const buildLabelledInput = (
        type: "text" | "date" | "number" | "checkbox",
        id: string,
        labelText: string
    ): HTMLElement => {
        // Mirrors what the AdaptiveCards renderer produces for Input.Text /
        // Input.Date / Input.Number / Input.Toggle: a visible <label for="...">
        // AND aria-label/aria-labelledby on the input that resolve to the same
        // string.
        const wrapper = document.createElement("div");
        wrapper.className = "ac-input-container";
        const label = document.createElement("label");
        label.id = `${id}-lbl`;
        label.setAttribute("for", id);
        label.textContent = labelText;
        const input = document.createElement("input");
        input.type = type;
        input.id = id;
        input.className = "ac-input";
        input.setAttribute("aria-label", labelText);
        input.setAttribute("aria-labelledby", `${id}-lbl`);
        wrapper.appendChild(label);
        wrapper.appendChild(input);
        return wrapper;
    };

    const countAnnouncedSources = (
        container: HTMLElement,
        inputId: string,
        expectedName: string
    ): number => {
        const input = container.querySelector(`#${CSS.escape(inputId)}`) as HTMLElement | null;
        if (!input) return 0;
        const ariaLabel = input.getAttribute("aria-label");
        const ariaLabelledBy = input.getAttribute("aria-labelledby");
        const visibleLabel = container.querySelector(
            `label[for="${CSS.escape(inputId)}"]:not([aria-hidden='true'])`
        );
        const sources: (string | undefined | null)[] = [
            ariaLabel,
            ariaLabelledBy
                ? (document.getElementById(ariaLabelledBy)?.textContent || "").trim()
                : undefined,
            visibleLabel?.textContent?.trim()
        ];
        return sources.filter((s) => s === expectedName).length;
    };

    const renderCardWith = async (factory: () => HTMLElement) => {
        const { container } = render(
            <AdaptiveCardAccessibilityWrapper>
                <div className="ac-adaptiveCard" />
            </AdaptiveCardAccessibilityWrapper>
        );
        const card = container.querySelector(".ac-adaptiveCard") as HTMLElement;
        await act(async () => {
            card.appendChild(factory());
            observerInstance.trigger();
        });
        return container;
    };

    it("Input.Text: visible <label for> AND aria-label/aria-labelledby must not all resolve to the same name", async () => {
        const container = await renderCardWith(() => buildLabelledInput("text", "name-input", "Name"));
        expect(countAnnouncedSources(container, "name-input", "Name")).toBeLessThanOrEqual(1);
    });

    it("Input.Date: visible <label for> AND aria-label/aria-labelledby must not all resolve to the same name", async () => {
        const container = await renderCardWith(() => buildLabelledInput("date", "dob-input", "Date of birth"));
        expect(countAnnouncedSources(container, "dob-input", "Date of birth")).toBeLessThanOrEqual(1);
    });

    it("Input.Number: visible <label for> AND aria-label/aria-labelledby must not all resolve to the same name", async () => {
        const container = await renderCardWith(() => buildLabelledInput("number", "qty-input", "Quantity"));
        expect(countAnnouncedSources(container, "qty-input", "Quantity")).toBeLessThanOrEqual(1);
    });

    it("Input.Toggle: visible <label for> AND aria-label/aria-labelledby must not all resolve to the same name", async () => {
        const container = await renderCardWith(() => buildLabelledInput("checkbox", "subscribe-input", "Subscribe"));
        expect(countAnnouncedSources(container, "subscribe-input", "Subscribe")).toBeLessThanOrEqual(1);
    });

    it("Input.ChoiceSet (expanded, non-radio checkbox style): visible <label for> AND aria-labelledby must not duplicate", async () => {
        // isMultiSelect: true on Input.ChoiceSet renders as <input type="checkbox">
        // wrapped exactly like the radio case the wrapper already handles, but
        // the wrapper's selector is scoped to input[type='radio'] so checkboxes
        // are not patched.
        const container = await renderCardWith(() =>
            buildLabelledInput("checkbox", "topics-1", "Updates")
        );
        expect(countAnnouncedSources(container, "topics-1", "Updates")).toBeLessThanOrEqual(1);
    });
});
