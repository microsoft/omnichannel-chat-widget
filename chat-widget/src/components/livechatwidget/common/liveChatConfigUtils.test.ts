import "@testing-library/jest-dom";

import { isPersistentChatEnabled, shouldLoadPersistentChatHistory } from "./liveChatConfigUtils";

import { ConversationMode } from "../../../common/Constants";
import { ExtendedChatConfig } from "../../webchatcontainerstateful/interfaces/IExtendedChatConffig";

describe("liveChatConfigUtils", () => {
    
    describe("isPersistentChatEnabled", () => {
        it("should return true for Persistent conversation mode", () => {
            expect(isPersistentChatEnabled(ConversationMode.Persistent)).toBe(true);
        });

        it("should return false for Regular conversation mode", () => {
            expect(isPersistentChatEnabled(ConversationMode.Regular)).toBe(false);
        });

        it("should return false for null", () => {
            expect(isPersistentChatEnabled(null as any)).toBe(false);
        });

        it("should return false for undefined", () => {
            expect(isPersistentChatEnabled(undefined)).toBe(false);
        });
    });

    describe("shouldLoadPersistentChatHistory", () => {
        
        it("should return false when widget is not persistent (no auth, regular mode) - REGRESSION TEST", () => {
            // This is the reported bug case: widget was loading history when it shouldn't
            const config: ExtendedChatConfig = {
                LiveWSAndLiveChatEngJoin: {
                    msdyn_enablepersistentchatpreviousconversations: "false", // string "false"
                    msdyn_conversationmode: "192350000" // Regular mode
                },
                LcwFcbConfiguration: {
                    lcwPersistentChatHistoryEnabled: true // FCB enabled
                },
                LiveChatConfigAuthSettings: {
                    msdyn_javascriptclientfunction: "authFunction" // Auth function present
                }
            } as any;

            // With auth function present, widget IS persistent-capable
            // BUT history is disabled in config ("false")
            // So result should be FALSE
            expect(shouldLoadPersistentChatHistory(config)).toBe(false);
        });

        it("should return false when widget is not persistent (no auth, regular mode)", () => {
            const config: ExtendedChatConfig = {
                LiveWSAndLiveChatEngJoin: {
                    msdyn_enablepersistentchatpreviousconversations: true,
                    msdyn_conversationmode: ConversationMode.Regular
                },
                LcwFcbConfiguration: {
                    lcwPersistentChatHistoryEnabled: true
                },
                LiveChatConfigAuthSettings: {} // No auth function
            } as any;

            expect(shouldLoadPersistentChatHistory(config)).toBe(false);
        });

        it("should return false when history is disabled in config (string 'false')", () => {
            const config: ExtendedChatConfig = {
                LiveWSAndLiveChatEngJoin: {
                    msdyn_enablepersistentchatpreviousconversations: "false", // string
                    msdyn_conversationmode: ConversationMode.Persistent
                },
                LcwFcbConfiguration: {
                    lcwPersistentChatHistoryEnabled: true
                },
                LiveChatConfigAuthSettings: {}
            } as any;

            expect(shouldLoadPersistentChatHistory(config)).toBe(false);
        });

        it("should return false when history is disabled in config (boolean false)", () => {
            const config: ExtendedChatConfig = {
                LiveWSAndLiveChatEngJoin: {
                    msdyn_enablepersistentchatpreviousconversations: false,
                    msdyn_conversationmode: ConversationMode.Persistent
                },
                LcwFcbConfiguration: {
                    lcwPersistentChatHistoryEnabled: true
                },
                LiveChatConfigAuthSettings: {}
            } as any;

            expect(shouldLoadPersistentChatHistory(config)).toBe(false);
        });

        it("should return false when FCB is disabled (string 'false')", () => {
            const config: ExtendedChatConfig = {
                LiveWSAndLiveChatEngJoin: {
                    msdyn_enablepersistentchatpreviousconversations: true,
                    msdyn_conversationmode: ConversationMode.Persistent
                },
                LcwFcbConfiguration: {
                    lcwPersistentChatHistoryEnabled: "false" as any // string "false"
                },
                LiveChatConfigAuthSettings: {}
            } as any;

            expect(shouldLoadPersistentChatHistory(config)).toBe(false);
        });

        it("should return false when FCB is disabled (boolean false)", () => {
            const config: ExtendedChatConfig = {
                LiveWSAndLiveChatEngJoin: {
                    msdyn_enablepersistentchatpreviousconversations: true,
                    msdyn_conversationmode: ConversationMode.Persistent
                },
                LcwFcbConfiguration: {
                    lcwPersistentChatHistoryEnabled: false
                },
                LiveChatConfigAuthSettings: {}
            } as any;

            expect(shouldLoadPersistentChatHistory(config)).toBe(false);
        });

        it("should return false when history config is null", () => {
            const config: ExtendedChatConfig = {
                LiveWSAndLiveChatEngJoin: {
                    msdyn_enablepersistentchatpreviousconversations: null as any,
                    msdyn_conversationmode: ConversationMode.Persistent
                },
                LcwFcbConfiguration: {
                    lcwPersistentChatHistoryEnabled: true
                },
                LiveChatConfigAuthSettings: {}
            } as any;

            expect(shouldLoadPersistentChatHistory(config)).toBe(false);
        });

        it("should return false when config is undefined", () => {
            expect(shouldLoadPersistentChatHistory(undefined)).toBe(false);
        });

        it("should return true when all conditions are met (boolean true values)", () => {
            const config: ExtendedChatConfig = {
                LiveWSAndLiveChatEngJoin: {
                    msdyn_enablepersistentchatpreviousconversations: true,
                    msdyn_conversationmode: ConversationMode.Persistent
                },
                LcwFcbConfiguration: {
                    lcwPersistentChatHistoryEnabled: true
                },
                LiveChatConfigAuthSettings: {}
            } as any;

            expect(shouldLoadPersistentChatHistory(config)).toBe(true);
        });

        it("should return true when all conditions are met (string 'true' values)", () => {
            const config: ExtendedChatConfig = {
                LiveWSAndLiveChatEngJoin: {
                    msdyn_enablepersistentchatpreviousconversations: "true",
                    msdyn_conversationmode: ConversationMode.Persistent
                },
                LcwFcbConfiguration: {
                    lcwPersistentChatHistoryEnabled: "true" as any
                },
                LiveChatConfigAuthSettings: {}
            } as any;

            expect(shouldLoadPersistentChatHistory(config)).toBe(true);
        });

        it("should return false when conversation mode is Regular even with auth function", () => {
            const config: ExtendedChatConfig = {
                LiveWSAndLiveChatEngJoin: {
                    msdyn_enablepersistentchatpreviousconversations: true,
                    msdyn_conversationmode: ConversationMode.Regular // Regular mode
                },
                LcwFcbConfiguration: {
                    lcwPersistentChatHistoryEnabled: true
                },
                LiveChatConfigAuthSettings: {
                    msdyn_javascriptclientfunction: "function() { return 'token'; }" // Auth function present but mode is Regular
                }
            } as any;

            // History should NOT load - only Persistent mode ("192350001") enables history
            expect(shouldLoadPersistentChatHistory(config)).toBe(false);
        });

        it("should return true for VALID persistent chat history scenario - POSITIVE TEST", () => {
            // This ensures the fix doesn't break legitimate persistent chat history loading
            const config: ExtendedChatConfig = {
                LiveWSAndLiveChatEngJoin: {
                    msdyn_enablepersistentchatpreviousconversations: "true", // Enabled (string)
                    msdyn_conversationmode: "192350001" // Persistent mode - REQUIRED
                },
                LcwFcbConfiguration: {
                    lcwPersistentChatHistoryEnabled: true // FCB enabled
                },
                LiveChatConfigAuthSettings: {}
            } as any;

            // All conditions met: mode is persistent ("192350001"), config enabled, FCB enabled
            // Result MUST be TRUE
            expect(shouldLoadPersistentChatHistory(config)).toBe(true);
        });

        it("should return true with Persistent mode and auth function - POSITIVE TEST", () => {
            // Valid scenario: Persistent mode + auth function + all settings enabled
            const config: ExtendedChatConfig = {
                LiveWSAndLiveChatEngJoin: {
                    msdyn_enablepersistentchatpreviousconversations: true, // Enabled (boolean)
                    msdyn_conversationmode: "192350001" // Persistent mode - REQUIRED
                },
                LcwFcbConfiguration: {
                    lcwPersistentChatHistoryEnabled: "true" as any // Enabled (string)
                },
                LiveChatConfigAuthSettings: {
                    msdyn_javascriptclientfunction: "function() { return 'auth-token'; }"
                }
            } as any;

            // All conditions met: mode is persistent, config enabled, FCB enabled
            // Auth function is present but NOT the determining factor
            // Result MUST be TRUE
            expect(shouldLoadPersistentChatHistory(config)).toBe(true);
        });
    });
});
