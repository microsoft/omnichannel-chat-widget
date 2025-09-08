import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ChatInputStateful } from "./ChatInputStateful";
import { IChatInputStatefulProps } from "./interfaces/IChatButtonStatefulParams";

// Mock WebChat hooks
const mockSendMessage = jest.fn();
const mockUseStyleOptions = jest.fn(() => [{}]);

jest.mock("botframework-webchat", () => ({
    hooks: {
        useSendMessage: () => mockSendMessage,
        useStyleOptions: () => mockUseStyleOptions()
    }
}));

// Mock ChatInput component
jest.mock("@microsoft/omnichannel-chat-components", () => ({
    ChatInput: ({ chatInputProps, suggestionsProps }: any) => (
        <div data-testid="chat-input-component">
            <input 
                data-testid="chat-input-field"
                placeholder={chatInputProps?.controlProps?.placeholderValue || "Type a message..."}
                disabled={chatInputProps?.controlProps?.disabled}
                onChange={(e) => chatInputProps?.controlProps?.onTextChange?.(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value.trim()) {
                        chatInputProps?.controlProps?.onSubmitText?.(e.currentTarget.value, []);
                    }
                }}
            />
            {chatInputProps?.controlProps?.attachmentProps?.showAttachButton && (
                <button data-testid="attachment-button">Attach</button>
            )}
            {suggestionsProps?.controlProps?.suggestions?.map((suggestion: any) => (
                <button 
                    key={suggestion.id}
                    data-testid={`suggestion-${suggestion.id}`}
                    onClick={() => suggestionsProps.controlProps.onSuggestionClick?.(suggestion)}
                >
                    {suggestion.text}
                </button>
            ))}
        </div>
    )
}));

// Mock hooks
jest.mock("../../hooks/useTypingIndicator", () => jest.fn());
jest.mock("../../hooks/useOfflineStatus", () => jest.fn(() => false));
jest.mock("./hooks/useChatInputAttachments", () => ({
    useChatInputAttachments: () => ({
        previewAttachments: [],
        addFiles: jest.fn(),
        removeAt: jest.fn(),
        clearAttachments: jest.fn(),
        onPaste: jest.fn()
    })
}));

jest.mock("./hooks/useSuggestionsState", () => ({
    useSuggestionsState: ({ props }: any) => ({
        suggestionsProps: props || {
            controlProps: {
                suggestions: [],
                updateSuggestions: jest.fn()
            }
        }
    })
}));

const defaultProps: IChatInputStatefulProps = {
    chatInputProps: {
        controlProps: {
            placeholderValue: "Type a message...",
            disabled: false
        }
    }
};

