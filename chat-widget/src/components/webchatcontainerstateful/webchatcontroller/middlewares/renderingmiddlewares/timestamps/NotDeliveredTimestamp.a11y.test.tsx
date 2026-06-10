import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";

import React from "react";

jest.mock("botframework-webchat", () => ({
    hooks: {
        useFocus: () => () => undefined,
        usePostActivity: () => () => undefined,
    },
}));

jest.mock("../../../../../../hooks/useChatContextStore", () => ({
    __esModule: true,
    default: () => [
        {
            domainStates: {
                renderingMiddlewareProps: {},
                globalDir: "ltr",
                middlewareLocalizedTexts: undefined,
            },
        },
        () => undefined,
    ],
}));

import { NotDeliveredTimestamp } from "./NotDeliveredTimestamp";

describe("NotDeliveredTimestamp retry control accessibility", () => {
    /**
     * Bug #7 (CHANGE_LOG [Unreleased]): retry must be a native <button>, not a
     * <span role="button">. A native button gets the right SR semantics, focus,
     * Enter/Space activation, and high-contrast outlines for free.
     */
    it("renders the retry control as a native <button> element", () => {
        const args = {
            activity: {
                timestamp: new Date().toISOString(),
                channelData: { clientActivityID: "abc" },
            },
        };

        render(<NotDeliveredTimestamp args={args} /> as never);

        const retry = screen.getByText("Retry");
        expect(retry.tagName).toBe("BUTTON");
        expect(retry.getAttribute("role")).toBeNull();
    });
});
