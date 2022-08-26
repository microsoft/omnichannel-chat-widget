import "@testing-library/jest-dom/extend-expect";

import * as ReactDOM from "react-dom";

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";

import ConfirmationPane from "./ConfirmationPane";
import { IConfirmationPaneProps } from "./interfaces/IConfirmationPaneProps";
import React from "react";
import { defaultConfirmationPaneProps } from "./common/defaultProps/defaultConfirmationPaneProps";
import { BroadcastServiceInitialize } from "../../services/BroadcastService";

beforeAll(() => {
    BroadcastServiceInitialize("testChannel");
});

describe("Confirmation Pane component", () => {

    afterEach(() => {
        cleanup;
        jest.resetAllMocks();
    });
    
    act(() => {
        it("renders confirmation pane", () => {
            const container = document.createElement("div");
            ReactDOM.render(
                <ConfirmationPane {...defaultConfirmationPaneProps}/>, container);
            expect(container.childElementCount).toBe(1);
        });
    });

    act(() => {
        it("hide confirmation pane", () => {
            const confirmationPanePropsHide: IConfirmationPaneProps = {
                ...defaultConfirmationPaneProps,
                controlProps: {
                    ...defaultConfirmationPaneProps.controlProps,
                    hideConfirmationPane: true
                }
            };
            const container = document.createElement("div");
            ReactDOM.render(
                <ConfirmationPane {...confirmationPanePropsHide}/>, container);
            expect(container.childElementCount).toBe(0);
        });
    });

    act(() => {
        it("hide title", () => {
            const confirmationPanePropsHide: IConfirmationPaneProps = {
                ...defaultConfirmationPaneProps,
                controlProps: {
                    ...defaultConfirmationPaneProps.controlProps,
                    hideTitle: true
                }
            };
            render(<ConfirmationPane {...confirmationPanePropsHide}/>);

            try {
                screen.getByText("Close chat");
                fail("Title should not be in the document");
            // eslint-disable-next-line no-empty
            } catch (ex) {
            }

            try {
                screen.getByText("Do you really want to close this chat?");
            } catch (ex) {
                fail("Subtitle should be in the document");
            }
        });
    });

    act(() => {
        it("hide subtitle", () => {
            const confirmationPanePropsHide: IConfirmationPaneProps = {
                ...defaultConfirmationPaneProps,
                controlProps: {
                    ...defaultConfirmationPaneProps.controlProps,
                    hideSubtitle: true
                }
            };
            render(<ConfirmationPane {...confirmationPanePropsHide}/>);

            try {
                screen.getByText("Do you really want to close this chat?");
                fail("Subitle should not be in the document");
            // eslint-disable-next-line no-empty
            } catch (ex) {
            }

            try {
                screen.getByText("Close chat");
            } catch (ex) {
                fail("Title should be in the document");
            }
        });
    });

    act(() => {
        it("hide confirm button", () => {
            const confirmationPanePropsHide: IConfirmationPaneProps = {
                ...defaultConfirmationPaneProps,
                controlProps: {
                    ...defaultConfirmationPaneProps.controlProps,
                    hideConfirmButton: true
                }
            };
            render(<ConfirmationPane {...confirmationPanePropsHide}/>);

            try {
                screen.getByText("Close");
                fail("Confirm Button should not be in the document");
            // eslint-disable-next-line no-empty
            } catch (ex) {
            }

            try {
                screen.getByText("Cancel");
            } catch (ex) {
                fail("Cancel button should be in the document");
            }
        });
    });

    act(() => {
        it("hide cancel button", () => {
            const confirmationPanePropsHide: IConfirmationPaneProps = {
                ...defaultConfirmationPaneProps,
                controlProps: {
                    ...defaultConfirmationPaneProps.controlProps,
                    hideCancelButton: true
                }
            };
            render(<ConfirmationPane {...confirmationPanePropsHide}/>);

            try {
                screen.getByText("Cancel");
                fail("Cancel Button should not be in the document");
            // eslint-disable-next-line no-empty
            } catch (ex) {
            }

            try {
                screen.getByText("Close");
            } catch (ex) {
                fail("Confirm button should be in the document");
            }
        });
    });

    act(() => {
        it("confirmation pane button clicked", () => {
            const handleConfirmClick = jest.fn();
            const handleCancelClick = jest.fn();

            const confirmationPaneProps: IConfirmationPaneProps = {
                ...defaultConfirmationPaneProps,
                controlProps: {
                    ...defaultConfirmationPaneProps.controlProps,
                    onConfirm: handleConfirmClick,
                    onCancel: handleCancelClick
                }
            };

            render(<ConfirmationPane {...confirmationPaneProps}/>);

            const confirmButton = screen.getByText("Close");
            fireEvent.click(confirmButton);
            expect(handleConfirmClick).toHaveBeenCalledTimes(1);

            const cancelButton = screen.getByText("Cancel");
            fireEvent.click(cancelButton);
            expect(handleCancelClick).toHaveBeenCalledTimes(1);
        });
    });
});