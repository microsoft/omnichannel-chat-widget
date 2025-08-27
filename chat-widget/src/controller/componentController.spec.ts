import { ConversationState } from "../contexts/common/ConversationState";
import { ILiveChatWidgetContext } from "../contexts/common/ILiveChatWidgetContext";
import { shouldShowOutOfOfficeHoursPane } from "./componentController";

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
});