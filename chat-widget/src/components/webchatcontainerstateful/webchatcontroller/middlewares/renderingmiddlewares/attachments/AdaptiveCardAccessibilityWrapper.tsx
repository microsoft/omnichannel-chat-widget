import React, { useEffect, useRef } from "react";

/**
 * Wraps an adaptive card and patches radio button groups with correct
 * ARIA attributes (role="radiogroup", aria-setsize, aria-posinset) after
 * the card renders, so screen readers announce the correct option count.
 */
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
                });
            });
        };

        // Use MutationObserver to patch after WebChat finishes rendering the card
        const observer = new MutationObserver(() => {
            patchRadioGroups();
        });

        observer.observe(containerRef.current, {
            childList: true,
            subtree: true
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
