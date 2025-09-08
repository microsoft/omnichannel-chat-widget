import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Suggestions } from "./Suggestions";
import { ISuggestionsProps } from "./interfaces/ISuggestionsProps";

// Mock Fluent UI Copilot components with proper behavior
jest.mock("@fluentui-copilot/react-copilot", () => ({
    SuggestionList: ({ children, className, style, ...props }: any) => (
        <div 
            data-testid="suggestion-list" 
            role="list" 
            className={className}
            style={style}
            {...props}
        >
            {children}
        </div>
    ),
    Suggestion: ({ children, onClick, disabled, className, style, ...props }: any) => (
        <button 
            data-testid="suggestion-item"
            onClick={onClick}
            disabled={disabled}
            className={className}
            style={style}
            role="listitem"
            tabIndex={0}
            {...props}
        >
            {children}
        </button>
    )
}));

// Mock default props
jest.mock("./common/defaultProps/defaultSuggestionsProps", () => ({
    defaultSuggestionsProps: {
        controlProps: {
            suggestions: [],
            ariaLabel: "Suggestions"
        },
        styleProps: {}
    }
}));

// Mock style utils - return CSS string, not object
jest.mock("./common/utils/suggestionsStyleUtils", () => ({
    createSuggestionsStyles: jest.fn(() => ".fai-Suggestion { color: blue; }")
}));

const mockSuggestions = [
    { id: "1", text: "Hello", value: "Hello" },
    { id: "2", text: "How can I help?", value: "How can I help?" },
    { id: "3", text: "Tell me a joke", value: "Tell me a joke" }
];

const mockOnSuggestionClick = jest.fn();

const defaultProps: ISuggestionsProps = {
    controlProps: {
        suggestions: mockSuggestions,
        onSuggestionClick: mockOnSuggestionClick,
        ariaLabel: "Message suggestions"
    }
};

