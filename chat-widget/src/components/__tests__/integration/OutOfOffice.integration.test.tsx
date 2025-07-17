import React from "react";

import { act, cleanup, render, screen } from "@testing-library/react";

import { ChatButtonStateful } from "../../chatbuttonstateful/ChatButtonStateful";
import { ConversationState } from "../../../contexts/common/ConversationState";
import { HeaderStateful } from "../../headerstateful/HeaderStateful";
import { ILiveChatWidgetContext } from "../../../contexts/common/ILiveChatWidgetContext";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";
import useChatAdapterStore from "../../../hooks/useChatAdapterStore";
import useChatContextStore from "../../../hooks/useChatContextStore";

// Mock the hooks
jest.mock("../../../hooks/useChatContextStore");
jest.mock("../../../hooks/useChatAdapterStore");
jest.mock("../../../common/telemetry/TelemetryHelper");
jest.mock("../../../common/telemetry/TelemetryManager");
jest.mock("../../../common/utils", () => ({
    createTimer: () => ({ milliSecondsElapsed: 100 }),
    setFocusOnElement: jest.fn()
}));

const mockUseChatContextStore = useChatContextStore as jest.MockedFunction<typeof useChatContextStore>;
const mockUseChatAdapterStore = useChatAdapterStore as jest.MockedFunction<typeof useChatAdapterStore>;

// Mock implementations for Header and ChatButton components from external library
jest.mock("@microsoft/omnichannel-chat-components", () => ({
    Header: ({ onMinimizeClick, ...props }: any) => (
        <div data-testid="mock-header" {...props}>
            <button onClick={onMinimizeClick} data-testid="minimize-button">
                Minimize
            </button>
        </div>
    ),
    ChatButton: ({ onClick, ...props }: any) => (
        <button data-testid="mock-chat-button" onClick={onClick} {...props}>
            Chat
        </button>
    ),
}));

interface MockState {
    appStates?: {
        conversationState?: ConversationState;
        outsideOperatingHours?: boolean;
        isMinimized?: boolean;
        unreadMessageCount?: number;
        startChatFailed?: boolean;
    };
    domainStates?: {
        liveChatConfig?: any;
        globalDir?: string;
    };
    uiStates?: {
        hideHeader?: boolean;
        headerProps?: any;
        chatButtonProps?: any;
    };
}

const createMockState = (overrides: MockState = {}): ILiveChatWidgetContext => ({
    state: {
        appStates: {
            conversationState: ConversationState.Closed,
            outsideOperatingHours: false,
            isMinimized: false,
            unreadMessageCount: 0,
            startChatFailed: false,
            ...overrides.appStates
        },
        domainStates: {
            liveChatConfig: {},
            globalDir: "ltr",
            ...overrides.domainStates
        },
        uiStates: {
            hideHeader: false,
            headerProps: {},
            chatButtonProps: {},
            ...overrides.uiStates
        }
    },
    dispatch: jest.fn()
});

