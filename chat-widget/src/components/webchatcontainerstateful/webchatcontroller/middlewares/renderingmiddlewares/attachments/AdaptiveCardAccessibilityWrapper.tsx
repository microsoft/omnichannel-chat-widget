import React, { useEffect, useRef } from "react";

/******
 * AdaptiveCardAccessibilityWrapper
 *
 * The `adaptivecards` renderer does not set `aria-setsize` or `aria-posinset`
 * on radio buttons rendered by Input.ChoiceSet (style: "expanded"). Without
 * these attributes, screen readers (TalkBack, VoiceOver, NVDA) cannot announce
 * the correct option count (e.g. "1 of 2") and may say "1 of 1" for every item.
 *
 * This wrapper observes the rendered card via MutationObserver and patches each
 * radio group with the correct ARIA attributes after the card finishes rendering.
 ******/


const AdaptiveCardAccessibilityWrapper: React.FC<{
    id?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    style?: any;
    children: React.ReactNode;
}> = ({ id, style, children }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const patchRadioGroups = () => {
            const container = containerRef.current;
            if (!container) return;

            // dropdown-double-label: compact Input.ChoiceSet renders as a native
            // <select> with both aria-labelledby and a sibling visible <label for>.
            // Only remove aria-labelledby when it points solely at that same visible
            // label; preserve composite labels that include required/error/context text.
            const compactSelects = container.querySelectorAll<HTMLSelectElement>(
                ".ac-input-container select.ac-input.ac-multichoiceInput[aria-labelledby]"
            );
            compactSelects.forEach((select) => {
                const id = select.id;
                if (!id) return;
                const visibleLabel = container.querySelector<HTMLLabelElement>(`label[for="${CSS.escape(id)}"]:not([aria-hidden='true'])`);
                const labelledBy = (select.getAttribute("aria-labelledby") || "").trim().split(/\s+/);
                if (visibleLabel?.id && labelledBy.length === 1 && labelledBy[0] === visibleLabel.id) {
                    select.removeAttribute("aria-labelledby");
                }
            });

            // action-button-toggle / login-button-toggle: submit/login action buttons can be
            // rendered with toggle-only ARIA that causes screen readers to announce them as
            // switches instead of plain push buttons. Preserve Action.ToggleVisibility buttons,
            // which own aria-controls and legitimately expose a pressed state.
            const actionButtons = container.querySelectorAll<HTMLElement>(
                ".ac-actionSet button.ac-pushButton:not([aria-controls])"
            );
            actionButtons.forEach((btn) => {
                if (btn.hasAttribute("aria-pressed")) {
                    btn.removeAttribute("aria-pressed");
                }
                const role = btn.getAttribute("role");
                if (role === "switch") {
                    btn.removeAttribute("role");
                }
            });

            // Find all radio inputs inside the adaptive card
            const radios = container.querySelectorAll("input[type='radio']");
            if (radios.length === 0) return;

            // Group radios by their name attribute (each ChoiceSet has a unique name)
            const groups = new Map<string, HTMLInputElement[]>();
            radios.forEach((radio) => {
                const name = radio.getAttribute("name") || "__default";
                if (!groups.has(name)) {
                    groups.set(name, []);
                }
                groups.get(name)?.push(radio as HTMLInputElement);
            });

            groups.forEach((radioInputs) => {
                const groupSize = radioInputs.length;
                radioInputs.forEach((radio, index) => {
                    radio.setAttribute("aria-setsize", String(groupSize));
                    radio.setAttribute("aria-posinset", String(index + 1));

                    // Ensure the parent container has radiogroup role
                    const parent = radio.closest("[role='radiogroup']") ||
                                   radio.closest(".ac-input-container");
                    if (parent && !parent.getAttribute("role")) {
                        parent.setAttribute("role", "radiogroup");
                    }

                    // The adaptive card renders each choice as:
                    //   <div style="display:flex">          ← flex wrapper
                    //     <input type="radio">
                    //     <div style="width:6px"></div>     ← spacer
                    //     <label><div><p>Text</p></div></label>
                    //   </div>
                    //
                    // TalkBack focuses on the <label> text node (just "Standard")
                    // instead of the <input>, so it never announces "radio button" or count.
                    //
                    // Fix: hide the label and spacer from the accessibility tree so TalkBack
                    // lands directly on the <input> which already has aria-label,
                    // aria-setsize and aria-posinset. The input's aria-labelledby still
                    // resolves the accessible name from the hidden label per ARIA spec.
                    const flexWrapper = radio.parentElement;
                    if (flexWrapper) {
                        // Hide label sibling — only set if not already applied to
                        // avoid re-triggering the attributeFilter observer in a loop
                        const label = flexWrapper.querySelector("label");
                        if (label && label.getAttribute("aria-hidden") !== "true") {
                            label.setAttribute("aria-hidden", "true");
                        }
                        // Hide spacer siblings (any non-input, non-label divs)
                        Array.from(flexWrapper.children).forEach((child) => {
                            const tag = child.tagName.toLowerCase();
                            if (tag !== "input" && tag !== "label" &&
                                child.getAttribute("aria-hidden") !== "true") {
                                child.setAttribute("aria-hidden", "true");
                            }
                        });

                        // TalkBack reads content-desc from the Android accessibility node,
                        // which Chrome populates from aria-label. However, aria-labelledby
                        // (set by the adaptive card renderer) takes precedence over aria-label.
                        // Since we hide the label (aria-hidden=true), Chrome can no longer
                        // resolve aria-labelledby and returns empty content-desc.
                        //
                        // Fix: remove aria-labelledby so Chrome falls back to aria-label,
                        // then encode the position count into aria-label so TalkBack announces
                        // e.g. "Standard, 1 of 2, radio button, not checked".
                        if (radio.hasAttribute("aria-labelledby")) {
                            radio.removeAttribute("aria-labelledby");
                        }
                        const labelText = label?.textContent?.trim() ||
                                          radio.getAttribute("aria-label") || "";
                        const expectedLabel = `${labelText}, ${index + 1} of ${groupSize}`;
                        if (radio.getAttribute("aria-label") !== expectedLabel) {
                            radio.setAttribute("aria-label", expectedLabel);
                        }
                    }
                });
            });
        };

        // Use MutationObserver to patch after WebChat finishes rendering the card.
        // Also watch attribute changes on aria-hidden so we can re-apply if React
        // reconciliation removes it from labels.
        const observer = new MutationObserver(() => {
            patchRadioGroups();
        });

        observer.observe(containerRef.current, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["aria-hidden"]
        });

        // Also run immediately in case the card is already rendered
        patchRadioGroups();

        return () => observer.disconnect();
    }, []);

    return (
        <div id={id} style={style} ref={containerRef}>
            {children}
        </div>
    );
};

export default AdaptiveCardAccessibilityWrapper;
