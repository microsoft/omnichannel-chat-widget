import "@testing-library/jest-dom";

import { act, cleanup, render, screen } from "@testing-library/react";

import { ConversationState } from "../../contexts/common/ConversationState";
import { HeaderStateful } from "./HeaderStateful";
import { ILiveChatWidgetContext } from "../../contexts/common/ILiveChatWidgetContext";
import { LiveChatWidgetActionType } from "../../contexts/common/LiveChatWidgetActionType";
import React from "react";
import useChatAdapterStore from "../../hooks/useChatAdapterStore";
import useChatContextStore from "../../hooks/useChatContextStore";

// Mock the hooks
jest.mock("../../hooks/useChatContextStore");
jest.mock("../../hooks/useChatAdapterStore");
jest.mock("../../common/telemetry/TelemetryHelper");
jest.mock("../../common/utils", () => ({
    createTimer: () => ({ milliSecondsElapsed: 100 })
}));

// Mock the Header component to capture its props and simulate user interactions
jest.mock("@microsoft/omnichannel-chat-components", () => ({
    Header: ({ controlProps, styleProps, componentOverrides }: any) => {
        return (
            <div role="banner" data-testid="header">
                <button 
                    data-testid="minimize-button"
                    onClick={controlProps?.onMinimizeClick}
                    aria-label="Minimize"
                >
                    Minimize
                </button>
                <button 
                    data-testid="close-button"
                    onClick={controlProps?.onCloseClick}
                    aria-label="Close"
                >
                    Close
                </button>
                <span data-testid="header-title">
                    {controlProps?.headerTitleProps?.text || "Header"}
                </span>
            </div>
        );
    }
}));

// Mock the DraggableEventEmitter
jest.mock("../draggable/DraggableEventEmitter", () => {
    return ({ children }: any) => <div data-testid="draggable-wrapper">{children}</div>;
});

const mockUseChatContextStore = useChatContextStore as jest.MockedFunction<typeof useChatContextStore>;
const mockUseChatAdapterStore = useChatAdapterStore as jest.MockedFunction<typeof useChatAdapterStore>;

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
const mockEndChat = jest.fn();
const mockAdapter = {};

