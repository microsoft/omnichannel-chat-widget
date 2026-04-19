/* eslint-disable @typescript-eslint/no-explicit-any */

import "@testing-library/jest-dom";

import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";
import { initWebChatComposer } from "./initWebChatComposer";

// Mock TelemetryHelper
jest.mock("../../../common/telemetry/TelemetryHelper");

// Mock other dependencies
jest.mock("../../../common/utils", () => ({
    changeLanguageCodeFormatForWebChat: jest.fn((locale) => locale),
    getConversationDetailsCall: jest.fn(),
    getLocaleStringFromId: jest.fn(() => "en-US"),
    createTimer: jest.fn(() => ({
        milliSecondsElapsed: 0
    }))
}));

jest.mock("@microsoft/omnichannel-chat-components", () => ({
    BroadcastService: {
        postMessage: jest.fn(),
        getMessageByEventName: jest.fn(() => ({
            subscribe: jest.fn()
        }))
    },
    BroadcastEvent: {
        PersistentConversationReset: "PersistentConversationReset"
    }
}));

// Mock console.warn to suppress development logs in tests
const originalWarn = console.warn;
const originalError = console.error;
beforeAll(() => {
    console.warn = jest.fn();
    console.error = jest.fn();
});

afterAll(() => {
    console.warn = originalWarn;
    console.error = originalError;
});

