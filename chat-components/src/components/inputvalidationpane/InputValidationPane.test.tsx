import "@testing-library/jest-dom/extend-expect";

import * as ReactDOM from "react-dom";

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";

import InputValidationPane from "./InputValidationPane";
import { IInputValidationPaneProps } from "./interfaces/IInputValidationPaneProps";
import React from "react";
import { defaultInputValidationPaneProps } from "./common/default/defaultProps/defaultInputValidationPaneProps";
import { BroadcastServiceInitialize } from "../../services/BroadcastService";

beforeAll(() => {
    BroadcastServiceInitialize("testChannel");
});

describe("Input Validation Pane component", () => {

    afterEach(() => {
        cleanup;
        jest.resetAllMocks();
    });
    
    act(() => {
        it("renders input validation pane", () => {
            const container = document.createElement("div");
            ReactDOM.render(
                <InputValidationPane {...defaultInputValidationPaneProps}/>, container);
            expect(container.childElementCount).toBe(1);
        });
    });

    act(() => {
        it("hide input validation pane", () => {
            const inputValidationPanePropsHide: IInputValidationPaneProps = {
                ...defaultInputValidationPaneProps,
                controlProps: {
                    ...defaultInputValidationPaneProps.controlProps,
                    hideInputValidationPane: true
                }
            };
            const container = document.createElement("div");
            ReactDOM.render(
                <InputValidationPane {...inputValidationPanePropsHide}/>, container);
            expect(container.childElementCount).toBe(0);
        });
    });

    act(() => {
        it("hide title", () => {
            const inputValidationPanePropsHide: IInputValidationPaneProps = {
                ...defaultInputValidationPaneProps,
                controlProps: {
                    ...defaultInputValidationPaneProps.controlProps,
                    hideTitle: true
                }
            };
            render(<InputValidationPane {...inputValidationPanePropsHide}/>);

            try {
                screen.getByText("Email this chat transcript");
                fail("Title should not be in the document");
            // eslint-disable-next-line no-empty
            } catch (ex) {
            }

            try {
                screen.getByText("This will be sent after your chat ends.");
            } catch (ex) {
                fail("Subtitle should be in the document");
            }
        });
    });

    act(() => {
        it("hide subtitle", () => {
            const inputValidationPanePropsHide: IInputValidationPaneProps = {
                ...defaultInputValidationPaneProps,
                controlProps: {
                    ...defaultInputValidationPaneProps.controlProps,
                    hideSubtitle: true
                }
            };
            render(<InputValidationPane {...inputValidationPanePropsHide}/>);

            try {
                screen.getByText("This will be sent after your chat ends.");
                fail("Subitle should not be in the document");
            // eslint-disable-next-line no-empty
            } catch (ex) {
            }

            try {
                screen.getByText("Email this chat transcript");
            } catch (ex) {
                fail("Title should be in the document");
            }
        });
    });

    act(() => {
        it("hide input textfield", () => {
            const inputValidationPanePropsHide: IInputValidationPaneProps = {
                ...defaultInputValidationPaneProps,
                controlProps: {
                    ...defaultInputValidationPaneProps.controlProps,
                    hideInput: true,
                }
            };
            render(<InputValidationPane {...inputValidationPanePropsHide}/>);
            try {
                screen.getByRole("textbox");
                fail("Input textfield should not be in the document");
            // eslint-disable-next-line no-empty
            } catch (ex) {
            }
        });
    });

    act(() => {
        it("hide send button", () => {
            const inputValidationPanePropsHide: IInputValidationPaneProps = {
                ...defaultInputValidationPaneProps,
                controlProps: {
                    ...defaultInputValidationPaneProps.controlProps,
                    hideSendButton: true
                }
            };
            render(<InputValidationPane {...inputValidationPanePropsHide}/>);

            try {
                screen.getByText("Send");
                fail("Send button should be in the document");
            // eslint-disable-next-line no-empty
            } catch (ex) {
            }
        });
    });

    act(() => {
        it("hide cancel button", () => {
            const inputValidationPanePropsHide: IInputValidationPaneProps = {
                ...defaultInputValidationPaneProps,
                controlProps: {
                    ...defaultInputValidationPaneProps.controlProps,
                    hideCancelButton: true
                }
            };
            render(<InputValidationPane {...inputValidationPanePropsHide}/>);

            try {
                screen.getByText("Cancel");
                fail("Cancel button should be in the document");
            // eslint-disable-next-line no-empty
            } catch (ex) {
            }
        });
    });

    act(() => {
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

            render(<InputValidationPane {...inputValidationPaneProps}/>);

            const sendButton = screen.getByText("Send");
            fireEvent.click(sendButton);
            expect(handleSendClick).toHaveBeenCalledTimes(1);
        });
    });

    act(() => {
        it("input validation pane send button disabled", () => {
            const handleSendClick = jest.fn();

            const inputValidationPaneProps: IInputValidationPaneProps = {
                ...defaultInputValidationPaneProps,
                controlProps: {
                    ...defaultInputValidationPaneProps.controlProps,
                    onSend: handleSendClick,
                }
            };

            render(<InputValidationPane {...inputValidationPaneProps}/>);

            const sendButton = screen.getByText("Send");
            fireEvent.click(sendButton);
            expect(handleSendClick).toHaveBeenCalledTimes(0);
        });
    });

    act(() => {
        it("input validation pane cancel button clicked", () => {
            const handleCancelClick = jest.fn();

            const inputValidationPaneProps: IInputValidationPaneProps = {
                ...defaultInputValidationPaneProps,
                controlProps: {
                    ...defaultInputValidationPaneProps.controlProps,
                    onCancel: handleCancelClick
                }
            };

            render(<InputValidationPane {...inputValidationPaneProps}/>);

            const cancelButton = screen.getByText("Cancel");
            fireEvent.click(cancelButton);
            expect(handleCancelClick).toHaveBeenCalledTimes(1);
        });
    });

    act(() => {
        it("input validation pane input textfield key down", () => {
            const handleInputKeyDown = jest.fn();

            const inputValidationPaneProps: IInputValidationPaneProps = {
                ...defaultInputValidationPaneProps,
                controlProps: {
                    ...defaultInputValidationPaneProps.controlProps,
                    onSend: handleInputKeyDown,
                    checkInput: undefined
                }
            };

            render(<InputValidationPane {...inputValidationPaneProps}/>);

            const textfields = screen.getAllByRole("textbox");
            const input = textfields[0];
            fireEvent.keyDown(input, {
                code: "Enter"
            });
            expect(handleInputKeyDown).toHaveBeenCalledTimes(1);
        });
    });

    act(() => {
        it("input validation pane email textfield value changed", () => {

            const inputValidationPaneProps: IInputValidationPaneProps = {
                ...defaultInputValidationPaneProps
            };

            render(<InputValidationPane {...inputValidationPaneProps}/>);

            const textfields = screen.getAllByRole("textbox");
            const input = textfields[0];

            fireEvent.change(input, {
                target: { value: "some value" }
            });
            
            const sendButton = screen.getByText("Send");
            expect(sendButton).not.toBeDisabled();
        });
    });
});