import { ConversationState } from "../contexts/common/ConversationState";
import { ILiveChatWidgetContext } from "../contexts/common/ILiveChatWidgetContext";

// Mock liveChatConfigUtils to avoid transitive Fluent UI ESM import issues.
// Mirrors the real shouldLoadPersistentChatHistory logic: all 3 conditions must be met.
jest.mock("../components/livechatwidget/common/liveChatConfigUtils", () => ({
    shouldLoadPersistentChatHistory: jest.fn((config) => {
        if (!config) return false;
        const conversationMode = config.LiveWSAndLiveChatEngJoin?.msdyn_conversationmode;
        const adminEnabled = config.LiveWSAndLiveChatEngJoin?.msdyn_enablepersistentchatpreviousconversations;
        const featureFlag = config.LcwFcbConfiguration?.lcwPersistentChatHistoryEnabled;
        const parseBool = (val: unknown) => val === true || val === "true";
        return conversationMode === "192350001" && parseBool(adminEnabled) && parseBool(featureFlag);
    })
}));

import { shouldShowOutOfOfficeHoursPane, shouldShowWebChatContainer } from "./componentController";

describe("componentController unit tests", () => {
    describe("shouldShowOutOfOfficeHoursPane", () => {
        const createMockState = (
            isMinimized = false,
            outsideOperatingHours = false,
            conversationState: ConversationState = ConversationState.Closed
        ): ILiveChatWidgetContext => ({
            appStates: {
                isMinimized,
                outsideOperatingHours,
                conversationState
            }
        } as ILiveChatWidgetContext);

        it("should return false when widget is minimized", () => {
            const state = createMockState(true, true, ConversationState.OutOfOffice);
            expect(shouldShowOutOfOfficeHoursPane(state)).toBe(false);
        });

        it("should return false when not outside operating hours", () => {
            const state = createMockState(false, false, ConversationState.OutOfOffice);
            expect(shouldShowOutOfOfficeHoursPane(state)).toBe(false);
        });

        it("should return false when conversation state is not OutOfOffice", () => {
            const state = createMockState(false, true, ConversationState.Closed);
            expect(shouldShowOutOfOfficeHoursPane(state)).toBe(false);
        });

        it("should return true when not minimized, outside operating hours, and conversation state is OutOfOffice", () => {
            const state = createMockState(false, true, ConversationState.OutOfOffice);
            expect(shouldShowOutOfOfficeHoursPane(state)).toBe(true);
        });

        it("should return false when conversation is Active even if outside operating hours", () => {
            const state = createMockState(false, true, ConversationState.Active);
            expect(shouldShowOutOfOfficeHoursPane(state)).toBe(false);
        });

        it("should return false when conversation is InActive even if outside operating hours", () => {
            const state = createMockState(false, true, ConversationState.InActive);
            expect(shouldShowOutOfOfficeHoursPane(state)).toBe(false);
        });
    });

    describe("shouldShowWebChatContainer", () => {
        const createMockState = (
            isMinimized = false,
            conversationState: ConversationState = ConversationState.Closed,
            isConversationalSurveyEnabled = false,
            isConversationalSurvey = false,
            liveChatConfig?: Record<string, unknown>
        ): ILiveChatWidgetContext => ({
            appStates: {
                isMinimized,
                conversationState,
                isConversationalSurveyEnabled,
                isConversationalSurvey
            },
            domainStates: {
                liveChatConfig
            }
        } as unknown as ILiveChatWidgetContext);

        // Config that enables all 3 persistent chat history conditions
        const persistentHistoryConfig = {
            LiveWSAndLiveChatEngJoin: {
                msdyn_conversationmode: "192350001",
                msdyn_enablepersistentchatpreviousconversations: "true"
            },
            LcwFcbConfiguration: {
                lcwPersistentChatHistoryEnabled: true
            }
        };

        describe("without persistent chat history (original behavior)", () => {
            it("should return true when conversation is Active and not minimized", () => {
                const state = createMockState(false, ConversationState.Active);
                expect(shouldShowWebChatContainer(state)).toBe(true);
            });

            it("should return false when conversation is Active and minimized", () => {
                const state = createMockState(true, ConversationState.Active);
                expect(shouldShowWebChatContainer(state)).toBe(false);
            });

            it("should return true when conversation is InActive and not minimized", () => {
                const state = createMockState(false, ConversationState.InActive);
                expect(shouldShowWebChatContainer(state)).toBe(true);
            });

            it("should return false when conversation is InActive and minimized", () => {
                const state = createMockState(true, ConversationState.InActive);
                expect(shouldShowWebChatContainer(state)).toBe(false);
            });

            it("should return false when conversation is Closed", () => {
                const state = createMockState(false, ConversationState.Closed);
                expect(shouldShowWebChatContainer(state)).toBe(false);
            });

            it("should return true when Postchat with conversational survey enabled", () => {
                const state = createMockState(false, ConversationState.Postchat, true, true);
                expect(shouldShowWebChatContainer(state)).toBe(true);
            });

            it("should return false when Postchat without conversational survey", () => {
                const state = createMockState(false, ConversationState.Postchat, false, false);
                expect(shouldShowWebChatContainer(state)).toBe(false);
            });
        });

        describe("with persistent chat history enabled (all 3 conditions)", () => {
            it("should return true when Active and minimized (CSS handles hiding)", () => {
                const state = createMockState(true, ConversationState.Active, false, false, persistentHistoryConfig);
                expect(shouldShowWebChatContainer(state)).toBe(true);
            });

            it("should return true when InActive and minimized", () => {
                const state = createMockState(true, ConversationState.InActive, false, false, persistentHistoryConfig);
                expect(shouldShowWebChatContainer(state)).toBe(true);
            });

            it("should return true when Active and not minimized", () => {
                const state = createMockState(false, ConversationState.Active, false, false, persistentHistoryConfig);
                expect(shouldShowWebChatContainer(state)).toBe(true);
            });

            it("should return false when Closed even with persistent history", () => {
                const state = createMockState(false, ConversationState.Closed, false, false, persistentHistoryConfig);
                expect(shouldShowWebChatContainer(state)).toBe(false);
            });

            it("should return true when Postchat with conversational survey and minimized", () => {
                const state = createMockState(true, ConversationState.Postchat, true, true, persistentHistoryConfig);
                expect(shouldShowWebChatContainer(state)).toBe(true);
            });

            it("should return false when Postchat without conversational survey", () => {
                const state = createMockState(false, ConversationState.Postchat, false, false, persistentHistoryConfig);
                expect(shouldShowWebChatContainer(state)).toBe(false);
            });
        });

        describe("with partial persistent chat config (missing a condition)", () => {
            it("should return false when minimized with only conversation mode set", () => {
                const partialConfig = {
                    LiveWSAndLiveChatEngJoin: {
                        msdyn_conversationmode: "192350001"
                    }
                };
                const state = createMockState(true, ConversationState.Active, false, false, partialConfig);
                expect(shouldShowWebChatContainer(state)).toBe(false);
            });

            it("should return false when minimized with feature flag missing", () => {
                const partialConfig = {
                    LiveWSAndLiveChatEngJoin: {
                        msdyn_conversationmode: "192350001",
                        msdyn_enablepersistentchatpreviousconversations: "true"
                    }
                };
                const state = createMockState(true, ConversationState.Active, false, false, partialConfig);
                expect(shouldShowWebChatContainer(state)).toBe(false);
            });

            it("should return false when minimized with non-persistent conversation mode", () => {
                const nonPersistentConfig = {
                    LiveWSAndLiveChatEngJoin: {
                        msdyn_conversationmode: "192350000",
                        msdyn_enablepersistentchatpreviousconversations: "true"
                    },
                    LcwFcbConfiguration: {
                        lcwPersistentChatHistoryEnabled: true
                    }
                };
                const state = createMockState(true, ConversationState.Active, false, false, nonPersistentConfig);
                expect(shouldShowWebChatContainer(state)).toBe(false);
            });

            it("should return false when minimized with no liveChatConfig", () => {
                const state = createMockState(true, ConversationState.Active, false, false, undefined);
                expect(shouldShowWebChatContainer(state)).toBe(false);
            });

            it("should return false when minimized with feature flag as string false", () => {
                const disabledFlagConfig = {
                    LiveWSAndLiveChatEngJoin: {
                        msdyn_conversationmode: "192350001",
                        msdyn_enablepersistentchatpreviousconversations: "true"
                    },
                    LcwFcbConfiguration: {
                        lcwPersistentChatHistoryEnabled: "false"
                    }
                };
                const state = createMockState(true, ConversationState.Active, false, false, disabledFlagConfig);
                expect(shouldShowWebChatContainer(state)).toBe(false);
            });
        });
    });
});
