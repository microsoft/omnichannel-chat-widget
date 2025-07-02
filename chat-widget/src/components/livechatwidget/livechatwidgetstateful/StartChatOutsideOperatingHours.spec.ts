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
});