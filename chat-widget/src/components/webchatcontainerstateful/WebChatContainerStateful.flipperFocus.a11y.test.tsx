import "@testing-library/jest-dom";

import React from "react";
import WebChatContainerStateful from "./WebChatContainerStateful";
import { render } from "@testing-library/react";

jest.mock("../../common/telemetry/TelemetryHelper");
jest.mock("../..", () => ({
    useChatContextStore: () => [{ appStates: { isMinimized: true }, domainStates: {} }, jest.fn()]
}));
jest.mock("../../hooks/useFacadeChatSDKStore", () => () => [undefined]);
jest.mock("botframework-webchat", () => ({ Components: { BasicWebChat: () => null } }));

// AB#5410790 (MAS 2.4.7 Focus Visible): the suggested actions carousel Previous/Next
// buttons wrap a small dark circle. A 1px dashed ring around it was reported as not
// visible, so the default indicator must be a solid 2px ring.
const flipperFocusSelector = ".react-film__flipper:focus-visible .react-film__flipper__body";

const getFlipperFocusRule = (): string => {
    const css = Array.from(document.querySelectorAll("style")).map(s => s.textContent ?? "").join("\n");
    const start = css.indexOf(flipperFocusSelector);
    expect(start).toBeGreaterThan(-1);
    const end = css.indexOf("}", start);
    expect(end).toBeGreaterThan(start);
    return css.substring(start, end + 1);
};

const renderContainer = (webChatStyles?: Record<string, string>) => {
    const webChatContainerProps = webChatStyles ? { webChatStyles } : undefined;
    render(<WebChatContainerStateful webChatContainerProps={webChatContainerProps} /> as never);
};

describe("WebChatContainerStateful suggested actions flipper focus indicator", () => {
    it("renders a solid 2px focus ring by default so keyboard focus is visible", () => {
        renderContainer();

        const rule = getFlipperFocusRule();
        expect(rule).toContain("outline: solid 2px #605E5C !important;");
        expect(rule).toContain("outline-offset: 2px !important;");
    });

    it("honors customer focus indicator overrides", () => {
        renderContainer({
            suggestedActionKeyboardFocusIndicatorBorderStyle: "dotted",
            suggestedActionKeyboardFocusIndicatorBorderWidth: "3px",
            suggestedActionKeyboardFocusIndicatorBorderColor: "red",
            suggestedActionKeyboardFocusIndicatorInset: "4px"
        });

        const rule = getFlipperFocusRule();
        expect(rule).toContain("outline: dotted 3px red !important;");
        expect(rule).toContain("outline-offset: 4px !important;");
    });
});
