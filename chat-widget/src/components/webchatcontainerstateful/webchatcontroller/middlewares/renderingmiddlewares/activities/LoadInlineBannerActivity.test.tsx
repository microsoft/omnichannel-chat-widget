import "@testing-library/jest-dom";

import { cleanup, render, screen } from "@testing-library/react";

import { ILiveChatWidgetProps } from "../../../../../livechatwidget/interfaces/ILiveChatWidgetProps";
import LoadInlineBannerActivity from "./LoadInlineBannerActivity";
import React from "react";

// Mock merge-styles
jest.mock("@fluentui/merge-styles", () => ({
    mergeStyles: jest.fn((...styles) => {
        // Simulate mergeStyles by combining class names
        return styles.filter(Boolean).map((style, index) => 
            typeof style === 'string' ? style : `merged-style-${index}`
        ).join(' ');
    })
}));

// Mock default styles and texts
jest.mock("../../../../common/defaultProps/defaultMiddlewareLocalizedTexts", () => ({
    defaultMiddlewareLocalizedTexts: {
        PREVIOUS_MESSAGES_LOADING: "Loading previous messages..."
    }
}));

jest.mock("../defaultStyles/defaultInLineBannerStyle", () => ({
    defaultInlineBannerStyle: "default-inline-banner-style"
}));

