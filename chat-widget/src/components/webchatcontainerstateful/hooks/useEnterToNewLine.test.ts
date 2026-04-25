import { renderHook } from "@testing-library/react";
import useEnterToNewLine from "./useEnterToNewLine";

const makeSendBoxInput = (): HTMLTextAreaElement => {
    const input = document.createElement("textarea");
    input.setAttribute("data-id", "webchat-sendbox-input");
    document.body.appendChild(input);
    return input;
};

describe("useEnterToNewLine", () => {
    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("does not stop Enter propagation when disabled", () => {
        renderHook(() => useEnterToNewLine(false));
        const input = makeSendBoxInput();

        const event = new KeyboardEvent("keypress", { key: "Enter", bubbles: true, cancelable: true });
        const stopSpy = jest.spyOn(event, "stopPropagation");
        input.dispatchEvent(event);

        expect(stopSpy).not.toHaveBeenCalled();
    });

    it("does not stop Enter propagation when undefined", () => {
        renderHook(() => useEnterToNewLine(undefined));
        const input = makeSendBoxInput();

        const event = new KeyboardEvent("keypress", { key: "Enter", bubbles: true, cancelable: true });
        const stopSpy = jest.spyOn(event, "stopPropagation");
        input.dispatchEvent(event);

        expect(stopSpy).not.toHaveBeenCalled();
    });

    it("stops Enter propagation to prevent submit when enabled", () => {
        renderHook(() => useEnterToNewLine(true));
        const input = makeSendBoxInput();

        const event = new KeyboardEvent("keypress", { key: "Enter", bubbles: true, cancelable: true });
        const stopSpy = jest.spyOn(event, "stopPropagation");
        input.dispatchEvent(event);

        expect(stopSpy).toHaveBeenCalled();
    });

    it("prevents default on Shift+Enter and dispatches form submit when enabled", () => {
        renderHook(() => useEnterToNewLine(true));

        const form = document.createElement("form");
        const input = document.createElement("textarea");
        input.setAttribute("data-id", "webchat-sendbox-input");
        form.appendChild(input);
        document.body.appendChild(form);

        const submitHandler = jest.fn();
        form.addEventListener("submit", submitHandler);

        const event = new KeyboardEvent("keypress", {
            key: "Enter",
            shiftKey: true,
            bubbles: true,
            cancelable: true
        });
        const preventSpy = jest.spyOn(event, "preventDefault");
        input.dispatchEvent(event);

        expect(preventSpy).toHaveBeenCalled();
        expect(submitHandler).toHaveBeenCalled();
    });

    it("ignores non-Enter keys", () => {
        renderHook(() => useEnterToNewLine(true));
        const input = makeSendBoxInput();

        const event = new KeyboardEvent("keypress", { key: "a", bubbles: true, cancelable: true });
        const stopSpy = jest.spyOn(event, "stopPropagation");
        const preventSpy = jest.spyOn(event, "preventDefault");
        input.dispatchEvent(event);

        expect(stopSpy).not.toHaveBeenCalled();
        expect(preventSpy).not.toHaveBeenCalled();
    });

    it("ignores keypress events outside the send box", () => {
        renderHook(() => useEnterToNewLine(true));

        const other = document.createElement("input");
        document.body.appendChild(other);

        const event = new KeyboardEvent("keypress", { key: "Enter", bubbles: true, cancelable: true });
        const stopSpy = jest.spyOn(event, "stopPropagation");
        other.dispatchEvent(event);

        expect(stopSpy).not.toHaveBeenCalled();
    });

    it("removes listener on unmount", () => {
        const { unmount } = renderHook(() => useEnterToNewLine(true));
        const input = makeSendBoxInput();
        unmount();

        const event = new KeyboardEvent("keypress", { key: "Enter", bubbles: true, cancelable: true });
        const stopSpy = jest.spyOn(event, "stopPropagation");
        input.dispatchEvent(event);

        expect(stopSpy).not.toHaveBeenCalled();
    });
});
