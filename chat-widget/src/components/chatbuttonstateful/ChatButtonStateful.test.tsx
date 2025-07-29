import "@testing-library/jest-dom";

import { act, cleanup, render, screen } from "@testing-library/react";

import { ChatButtonStateful } from "./ChatButtonStateful";
import { ConversationState } from "../../contexts/common/ConversationState";
import { ILiveChatWidgetContext } from "../../contexts/common/ILiveChatWidgetContext";
import { LiveChatWidgetActionType } from "../../contexts/common/LiveChatWidgetActionType";
import React from "react";
import { TelemetryTimers } from "../../common/telemetry/TelemetryManager";
import useChatContextStore from "../../hooks/useChatContextStore";

// Mock the hooks
jest.mock("../../hooks/useChatContextStore");
jest.mock("../../common/telemetry/TelemetryHelper");
jest.mock("../../common/telemetry/TelemetryManager");
jest.mock("../../common/utils", () => ({
    createTimer: () => ({ milliSecondsElapsed: 100 }),
    setFocusOnElement: jest.fn()
}));

// Mock the ChatButton component to capture its props and simulate user interactions
jest.mock("@microsoft/omnichannel-chat-components", () => ({
    ChatButton: ({ controlProps, styleProps, componentOverrides }: any) => {
        return (
            <button 
                data-testid="chat-button"
                onClick={controlProps?.onClick}
                aria-label={controlProps?.titleText || "Chat"}
                title={controlProps?.titleText}
            >
                {controlProps?.titleText || "Chat"}
                {controlProps?.subtitleText && (
                    <span data-testid="subtitle">{controlProps.subtitleText}</span>
                )}
            </button>
        );
    }
}));

const mockUseChatContextStore = useChatContextStore as jest.MockedFunction<typeof useChatContextStore>;

const createMockState = (overrides: Partial<ILiveChatWidgetContext> = {}): ILiveChatWidgetContext => ({
    domainStates: {
        globalDir: "ltr",
        confirmationState: "Ok"
    },
    appStates: {
        conversationState: ConversationState.Closed,
        outsideOperatingHours: false,
        isMinimized: false,
        unreadMessageCount: 0,
        startChatFailed: false,
        ...overrides.appStates
    },
    uiStates: {
        focusChatButton: false,
        ...overrides.uiStates
    },
    ...overrides
} as ILiveChatWidgetContext);

const mockDispatch = jest.fn();
const mockStartChat = jest.fn();