describe("ChatInputStateful Component", () => {
    beforeEach(() => {
        mockSendMessage.mockClear();
    });

    // Core Functionality Tests
    describe("Core Functionality", () => {
        it("should render ChatInput component", () => {
            render(<ChatInputStateful {...defaultProps} />);
            expect(screen.getByTestId("chat-input-component")).toBeInTheDocument();
        });

        it("should render with default placeholder", () => {
            render(<ChatInputStateful {...defaultProps} />);
            const input = screen.getByTestId("chat-input-field");
            expect(input).toHaveAttribute("placeholder", "Type a message...");
        });

        it("should handle text input and submission", () => {
            render(<ChatInputStateful {...defaultProps} />);
            
            const input = screen.getByTestId("chat-input-field");
            fireEvent.change(input, { target: { value: "Test message" } });
            fireEvent.keyDown(input, { key: "Enter" });
            
            expect(mockSendMessage).toHaveBeenCalledWith("Test message", "keyboard", undefined);
        });

        it("should not send empty messages", () => {
            render(<ChatInputStateful {...defaultProps} />);
            
            const input = screen.getByTestId("chat-input-field");
            fireEvent.keyDown(input, { key: "Enter" });
            
            expect(mockSendMessage).not.toHaveBeenCalled();
        });

        it("should handle disabled state", () => {
            const disabledProps = {
                chatInputProps: {
                    controlProps: {
                        disabled: true,
                        placeholderValue: "Chat is disabled"
                    }
                }
            };
            
            render(<ChatInputStateful {...disabledProps} />);
            
            const input = screen.getByTestId("chat-input-field");
            expect(input).toBeDisabled();
        });
    });

    // Attachment Tests
    describe("Attachment Functionality", () => {
        it("should show attachment button when enabled", () => {
            const attachmentProps = {
                chatInputProps: {
                    controlProps: {
                        attachmentProps: {
                            showAttachButton: true
                        }
                    }
                }
            };
            
            render(<ChatInputStateful {...attachmentProps} />);
            expect(screen.getByTestId("attachment-button")).toBeInTheDocument();
        });

        it("should hide attachment button when not enabled", () => {
            render(<ChatInputStateful {...defaultProps} />);
            expect(screen.queryByTestId("attachment-button")).not.toBeInTheDocument();
        });
    });

    // Suggestions Tests
    describe("Suggestions Integration", () => {
        it("should render suggestions when provided", () => {
            const suggestionsProps = {
                ...defaultProps,
                suggestionsProps: {
                    controlProps: {
                        suggestions: [
                            { id: "1", text: "Hello", value: "Hello" },
                            { id: "2", text: "How can I help?", value: "How can I help?" }
                        ]
                    }
                }
            };
            
            render(<ChatInputStateful {...suggestionsProps} />);
            
            expect(screen.getByTestId("suggestion-1")).toBeInTheDocument();
            expect(screen.getByTestId("suggestion-2")).toBeInTheDocument();
        });

        it("should handle suggestion clicks", () => {
            const mockOnSuggestionClick = jest.fn();
            const suggestionsProps = {
                ...defaultProps,
                suggestionsProps: {
                    controlProps: {
                        suggestions: [{ id: "1", text: "Hello", value: "Hello" }],
                        onSuggestionClick: mockOnSuggestionClick
                    }
                }
            };
            
            render(<ChatInputStateful {...suggestionsProps} />);
            
            const suggestion = screen.getByTestId("suggestion-1");
            fireEvent.click(suggestion);
            
            expect(mockOnSuggestionClick).toHaveBeenCalledWith({
                id: "1",
                text: "Hello", 
                value: "Hello"
            });
        });
    });

    // Localization Tests
    describe("Localization", () => {
        it("should apply custom placeholder from props", () => {
            const customProps = {
                chatInputProps: {
                    controlProps: {
                        placeholderValue: "Custom placeholder"
                    }
                }
            };
            
            render(<ChatInputStateful {...customProps} />);
            
            const input = screen.getByTestId("chat-input-field");
            expect(input).toHaveAttribute("placeholder", "Custom placeholder");
        });

        it("should handle localized strings override", () => {
            const localizedProps = {
                ...defaultProps,
                overrideLocalizedStrings: {
                    CHAT_INPUT_PLACEHOLDER: "Localized placeholder"
                }
            };
            
            render(<ChatInputStateful {...localizedProps} />);
            expect(screen.getByTestId("chat-input-component")).toBeInTheDocument();
        });
    });

    // Integration Tests
    describe("Integration Scenarios", () => {
        it("should work with all features enabled", () => {
            const completeProps = {
                chatInputProps: {
                    controlProps: {
                        placeholderValue: "Type your message...",
                        disabled: false,
                        attachmentProps: {
                            showAttachButton: true
                        }
                    }
                },
                suggestionsProps: {
                    controlProps: {
                        suggestions: [
                            { id: "1", text: "Quick reply", value: "Quick reply" }
                        ]
                    }
                },
                overrideLocalizedStrings: {
                    CHAT_INPUT_PLACEHOLDER: "Complete example"
                }
            };
            
            render(<ChatInputStateful {...completeProps} />);
            
            expect(screen.getByTestId("chat-input-component")).toBeInTheDocument();
            expect(screen.getByTestId("attachment-button")).toBeInTheDocument();
            expect(screen.getByTestId("suggestion-1")).toBeInTheDocument();
        });

        it("should handle message submission with all features", () => {
            const completeProps = {
                chatInputProps: {
                    controlProps: {
                        placeholderValue: "Type message...",
                        attachmentProps: {
                            showAttachButton: true
                        }
                    }
                }
            };
            
            render(<ChatInputStateful {...completeProps} />);
            
            const input = screen.getByTestId("chat-input-field");
            fireEvent.change(input, { target: { value: "Complete test message" } });
            fireEvent.keyDown(input, { key: "Enter" });
            
            expect(mockSendMessage).toHaveBeenCalledWith("Complete test message", "keyboard", undefined);
        });
    });

    // Error Handling Tests
    describe("Error Handling", () => {
        it("should handle missing props gracefully", () => {
            const minimalProps = {
                chatInputProps: {}
            };
            
            expect(() => {
                render(<ChatInputStateful {...minimalProps} />);
            }).not.toThrow();
        });

        it("should handle undefined suggestions", () => {
            const undefinedSuggestionsProps = {
                ...defaultProps,
                suggestionsProps: {
                    controlProps: {
                        suggestions: undefined
                    }
                }
            };
            
            expect(() => {
                render(<ChatInputStateful {...undefinedSuggestionsProps} />);
            }).not.toThrow();
        });
    });
});
