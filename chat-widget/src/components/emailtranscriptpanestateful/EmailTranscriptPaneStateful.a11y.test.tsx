/* eslint-disable @typescript-eslint/no-explicit-any */

import "@testing-library/jest-dom";

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";

import { EmailTranscriptPaneStateful } from "./EmailTranscriptPaneStateful";
import React from "react";
import { announceForScreenReader } from "../../common/utils";
import useChatContextStore from "../../hooks/useChatContextStore";
import useFacadeChatSDKStore from "../../hooks/useFacadeChatSDKStore";

jest.mock("../../hooks/useChatContextStore");
jest.mock("../../hooks/useFacadeChatSDKStore");
jest.mock("../../common/telemetry/TelemetryHelper");
jest.mock("../dimlayer/DimLayer", () => ({ DimLayer: () => null }));
jest.mock("../webchatcontainerstateful/webchatcontroller/notification/NotificationHandler", () => ({
    NotificationHandler: { notifySuccess: jest.fn(), notifyError: jest.fn() }
}));

jest.mock("../../common/utils", () => ({
    createTimer: () => ({ milliSecondsElapsed: 100 }),
    findAllFocusableElement: () => [{ focus: jest.fn() }],
    findParentFocusableElementsWithoutChildContainer: () => [],
    formatTemplateString: (s: string) => s,
    preventFocusToMoveOutOfElement: jest.fn(),
    setFocusOnElement: jest.fn(),
    setFocusOnSendBox: jest.fn(),
    setTabIndices: jest.fn(),
    announceForScreenReader: jest.fn()
}));

// Capture the onSend handler the component wires into InputValidationPane.
jest.mock("@microsoft/omnichannel-chat-components", () => ({
    InputValidationPane: ({ controlProps }: any) => (
        <button data-testid="send-transcript" onClick={() => controlProps.onSend("customer@contoso.com")}>send</button>
    )
}));

const SUCCESS_TEXT = "Transcript was sent to your email.";

const mockUseChatContextStore = useChatContextStore as jest.MockedFunction<typeof useChatContextStore>;
const mockUseFacadeChatSDKStore = useFacadeChatSDKStore as jest.MockedFunction<typeof useFacadeChatSDKStore>;

const setup = (emailLiveChatTranscript: jest.Mock) => {
    const dispatch = jest.fn();
    const state: any = {
        domainStates: {
            globalDir: "ltr",
            liveChatContext: {},
            middlewareLocalizedTexts: { MIDDLEWARE_BANNER_FILE_EMAIL_ADDRESS_RECORDED_SUCCESS: SUCCESS_TEXT }
        },
        appStates: { previousElementIdOnFocusBeforeModalOpen: null, preChatResponseEmail: "" }
    };
    mockUseChatContextStore.mockReturnValue([state, dispatch] as any);
    mockUseFacadeChatSDKStore.mockReturnValue([{ emailLiveChatTranscript } as any, jest.fn()] as any);
};

describe("EmailTranscriptPaneStateful accessibility announcement", () => {
    afterEach(() => {
        cleanup();
        jest.clearAllMocks();
    });

    it("announces the success message to a screen reader after the transcript is sent", async () => {
        const emailLiveChatTranscript = jest.fn().mockResolvedValue(undefined);
        setup(emailLiveChatTranscript);

        render(<EmailTranscriptPaneStateful {...({} as any)} />);
        await act(async () => {
            fireEvent.click(screen.getByTestId("send-transcript"));
        });

        expect(emailLiveChatTranscript).toHaveBeenCalledTimes(1);
        expect(announceForScreenReader).toHaveBeenCalledWith(SUCCESS_TEXT);
    });

    it("does not announce success when sending the transcript fails", async () => {
        const emailLiveChatTranscript = jest.fn().mockRejectedValue(new Error("boom"));
        setup(emailLiveChatTranscript);

        render(<EmailTranscriptPaneStateful {...({} as any)} />);
        await act(async () => {
            fireEvent.click(screen.getByTestId("send-transcript"));
        });

        expect(announceForScreenReader).not.toHaveBeenCalled();
    });
});