describe("HeaderStateful Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseChatAdapterStore.mockReturnValue([mockAdapter, jest.fn()]);
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
                headerProps: {
                    controlProps: {
                        id: "test-header",
                        headerTitleProps: { text: "Chat" }
                    }
                },
                outOfOfficeHeaderProps: {
                    controlProps: {
                        id: "test-ooo-header",
                        headerTitleProps: { text: "We're Offline" }
                    }
                },
                endChat: mockEndChat
            };

            render(<HeaderStateful {...props} />);

            // The component should render
            expect(screen.getByRole("banner")).toBeInTheDocument();
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
                headerProps: {
                    controlProps: {
                        id: "test-header",
                        headerTitleProps: { text: "Chat" }
                    }
                },
                endChat: mockEndChat
            };

            render(<HeaderStateful {...props} />);

            expect(screen.getByRole("banner")).toBeInTheDocument();
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
                headerProps: {
                    controlProps: {
                        id: "test-header",
                        headerTitleProps: { text: "Chat" }
                    }
                },
                endChat: mockEndChat
            };

            render(<HeaderStateful {...props} />);

            expect(screen.getByRole("banner")).toBeInTheDocument();
        });
    });

    describe("Minimize button functionality", () => {
        it("should dispatch minimize action when regular header minimize is clicked", async () => {
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
                headerProps: {
                    controlProps: {
                        id: "test-header",
                        headerTitleProps: { text: "Chat" },
                        minimizeButtonProps: { id: "minimize-btn" }
                    }
                },
                endChat: mockEndChat
            };

            render(<HeaderStateful {...props} />);

            const minimizeButton = screen.getByTestId("minimize-button");
            
            await act(async () => {
                minimizeButton.click();
            });

            expect(mockDispatch).toHaveBeenCalledWith({
                type: LiveChatWidgetActionType.SET_MINIMIZED,
                payload: true
            });
            expect(mockDispatch).toHaveBeenCalledWith({
                type: LiveChatWidgetActionType.SET_UNREAD_MESSAGE_COUNT,
                payload: 0
            });
        });

        it("should dispatch minimize and conversation state when out-of-office header minimize is clicked", async () => {
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
                headerProps: {
                    controlProps: {
                        id: "test-header",
                        headerTitleProps: { text: "Chat" }
                    }
                },
                outOfOfficeHeaderProps: {
                    controlProps: {
                        id: "test-ooo-header",
                        headerTitleProps: { text: "We're Offline" },
                        minimizeButtonProps: { id: "ooo-minimize-btn" }
                    }
                },
                endChat: mockEndChat
            };

            render(<HeaderStateful {...props} />);

            const minimizeButton = screen.getByTestId("minimize-button");
            
            await act(async () => {
                minimizeButton.click();
            });

            expect(mockDispatch).toHaveBeenCalledWith({
                type: LiveChatWidgetActionType.SET_MINIMIZED,
                payload: true
            });
        });

        it("should only set conversation state to Closed if current state is not Closed", async () => {
            const mockState = createMockState({
                appStates: {
                    conversationState: ConversationState.OutOfOffice, // OutOfOffice to trigger out-of-office props
                    outsideOperatingHours: true,
                    isMinimized: false,
                    unreadMessageCount: 0,
                    startChatFailed: false
                }
            });

            mockUseChatContextStore.mockReturnValue([mockState, mockDispatch]);

            const props = {
                outOfOfficeHeaderProps: {
                    controlProps: {
                        id: "test-ooo-header",
                        headerTitleProps: { text: "We're Offline" },
                        minimizeButtonProps: { id: "ooo-minimize-btn" }
                    }
                },
                endChat: mockEndChat
            };

            render(<HeaderStateful {...props} />);

            const minimizeButton = screen.getByTestId("minimize-button");
            
            await act(async () => {
                minimizeButton.click();
            });

            expect(mockDispatch).toHaveBeenCalledWith({
                type: LiveChatWidgetActionType.SET_MINIMIZED,
                payload: true
            });
            expect(mockDispatch).toHaveBeenCalledWith({
                type: LiveChatWidgetActionType.SET_CONVERSATION_STATE,
                payload: ConversationState.Closed
            });
        });

        it("should not set conversation state to Closed if current state is already Closed", async () => {
            const mockState = createMockState({
                appStates: {
                    conversationState: ConversationState.Closed, // Already Closed
                    outsideOperatingHours: true,
                    isMinimized: false,
                    unreadMessageCount: 0,
                    startChatFailed: false
                }
            });

            mockUseChatContextStore.mockReturnValue([mockState, mockDispatch]);

            const props = {
                outOfOfficeHeaderProps: {
                    controlProps: {
                        id: "test-ooo-header",
                        headerTitleProps: { text: "We're Offline" },
                        minimizeButtonProps: { id: "ooo-minimize-btn" }
                    }
                },
                endChat: mockEndChat
            };

            render(<HeaderStateful {...props} />);

            const minimizeButton = screen.getByTestId("minimize-button");
            
            await act(async () => {
                minimizeButton.click();
            });

            expect(mockDispatch).toHaveBeenCalledWith({
                type: LiveChatWidgetActionType.SET_MINIMIZED,
                payload: true
            });
            
            // Should not call SET_CONVERSATION_STATE since it's already Closed
            expect(mockDispatch).not.toHaveBeenCalledWith({
                type: LiveChatWidgetActionType.SET_CONVERSATION_STATE,
                payload: ConversationState.Closed
            });
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

            const { rerender } = render(<HeaderStateful 
                headerProps={{ controlProps: { id: "test-header" } }}
                outOfOfficeHeaderProps={{ controlProps: { id: "test-ooo-header" } }}
                endChat={mockEndChat}
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

            rerender(<HeaderStateful 
                headerProps={{ controlProps: { id: "test-header" } }}
                outOfOfficeHeaderProps={{ controlProps: { id: "test-ooo-header" } }}
                endChat={mockEndChat}
            />);

            expect(screen.getByRole("banner")).toBeInTheDocument();
        });
    });

    describe("Conditional rendering logic", () => {
        it("should use out-of-office props when outOfOperatingHours is true", () => {
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
                headerProps: {
                    controlProps: {
                        id: "test-header",
                        headerTitleProps: { text: "Regular Header" }
                    }
                },
                outOfOfficeHeaderProps: {
                    controlProps: {
                        id: "test-ooo-header",
                        headerTitleProps: { text: "We're Offline" }
                    }
                },
                endChat: mockEndChat
            };

            render(<HeaderStateful {...props} />);

            expect(screen.getByRole("banner")).toBeInTheDocument();
        });

        it("should use out-of-office props when conversation state is OutOfOffice", () => {
            const mockState = createMockState({
                appStates: {
                    conversationState: ConversationState.OutOfOffice,
                    outsideOperatingHours: false,
                    isMinimized: false,
                    unreadMessageCount: 0,
                    startChatFailed: false
                }
            });

            mockUseChatContextStore.mockReturnValue([mockState, mockDispatch]);

            const props = {
                headerProps: {
                    controlProps: {
                        id: "test-header",
                        headerTitleProps: { text: "Regular Header" }
                    }
                },
                outOfOfficeHeaderProps: {
                    controlProps: {
                        id: "test-ooo-header",
                        headerTitleProps: { text: "We're Offline" }
                    }
                },
                endChat: mockEndChat
            };

            render(<HeaderStateful {...props} />);

            expect(screen.getByRole("banner")).toBeInTheDocument();
        });

        it("should use regular props when both conditions are false", () => {
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
                headerProps: {
                    controlProps: {
                        id: "test-header",
                        headerTitleProps: { text: "Regular Header" }
                    }
                },
                outOfOfficeHeaderProps: {
                    controlProps: {
                        id: "test-ooo-header",
                        headerTitleProps: { text: "We're Offline" }
                    }
                },
                endChat: mockEndChat
            };

            render(<HeaderStateful {...props} />);

            expect(screen.getByRole("banner")).toBeInTheDocument();
        });
    });

    describe("Draggable functionality", () => {
        it("should render with DraggableEventEmitter when draggable is true", () => {
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
                headerProps: {
                    controlProps: {
                        id: "test-header",
                        headerTitleProps: { text: "Regular Header" }
                    }
                },
                draggable: true,
                endChat: mockEndChat
            };

            render(<HeaderStateful {...props} />);

            expect(screen.getByRole("banner")).toBeInTheDocument();
        });

        it("should use correct elementId for draggable when in out-of-office mode", () => {
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
                headerProps: {
                    controlProps: {
                        id: "test-header",
                        headerTitleProps: { text: "Regular Header" }
                    }
                },
                outOfOfficeHeaderProps: {
                    controlProps: {
                        id: "test-ooo-header",
                        headerTitleProps: { text: "We're Offline" }
                    }
                },
                draggable: true,
                endChat: mockEndChat
            };

            render(<HeaderStateful {...props} />);

            expect(screen.getByRole("banner")).toBeInTheDocument();
        });
    });
});
