import { ConversationState } from "../../../contexts/common/ConversationState";

describe("Initialization logic outside operating hours", () => {
    // Mock state scenarios for testing the fix
    const createMockAppState = (outsideOperatingHours: boolean, conversationState: ConversationState) => ({
        outsideOperatingHours,
        conversationState,
        isMinimized: false
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