describe("LoadInlineBannerActivity", () => {
    const defaultProps = {
        id: "test-banner-id"
    };

    afterEach(() => {
        cleanup();
    });

    describe("Basic Rendering", () => {
        it("should render with minimal props", () => {
            render(<LoadInlineBannerActivity {...defaultProps} />);
            
            const banner = screen.getByRole("status");
            expect(banner).toBeInTheDocument();
            expect(banner).toHaveAttribute("id", "test-banner-id");
        });

        it("should display default loading text", () => {
            render(<LoadInlineBannerActivity {...defaultProps} />);
            
            const banner = screen.getByText("Loading previous messages...");
            expect(banner).toBeInTheDocument();
        });

        it("should have correct ARIA attributes", () => {
            render(<LoadInlineBannerActivity {...defaultProps} />);
            
            const banner = screen.getByRole("status");
            expect(banner).toHaveAttribute("aria-live", "polite");
            expect(banner).toHaveAttribute("aria-label", "Loading previous messages...");
            expect(banner).toHaveAttribute("aria-busy", "true");
        });
    });

    describe("Props Handling", () => {
        it("should use custom localized text when provided", () => {
            const customProps = {
                ...defaultProps,
                webChatContainerProps: {
                    localizedTexts: {
                        PREVIOUS_MESSAGES_LOADING: "Custom loading message..."
                    }
                } as ILiveChatWidgetProps['webChatContainerProps']
            };

            render(<LoadInlineBannerActivity {...customProps} />);
            
            const banner = screen.getByText("Custom loading message...");
            expect(banner).toBeInTheDocument();
            expect(banner).toHaveAttribute("aria-label", "Custom loading message...");
        });

        it("should merge default and custom localized texts", () => {
            const customProps = {
                ...defaultProps,
                webChatContainerProps: {
                    localizedTexts: {
                        PREVIOUS_MESSAGES_LOADING: "Custom text",
                        SOME_OTHER_TEXT: "Other text"
                    }
                } as ILiveChatWidgetProps['webChatContainerProps']
            };

            render(<LoadInlineBannerActivity {...customProps} />);
            
            const banner = screen.getByText("Custom text");
            expect(banner).toBeInTheDocument();
        });

        it("should handle empty webChatContainerProps", () => {
            const customProps = {
                ...defaultProps,
                webChatContainerProps: {} as ILiveChatWidgetProps['webChatContainerProps']
            };

            render(<LoadInlineBannerActivity {...customProps} />);
            
            const banner = screen.getByText("Loading previous messages...");
            expect(banner).toBeInTheDocument();
        });

        it("should handle undefined webChatContainerProps", () => {
            const customProps = {
                ...defaultProps,
                webChatContainerProps: undefined
            };

            render(<LoadInlineBannerActivity {...customProps} />);
            
            const banner = screen.getByText("Loading previous messages...");
            expect(banner).toBeInTheDocument();
        });

        it("should handle undefined localizedTexts", () => {
            const customProps = {
                ...defaultProps,
                webChatContainerProps: {
                    localizedTexts: undefined
                } as ILiveChatWidgetProps['webChatContainerProps']
            };

            render(<LoadInlineBannerActivity {...customProps} />);
            
            const banner = screen.getByText("Loading previous messages...");
            expect(banner).toBeInTheDocument();
        });
    });

    describe("Styling", () => {
        it("should apply default banner style", () => {
            render(<LoadInlineBannerActivity {...defaultProps} />);
            
            const banner = screen.getByRole("status");
            expect(banner).toHaveClass("default-inline-banner-style");
        });

        it("should merge custom banner style with default", () => {
            const customProps = {
                ...defaultProps,
                persistentChatHistory: {
                    bannerStyle: "custom-banner-style"
                }
            };

            render(<LoadInlineBannerActivity {...customProps} />);
            
            const banner = screen.getByRole("status");
            // Should have both custom and default styles merged
            expect(banner.className).toContain("custom-banner-style");
            expect(banner.className).toContain("default-inline-banner-style");
        });

        it("should handle undefined persistentChatHistory", () => {
            const customProps = {
                ...defaultProps,
                persistentChatHistory: undefined
            };

            render(<LoadInlineBannerActivity {...customProps} />);
            
            const banner = screen.getByRole("status");
            expect(banner).toHaveClass("default-inline-banner-style");
        });

        it("should handle undefined bannerStyle", () => {
            const customProps = {
                ...defaultProps,
                persistentChatHistory: {
                    bannerStyle: undefined
                }
            };

            render(<LoadInlineBannerActivity {...customProps} />);
            
            const banner = screen.getByRole("status");
            expect(banner).toHaveClass("default-inline-banner-style");
        });
    });

    describe("Accessibility", () => {
        it("should be accessible to screen readers", () => {
            render(<LoadInlineBannerActivity {...defaultProps} />);
            
            const banner = screen.getByRole("status");
            expect(banner).toHaveAttribute("role", "status");
            expect(banner).toHaveAttribute("aria-live", "polite");
            expect(banner).toHaveAttribute("aria-busy", "true");
        });

        it("should update aria-label when localized text changes", () => {
            const customProps = {
                ...defaultProps,
                webChatContainerProps: {
                    localizedTexts: {
                        PREVIOUS_MESSAGES_LOADING: "Cargando mensajes anteriores..."
                    }
                } as ILiveChatWidgetProps['webChatContainerProps']
            };

            render(<LoadInlineBannerActivity {...customProps} />);
            
            const banner = screen.getByRole("status");
            expect(banner).toHaveAttribute("aria-label", "Cargando mensajes anteriores...");
        });

        it("should maintain accessibility with different ID", () => {
            const customProps = {
                ...defaultProps,
                id: "custom-banner-id"
            };

            render(<LoadInlineBannerActivity {...customProps} />);
            
            const banner = screen.getByRole("status");
            expect(banner).toHaveAttribute("id", "custom-banner-id");
            expect(banner).toHaveAttribute("aria-live", "polite");
        });
    });

    describe("Memoization", () => {
        it("should memoize localized texts correctly", () => {
            const props1 = {
                ...defaultProps,
                webChatContainerProps: {
                    localizedTexts: {
                        PREVIOUS_MESSAGES_LOADING: "Loading..."
                    }
                } as ILiveChatWidgetProps['webChatContainerProps']
            };

            const { rerender } = render(<LoadInlineBannerActivity {...props1} />);
            
            // First render
            let banner = screen.getByText("Loading...");
            expect(banner).toBeInTheDocument();

            // Rerender with same localizedTexts object
            rerender(<LoadInlineBannerActivity {...props1} />);
            banner = screen.getByText("Loading...");
            expect(banner).toBeInTheDocument();

            // Rerender with different localizedTexts object
            const props2 = {
                ...defaultProps,
                webChatContainerProps: {
                    localizedTexts: {
                        PREVIOUS_MESSAGES_LOADING: "Different text..."
                    }
                } as ILiveChatWidgetProps['webChatContainerProps']
            };

            rerender(<LoadInlineBannerActivity {...props2} />);
            banner = screen.getByText("Different text...");
            expect(banner).toBeInTheDocument();
        });
    });

    describe("Edge Cases", () => {
        it("should handle null localizedTexts gracefully", () => {
            const customProps = {
                ...defaultProps,
                webChatContainerProps: {
                    localizedTexts: null
                } as any
            };

            render(<LoadInlineBannerActivity {...customProps} />);
            
            const banner = screen.getByText("Loading previous messages...");
            expect(banner).toBeInTheDocument();
        });

        it("should handle empty string as loading text", () => {
            const customProps = {
                ...defaultProps,
                webChatContainerProps: {
                    localizedTexts: {
                        PREVIOUS_MESSAGES_LOADING: ""
                    }
                } as ILiveChatWidgetProps['webChatContainerProps']
            };

            render(<LoadInlineBannerActivity {...customProps} />);
            
            const banner = screen.getByRole("status");
            expect(banner).toBeInTheDocument();
            expect(banner).toHaveTextContent("");
            expect(banner).toHaveAttribute("aria-label", "");
        });

        it("should handle very long loading text", () => {
            const longText = "This is a very long loading message that might be used in some scenarios to provide more detailed information about what is happening during the loading process";
            
            const customProps = {
                ...defaultProps,
                webChatContainerProps: {
                    localizedTexts: {
                        PREVIOUS_MESSAGES_LOADING: longText
                    }
                } as ILiveChatWidgetProps['webChatContainerProps']
            };

            render(<LoadInlineBannerActivity {...customProps} />);
            
            const banner = screen.getByText(longText);
            expect(banner).toBeInTheDocument();
            expect(banner).toHaveAttribute("aria-label", longText);
        });

        it("should handle special characters in loading text", () => {
            const specialText = "Loading... 📤 Cargando mensajes anteriores... 中文 العربية";
            
            const customProps = {
                ...defaultProps,
                webChatContainerProps: {
                    localizedTexts: {
                        PREVIOUS_MESSAGES_LOADING: specialText
                    }
                } as ILiveChatWidgetProps['webChatContainerProps']
            };

            render(<LoadInlineBannerActivity {...customProps} />);
            
            const banner = screen.getByText(specialText);
            expect(banner).toBeInTheDocument();
            expect(banner).toHaveAttribute("aria-label", specialText);
        });
    });

    describe("DOM Structure", () => {
        it("should render within a React Fragment", () => {
            const { container } = render(<LoadInlineBannerActivity {...defaultProps} />);
            
            // Should have only the div element as direct child
            expect(container.children).toHaveLength(1);
            expect(container.firstElementChild?.tagName).toBe("DIV");
        });

        it("should have the correct element structure", () => {
            render(<LoadInlineBannerActivity {...defaultProps} />);
            
            const banner = screen.getByRole("status");
            expect(banner.tagName).toBe("DIV");
            expect(banner).toHaveAttribute("id");
            expect(banner).toHaveClass("default-inline-banner-style");
            expect(banner).toHaveAttribute("role");
            expect(banner).toHaveAttribute("aria-live");
            expect(banner).toHaveAttribute("aria-label");
            expect(banner).toHaveAttribute("aria-busy");
        });
    });
});