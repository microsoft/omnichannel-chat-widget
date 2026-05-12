/* eslint-disable @typescript-eslint/no-explicit-any */
import "@testing-library/jest-dom";

import * as utils from "../../common/utils";

import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";

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
 * The stateful pane should manage a polite aria-live region on focus changes
 * so previous text never carries forward. This DOM-level integration test
 * verifies the behavior by moving focus between options and asserting that the
 * live-region text is replaced with the focused option's label.
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
            <input type="checkbox" id="prechat-email" aria-label="Email updates" />
            <input type="checkbox" id="prechat-sms" />
            <label htmlFor="prechat-sms">SMS updates</label>
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

describe("PreChatSurveyPaneStateful — accessibility behavior (prechat-stale-live-region)", () => {
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

    it("prechat-stale-live-region: focused option label is written to the polite live region and replaces stale text", async () => {
        const { container } = render(
            <PreChatSurveyPaneStateful surveyProps={{}} initStartChat={jest.fn()} />
        );

        const liveRegion = container.querySelector("[role='status'][aria-live='polite']");
        const emailOption = container.querySelector("#prechat-email") as HTMLElement;
        const smsOption = container.querySelector("#prechat-sms") as HTMLElement;

        expect(liveRegion).not.toBeNull();

        fireEvent.focus(emailOption);
        await waitFor(() => expect(liveRegion).toHaveTextContent("Email updates"));

        fireEvent.focus(smsOption);
        await waitFor(() => expect(liveRegion).toHaveTextContent("SMS updates"));
        expect(liveRegion).not.toHaveTextContent("Email updates");
    });
});
