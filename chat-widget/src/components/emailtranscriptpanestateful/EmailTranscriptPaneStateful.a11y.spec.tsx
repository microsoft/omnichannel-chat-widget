/* eslint-disable @typescript-eslint/no-explicit-any */
import "@testing-library/jest-dom";

import * as utils from "../../common/utils";

import { act, cleanup, render } from "@testing-library/react";

import { EmailTranscriptPaneStateful } from "./EmailTranscriptPaneStateful";
import { LiveChatWidgetActionType } from "../../contexts/common/LiveChatWidgetActionType";
import { NotificationHandler } from "../webchatcontainerstateful/webchatcontroller/notification/NotificationHandler";
import React from "react";

// jest.mock factories may only reference identifiers prefixed with `mock`. Hold
// the captured controlProps and shared state in mock-prefixed singletons.
const mockCapturedControlProps: { current: any } = { current: undefined };
const mockDispatch = jest.fn();
const mockFacadeChatSDK = { emailLiveChatTranscript: jest.fn() };
const mockState: { current: any } = { current: undefined };

jest.mock("@microsoft/omnichannel-chat-components", () => ({
    BroadcastService: {
        postMessage: jest.fn(),
        getMessageByEventName: jest.fn(() => ({
            subscribe: () => ({ unsubscribe: jest.fn() })
        }))
    },
    InputValidationPane: (props: any) => {
        mockCapturedControlProps.current = props.controlProps;
        return null;
    }
}));

jest.mock("../../hooks/useChatContextStore", () => ({
    __esModule: true,
    default: () => [mockState.current, mockDispatch]
}));

jest.mock("../../hooks/useFacadeChatSDKStore", () => ({
    __esModule: true,
    default: () => [mockFacadeChatSDK]
}));

jest.mock("../webchatcontainerstateful/webchatcontroller/notification/NotificationHandler");

const buildState = (overrides: Partial<any> = {}) => ({
    appStates: {
        previousElementIdOnFocusBeforeModalOpen: "previous-button",
        preChatResponseEmail: ""
    },
    domainStates: {
        liveChatContext: {},
        globalDir: "ltr",
        middlewareLocalizedTexts: {},
        ...overrides
    }
});

