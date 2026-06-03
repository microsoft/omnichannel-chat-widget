/* eslint-disable @typescript-eslint/no-explicit-any */
import "@testing-library/jest-dom";

import * as utils from "../../common/utils";

import { cleanup, render } from "@testing-library/react";

import { PreChatSurveyPaneStateful } from "./PreChatSurveyPaneStateful";
import React from "react";

/**
 * Verifies the focus-capture wrapper around <PreChatSurveyPane> carries
 * `width: 100%; height: 100%` so the inner pane (which uses
 * `width: inherit; height: inherit`) receives the surrounding chat
 * container's dimensions instead of collapsing to its intrinsic
 * content size.
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

describe("PreChatSurveyPaneStateful — focus-capture wrapper sizing", () => {
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

        // PreChatSurveyPane uses width: inherit / height: inherit, so the
        // wrapper must declare explicit 100% dimensions for the inner pane
        // to fill the chat container.
        expect(wrapper.style.width).toBe("100%");
        expect(wrapper.style.height).toBe("100%");
    });
});
