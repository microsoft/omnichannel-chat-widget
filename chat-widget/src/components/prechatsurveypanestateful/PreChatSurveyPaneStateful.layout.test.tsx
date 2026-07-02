/* eslint-disable @typescript-eslint/no-explicit-any */
import "@testing-library/jest-dom";

import * as utils from "../../common/utils";

import { cleanup, render } from "@testing-library/react";

import { PreChatSurveyPaneStateful } from "./PreChatSurveyPaneStateful";
import React from "react";

/**
 * Verifies the focus-capture wrapper around <PreChatSurveyPane> fills the
 * space remaining below the header instead of the entire chat container.
 *
 * Regression coverage:
 *  - Bug 6423684: wrapper must give the inner pane (width/height: inherit ->
 *    100%) a real size so it does not collapse to intrinsic content height.
 *  - Bug 6525143: wrapper must NOT declare height: 100% (which resolves to the
 *    whole centered flex-column container and clips the header's top edge); it
 *    must instead flex to fill only the leftover space (flex: 1 1 auto).
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

    it("focus-capture wrapper fills remaining space via flex without clipping the header (Bug 6525143 / Bug 6423684)", () => {
        const { container } = render(
            <PreChatSurveyPaneStateful surveyProps={{}} initStartChat={jest.fn()} />
        );

        const innerPane = container.querySelector("[data-testid='prechat-pane']") as HTMLElement;
        expect(innerPane).not.toBeNull();

        // The wrapper is the parent of the rendered PreChatSurveyPane.
        const wrapper = innerPane.parentElement as HTMLElement;
        expect(wrapper).not.toBeNull();

        // Full width is preserved.
        expect(wrapper.style.width).toBe("100%");

        // Bug 6525143: the wrapper must NOT hardcode height: 100% (that resolves to
        // the whole centered container and clips the header). It fills only the
        // remaining space as a flex column instead.
        expect(wrapper.style.height).toBe("");
        expect(wrapper.style.flex).toBe("1 1 auto");
        expect(wrapper.style.minHeight).toMatch(/^0(px)?$/);
        expect(wrapper.style.display).toBe("flex");
        expect(wrapper.style.flexDirection).toBe("column");
    });
});
