import "@testing-library/jest-dom";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import { BroadcastServiceInitialize } from "../../services/BroadcastService";
import { IInputValidationPaneProps } from "./interfaces/IInputValidationPaneProps";
import InputValidationPane from "./InputValidationPane";
import React from "react";
import { Texts } from "../../common/Constants";
import { defaultInputValidationPaneProps } from "./common/default/defaultProps/defaultInputValidationPaneProps";

beforeAll(() => {
    BroadcastServiceInitialize("testChannel");
});

describe("Input Validation Pane component", () => {

    afterEach(() => {
        cleanup();
        jest.resetAllMocks();
    });

    it("renders input validation pane", () => {
        const { container } = render(
            <InputValidationPane {...defaultInputValidationPaneProps} />);
        expect(container.childElementCount).toBe(1);
    });

    it("hide input validation pane", () => {
        const inputValidationPanePropsHide: IInputValidationPaneProps = {
            ...defaultInputValidationPaneProps,
            controlProps: {
                ...defaultInputValidationPaneProps.controlProps,
                hideInputValidationPane: true
            }
        };

        const { container } = render(
            <InputValidationPane {...inputValidationPanePropsHide} />
        );

        expect(container.childElementCount).toBe(0);
    });

    it("hide title", () => {
        const inputValidationPanePropsHide: IInputValidationPaneProps = {
            ...defaultInputValidationPaneProps,
            controlProps: {
                ...defaultInputValidationPaneProps.controlProps,
                hideTitle: true
            }
        };
        render(<InputValidationPane {...inputValidationPanePropsHide} />);

        try {
            screen.getByText(Texts.InputValidationPaneTitleText);
            fail("Title should not be in the document");
            // eslint-disable-next-line no-empty
        } catch (ex) {
        }

        try {
            screen.getByText(Texts.InputValidationPaneSubtitleText);
        } catch (ex) {
            fail("Subtitle should be in the document");
        }
    });

    it("hide subtitle", () => {
        const inputValidationPanePropsHide: IInputValidationPaneProps = {
            ...defaultInputValidationPaneProps,
            controlProps: {
                ...defaultInputValidationPaneProps.controlProps,
                hideSubtitle: true
            }
        };
        render(<InputValidationPane {...inputValidationPanePropsHide} />);

        try {
            screen.getByText(Texts.InputValidationPaneSubtitleText);
            fail("Subitle should not be in the document");
            // eslint-disable-next-line no-empty
        } catch (ex) {
        }

        try {
            screen.getByText(Texts.InputValidationPaneTitleText);
        } catch (ex) {
            fail("Title should be in the document");
        }
    });

    it("hide input textfield", () => {
        const inputValidationPanePropsHide: IInputValidationPaneProps = {
            ...defaultInputValidationPaneProps,
            controlProps: {
                ...defaultInputValidationPaneProps.controlProps,
                hideInput: true,
            }
        };
        render(<InputValidationPane {...inputValidationPanePropsHide} />);
        try {
            screen.getByRole("textbox");
            fail("Input textfield should not be in the document");
            // eslint-disable-next-line no-empty
        } catch (ex) {
        }
    });

    it("hide send button", () => {
        const inputValidationPanePropsHide: IInputValidationPaneProps = {
            ...defaultInputValidationPaneProps,
            controlProps: {
                ...defaultInputValidationPaneProps.controlProps,
                hideSendButton: true
            }
        };
        render(<InputValidationPane {...inputValidationPanePropsHide} />);

        try {
            screen.getByText(Texts.SaveButtonText);
            fail("Send button should be in the document");
            // eslint-disable-next-line no-empty
        } catch (ex) {
        }
    });

    it("hide cancel button", () => {
        const inputValidationPanePropsHide: IInputValidationPaneProps = {
            ...defaultInputValidationPaneProps,
            controlProps: {
                ...defaultInputValidationPaneProps.controlProps,
                hideCancelButton: true
            }
        };
        render(<InputValidationPane {...inputValidationPanePropsHide} />);

        try {
            screen.getByText(Texts.CancelButtonText);
            fail("Cancel button should be in the document");
            // eslint-disable-next-line no-empty
        } catch (ex) {
        }
    });

    it("input validation pane send button clicked", () => {
        const handleSendClick = jest.fn();

        const inputValidationPaneProps: IInputValidationPaneProps = {
            ...defaultInputValidationPaneProps,
            controlProps: {
                ...defaultInputValidationPaneProps.controlProps,
                enableSendButton: true,
                onSend: handleSendClick,
                checkInput: undefined
            }
        };

        render(<InputValidationPane {...inputValidationPaneProps} />);

        const sendButton = screen.getByText(Texts.SaveButtonText);
        fireEvent.click(sendButton);
        expect(handleSendClick).toHaveBeenCalledTimes(1);
    });

    it("input validation pane send button disabled", () => {
        const handleSendClick = jest.fn();

        const inputValidationPaneProps: IInputValidationPaneProps = {
            ...defaultInputValidationPaneProps,
            controlProps: {
                ...defaultInputValidationPaneProps.controlProps,
                onSend: handleSendClick,
            }
        };

        render(<InputValidationPane {...inputValidationPaneProps} />);

        const sendButton = screen.getByText(Texts.SaveButtonText);
        fireEvent.click(sendButton);
        expect(handleSendClick).toHaveBeenCalledTimes(0);
    });

    it("input validation pane cancel button clicked", () => {
        const handleCancelClick = jest.fn();

        const inputValidationPaneProps: IInputValidationPaneProps = {
            ...defaultInputValidationPaneProps,
            controlProps: {
                ...defaultInputValidationPaneProps.controlProps,
                onCancel: handleCancelClick
            }
        };

        render(<InputValidationPane {...inputValidationPaneProps} />);

        const cancelButton = screen.getByText(Texts.CancelButtonText);
        fireEvent.click(cancelButton);
        expect(handleCancelClick).toHaveBeenCalledTimes(1);
    });

    it("input validation pane input textfield key up", () => {
        const handleInputKeyUp = jest.fn();

        const inputValidationPaneProps: IInputValidationPaneProps = {
            ...defaultInputValidationPaneProps,
            controlProps: {
                ...defaultInputValidationPaneProps.controlProps,
                onSend: handleInputKeyUp,
                checkInput: undefined
            }
        };

        render(<InputValidationPane {...inputValidationPaneProps} />);

        const textfields = screen.getAllByRole("textbox");
        const input = textfields[0];
        fireEvent.keyUp(input, {
            code: "Enter"
        });
        expect(handleInputKeyUp).toHaveBeenCalledTimes(1);
    });

    it("input validation pane email textfield value changed", () => {

        const inputValidationPaneProps: IInputValidationPaneProps = {
            ...defaultInputValidationPaneProps
        };

        render(<InputValidationPane {...inputValidationPaneProps} />);

        const textfields = screen.getAllByRole("textbox");
        const input = textfields[0];

        fireEvent.change(input, {
            target: { value: "some value" }
        });

        const sendButton = screen.getByText(Texts.SaveButtonText);
        expect(sendButton).not.toBeDisabled();
    });
});