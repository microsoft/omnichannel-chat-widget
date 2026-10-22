import { useEffect } from "react";

const useEnterToNewLine = (enabled: boolean | undefined) => {
    useEffect(() => {
        if (!enabled) return;

        const handleKeyPress = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest("[data-id=\"webchat-sendbox-input\"]")) return;
            if (event.key !== "Enter") return;

            if (!event.shiftKey) {
                event.stopPropagation();
            } else {
                event.preventDefault();
                const form = target.closest("form");
                form?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
            }
        };

        document.addEventListener("keypress", handleKeyPress, true);
        return () => document.removeEventListener("keypress", handleKeyPress, true);
    }, [enabled]);
};

export default useEnterToNewLine;
