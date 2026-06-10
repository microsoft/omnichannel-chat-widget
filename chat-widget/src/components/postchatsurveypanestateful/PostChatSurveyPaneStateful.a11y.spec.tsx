/* eslint-disable @typescript-eslint/no-explicit-any */
import "@testing-library/jest-dom";

import * as utils from "../../common/utils";

import { cleanup, render } from "@testing-library/react";

import { PostChatSurveyPaneStateful } from "./PostChatSurveyPaneStateful";
import React from "react";

/**
 * Repro catcher for postchat-iframe-title — Postchat survey textbox accessible name
 * is wrong: NVDA announces "Please give feedback * Required..." (the raw
 * Customer Voice question + required marker concatenated) instead of just
 * the question text. The textbox lives inside an iframe (Customer Voice),
 * so the only accessible-name source we control from this side is the
 * iframe's `title` attribute.
 *
 * `PostChatSurveyPaneStateful` renders the PostChatSurveyPane component
 * with `surveyURL` only — no `title` is propagated. The iframe therefore
 * has no accessible name, and screen readers may fall back to the survey
 * URL or the document title which is unhelpful.
 *
 * Fix path: ensure the stateful pane sets a `title` on the survey
 * iframe (e.g. "Post-chat survey") so screen readers announce a stable,
 * meaningful frame name independent of the in-iframe field labels.
 *
 * NOTE: This is a best-effort catcher — true verification requires
 * NVDA against a Customer Voice survey. See BUG_STATUS.md.
 */

const mockCapturedControlProps: { current: any } = { current: undefined };
const mockState: { current: any } = { current: undefined };
const mockDispatch = jest.fn();

jest.mock("@microsoft/omnichannel-chat-components", () => ({
    BroadcastService: {
        postMessage: jest.fn(),
        getMessageByEventName: jest.fn(() => ({ subscribe: () => ({ unsubscribe: jest.fn() }) }))
    },
    PostChatSurveyPane: (props: any) => {
        mockCapturedControlProps.current = props.controlProps;
        return (
            <iframe
                id={props.controlProps?.id}
                title={props.controlProps?.title}
                src={props.controlProps?.surveyURL || "about:blank"}
            />
        );
    }
}));

jest.mock("../../hooks/useChatContextStore", () => ({
    __esModule: true,
    default: () => [mockState.current, mockDispatch]
}));

jest.mock("./common/isValidSurveyUrl", () => ({
    __esModule: true,
    default: () => true
}));

const buildState = () => ({
    appStates: {
        isMinimized: false,
        selectedSurveyMode: 0,
        postChatParticipantType: "Bot"
    },
    domainStates: {
        globalDir: "ltr",
        postChatContext: {
            botSurveyInviteLink: "https://customervoice.example/survey?id=1",
            botFormsProLocale: "en-us",
            surveyInviteLink: "https://customervoice.example/survey?id=2",
            formsProLocale: "en-us"
        }
    }
});

describe("PostChatSurveyPaneStateful — accessibility behavior (postchat-iframe-title)", () => {
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

    it("postchat-iframe-title: post-chat survey iframe MUST carry a stable `title` so screen readers announce a meaningful frame name", () => {
        const { container } = render(
            <PostChatSurveyPaneStateful
                customerVoiceSurveyCorrelationId="abc"
                isCustomerVoiceSurveyCompact={true}
            />
        );

        const cp = mockCapturedControlProps.current;
        expect(cp).toBeDefined();
        // After fix: the stateful component must propagate a non-empty
        // accessible-name affordance through to the iframe.
        const title = (cp?.title || "").trim();
        expect(title.length).toBeGreaterThan(0);

        const iframe = container.querySelector("iframe");
        expect(iframe).not.toBeNull();
        expect((iframe?.getAttribute("title") || "").trim().length).toBeGreaterThan(0);
    });
});