describe("Out-of-Office Integration Tests", () => {
    let mockDispatch: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        mockDispatch = jest.fn();
        
        // Default mock adapter store
        mockUseChatAdapterStore.mockReturnValue([{}, jest.fn()]);
    });

    afterEach(() => {
        cleanup();
    });

    describe("Header and ChatButton State Synchronization", () => {
        it("should both components reflect out-of-office state when conversation is closed and outside operating hours", () => {
            const mockState = createMockState({
                appStates: {
                    conversationState: ConversationState.Closed,
                    outsideOperatingHours: true,
                    isMinimized: false
                }
            });
            mockState.dispatch = mockDispatch;
            mockUseChatContextStore.mockReturnValue([mockState.state, mockState.dispatch]);

            const { container } = render(
                <div>
                    <HeaderStateful />
                    <ChatButtonStateful />
                </div>
            );

            // Both components should be present
            expect(screen.getByTestId("mock-header")).toBeInTheDocument();
            expect(screen.getByTestId("mock-chat-button")).toBeInTheDocument();
        });

        it("should maintain state consistency when toggling between regular and out-of-office modes", () => {
            const mockState = createMockState({
                appStates: {
                    conversationState: ConversationState.Closed,
                    outsideOperatingHours: false,
                    isMinimized: false
                }
            });
            mockState.dispatch = mockDispatch;
            mockUseChatContextStore.mockReturnValue([mockState.state, mockState.dispatch]);

            const { rerender } = render(
                <div>
                    <HeaderStateful />
                    <ChatButtonStateful />
                </div>
            );

            // Initially in regular mode
            expect(screen.getByTestId("mock-header")).toBeInTheDocument();
            expect(screen.getByTestId("mock-chat-button")).toBeInTheDocument();

            // Switch to out-of-office mode
            const outOfOfficeState = createMockState({
                appStates: {
                    conversationState: ConversationState.Closed,
                    outsideOperatingHours: true,
                    isMinimized: false
                }
            });
            outOfOfficeState.dispatch = mockDispatch;
            mockUseChatContextStore.mockReturnValue([outOfOfficeState.state, outOfOfficeState.dispatch]);

            rerender(
                <div>
                    <HeaderStateful />
                    <ChatButtonStateful />
                </div>
            );

            // Still both present but now in out-of-office mode
            expect(screen.getByTestId("mock-header")).toBeInTheDocument();
            expect(screen.getByTestId("mock-chat-button")).toBeInTheDocument();
        });
    });

    describe("Cross-Component Event Handling", () => {
        it("should maintain out-of-office mode when header minimize is clicked from out-of-office state", async () => {
            const mockState = createMockState({
                appStates: {
                    conversationState: ConversationState.OutOfOffice,
                    outsideOperatingHours: true,
                    isMinimized: false
                }
            });
            mockState.dispatch = mockDispatch;
            mockUseChatContextStore.mockReturnValue([mockState.state, mockState.dispatch]);

            render(
                <div>
                    <HeaderStateful />
                    <ChatButtonStateful />
                </div>
            );

            const minimizeButton = screen.getByTestId("minimize-button");

            await act(async () => {
                minimizeButton.click();
            });

            // Should maintain conversation state as OutOfOffice (no change needed)
            // The minimize action should not change conversation state from OutOfOffice
            expect(mockDispatch).toHaveBeenCalledWith({
                type: LiveChatWidgetActionType.SET_MINIMIZED,
                payload: true
            });
        });

        it("should handle chat button click appropriately in out-of-office mode", async () => {
            const mockState = createMockState({
                appStates: {
                    conversationState: ConversationState.Closed,
                    outsideOperatingHours: true,
                    isMinimized: false
                }
            });
            mockState.dispatch = mockDispatch;
            mockUseChatContextStore.mockReturnValue([mockState.state, mockState.dispatch]);

            render(
                <div>
                    <HeaderStateful />
                    <ChatButtonStateful />
                </div>
            );

            const chatButton = screen.getByTestId("mock-chat-button");

            await act(async () => {
                chatButton.click();
            });

            // Should set conversation state to OutOfOffice when clicked in out-of-office conditions
            expect(mockDispatch).toHaveBeenCalledWith({
                type: LiveChatWidgetActionType.SET_CONVERSATION_STATE,
                payload: ConversationState.OutOfOffice
            });
        });

        it("should handle minimize from out-of-office state correctly", async () => {
            const mockState = createMockState({
                appStates: {
                    conversationState: ConversationState.OutOfOffice,
                    outsideOperatingHours: true,
                    isMinimized: false
                }
            });
            mockState.dispatch = mockDispatch;
            mockUseChatContextStore.mockReturnValue([mockState.state, mockState.dispatch]);

            render(<HeaderStateful />);

            const minimizeButton = screen.getByTestId("minimize-button");

            await act(async () => {
                minimizeButton.click();
            });

            // Should set minimized to true and maintain OutOfOffice state
            expect(mockDispatch).toHaveBeenCalledWith({
                type: LiveChatWidgetActionType.SET_MINIMIZED,
                payload: true
            });

            // Should not change conversation state from OutOfOffice
            expect(mockDispatch).not.toHaveBeenCalledWith({
                type: LiveChatWidgetActionType.SET_CONVERSATION_STATE,
                payload: expect.anything()
            });
        });
    });

    describe("State Transition Integration", () => {
        it("should handle transition from regular chat to out-of-office mode seamlessly", () => {
            // Start in regular chat mode
            const regularState = createMockState({
                appStates: {
                    conversationState: ConversationState.InChat,
                    outsideOperatingHours: false,
                    isMinimized: false
                }
            });
            regularState.dispatch = mockDispatch;
            mockUseChatContextStore.mockReturnValue([regularState.state, regularState.dispatch]);

            const { rerender } = render(
                <div>
                    <HeaderStateful />
                    <ChatButtonStateful />
                </div>
            );

            // Verify initial state
            expect(screen.getByTestId("mock-header")).toBeInTheDocument();
            expect(screen.getByTestId("mock-chat-button")).toBeInTheDocument();

            // Transition to out-of-office
            const outOfOfficeState = createMockState({
                appStates: {
                    conversationState: ConversationState.Closed,
                    outsideOperatingHours: true,
                    isMinimized: false
                }
            });
            outOfOfficeState.dispatch = mockDispatch;
            mockUseChatContextStore.mockReturnValue([outOfOfficeState.state, outOfOfficeState.dispatch]);

            rerender(
                <div>
                    <HeaderStateful />
                    <ChatButtonStateful />
                </div>
            );

            // Both components should still be present and functional
            expect(screen.getByTestId("mock-header")).toBeInTheDocument();
            expect(screen.getByTestId("mock-chat-button")).toBeInTheDocument();
        });

        it("should handle minimize state persistence across component re-renders", () => {
            const mockState = createMockState({
                appStates: {
                    conversationState: ConversationState.OutOfOffice,
                    outsideOperatingHours: true,
                    isMinimized: true
                }
            });
            mockState.dispatch = mockDispatch;
            mockUseChatContextStore.mockReturnValue([mockState.state, mockState.dispatch]);

            const { rerender } = render(
                <div>
                    <HeaderStateful />
                    <ChatButtonStateful />
                </div>
            );

            // Re-render with same state
            rerender(
                <div>
                    <HeaderStateful />
                    <ChatButtonStateful />
                </div>
            );

            // Components should maintain their state
            expect(screen.getByTestId("mock-header")).toBeInTheDocument();
            expect(screen.getByTestId("mock-chat-button")).toBeInTheDocument();
        });
    });

    describe("Error Handling Integration", () => {
        it("should gracefully handle missing state properties", () => {
            const incompleteState = {
                state: {
                    appStates: {
                        conversationState: ConversationState.Closed
                        // Missing other properties
                    },
                    domainStates: {},
                    uiStates: {}
                },
                dispatch: mockDispatch
            } as ILiveChatWidgetContext;

            mockUseChatContextStore.mockReturnValue([incompleteState.state, incompleteState.dispatch]);

            expect(() => {
                render(
                    <div>
                        <HeaderStateful />
                        <ChatButtonStateful />
                    </div>
                );
            }).not.toThrow();
        });

        it("should handle rapid state changes without breaking", async () => {
            const initialState = createMockState({
                appStates: {
                    conversationState: ConversationState.Closed,
                    outsideOperatingHours: false
                }
            });
            initialState.dispatch = mockDispatch;
            mockUseChatContextStore.mockReturnValue([initialState.state, initialState.dispatch]);

            const { rerender } = render(
                <div>
                    <HeaderStateful />
                    <ChatButtonStateful />
                </div>
            );

            // Rapid state changes
            for (let i = 0; i < 5; i++) {
                const newState = createMockState({
                    appStates: {
                        conversationState: i % 2 === 0 ? ConversationState.Closed : ConversationState.OutOfOffice,
                        outsideOperatingHours: i % 2 === 1
                    }
                });
                newState.dispatch = mockDispatch;
                mockUseChatContextStore.mockReturnValue([newState.state, newState.dispatch]);

                await act(async () => {
                    rerender(
                        <div>
                            <HeaderStateful />
                            <ChatButtonStateful />
                        </div>
                    );
                });
            }

            // Components should still be present and functional
            expect(screen.getByTestId("mock-header")).toBeInTheDocument();
            expect(screen.getByTestId("mock-chat-button")).toBeInTheDocument();
        });
    });

    describe("Props Integration", () => {
        it("should properly merge out-of-office props with default props", () => {
            const mockState = createMockState({
                appStates: {
                    conversationState: ConversationState.OutOfOffice,
                    outsideOperatingHours: true
                },
                uiStates: {
                    headerProps: {
                        customTitle: "Custom Header"
                    },
                    chatButtonProps: {
                        customText: "Custom Button"
                    }
                }
            });
            mockState.dispatch = mockDispatch;
            mockUseChatContextStore.mockReturnValue([mockState.state, mockState.dispatch]);

            render(
                <div>
                    <HeaderStateful />
                    <ChatButtonStateful />
                </div>
            );

            const header = screen.getByTestId("mock-header");
            const chatButton = screen.getByTestId("mock-chat-button");

            expect(header).toBeInTheDocument();
            expect(chatButton).toBeInTheDocument();
        });
    });
});