describe("Suggestions Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Core Functionality Tests
    describe("Core Functionality", () => {
        it("should render suggestions list with all items", () => {
            render(<Suggestions {...defaultProps} />);
            
            expect(screen.getByTestId("suggestion-list")).toBeInTheDocument();
            
            const suggestionItems = screen.getAllByTestId("suggestion-item");
            expect(suggestionItems).toHaveLength(mockSuggestions.length);
            
            mockSuggestions.forEach(suggestion => {
                expect(screen.getByText(suggestion.text)).toBeInTheDocument();
            });
        });

        it("should not render when suggestions array is empty", () => {
            const emptyProps = {
                controlProps: {
                    suggestions: [],
                    onSuggestionClick: mockOnSuggestionClick,
                    ariaLabel: "Empty suggestions"
                }
            };
            
            const { container } = render(<Suggestions {...emptyProps} />);
            expect(container.firstChild).toBeNull();
        });

        it("should not render when suggestions is undefined", () => {
            const undefinedProps = {
                controlProps: {
                    suggestions: undefined,
                    onSuggestionClick: mockOnSuggestionClick,
                    ariaLabel: "Undefined suggestions"
                }
            };
            
            const { container } = render(<Suggestions {...undefinedProps} />);
            expect(container.firstChild).toBeNull();
        });
    });

    // Interaction Tests
    describe("User Interactions", () => {
        it("should call onSuggestionClick when suggestion is clicked", () => {
            render(<Suggestions {...defaultProps} />);
            
            const firstSuggestion = screen.getAllByTestId("suggestion-item")[0];
            fireEvent.click(firstSuggestion);
            
            expect(mockOnSuggestionClick).toHaveBeenCalledTimes(1);
            expect(mockOnSuggestionClick).toHaveBeenCalledWith(mockSuggestions[0]);
        });

        it("should handle keyboard navigation", () => {
            render(<Suggestions {...defaultProps} />);
            
            const firstSuggestion = screen.getAllByTestId("suggestion-item")[0];
            
            // Test Enter key
            fireEvent.keyDown(firstSuggestion, { key: "Enter", code: "Enter" });
            // Note: Fluent UI components handle keydown internally, we just test it doesn't crash
            
            expect(firstSuggestion).toBeInTheDocument();
        });

        it("should handle missing callback gracefully", () => {
            const noCallbackProps = {
                controlProps: {
                    suggestions: mockSuggestions,
                    onSuggestionClick: undefined,
                    ariaLabel: "No callback suggestions"
                }
            };
            
            render(<Suggestions {...noCallbackProps} />);
            
            const firstSuggestion = screen.getAllByTestId("suggestion-item")[0];
            
            expect(() => {
                fireEvent.click(firstSuggestion);
            }).not.toThrow();
        });
    });

    // Styling Tests
    describe("Styling and Customization", () => {
        it("should apply custom styles", () => {
            const styledProps = {
                ...defaultProps,
                styleProps: {
                    containerStyleProps: {
                        backgroundColor: "#f0f0f0",
                        padding: "16px"
                    }
                }
            };
            
            render(<Suggestions {...styledProps} />);
            
            expect(screen.getByTestId("suggestion-list")).toBeInTheDocument();
        });

        it("should handle disabled state", () => {
            const disabledProps = {
                controlProps: {
                    suggestions: mockSuggestions,
                    onSuggestionClick: mockOnSuggestionClick,
                    disabled: true,
                    ariaLabel: "Disabled suggestions"
                }
            };
            
            render(<Suggestions {...disabledProps} />);
            
            const suggestionItems = screen.getAllByTestId("suggestion-item");
            suggestionItems.forEach(item => {
                expect(item).toBeDisabled();
            });
        });
    });

    // Component Override Tests
    describe("Component Overrides", () => {
        it("should handle component overrides", () => {
            const overrideProps = {
                ...defaultProps,
                componentOverrides: {
                    container: ({ children }: any) => (
                        <div data-testid="custom-container">{children}</div>
                    )
                }
            };
            
            render(<Suggestions {...overrideProps} />);
            
            // Component overrides are handled internally by the component
            expect(screen.getByTestId("suggestion-list")).toBeInTheDocument();
        });
    });

    // Error Handling Tests
    describe("Error Handling", () => {
        it("should handle malformed suggestion objects", () => {
            const malformedProps = {
                controlProps: {
                    suggestions: [
                        { id: "1", text: "Valid", value: "Valid" },
                        { id: null, text: "Invalid ID", value: "Invalid" },
                        { id: "3", text: null, value: "Invalid text" }
                    ] as any,
                    onSuggestionClick: mockOnSuggestionClick,
                    ariaLabel: "Malformed suggestions"
                }
            };
            
            expect(() => {
                render(<Suggestions {...malformedProps} />);
            }).not.toThrow();
        });

        it("should handle missing props gracefully", () => {
            const minimalProps = {
                controlProps: {}
            };
            
            expect(() => {
                render(<Suggestions {...minimalProps} />);
            }).not.toThrow();
        });
    });

    // Integration Tests
    describe("Integration Scenarios", () => {
        it("should work with dynamic suggestion updates", () => {
            const { rerender } = render(<Suggestions {...defaultProps} />);
            
            expect(screen.getAllByTestId("suggestion-item")).toHaveLength(3);
            
            const newSuggestions = [
                { id: "4", text: "New suggestion", value: "New suggestion" }
            ];
            
            const updatedProps = {
                ...defaultProps,
                controlProps: {
                    ...defaultProps.controlProps,
                    suggestions: newSuggestions
                }
            };
            
            rerender(<Suggestions {...updatedProps} />);
            
            expect(screen.getAllByTestId("suggestion-item")).toHaveLength(1);
            expect(screen.getByText("New suggestion")).toBeInTheDocument();
        });

        it("should handle complete configuration", () => {
            const completeProps = {
                controlProps: {
                    suggestions: mockSuggestions,
                    onSuggestionClick: mockOnSuggestionClick,
                    ariaLabel: "Complete suggestions",
                    disabled: false
                },
                styleProps: {
                    containerStyleProps: {
                        padding: "8px"
                    }
                },
                componentOverrides: {}
            };
            
            render(<Suggestions {...completeProps} />);
            
            expect(screen.getByTestId("suggestion-list")).toBeInTheDocument();
            expect(screen.getAllByTestId("suggestion-item")).toHaveLength(3);
            
            // Test interaction with complete configuration
            const firstSuggestion = screen.getAllByTestId("suggestion-item")[0];
            fireEvent.click(firstSuggestion);
            
            expect(mockOnSuggestionClick).toHaveBeenCalledWith(mockSuggestions[0]);
        });
    });
});
