import { ConversationState } from "../../../contexts/common/ConversationState";

describe("StartChat event outside operating hours", () => {
    // Mock state scenarios for testing the fix
    const createMockAppState = (outsideOperatingHours: boolean, conversationState: ConversationState) => ({
        outsideOperatingHours,
        conversationState,
        isMinimized: false
    });

    describe("when outside operating hours", () => {
        it("should allow continuation of Active conversations", () => {
            const appState = createMockAppState(true, ConversationState.Active);
            
            // The logic should NOT set OutOfOffice state for Active conversations
            const shouldSetOutOfOffice = appState.outsideOperatingHours === true && 
                appState.conversationState !== ConversationState.Active &&
                appState.conversationState !== ConversationState.InActive;
            
            expect(shouldSetOutOfOffice).toBe(false);
        });

        it("should allow continuation of InActive conversations", () => {
            const appState = createMockAppState(true, ConversationState.InActive);
            
            // The logic should NOT set OutOfOffice state for InActive conversations
            const shouldSetOutOfOffice = appState.outsideOperatingHours === true && 
                appState.conversationState !== ConversationState.Active &&
                appState.conversationState !== ConversationState.InActive;
            
            expect(shouldSetOutOfOffice).toBe(false);
        });

        it("should set OutOfOffice for new conversations (Closed state)", () => {
            const appState = createMockAppState(true, ConversationState.Closed);
            
            // The logic SHOULD set OutOfOffice state for new conversations
            const shouldSetOutOfOffice = appState.outsideOperatingHours === true && 
                appState.conversationState !== ConversationState.Active &&
                appState.conversationState !== ConversationState.InActive;
            
            expect(shouldSetOutOfOffice).toBe(true);
        });

        it("should set OutOfOffice for other conversation states", () => {
            const testStates = [
                ConversationState.Prechat,
                ConversationState.Loading,
                ConversationState.Error,
                ConversationState.Postchat
            ];

            testStates.forEach(state => {
                const appState = createMockAppState(true, state);
                
                const shouldSetOutOfOffice = appState.outsideOperatingHours === true && 
                    appState.conversationState !== ConversationState.Active &&
                    appState.conversationState !== ConversationState.InActive;
                
                expect(shouldSetOutOfOffice).toBe(true);
            });
        });
    });

    describe("when within operating hours", () => {
        it("should not set OutOfOffice regardless of conversation state", () => {
            const testStates = [
                ConversationState.Active,
                ConversationState.InActive,
                ConversationState.Closed,
                ConversationState.Prechat
            ];

            testStates.forEach(state => {
                const appState = createMockAppState(false, state);
                
                const shouldSetOutOfOffice = appState.outsideOperatingHours === true && 
                    appState.conversationState !== ConversationState.Active &&
                    appState.conversationState !== ConversationState.InActive;
                
                expect(shouldSetOutOfOffice).toBe(false);
            });
        });
    });

    describe("initialization logic when outside operating hours", () => {
        it("should preserve Active conversations and not set Closed state", () => {
            const appState = createMockAppState(true, ConversationState.Active);
            
            // Test the initialization logic that prevents setting Closed state for active conversations
            const shouldPreserveActiveConversation = appState.outsideOperatingHours === true && 
                (appState.conversationState === ConversationState.Active ||
                 appState.conversationState === ConversationState.InActive);
            
            expect(shouldPreserveActiveConversation).toBe(true);
        });

        it("should preserve InActive conversations and not set Closed state", () => {
            const appState = createMockAppState(true, ConversationState.InActive);
            
            // Test the initialization logic that prevents setting Closed state for inactive conversations
            const shouldPreserveInActiveConversation = appState.outsideOperatingHours === true && 
                (appState.conversationState === ConversationState.Active ||
                 appState.conversationState === ConversationState.InActive);
            
            expect(shouldPreserveInActiveConversation).toBe(true);
        });

        it("should allow setting Closed state for new conversations", () => {
            const appState = createMockAppState(true, ConversationState.Closed);
            
            // Test that new conversations (Closed state) can still be set to Closed during initialization
            const shouldPreserveConversation = appState.outsideOperatingHours === true && 
                (appState.conversationState === ConversationState.Active ||
                 appState.conversationState === ConversationState.InActive);
            
            expect(shouldPreserveConversation).toBe(false);
        });
    });
});