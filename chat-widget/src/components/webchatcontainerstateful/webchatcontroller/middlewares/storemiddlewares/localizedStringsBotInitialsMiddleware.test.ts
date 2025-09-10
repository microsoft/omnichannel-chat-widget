import "@testing-library/jest-dom";
import { Constants } from "../../../../../common/Constants";
import { IWebChatAction } from "../../../interfaces/IWebChatAction";
import { WebChatActionType } from "../../enums/WebChatActionType";
import { localizedStringsBotInitialsMiddleware, getOverriddenLocalizedStrings } from "./localizedStringsBotInitialsMiddleware";

// Mock getIconText utility
const mockGetIconText = jest.fn();
jest.mock("../../../../../common/utils", () => ({
    getIconText: (...args: any[]) => mockGetIconText(...args)
}));

// Mock defaultWebChatStyles
jest.mock("../../../common/defaultStyles/defaultWebChatStyles", () => ({
    defaultWebChatStyles: {
        botAvatarInitials: "WC"
    }
}));

describe("localizedStringsBotInitialsMiddleware", () => {
    let nextMock: jest.Mock;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let middleware: any;

    beforeEach(() => {
        jest.resetAllMocks();
        mockGetIconText.mockReset();
        
        nextMock = jest.fn((action) => action);
        const botInitialsMiddleware = localizedStringsBotInitialsMiddleware();
        middleware = botInitialsMiddleware({ dispatch: jest.fn() })(nextMock);
    });

    describe("core functionality", () => {
        it("should update agent initials when valid bot message is received", () => {
            // Arrange
            mockGetIconText.mockReturnValue("JD");
            const mockAction: IWebChatAction = {
                type: WebChatActionType.DIRECT_LINE_INCOMING_ACTIVITY,
                payload: {
                    activity: {
                        from: {
                            name: "John Doe",
                            role: "bot"
                        }
                    }
                }
            };

            // Act
            middleware(mockAction);

            // Assert
            expect(mockGetIconText).toHaveBeenCalledWith("John Doe");
            expect(nextMock).toHaveBeenCalledWith(mockAction);
            
            // Verify initials are updated in localized strings
            const overriddenStrings = getOverriddenLocalizedStrings()({});
            expect(overriddenStrings.ACTIVITY_BOT_SAID_ALT).toBe("JD said:");
        });

        it("should ignore user messages", () => {
            // Arrange
            const userAction: IWebChatAction = {
                type: WebChatActionType.DIRECT_LINE_INCOMING_ACTIVITY,
                payload: {
                    activity: {
                        from: {
                            name: "User Name",
                            role: Constants.userMessageTag
                        }
                    }
                }
            };

            // Act
            middleware(userAction);

            // Assert - should not process user messages at all
            expect(mockGetIconText).not.toHaveBeenCalled();
            expect(nextMock).toHaveBeenCalledWith(userAction);
        });

        it("should ignore system messages and use previous/default initials", () => {
            // Arrange - system message with channelData tags
            const systemAction: IWebChatAction = {
                type: WebChatActionType.DIRECT_LINE_INCOMING_ACTIVITY,
                payload: {
                    activity: {
                        from: {
                            name: "System Bot",
                            role: "bot"
                        },
                        channelData: {
                            tags: [Constants.systemMessageTag]
                        }
                    }
                }
            };

            // Act
            middleware(systemAction);

            // Assert
            expect(mockGetIconText).not.toHaveBeenCalled();
        });

        it("should ignore system messages with activity tags", () => {
            // Arrange
            const systemAction: IWebChatAction = {
                type: WebChatActionType.DIRECT_LINE_INCOMING_ACTIVITY,
                payload: {
                    activity: {
                        from: {
                            name: "System Bot",
                            role: "bot"
                        },
                        tags: [Constants.systemMessageTag]
                    }
                }
            };

            // Act
            middleware(systemAction);

            // Assert
            expect(mockGetIconText).not.toHaveBeenCalled();
        });

        it("should fallback to current initials when getIconText returns empty", () => {
            // Arrange - first set some initials
            mockGetIconText.mockReturnValueOnce("AB");
            const setupAction: IWebChatAction = {
                type: WebChatActionType.DIRECT_LINE_INCOMING_ACTIVITY,
                payload: {
                    activity: {
                        from: { name: "Agent Bob", role: "bot" }
                    }
                }
            };
            middleware(setupAction);

            // Now test with getIconText returning empty
            mockGetIconText.mockReturnValue("");
            const testAction: IWebChatAction = {
                type: WebChatActionType.DIRECT_LINE_INCOMING_ACTIVITY,
                payload: {
                    activity: {
                        from: {
                            name: "Special Agent",
                            role: "bot"
                        }
                    }
                }
            };

            // Act
            middleware(testAction);

            // Assert - should keep previous initials
            const overriddenStrings = getOverriddenLocalizedStrings()({});
            expect(overriddenStrings.ACTIVITY_BOT_SAID_ALT).toBe("AB said:");
        });
    });
});

describe("getOverriddenLocalizedStrings", () => {
    it("should return localized strings with current bot initials", () => {
        // Arrange
        const baseStrings = { SOME_OTHER_STRING: "test" };

        // Act
        const result = getOverriddenLocalizedStrings()(baseStrings);

        // Assert
        expect(result.SOME_OTHER_STRING).toBe("test");
        expect(result.ACTIVITY_BOT_SAID_ALT).toMatch(/^.+ said:$/);
        expect(result.ACTIVITY_BOT_ATTACHED_ALT).toMatch(/^.+ attached:$/);
    });

    it("should preserve partial existing overrides", () => {
        // Arrange
        const baseStrings = { SOME_OTHER_STRING: "test" };
        const existingOverrides = { 
            ACTIVITY_BOT_SAID_ALT: "Custom said:"
            // ACTIVITY_BOT_ATTACHED_ALT not overridden
        };

        // Act
        const result = getOverriddenLocalizedStrings(existingOverrides)(baseStrings);

        // Assert
        expect(result.SOME_OTHER_STRING).toBe("test");
        expect(result.ACTIVITY_BOT_SAID_ALT).toBe("Custom said:");
        expect(result.ACTIVITY_BOT_ATTACHED_ALT).toMatch(/^.+ attached:$/);
    });

    it("should preserve all existing prop overrides", () => {
        // Arrange
        const baseStrings = { SOME_OTHER_STRING: "test" };
        const existingOverrides = { 
            ACTIVITY_BOT_SAID_ALT: "Custom said:",
            ACTIVITY_BOT_ATTACHED_ALT: "Custom attached:"
        };

        // Act
        const result = getOverriddenLocalizedStrings(existingOverrides)(baseStrings);

        // Assert
        expect(result).toEqual({
            SOME_OTHER_STRING: "test",
            ACTIVITY_BOT_SAID_ALT: "Custom said:",
            ACTIVITY_BOT_ATTACHED_ALT: "Custom attached:"
        });
    });
});
