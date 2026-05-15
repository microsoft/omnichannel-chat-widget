/* eslint-disable @typescript-eslint/no-explicit-any */
import "@testing-library/jest-dom";

import * as utils from "../../common/utils";

import { cleanup, render } from "@testing-library/react";

import { ConfirmationPaneStateful } from "./ConfirmationPaneStateful";
import { CitationPaneStateful } from "../citationpanestateful/CitationPaneStateful";
import { EmailTranscriptPaneStateful } from "../emailtranscriptpanestateful/EmailTranscriptPaneStateful";
import React from "react";

/**
 * Regression-guard catcher for internal tracking (focus trap after page reload).
 *
 * The production repro path requires a modal pane (Confirmation, Citation,
 * EmailTranscript) to be open across a page reload — the persistent-storage
 * rehydrate restores the pane, the pane re-installs its focus trap via
 * `preventFocusToMoveOutOfElement`, but if the trap is *not* paired with a
 * matching cleanup the trap will outlive the pane and Tab will be trapped
 * inside the now-stale region (matching the bug report: "focus trapped in
 * Live Chat after link activation + page reload").
 *
 * Designer-mode E2E (focusTrapAfterReload.spec.ts) cannot exercise the real
 * rehydrate path. This unit catcher pins the invariant that the most
 * likely fix-regression source — a pane forgetting to `return cleanup`
 * from its focus-trap effect — fails loudly here.
 *
 * The contract under test:
 *   1. On mount, the pane MUST call `preventFocusToMoveOutOfElement` so a
 *      focus trap is installed for the modal lifetime.
 *   2. On unmount, the cleanup function returned by
 *      `preventFocusToMoveOutOfElement` MUST be invoked, releasing the
 *      Tab/Shift+Tab keydown listeners on the pane's first/last focusable
 *      elements. Without this, listeners outlive the pane and trap focus
 *      in stale DOM after the pane is torn down (e.g. on rehydrate).
 */

const mockDispatch = jest.fn();
const mockState: { current: any } = { current: undefined };
const mockFacadeChatSDK = { emailLiveChatTranscript: jest.fn() };

jest.mock("@microsoft/omnichannel-chat-components", () => ({
    BroadcastService: {
        postMessage: jest.fn(),
        getMessageByEventName: jest.fn(() => ({
            subscribe: () => ({ unsubscribe: jest.fn() })
        }))
    },
    ConfirmationPane: () => null,
    CitationPane: () => null,
    InputValidationPane: () => null
}));

jest.mock("../../hooks/useChatContextStore", () => ({
    __esModule: true,
    default: () => [mockState.current, mockDispatch]
}));

jest.mock("../../hooks/useFacadeChatSDKStore", () => ({
    __esModule: true,
    default: () => [mockFacadeChatSDK]
}));

jest.mock("../dimlayer/DimLayer", () => ({
    DimLayer: () => null
}));

jest.mock("../citationpanestateful/CitationDim", () => ({
    __esModule: true,
    default: () => null
}));

const buildState = () => ({
    appStates: {
        previousElementIdOnFocusBeforeModalOpen: "previous-button",
        preChatResponseEmail: ""
    },
    domainStates: {
        liveChatContext: {},
        globalDir: "ltr",
        middlewareLocalizedTexts: {}
    }
});

interface PaneCase {
    name: string;
    render: () => { unmount: () => void };
}

describe("Modal-pane focus traps must release on unmount (internal tracking regression guard)", () => {
    let preventSpy: jest.SpyInstance;
    let trapCleanups: jest.Mock[];

    beforeEach(() => {
        jest.clearAllMocks();
        mockState.current = buildState();
        trapCleanups = [];

        // Capture each call's cleanup so we can assert it ran on unmount.
        preventSpy = jest.spyOn(utils, "preventFocusToMoveOutOfElement")
            .mockImplementation(() => {
                const c = jest.fn();
                trapCleanups.push(c);
                return c;
            });
        jest.spyOn(utils, "findAllFocusableElement").mockReturnValue(null as any);
        jest.spyOn(utils, "findParentFocusableElementsWithoutChildContainer").mockReturnValue([] as any);
        jest.spyOn(utils, "setTabIndices").mockImplementation(() => undefined);
        jest.spyOn(utils, "createTimer").mockReturnValue({ milliSecondsElapsed: 0 } as any);
        jest.spyOn(utils, "setFocusOnElement").mockImplementation(() => undefined);
        jest.spyOn(utils, "setFocusOnSendBox").mockImplementation(() => undefined);
        jest.spyOn(utils, "announceMessageImmediately").mockImplementation(() => undefined);
    });

    afterEach(() => {
        cleanup();
        jest.restoreAllMocks();
    });

    const cases: PaneCase[] = [
        {
            name: "ConfirmationPaneStateful",
            render: () => render(<ConfirmationPaneStateful />)
        },
        {
            name: "CitationPaneStateful",
            render: () => render(
                <CitationPaneStateful
                    id="ocw-citation-pane"
                    title="Citation"
                    contentHtml="<p>cite</p>"
                    onClose={() => undefined}
                />
            )
        },
        {
            name: "EmailTranscriptPaneStateful",
            render: () => render(<EmailTranscriptPaneStateful />)
        }
    ];

    for (const c of cases) {
        describe(c.name, () => {
            it("installs a focus trap on mount and releases it on unmount", () => {
                const { unmount } = c.render();

                // 1. The pane MUST install a focus trap on mount.
                expect(preventSpy).toHaveBeenCalled();
                expect(trapCleanups.length).toBeGreaterThanOrEqual(1);

                const installedCleanup = trapCleanups[trapCleanups.length - 1];
                expect(installedCleanup).not.toHaveBeenCalled();

                // 2. On unmount, the cleanup MUST run — otherwise the Tab
                //    handlers outlive the pane and trap focus in stale DOM.
                unmount();
                expect(installedCleanup).toHaveBeenCalledTimes(1);
            });
        });
    }

    it("multiple mount/unmount cycles do not leak trap cleanups", () => {
        // Simulates the rehydrate scenario: pane comes and goes across
        // reload-equivalent state transitions. Every install must be
        // matched by a release; otherwise stale Tab handlers accumulate
        // on the document and Tab is trapped after the pane is gone.
        const r1 = render(<ConfirmationPaneStateful />);
        r1.unmount();

        const r2 = render(<ConfirmationPaneStateful />);
        r2.unmount();

        const r3 = render(<ConfirmationPaneStateful />);
        r3.unmount();

        expect(trapCleanups.length).toBe(3);
        for (const c of trapCleanups) {
            expect(c).toHaveBeenCalledTimes(1);
        }
    });
});
