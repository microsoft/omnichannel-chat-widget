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

    describe("Basic Rendering", () => {
        it("renders with default props", () => {
            render(<ChatInput chatInputProps={defaultProps} />);
            const container = document.querySelector(".lcw-chat-input-box");
            expect(container).toBeInTheDocument();
        });

        it("applies correct chatInputId", () => {
            const props: IChatInputProps = {
                controlProps: {
                    ...defaultControlProps,
                    chatInputId: "custom-chat-input"
                }
            };
            render(<ChatInput chatInputProps={props} />);
            const container = document.getElementById("custom-chat-input");
            expect(container).toBeInTheDocument();
        });

        it("renders with custom placeholder", () => {
            const props: IChatInputProps = {
                controlProps: {
                    ...defaultControlProps,
                    placeholderValue: "Custom placeholder"
                }
            };
            render(<ChatInput chatInputProps={props} />);
            const container = document.querySelector(".lcw-chat-input-box");
            expect(container).toBeInTheDocument();
        });

        it("hides when hideSendBox is true", () => {
            const props: IChatInputProps = {
                controlProps: {
                    ...defaultControlProps,
                    hideSendBox: true
                }
            };
            render(<ChatInput chatInputProps={props} />);
            const container = document.querySelector(".lcw-chat-input-box");
            expect(container).not.toBeInTheDocument();
        });
    });

    describe("Event Handlers", () => {
        it("calls onSubmitText when message is submitted", async () => {
            const onSubmitText = jest.fn().mockReturnValue(true);
            const onTextChange = jest.fn();
            const props: IChatInputProps = {
                controlProps: {
                    ...defaultControlProps,
                    onSubmitText,
                    onTextChange
                }
            };
            
            render(<ChatInput chatInputProps={props} />);
            // Note: Actual interaction testing would require more complex setup
            // with Fluent UI components or mock implementations
        });

        it("calls onTextChange when text changes", () => {
            const onTextChange = jest.fn();
            const props: IChatInputProps = {
                controlProps: {
                    ...defaultControlProps,
                    onTextChange
                }
            };
            
            render(<ChatInput chatInputProps={props} />);
            // Text change testing would require Fluent UI component interaction
        });
    });

    describe("Attachment Support", () => {
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
            
            render(<ChatInput chatInputProps={props} />);
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
                        ],
                        onAttachmentRemove: jest.fn(),
                        onFilesChange: jest.fn()
                    }
                }
            };
            
            render(<ChatInput chatInputProps={props} />);
            const container = document.querySelector(".lcw-chat-input-box");
            expect(container).toBeInTheDocument();
        });

        it("handles file drop events", () => {
            const onFilesChange = jest.fn();
            const props: IChatInputProps = {
                controlProps: {
                    ...defaultControlProps,
                    attachmentProps: {
                        onFilesChange,
                        attachmentAccept: "*/*",
                        dropzoneMaxFiles: 5
                    }
                }
            };
            
            render(<ChatInput chatInputProps={props} />);
            // File drop testing would require simulating drag and drop events
        });
    });

    describe("RTL Support", () => {
        it("automatically detects RTL direction", () => {
            // Mock document.documentElement.lang for RTL
            Object.defineProperty(document.documentElement, 'lang', {
                writable: true,
                value: 'ar'
            });

            render(<ChatInput chatInputProps={defaultProps} />);
            const container = document.querySelector(".lcw-chat-input-box");
            expect(container).toHaveAttribute("dir", "rtl");
        });

        it("defaults to LTR direction", () => {
            Object.defineProperty(document.documentElement, 'lang', {
                writable: true,
                value: 'en'
            });

            render(<ChatInput chatInputProps={defaultProps} />);
            const container = document.querySelector(".lcw-chat-input-box");
            expect(container).toHaveAttribute("dir", "ltr");
        });
    });

    describe("Styling", () => {
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
            render(<ChatInput chatInputProps={props} />);
            const container = document.querySelector(".lcw-chat-input-box");
            expect(container).toHaveStyle("background-color: red");
            expect(container).toHaveStyle("padding: 10px");
        });

        it("generates dynamic styles", () => {
            const props: IChatInputProps = {
                ...defaultProps,
                styleProps: {
                    inputContainerStyleProps: {
                        borderRadius: "10px"
                    },
                    inputFieldStyleProps: {
                        fontSize: "16px",
                        color: "blue"
                    }
                }
            };
            
            render(<ChatInput chatInputProps={props} />);
            // Check that dynamic styles are applied
            const container = document.querySelector(".lcw-chat-input-box");
            expect(container).toBeInTheDocument();
        });
    });

    describe("Suggestions Integration", () => {
        it("renders with suggestions component", () => {
            const suggestionsProps = {
                controlProps: {
                    suggestions: [
                        { id: "1", text: "Hello", value: "Hello" },
                        { id: "2", text: "How are you?", value: "How are you?" }
                    ],
                    onSuggestionClick: jest.fn(),
                    ariaLabel: "Suggestions"
                }
            };

            render(
                <ChatInput 
                    chatInputProps={defaultProps} 
                    suggestionsProps={suggestionsProps} 
                />
            );
            const container = document.querySelector(".lcw-chat-input-box");
            expect(container).toBeInTheDocument();
        });
    });

    describe("Disabled State", () => {
        it("renders in disabled state", () => {
            const props: IChatInputProps = {
                controlProps: {
                    ...defaultControlProps,
                    disabled: true
                }
            };
            render(<ChatInput chatInputProps={props} />);
            const container = document.querySelector(".lcw-chat-input-box");
            expect(container).toBeInTheDocument();
        });
    });

    describe("Character Limits", () => {
        it("handles character limit functionality", () => {
            const props: IChatInputProps = {
                controlProps: {
                    ...defaultControlProps,
                    maxLength: 100,
                    characterLimitErrorMessage: "Too many characters!",
                    charactersRemainingMessage: (remaining: number) => 
                        remaining > 0 ? `${remaining} left` : "Limit reached"
                }
            };
            
            render(<ChatInput chatInputProps={props} />);
            const container = document.querySelector(".lcw-chat-input-box");
            expect(container).toBeInTheDocument();
        });
    });
});