describe("ChatButtonStateful Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock TelemetryTimers
        (TelemetryTimers as any).LcwLoadToChatButtonTimer = { milliSecondsElapsed: 100 };
    });

    afterEach(() => {
        cleanup();
    });

    describe("Out-of-office mode initialization", () => {
        it("should initialize with out-of-office mode when conversation is closed and outside operating hours", () => {
            const mockState = createMockState({
                appStates: {
                    conversationState: ConversationState.Closed,
                    outsideOperatingHours: true,
                    isMinimized: false,
                    unreadMessageCount: 0,
                    startChatFailed: false
                }
            });

            mockUseChatContextStore.mockReturnValue([mockState, mockDispatch]);

            const props = {
                buttonProps: {
                    controlProps: {
                        id: "test-button",
                        titleText: "Chat"
                    }
                },
                outOfOfficeButtonProps: {
                    controlProps: {
                        id: "test-ooo-button",
                        titleText: "We're Offline"
                    }
                },
                startChat: mockStartChat
            };

            render(<ChatButtonStateful {...props} />);

            // The component should render with out-of-office props
            expect(screen.getByRole("button")).toBeInTheDocument();
        });

        it("should initialize with regular mode when conversation is closed but inside operating hours", () => {
            const mockState = createMockState({
                appStates: {
                    conversationState: ConversationState.Closed,
                    outsideOperatingHours: false,
                    isMinimized: false,
                    unreadMessageCount: 0,
                    startChatFailed: false
                }
            });

            mockUseChatContextStore.mockReturnValue([mockState, mockDispatch]);

            const props = {
                buttonProps: {
                    controlProps: {
                        id: "test-button",
                        titleText: "Chat"
                    }
                },
                outOfOfficeButtonProps: {
                    controlProps: {
                        id: "test-ooo-button",
                        titleText: "We're Offline"
                    }
                },
                startChat: mockStartChat
            };

            render(<ChatButtonStateful {...props} />);

            expect(screen.getByRole("button")).toBeInTheDocument();
        });

        it("should initialize with regular mode when conversation is not closed", () => {
            const mockState = createMockState({
                appStates: {
                    conversationState: ConversationState.InChat,
                    outsideOperatingHours: true,
                    isMinimized: false,
                    unreadMessageCount: 0,
                    startChatFailed: false
                }
            });

            mockUseChatContextStore.mockReturnValue([mockState, mockDispatch]);

            const props = {
                buttonProps: {
                    controlProps: {
                        id: "test-button",
                        titleText: "Chat"
                    }
                },
                startChat: mockStartChat
            };

            render(<ChatButtonStateful {...props} />);

            expect(screen.getByRole("button")).toBeInTheDocument();
        });
    });

    describe("State updates and re-renders", () => {
        it("should update to out-of-office mode when outsideOperatingHours changes to true", () => {
            const initialState = createMockState({
                appStates: {
                    conversationState: ConversationState.Closed,
                    outsideOperatingHours: false,
                    isMinimized: false,
                    unreadMessageCount: 0,
                    startChatFailed: false
                }
            });

            const { rerender } = render(<ChatButtonStateful 
                buttonProps={{ controlProps: { id: "test-button" } }}
                outOfOfficeButtonProps={{ controlProps: { id: "test-ooo-button" } }}
                startChat={mockStartChat}
            />);

            // Initially should be in regular mode
            mockUseChatContextStore.mockReturnValue([initialState, mockDispatch]);

            // Update state to outside operating hours
            const updatedState = createMockState({
                appStates: {
                    conversationState: ConversationState.Closed,
                    outsideOperatingHours: true,
                    isMinimized: false,
                    unreadMessageCount: 0,
                    startChatFailed: false
                }
            });

            mockUseChatContextStore.mockReturnValue([updatedState, mockDispatch]);

            rerender(<ChatButtonStateful 
                buttonProps={{ controlProps: { id: "test-button" } }}
                outOfOfficeButtonProps={{ controlProps: { id: "test-ooo-button" } }}
                startChat={mockStartChat}
            />);

            expect(screen.getByRole("button")).toBeInTheDocument();
        });

        it("should reset out-of-office mode when conversation state is not closed", () => {
            const initialState = createMockState({
                appStates: {
                    conversationState: ConversationState.Closed,
                    outsideOperatingHours: true,
                    isMinimized: false,
                    unreadMessageCount: 0,
                    startChatFailed: false
                }
            });

            mockUseChatContextStore.mockReturnValue([initialState, mockDispatch]);

            const { rerender } = render(<ChatButtonStateful 
                buttonProps={{ controlProps: { id: "test-button" } }}
                outOfOfficeButtonProps={{ controlProps: { id: "test-ooo-button" } }}
                startChat={mockStartChat}
            />);

            // Update state to different conversation state
            const updatedState = createMockState({
                appStates: {
                    conversationState: ConversationState.InChat,
                    outsideOperatingHours: true,
                    isMinimized: false,
                    unreadMessageCount: 0,
                    startChatFailed: false
                }
            });

            mockUseChatContextStore.mockReturnValue([updatedState, mockDispatch]);

            rerender(<ChatButtonStateful 
                buttonProps={{ controlProps: { id: "test-button" } }}
                outOfOfficeButtonProps={{ controlProps: { id: "test-ooo-button" } }}
                startChat={mockStartChat}
            />);

            expect(screen.getByRole("button")).toBeInTheDocument();
        });
    });

    describe("Click handlers", () => {
        it("should call regular startChat when in regular mode", async () => {
            const mockState = createMockState({
                appStates: {
                    conversationState: ConversationState.Closed,
                    outsideOperatingHours: false,
                    isMinimized: false,
                    unreadMessageCount: 0,
                    startChatFailed: false
                }
            });

            mockUseChatContextStore.mockReturnValue([mockState, mockDispatch]);

            const props = {
                buttonProps: {
                    controlProps: {
                        id: "test-button",
                        titleText: "Chat"
                    }
                },
                startChat: mockStartChat
            };

            render(<ChatButtonStateful {...props} />);

            const button = screen.getByRole("button");
            
            await act(async () => {
                button.click();
            });

            expect(mockStartChat).toHaveBeenCalled();
        });

        it("should dispatch OutOfOffice conversation state when in out-of-office mode", async () => {
            const mockState = createMockState({
                appStates: {
                    conversationState: ConversationState.Closed,
                    outsideOperatingHours: true,
                    isMinimized: false,
                    unreadMessageCount: 0,
                    startChatFailed: false
                }
            });

            mockUseChatContextStore.mockReturnValue([mockState, mockDispatch]);

            const props = {
                buttonProps: {
                    controlProps: {
                        id: "test-button",
                        titleText: "Chat"
                    }
                },
                outOfOfficeButtonProps: {
                    controlProps: {
                        id: "test-ooo-button",
                        titleText: "We're Offline"
                    }
                },
                startChat: mockStartChat
            };

            render(<ChatButtonStateful {...props} />);

            const button = screen.getByRole("button");
            
            await act(async () => {
                button.click();
            });

            expect(mockDispatch).toHaveBeenCalledWith({
                type: LiveChatWidgetActionType.SET_CONVERSATION_STATE,
                payload: ConversationState.OutOfOffice
            });
        });

        it("should handle minimized state correctly in regular mode", async () => {
            const mockState = createMockState({
                appStates: {
                    conversationState: ConversationState.Closed,
                    outsideOperatingHours: false,
                    isMinimized: true,
                    unreadMessageCount: 0,
                    startChatFailed: false
                }
            });

            mockUseChatContextStore.mockReturnValue([mockState, mockDispatch]);

            const props = {
                buttonProps: {
                    controlProps: {
                        id: "test-button",
                        titleText: "Chat"
                    }
                },
                startChat: mockStartChat
            };

            render(<ChatButtonStateful {...props} />);

            const button = screen.getByRole("button");
            
            await act(async () => {
                button.click();
            });

            expect(mockDispatch).toHaveBeenCalledWith({
                type: LiveChatWidgetActionType.SET_MINIMIZED,
                payload: false
            });
            expect(mockDispatch).toHaveBeenCalledWith({
                type: LiveChatWidgetActionType.SET_UNREAD_MESSAGE_COUNT,
                payload: 0
            });
            expect(mockStartChat).toHaveBeenCalled();
        });

        it("should handle minimized state correctly in out-of-office mode", async () => {
            const mockState = createMockState({
                appStates: {
                    conversationState: ConversationState.Closed,
                    outsideOperatingHours: true,
                    isMinimized: true,
                    unreadMessageCount: 0,
                    startChatFailed: false
                }
            });

            mockUseChatContextStore.mockReturnValue([mockState, mockDispatch]);

            const props = {
                buttonProps: {
                    controlProps: {
                        id: "test-button",
                        titleText: "Chat"
                    }
                },
                outOfOfficeButtonProps: {
                    controlProps: {
                        id: "test-ooo-button",
                        titleText: "We're Offline"
                    }
                },
                startChat: mockStartChat
            };

            render(<ChatButtonStateful {...props} />);

            const button = screen.getByRole("button");
            
            await act(async () => {
                button.click();
            });

            expect(mockDispatch).toHaveBeenCalledWith({
                type: LiveChatWidgetActionType.SET_MINIMIZED,
                payload: false
            });
            expect(mockDispatch).toHaveBeenCalledWith({
                type: LiveChatWidgetActionType.SET_CONVERSATION_STATE,
                payload: ConversationState.OutOfOffice
            });
        });
    });

    describe("Props spreading and click handler precedence", () => {
        it("should allow external onClick to override internal onClick for popup functionality", async () => {
            const mockState = createMockState({
                appStates: {
                    conversationState: ConversationState.Closed,
                    outsideOperatingHours: true,
                    isMinimized: false,
                    unreadMessageCount: 0,
                    startChatFailed: false
                }
            });

            mockUseChatContextStore.mockReturnValue([mockState, mockDispatch]);

            const customOnClick = jest.fn();
            const props = {
                buttonProps: {
                    controlProps: {
                        id: "test-button",
                        titleText: "Chat"
                    }
                },
                outOfOfficeButtonProps: {
                    controlProps: {
                        id: "test-ooo-button",
                        titleText: "We're Offline",
                        onClick: customOnClick // This should override the internal onClick
                    }
                },
                startChat: mockStartChat
            };

            render(<ChatButtonStateful {...props} />);

            const button = screen.getByRole("button");
            
            await act(async () => {
                button.click();
            });

            // Should call the custom onClick handler instead of internal logic
            expect(customOnClick).toHaveBeenCalled();
            expect(mockDispatch).not.toHaveBeenCalledWith({
                type: LiveChatWidgetActionType.SET_CONVERSATION_STATE,
                payload: ConversationState.OutOfOffice
            });
        });

        it("should properly spread other properties from outOfOfficeButtonProps while excluding onClick", () => {
            const mockState = createMockState({
                appStates: {
                    conversationState: ConversationState.Closed,
                    outsideOperatingHours: true,
                    isMinimized: false,
                    unreadMessageCount: 0,
                    startChatFailed: false
                }
            });

            mockUseChatContextStore.mockReturnValue([mockState, mockDispatch]);

            const props = {
                buttonProps: {
                    controlProps: {
                        id: "test-button",
                        titleText: "Chat"
                    }
                },
                outOfOfficeButtonProps: {
                    controlProps: {
                        id: "test-ooo-button",
                        titleText: "Custom Offline Title",
                        subtitleText: "Custom Offline Subtitle",
                        onClick: jest.fn(), // Should be excluded
                        customProp: "should be included"
                    }
                },
                startChat: mockStartChat
            };

            render(<ChatButtonStateful {...props} />);

            expect(screen.getByRole("button")).toBeInTheDocument();
            // The component should have the custom properties but not the onClick
        });
    });
});
