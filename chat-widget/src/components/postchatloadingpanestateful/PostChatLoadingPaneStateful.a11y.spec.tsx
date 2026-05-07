/* eslint-disable @typescript-eslint/no-explicit-any */
import "@testing-library/jest-dom";

import * as utils from "../../common/utils";

import { cleanup, render } from "@testing-library/react";

import { PostChatLoadingPaneStateful } from "./PostChatLoadingPaneStateful";
import React from "react";

/**
 * Repro catcher for loading-pane-status — "Please take a moment..." text is not
 * announced by screen readers while the post-chat feedback pane is loading.
 *
 * Root cause (repro): PostChatLoadingPaneStateful builds `controlProps` for
 * the shared `LoadingPane` but does NOT set `controlProps.role`. Without
 * `role="status"` (or any aria-live wiring), the subtitle text is rendered
 * as ordinary text and screen readers do not announce it on mount.
 *
 * Fix path: set `role: "status"` (or equivalent) on the LoadingPane
 * controlProps so the subtitle becomes a polite live region.
 */

const mockCapturedControlProps: { current: any } = { current: undefined };
const mockState: { current: any } = { current: undefined };
const mockDispatch = jest.fn();

jest.mock("@microsoft/omnichannel-chat-components", () => ({
    BroadcastService: {
        postMessage: jest.fn(),
        getMessageByEventName: jest.fn(() => ({
            subscribe: () => ({ unsubscribe: jest.fn() })
        }))
    },
    LoadingPane: (props: any) => {
        mockCapturedControlProps.current = props.controlProps;
        return (
            <div
                id={props.controlProps?.id}
                role={props.controlProps?.role}
                aria-live={props.controlProps?.["aria-live"]}
            >
                <span id={`${props.controlProps?.id}-subtitle`}>
                    {props.controlProps?.subtitleText}
                </span>
            </div>
        );
    }
}));

jest.mock("../../hooks/useChatContextStore", () => ({
    __esModule: true,
    default: () => [mockState.current, mockDispatch]
}));

const buildState = () => ({
    appStates: {},
    domainStates: {
        globalDir: "ltr",
        widgetElementId: "oc-lcw"
    }
});

describe("PostChatLoadingPaneStateful — accessibility behavior", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCapturedControlProps.current = undefined;
        mockState.current = buildState();
        jest.spyOn(utils, "createTimer").mockReturnValue({ milliSecondsElapsed: 0 } as any);
        jest.spyOn(utils, "findAllFocusableElement").mockReturnValue(null as any);
    });

    afterEach(() => {
        cleanup();
    });

    it("loading-pane-status: subtitle is rendered (sanity)", () => {
        const { container } = render(<PostChatLoadingPaneStateful />);
        const subtitle = container.querySelector("#oc-lcw-postchatloading-pane-subtitle");
        expect(subtitle).not.toBeNull();
        expect(subtitle?.textContent || "").toMatch(/please take a moment/i);
    });

    it("loading-pane-status: LoadingPane controlProps MUST carry live-region semantics (role/aria-live) so subtitle is announced", () => {
        render(<PostChatLoadingPaneStateful />);

        const cp = mockCapturedControlProps.current;
        expect(cp).toBeDefined();

        const role = cp?.role;
        const ariaLive = cp?.["aria-live"];
        const hasLiveRegion =
            role === "status" ||
            role === "alert" ||
            ariaLive === "polite" ||
            ariaLive === "assertive";

        // Reproduces the bug: no live-region wiring is set today, so this fails.
        expect(hasLiveRegion).toBe(true);
    });
});