describe("EmailTranscriptPaneStateful — accessibility behavior", () => {
    let announceSpy: jest.SpyInstance;
    let setFocusOnElementSpy: jest.SpyInstance;
    let setFocusOnSendBoxSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        mockCapturedControlProps.current = undefined;
        mockState.current = buildState();

        announceSpy = jest.spyOn(utils, "announceMessageImmediately").mockImplementation(() => undefined);
        setFocusOnElementSpy = jest.spyOn(utils, "setFocusOnElement").mockImplementation(() => undefined);
        setFocusOnSendBoxSpy = jest.spyOn(utils, "setFocusOnSendBox").mockImplementation(() => undefined);
        jest.spyOn(utils, "preventFocusToMoveOutOfElement").mockImplementation(() => () => undefined);
        // Return null so the component skips focus({}) on a non-existent element.
        jest.spyOn(utils, "findAllFocusableElement").mockReturnValue(null as any);
        jest.spyOn(utils, "findParentFocusableElementsWithoutChildContainer").mockReturnValue([] as any);
        jest.spyOn(utils, "setTabIndices").mockImplementation(() => undefined);
        jest.spyOn(utils, "createTimer").mockReturnValue({ milliSecondsElapsed: 0 } as any);
    });

    afterEach(() => {
        cleanup();
        jest.restoreAllMocks();
    });

    const renderPane = (props: any = {}) => {
        render(<EmailTranscriptPaneStateful {...props} />);
        return mockCapturedControlProps.current;
    };

    describe("onSend success path", () => {
        it("announces with the default English 'Success. ' prefix when no localized override", async () => {
            mockFacadeChatSDK.emailLiveChatTranscript.mockResolvedValueOnce(undefined);
            const controlProps = renderPane();

            await act(async () => {
                await controlProps.onSend("user@example.com");
            });

            expect(announceSpy).toHaveBeenCalledTimes(1);
            expect(announceSpy).toHaveBeenCalledWith("Success. Email will be sent after chat ends!");
            expect(NotificationHandler.notifySuccess).toHaveBeenCalledTimes(1);
        });

        it("uses the localized SR success prefix when provided via middlewareLocalizedTexts", async () => {
            mockState.current.domainStates.middlewareLocalizedTexts = {
                MIDDLEWARE_SR_PREFIX_SUCCESS: "Succès. ",
                MIDDLEWARE_BANNER_FILE_EMAIL_ADDRESS_RECORDED_SUCCESS: "L'email sera envoyé."
            };
            mockFacadeChatSDK.emailLiveChatTranscript.mockResolvedValueOnce(undefined);
            const controlProps = renderPane();

            await act(async () => {
                await controlProps.onSend("user@example.com");
            });

            expect(announceSpy).toHaveBeenCalledWith("Succès. L'email sera envoyé.");
        });

        it("skips focus restore on submit so the notification banner takes focus", async () => {
            mockFacadeChatSDK.emailLiveChatTranscript.mockResolvedValueOnce(undefined);
            const controlProps = renderPane();

            await act(async () => {
                await controlProps.onSend("user@example.com");
            });

            expect(setFocusOnElementSpy).not.toHaveBeenCalled();
            expect(setFocusOnSendBoxSpy).not.toHaveBeenCalled();
            expect(mockDispatch).toHaveBeenCalledWith(
                expect.objectContaining({ type: LiveChatWidgetActionType.SET_SHOW_EMAIL_TRANSCRIPT_PANE, payload: false })
            );
        });
    });

    describe("onSend failure path", () => {
        it("announces with the default English 'Error. ' prefix and notifies error", async () => {
            mockFacadeChatSDK.emailLiveChatTranscript.mockRejectedValueOnce(new Error("boom"));
            const controlProps = renderPane();

            await act(async () => {
                await controlProps.onSend("user@example.com");
            });

            expect(announceSpy).toHaveBeenCalledTimes(1);
            expect(announceSpy).toHaveBeenCalledWith("Error. Email user@example.com could not be saved, try again later.");
            expect(NotificationHandler.notifyError).toHaveBeenCalledTimes(1);
        });

        it("uses the localized SR error prefix when provided", async () => {
            mockState.current.domainStates.middlewareLocalizedTexts = {
                MIDDLEWARE_SR_PREFIX_ERROR: "Erreur. ",
                MIDDLEWARE_BANNER_FILE_EMAIL_ADDRESS_RECORDED_ERROR: "Email {0} non enregistré."
            };
            mockFacadeChatSDK.emailLiveChatTranscript.mockRejectedValueOnce(new Error("boom"));
            const controlProps = renderPane();

            await act(async () => {
                await controlProps.onSend("user@example.com");
            });

            expect(announceSpy).toHaveBeenCalledWith("Erreur. Email user@example.com non enregistré.");
        });

        it("respects bannerMessageOnError prop when supplied", async () => {
            mockFacadeChatSDK.emailLiveChatTranscript.mockRejectedValueOnce(new Error("boom"));
            const controlProps = renderPane({ bannerMessageOnError: "Custom error copy." });

            await act(async () => {
                await controlProps.onSend("user@example.com");
            });

            expect(announceSpy).toHaveBeenCalledWith("Error. Custom error copy.");
            expect(NotificationHandler.notifyError).toHaveBeenCalledWith(expect.anything(), "Custom error copy.");
        });

        it("skips focus restore on submit failure so the error banner takes focus", async () => {
            mockFacadeChatSDK.emailLiveChatTranscript.mockRejectedValueOnce(new Error("boom"));
            const controlProps = renderPane();

            await act(async () => {
                await controlProps.onSend("user@example.com");
            });

            expect(setFocusOnElementSpy).not.toHaveBeenCalled();
            expect(setFocusOnSendBoxSpy).not.toHaveBeenCalled();
        });
    });

    describe("onCancel path", () => {
        it("restores focus to the previously focused element", () => {
            const controlProps = renderPane();

            act(() => {
                controlProps.onCancel();
            });

            expect(setFocusOnElementSpy).toHaveBeenCalledWith("#previous-button");
            expect(announceSpy).not.toHaveBeenCalled();
            expect(NotificationHandler.notifySuccess).not.toHaveBeenCalled();
            expect(NotificationHandler.notifyError).not.toHaveBeenCalled();
        });

        it("falls back to setFocusOnSendBox when no previous element id is stored", () => {
            mockState.current.appStates.previousElementIdOnFocusBeforeModalOpen = null;
            const controlProps = renderPane();

            act(() => {
                controlProps.onCancel();
            });

            expect(setFocusOnSendBoxSpy).toHaveBeenCalled();
            expect(setFocusOnElementSpy).not.toHaveBeenCalled();
        });
    });
});