describe("initWebChatComposer - HTML Sanitization Monitoring", () => {
    let mockProps: any;
    let mockState: any;
    let mockDispatch: any;
    let mockFacadeChatSDK: any;
    let mockEndChat: any;
    let logActionEventSpy: jest.SpyInstance;

    // Mock requestIdleCallback for tests
    let requestIdleCallbackSpy: jest.SpyInstance;
    let setTimeoutSpy: jest.SpyInstance;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Mock requestIdleCallback (doesn't exist in jsdom)
        (window as any).requestIdleCallback = jest.fn((callback: any) => {
            callback(); // Execute immediately in tests
            return 1;
        });
        requestIdleCallbackSpy = window.requestIdleCallback as any;

        setTimeoutSpy = jest.spyOn(window, "setTimeout");

        // Mock state with orgId and chatId
        mockState = {
            domainStates: {
                telemetryInternalData: {
                    orgId: "test-org-123"
                },
                chatToken: {
                    chatId: "test-chat-456"
                },
                liveChatConfig: {
                    ChatWidgetLanguage: {
                        msdyn_localeid: 1033
                    }
                }
            }
        };

        mockProps = {
            webChatContainerProps: {}
        };

        mockDispatch = jest.fn();
        mockFacadeChatSDK = {};
        mockEndChat = jest.fn();

        // Spy on TelemetryHelper.logActionEvent
        logActionEventSpy = jest.spyOn(TelemetryHelper, "logActionEvent");
    });

    afterEach(() => {
        if (setTimeoutSpy && setTimeoutSpy.mockRestore) {
            setTimeoutSpy.mockRestore();
        }
        // Clean up requestIdleCallback mock
        delete (window as any).requestIdleCallback;
    });

    describe("renderMarkdown function", () => {
        it("should sanitize HTML and return sanitized text", () => {
            const webChatProps = initWebChatComposer(mockProps, mockState, mockDispatch, mockFacadeChatSDK, mockEndChat);
            const renderMarkdown = webChatProps.renderMarkdown;

            const htmlWithScript = "Hello <script>alert('xss')</script> world";
            const result = renderMarkdown(htmlWithScript);

            // Existing sanitization should block script tags
            expect(result).not.toContain("<script>");
            expect(result).not.toContain("alert");
            expect(result).toContain("Hello");
            expect(result).toContain("world");
        });

        it("should sanitize forbidden tags from existing config", () => {
            const webChatProps = initWebChatComposer(mockProps, mockState, mockDispatch, mockFacadeChatSDK, mockEndChat);
            const renderMarkdown = webChatProps.renderMarkdown;

            const htmlWithDiv = "Hello <div>test</div> world";
            const result = renderMarkdown(htmlWithDiv);

            // Existing config forbids div tags
            expect(result).not.toContain("<div>");
        });

        it("should allow safe HTML tags through existing sanitization", () => {
            const webChatProps = initWebChatComposer(mockProps, mockState, mockDispatch, mockFacadeChatSDK, mockEndChat);
            const renderMarkdown = webChatProps.renderMarkdown;

            const htmlWithAllowed = "Hello <p><b>bold</b> <i>italic</i></p>";
            const result = renderMarkdown(htmlWithAllowed);

            // These tags are allowed by existing config
            // Note: target="_blank" is added by ADD_ATTR config
            expect(result).toContain("bold");
            expect(result).toContain("italic");
            expect(result).toContain("<b");
            expect(result).toContain("<i");
        });

        it("should schedule monitoring via requestIdleCallback", () => {
            const webChatProps = initWebChatComposer(mockProps, mockState, mockDispatch, mockFacadeChatSDK, mockEndChat);
            const renderMarkdown = webChatProps.renderMarkdown;

            renderMarkdown("Hello <img src='test.jpg' /> world");

            // Should call requestIdleCallback to schedule monitoring
            expect(requestIdleCallbackSpy).toHaveBeenCalled();
        });

        it("should fallback to setTimeout when requestIdleCallback is not available", () => {
            // Remove requestIdleCallback
            requestIdleCallbackSpy.mockRestore();
            delete (window as any).requestIdleCallback;

            const webChatProps = initWebChatComposer(mockProps, mockState, mockDispatch, mockFacadeChatSDK, mockEndChat);
            const renderMarkdown = webChatProps.renderMarkdown;

            renderMarkdown("Hello world");

            // Should fallback to setTimeout
            expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 0);
        });

        it("should not modify the returned text (monitor-only)", () => {
            const webChatProps = initWebChatComposer(mockProps, mockState, mockDispatch, mockFacadeChatSDK, mockEndChat);
            const renderMarkdown = webChatProps.renderMarkdown;

            // HTML with img tag (allowed by existing config, but monitored by strict config)
            const htmlWithImg = "<p>Hello <img src='test.jpg' /> world</p>";
            const result = renderMarkdown(htmlWithImg);

            // Existing config allows img through
            expect(result).toContain("<img");
        });
    });

    describe("Telemetry logging for strict monitoring", () => {
        it("should log telemetry when img tag would be removed by strict allowlist", (done) => {
            const webChatProps = initWebChatComposer(mockProps, mockState, mockDispatch, mockFacadeChatSDK, mockEndChat);
            const renderMarkdown = webChatProps.renderMarkdown;

            renderMarkdown("<p>Hello <img src='test.jpg' /> world</p>");

            // Wait for async monitoring to complete
            setTimeout(() => {
                expect(logActionEventSpy).toHaveBeenCalledWith(
                    LogLevel.INFO,
                    expect.objectContaining({
                        Event: TelemetryEvent.HTMLSanitized,
                        Description: "HTML content would be sanitized by stricter allowlist (monitor-only)",
                        CustomProperties: expect.objectContaining({
                            OrganizationId: "test-org-123",
                            ConversationId: "test-chat-456",
                            RemovedTags: expect.stringContaining("img"),
                            Phase: "Monitor"
                        })
                    })
                );
                done();
            }, 100);
        });

        it("should log telemetry when div and span tags would be removed", (done) => {
            const webChatProps = initWebChatComposer(mockProps, mockState, mockDispatch, mockFacadeChatSDK, mockEndChat);
            const renderMarkdown = webChatProps.renderMarkdown;

            // div is blocked by existing config, but span is allowed
            renderMarkdown("<p>Hello <span style='color:red'>test</span></p>");

            setTimeout(() => {
                expect(logActionEventSpy).toHaveBeenCalled();
                const call = logActionEventSpy.mock.calls[0];
                expect(call[1].CustomProperties.RemovedTags).toContain("span");
                expect(call[1].CustomProperties.RemovedAttributes).toContain("style");
                done();
            }, 100);
        });

        it("should NOT log telemetry for allowed tags", (done) => {
            const webChatProps = initWebChatComposer(mockProps, mockState, mockDispatch, mockFacadeChatSDK, mockEndChat);
            const renderMarkdown = webChatProps.renderMarkdown;

            renderMarkdown("<p>Hello <b>bold</b> <i>italic</i></p>");

            setTimeout(() => {
                // Should not log telemetry for safe HTML
                expect(logActionEventSpy).not.toHaveBeenCalled();
                done();
            }, 100);
        });

        it("should include execution time in telemetry", (done) => {
            const webChatProps = initWebChatComposer(mockProps, mockState, mockDispatch, mockFacadeChatSDK, mockEndChat);
            const renderMarkdown = webChatProps.renderMarkdown;

            renderMarkdown("<p><img src='test.jpg' /></p>");

            setTimeout(() => {
                expect(logActionEventSpy).toHaveBeenCalled();
                const call = logActionEventSpy.mock.calls[0];
                expect(call[1].ElapsedTimeInMilliseconds).toBeGreaterThanOrEqual(0);
                expect(typeof call[1].ElapsedTimeInMilliseconds).toBe("number");
                done();
            }, 100);
        });

        it("should use 'unknown' fallback for missing orgId", (done) => {
            // State without orgId
            const stateWithoutOrgId = {
                domainStates: {
                    chatToken: {
                        chatId: "test-chat-456"
                    },
                    liveChatConfig: {
                        ChatWidgetLanguage: {
                            msdyn_localeid: 1033
                        }
                    }
                }
            };

            const webChatProps = initWebChatComposer(mockProps, stateWithoutOrgId, mockDispatch, mockFacadeChatSDK, mockEndChat);
            const renderMarkdown = webChatProps.renderMarkdown;

            renderMarkdown("<p><img src='test.jpg' /></p>");

            setTimeout(() => {
                expect(logActionEventSpy).toHaveBeenCalled();
                const call = logActionEventSpy.mock.calls[0];
                expect(call[1].CustomProperties.OrganizationId).toBe("unknown");
                done();
            }, 100);
        });
    });

    describe("Error handling", () => {
        it("should not break message flow if monitoring throws an error", () => {
            // Force monitoring to throw an error
            logActionEventSpy.mockImplementation(() => {
                throw new Error("Telemetry error");
            });

            const webChatProps = initWebChatComposer(mockProps, mockState, mockDispatch, mockFacadeChatSDK, mockEndChat);
            const renderMarkdown = webChatProps.renderMarkdown;

            // Should not throw - error should be caught
            expect(() => {
                const result = renderMarkdown("<p>Hello <img src='test.jpg' /></p>");
                expect(result).toBeDefined();
                expect(result).toContain("Hello");
            }).not.toThrow();
        });

        it("should handle empty HTML gracefully", () => {
            const webChatProps = initWebChatComposer(mockProps, mockState, mockDispatch, mockFacadeChatSDK, mockEndChat);
            const renderMarkdown = webChatProps.renderMarkdown;

            const result = renderMarkdown("");
            expect(result).toBeDefined();
        });

        it("should handle plain text without HTML", (done) => {
            const webChatProps = initWebChatComposer(mockProps, mockState, mockDispatch, mockFacadeChatSDK, mockEndChat);
            const renderMarkdown = webChatProps.renderMarkdown;

            renderMarkdown("Plain text message");

            setTimeout(() => {
                // Should not log telemetry for plain text
                expect(logActionEventSpy).not.toHaveBeenCalled();
                done();
            }, 100);
        });
    });

    describe("XSS Prevention", () => {
        it("should block javascript: URLs", () => {
            const webChatProps = initWebChatComposer(mockProps, mockState, mockDispatch, mockFacadeChatSDK, mockEndChat);
            const renderMarkdown = webChatProps.renderMarkdown;

            const xss = "<a href=\"javascript:alert('xss')\">Click</a>";
            const result = renderMarkdown(xss);

            expect(result).not.toContain("javascript:");
        });

        it("should block event handlers", () => {
            const webChatProps = initWebChatComposer(mockProps, mockState, mockDispatch, mockFacadeChatSDK, mockEndChat);
            const renderMarkdown = webChatProps.renderMarkdown;

            const xss = "<p onclick=\"alert('xss')\">Click me</p>";
            const result = renderMarkdown(xss);

            expect(result).not.toContain("onclick");
        });

        it("should block iframe tags", () => {
            const webChatProps = initWebChatComposer(mockProps, mockState, mockDispatch, mockFacadeChatSDK, mockEndChat);
            const renderMarkdown = webChatProps.renderMarkdown;

            const xss = "<iframe src=\"http://evil.com\"></iframe>";
            const result = renderMarkdown(xss);

            expect(result).not.toContain("<iframe");
        });
    });
});
