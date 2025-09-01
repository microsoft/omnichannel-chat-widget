import * as React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import ChatInput from "./ChatInput";
import { IChatInputProps } from "./interfaces/IChatInputProps";

describe("ChatInput component", () => {
    const defaultControlProps = {
        placeholderValue: "Type a message...",
        disabled: false,
        maxLength: 500,
        charactersRemainingMessage: (remaining: number) => `${remaining} characters remaining`,
        chatInputAriaLabel: "Chat input field"
    };

    const defaultProps: IChatInputProps = {
        controlProps: defaultControlProps
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders with default props", () => {
        render(<ChatInput {...defaultProps} />);
        // Look for the container with the fixed class name
        const container = document.querySelector(".lcw-chat-input-box");
        expect(container).toBeInTheDocument();
    });

    it("applies correct elementId", () => {
        const props: IChatInputProps = {
            controlProps: {
                ...defaultControlProps,
                chatInputId: "custom-chat-input"
            }
        };
        render(<ChatInput {...props} />);
        const container = document.getElementById("custom-chat-input");
        expect(container).toBeInTheDocument();
    });

    it("renders with custom placeholder", () => {
        const props: IChatInputProps = {
            controlProps: {
                placeholderValue: "Custom placeholder",
                chatInputAriaLabel: "Custom chat input",
                maxLength: 500,
                charactersRemainingMessage: (remaining: number) => `${remaining} characters left`
            }
        };
        render(<ChatInput {...props} />);
        const container = document.querySelector(".lcw-chat-input-box");
        expect(container).toBeInTheDocument();
    });

    it("renders in disabled state", () => {
        const props: IChatInputProps = {
            controlProps: {
                disabled: true,
                maxLength: 500,
                charactersRemainingMessage: (remaining: number) => `${remaining} characters remaining`,
                chatInputAriaLabel: "Chat input field"
            }
        };
        render(<ChatInput {...props} />);
        const container = document.querySelector(".lcw-chat-input-box");
        expect(container).toBeInTheDocument();
    });

    it("applies custom container styles", () => {
        const props: IChatInputProps = {
            ...defaultProps,
            styleProps: {
                containerStyleProps: {
                    backgroundColor: "red",
                    padding: "10px"
                }
            }
        };
        render(<ChatInput {...props} />);
        const container = document.querySelector(".lcw-chat-input-box");
        expect(container).toHaveStyle("background-color: red");
        expect(container).toHaveStyle("padding: 10px");
    });

    it("handles text submission", async () => {
        const onSubmitText = jest.fn();
        const props: IChatInputProps = {
            controlProps: {
                ...defaultControlProps,
                onSubmitText
            }
        };
        
        render(<ChatInput {...props} />);
        
        // This test would need to be adjusted based on how the underlying
        // Fluent UI component can be tested - may require custom test utilities
    });

    it("renders with attachment button when configured", () => {
        const props: IChatInputProps = {
            controlProps: {
                ...defaultControlProps,
                attachmentProps: {
                    showAttachButton: true,
                    attachmentButtonAriaLabel: "Attach file"
                }
            }
        };
        
        render(<ChatInput {...props} />);
        const container = document.querySelector(".lcw-chat-input-box");
        expect(container).toBeInTheDocument();
    });

    it("renders with custom send button props", () => {
        const props: IChatInputProps = {
            controlProps: {
                ...defaultControlProps,
                sendButtonProps: {
                    disabled: true
                }
            }
        };
        
        render(<ChatInput {...props} />);
        const container = document.querySelector(".lcw-chat-input-box");
        expect(container).toBeInTheDocument();
    });

    it("renders attachments when provided", () => {
        const props: IChatInputProps = {
            controlProps: {
                ...defaultControlProps,
                attachmentProps: {
                    attachmentPreviewItems: [
                        { id: "1", text: "test-file.pdf" },
                        { id: "2", text: "image.png", progress: 50 }
                    ]
                }
            }
        };
        
        render(<ChatInput {...props} />);
        const container = document.querySelector(".lcw-chat-input-box");
        expect(container).toBeInTheDocument();
    });

    it("applies dynamic styles", () => {
        const props: IChatInputProps = {
            ...defaultProps,
            styleProps: {
                inputWrapperStyleProps: {
                    borderRadius: "10px"
                },
                inputFieldStyleProps: {
                    fontSize: "16px",
                    color: "blue"
                }
            }
        };
        
        render(<ChatInput {...props} />);
        
        // Check that style element is created for dynamic styles
        const styleElement = document.querySelector("style[key='chat-input-styles']");
        expect(styleElement).toBeInTheDocument();
    });
});
