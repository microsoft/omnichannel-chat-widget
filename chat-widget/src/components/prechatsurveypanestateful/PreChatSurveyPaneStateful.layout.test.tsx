/* eslint-disable @typescript-eslint/no-explicit-any */
import "@testing-library/jest-dom";

import * as utils from "../../common/utils";

import { cleanup, render } from "@testing-library/react";

import { PreChatSurveyPaneStateful } from "./PreChatSurveyPaneStateful";
import React from "react";

/**
 * Regression test for Bug 6423684 — Pre-chat pane rendered collapsed to its
 * intrinsic content size after PR #929 wrapped <PreChatSurveyPane> in a new
 * <div onFocusCapture> to host the polite live region. The inner pane's
 * `height: inherit; width: inherit` resolved against `auto` because the
 * wrapper had no width/height, so the surrounding chat-container sizing
 * chain was broken and the survey shrank.
 *
 * The wrapper must carry `width: 100%; height: 100%` so the inherited
 * sizing chain reaches the inner <PreChatSurveyPane>.
 */

const mockState: { current: any } = { current: undefined };
const mockDispatch = jest.fn();

jest.mock("@microsoft/omnichannel-chat-components", () => ({
    BroadcastService: {
        postMessage: jest.fn(),
        getMessageByEventName: jest.fn(() => ({ subscribe: () => ({ unsubscribe: jest.fn() }) }))
    },
    PreChatSurveyPane: (props: any) => (
        <div id={props.controlProps?.id} data-testid="prechat-pane" />
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

describe("PreChatSurveyPaneStateful — layout regression (Bug 6423684)", () => {
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

    it("focus-capture wrapper preserves inherited sizing with width:100% and height:100%", () => {
        const { container } = render(
            <PreChatSurveyPaneStateful surveyProps={{}} initStartChat={jest.fn()} />
        );

        const innerPane = container.querySelector("[data-testid='prechat-pane']") as HTMLElement;
        expect(innerPane).not.toBeNull();

        // The wrapper is the parent of the rendered PreChatSurveyPane.
        const wrapper = innerPane.parentElement as HTMLElement;
        expect(wrapper).not.toBeNull();

        // Without these styles the pane collapses to its intrinsic content
        // size because PreChatSurveyPane uses height: inherit / width: inherit.
        expect(wrapper.style.width).toBe("100%");
        expect(wrapper.style.height).toBe("100%");
    });
});
