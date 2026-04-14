/* eslint-disable @typescript-eslint/no-explicit-any */

import "@testing-library/jest-dom";

import { act, cleanup, render } from "@testing-library/react";

import AdaptiveCardAccessibilityWrapper from "./AdaptiveCardAccessibilityWrapper";
import React from "react";

// jsdom does not implement MutationObserver fully — provide a minimal shim
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
            observerInstance = this;
        }
    };
});

afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
});

// Helper: build the DOM structure that adaptivecards renders for a radio button
const buildRadioDOM = (name: string, value: string, labelText: string, ariaLabelledBy: string): HTMLElement => {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = name;
    input.value = value;
    input.setAttribute("aria-labelledby", ariaLabelledBy);
    input.setAttribute("aria-label", labelText);

    const spacer = document.createElement("div");
    spacer.style.width = "6px";

    const label = document.createElement("label");
    label.id = ariaLabelledBy;
    const inner = document.createElement("div");
    inner.textContent = labelText;
    label.appendChild(inner);

    wrapper.appendChild(input);
    wrapper.appendChild(spacer);
    wrapper.appendChild(label);
    return wrapper;
};

describe("AdaptiveCardAccessibilityWrapper", () => {
    describe("Rendering", () => {
        it("should render children inside a div", () => {
            const { container } = render(
                <AdaptiveCardAccessibilityWrapper>
                    <span data-testid="child">content</span>
                </AdaptiveCardAccessibilityWrapper>
            );
            expect(container.querySelector("[data-testid='child']")).toBeInTheDocument();
        });

        it("should forward id and style props to the wrapper div", () => {
            const { container } = render(
                <AdaptiveCardAccessibilityWrapper id="card-1" style={{ color: "red" }}>
                    <span>content</span>
                </AdaptiveCardAccessibilityWrapper>
            );
            const div = container.firstChild as HTMLElement;
            expect(div).toHaveAttribute("id", "card-1");
            expect(div).toHaveStyle({ color: "red" });
        });
    });

    describe("MutationObserver lifecycle", () => {
        it("should attach MutationObserver on mount", () => {
            render(
                <AdaptiveCardAccessibilityWrapper>
                    <div />
                </AdaptiveCardAccessibilityWrapper>
            );
            expect(observerInstance.observe).toHaveBeenCalledWith(
                expect.any(HTMLElement),
                expect.objectContaining({
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ["aria-hidden"]
                })
            );
        });

        it("should disconnect MutationObserver on unmount", () => {
            const { unmount } = render(
                <AdaptiveCardAccessibilityWrapper>
                    <div />
                </AdaptiveCardAccessibilityWrapper>
            );
            unmount();
            expect(observerInstance.disconnect).toHaveBeenCalled();
        });
    });

    describe("Radio group patching", () => {
        it("should set aria-setsize and aria-posinset on each radio in a group", async () => {
            const { container } = render(
                <AdaptiveCardAccessibilityWrapper>
                    <div className="ac-input-container" />
                </AdaptiveCardAccessibilityWrapper>
            );

            const acContainer = container.querySelector(".ac-input-container") as HTMLElement;

            await act(async () => {
                acContainer.appendChild(buildRadioDOM("priority", "standard", "Standard", "lbl-standard"));
                acContainer.appendChild(buildRadioDOM("priority", "urgent", "Urgent", "lbl-urgent"));
                observerInstance.trigger();
            });

            const radios = container.querySelectorAll("input[type='radio']");
            expect(radios).toHaveLength(2);
            expect(radios[0]).toHaveAttribute("aria-setsize", "2");
            expect(radios[0]).toHaveAttribute("aria-posinset", "1");
            expect(radios[1]).toHaveAttribute("aria-setsize", "2");
            expect(radios[1]).toHaveAttribute("aria-posinset", "2");
        });

        it("should remove aria-labelledby from each radio input", async () => {
            const { container } = render(
                <AdaptiveCardAccessibilityWrapper>
                    <div className="ac-input-container" />
                </AdaptiveCardAccessibilityWrapper>
            );

            const acContainer = container.querySelector(".ac-input-container") as HTMLElement;

            await act(async () => {
                acContainer.appendChild(buildRadioDOM("priority", "standard", "Standard", "lbl-standard"));
                acContainer.appendChild(buildRadioDOM("priority", "urgent", "Urgent", "lbl-urgent"));
                observerInstance.trigger();
            });

            const radios = container.querySelectorAll("input[type='radio']");
            radios.forEach(r => {
                expect(r).not.toHaveAttribute("aria-labelledby");
            });
        });

        it("should encode position count into aria-label for TalkBack", async () => {
            const { container } = render(
                <AdaptiveCardAccessibilityWrapper>
                    <div className="ac-input-container" />
                </AdaptiveCardAccessibilityWrapper>
            );

            const acContainer = container.querySelector(".ac-input-container") as HTMLElement;

            await act(async () => {
                acContainer.appendChild(buildRadioDOM("priority", "standard", "Standard", "lbl-standard"));
                acContainer.appendChild(buildRadioDOM("priority", "urgent", "Urgent", "lbl-urgent"));
                observerInstance.trigger();
            });

            const radios = container.querySelectorAll("input[type='radio']");
            expect(radios[0]).toHaveAttribute("aria-label", "Standard, 1 of 2");
            expect(radios[1]).toHaveAttribute("aria-label", "Urgent, 2 of 2");
        });

        it("should hide sibling label via aria-hidden", async () => {
            const { container } = render(
                <AdaptiveCardAccessibilityWrapper>
                    <div className="ac-input-container" />
                </AdaptiveCardAccessibilityWrapper>
            );

            const acContainer = container.querySelector(".ac-input-container") as HTMLElement;

            await act(async () => {
                acContainer.appendChild(buildRadioDOM("priority", "standard", "Standard", "lbl-standard"));
                observerInstance.trigger();
            });

            const label = container.querySelector("label");
            expect(label).toHaveAttribute("aria-hidden", "true");
        });

        it("should hide spacer siblings via aria-hidden", async () => {
            const { container } = render(
                <AdaptiveCardAccessibilityWrapper>
                    <div className="ac-input-container" />
                </AdaptiveCardAccessibilityWrapper>
            );

            const acContainer = container.querySelector(".ac-input-container") as HTMLElement;

            await act(async () => {
                acContainer.appendChild(buildRadioDOM("priority", "standard", "Standard", "lbl-standard"));
                observerInstance.trigger();
            });

            // The spacer div (not input, not label) should be aria-hidden
            const flexWrapper = container.querySelector("input[type='radio']")?.parentElement;
            const spacer = Array.from(flexWrapper?.children ?? []).find(
                c => c.tagName.toLowerCase() === "div"
            );
            expect(spacer).toHaveAttribute("aria-hidden", "true");
        });

        it("should handle multiple independent ChoiceSets (different name attributes)", async () => {
            const { container } = render(
                <AdaptiveCardAccessibilityWrapper>
                    <div className="ac-input-container" />
                </AdaptiveCardAccessibilityWrapper>
            );

            const acContainer = container.querySelector(".ac-input-container") as HTMLElement;

            await act(async () => {
                // ChoiceSet 1 — 2 options
                acContainer.appendChild(buildRadioDOM("set1", "a", "Option A", "lbl-a"));
                acContainer.appendChild(buildRadioDOM("set1", "b", "Option B", "lbl-b"));
                // ChoiceSet 2 — 3 options
                acContainer.appendChild(buildRadioDOM("set2", "x", "Option X", "lbl-x"));
                acContainer.appendChild(buildRadioDOM("set2", "y", "Option Y", "lbl-y"));
                acContainer.appendChild(buildRadioDOM("set2", "z", "Option Z", "lbl-z"));
                observerInstance.trigger();
            });

            const set1Radios = container.querySelectorAll("input[name='set1']");
            const set2Radios = container.querySelectorAll("input[name='set2']");

            expect(set1Radios[0]).toHaveAttribute("aria-setsize", "2");
            expect(set1Radios[1]).toHaveAttribute("aria-setsize", "2");
            expect(set1Radios[0]).toHaveAttribute("aria-label", "Option A, 1 of 2");
            expect(set1Radios[1]).toHaveAttribute("aria-label", "Option B, 2 of 2");

            expect(set2Radios[0]).toHaveAttribute("aria-setsize", "3");
            expect(set2Radios[2]).toHaveAttribute("aria-setsize", "3");
            expect(set2Radios[0]).toHaveAttribute("aria-label", "Option X, 1 of 3");
            expect(set2Radios[2]).toHaveAttribute("aria-label", "Option Z, 3 of 3");
        });

        it("should not re-patch aria-label if already correct (prevents infinite observer loop)", async () => {
            const { container } = render(
                <AdaptiveCardAccessibilityWrapper>
                    <div className="ac-input-container" />
                </AdaptiveCardAccessibilityWrapper>
            );

            const acContainer = container.querySelector(".ac-input-container") as HTMLElement;

            await act(async () => {
                acContainer.appendChild(buildRadioDOM("priority", "standard", "Standard", "lbl-standard"));
                observerInstance.trigger();
            });

            const radio = container.querySelector("input[type='radio']") as HTMLInputElement;
            const setAttributeSpy = jest.spyOn(radio, "setAttribute");

            await act(async () => {
                // Trigger observer again — patch is already correct, should skip setAttribute
                observerInstance.trigger();
            });

            // aria-label is already "Standard, 1 of 1" — setAttribute should NOT be called again
            const ariaLabelCalls = setAttributeSpy.mock.calls.filter(c => c[0] === "aria-label");
            expect(ariaLabelCalls).toHaveLength(0);
        });

        it("should do nothing when there are no radio inputs", async () => {
            const { container } = render(
                <AdaptiveCardAccessibilityWrapper>
                    <div className="ac-input-container">
                        <input type="text" />
                    </div>
                </AdaptiveCardAccessibilityWrapper>
            );

            await act(async () => {
                observerInstance.trigger();
            });

            // No errors, no radio patches
            expect(container.querySelectorAll("input[aria-setsize]")).toHaveLength(0);
        });
    });
});
