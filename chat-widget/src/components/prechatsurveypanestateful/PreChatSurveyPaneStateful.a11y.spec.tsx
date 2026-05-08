/* eslint-disable @typescript-eslint/no-explicit-any */
import "@testing-library/jest-dom";

import * as utils from "../../common/utils";

import { cleanup, render } from "@testing-library/react";

import { PreChatSurveyPaneStateful } from "./PreChatSurveyPaneStateful";
import React from "react";

/**
 * Repro catcher for prechat-stale-live-region — When focus moves onto a checkbox in the
 * prechat survey, Narrator announces the *previous* element's information
 * (e.g. the previously-typed text in the email field) before the checkbox
 * label. Symptom is consistent with a stale aria-live region (or polite
 * status node) inside the prechat pane that retains the previous focus
 * event's label and gets re-read on the next focus change.
 *
 * `PreChatSurveyPaneStateful.tsx` does not currently declare any aria-live
 * cleanup hook — `useEffect` only sets aria-label on inputs once and never
 * touches a status / live region.
 *
 * Fix path (proposed): the stateful pane should manage a polite
 * aria-live region (or call `announceMessageImmediately("")`) on
 * focus changes so previous text never carries forward.
 *
 * NOTE: This is a best-effort DOM-level catcher. Real verification needs
 * Narrator against a live prechat — see BUG_STATUS.md.
 */

const mockState: { current: any } = { current: undefined };
const mockDispatch = jest.fn();

jest.mock("@microsoft/omnichannel-chat-components", () => ({
    BroadcastService: {
        postMessage: jest.fn(),
        getMessageByEventName: jest.fn(() => ({ subscribe: () => ({ unsubscribe: jest.fn() }) }))
    },
    PreChatSurveyPane: (props: any) => (
        <div id={props.controlProps?.id} data-testid="prechat-pane">
            {/* Simulated rendered checkbox to exercise the live-region cleanup */}
            <input type="checkbox" id="prechat-consent" aria-label="I consent" />
            {/* Component is expected (after fix) to render a managed polite live region */}
        </div>
    )
}));

jest.mock("../../hooks/useChatContextStore", () => ({
    __esModule: true,
    default: () => [mockState.current, mockDispatch]
}));

const buildState = () => ({
    appStates: { isMinimized: false },
    domainStates: {
        globalDir: "ltr",
        widgetElementId: "oc-lcw",
        preChatSurveyResponse: JSON.stringify({ type: "AdaptiveCard", body: [] }),
        telemetryInternalData: { orgId: "o", widgetId: "w" },
        widgetInstanceId: "i"
    }
});

describe.skip("PreChatSurveyPaneStateful — accessibility behavior (prechat-stale-live-region)", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockState.current = buildState();
        jest.spyOn(utils, "createTimer").mockReturnValue({ milliSecondsElapsed: 0 } as any);
        jest.spyOn(utils, "findAllFocusableElement").mockReturnValue(null as any);
        jest.spyOn(utils, "parseAdaptiveCardPayload").mockReturnValue({} as any);
        jest.spyOn(utils, "getStateFromCache").mockReturnValue(undefined as any);
        jest.spyOn(utils, "extractPreChatSurveyResponseValues").mockReturnValue([] as any);
        jest.spyOn(utils, "isUndefinedOrEmpty").mockReturnValue(true);
        jest.spyOn(utils, "getWidgetCacheId").mockReturnValue("cache-id");
    });

    afterEach(() => {
        cleanup();
    });

    it("prechat-stale-live-region: prechat pane MUST own a managed polite live region (status / aria-live=polite) so previous focus text does not linger", () => {
        const { container } = render(
            <PreChatSurveyPaneStateful surveyProps={{}} initStartChat={jest.fn()} />
        );

        // Look anywhere inside the rendered pane for an aria-live cleanup
        // affordance: either an explicit role="status", an aria-live region,
        // or a hidden announcement node owned by the pane.
        const liveNodes = container.querySelectorAll(
            "[role='status'], [role='alert'], [aria-live='polite'], [aria-live='assertive']"
        );

        // Today the pane renders no managed live region — this assertion fails.
        expect(liveNodes.length).toBeGreaterThan(0);
    });
});
