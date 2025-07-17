import "@testing-library/jest-dom";
import { render, fireEvent } from "@testing-library/react";
import React from "react";
import { ChatButtonStateful } from "./ChatButtonStateful";
import { LiveChatWidgetActionType } from "../../contexts/common/LiveChatWidgetActionType";
import { ConversationState } from "../../contexts/common/ConversationState";

// Mock the useChatContextStore hook
const mockDispatch = jest.fn();
const mockUseChatContextStore = jest.fn();

jest.mock("../../hooks/useChatContextStore", () => ({
    __esModule: true,
    default: jest.fn()
}));

// Mock the TelemetryHelper
jest.mock("../../common/telemetry/TelemetryHelper", () => ({
    TelemetryHelper: {
        logLoadingEventToAllTelemetry: jest.fn(),
        logActionEventToAllTelemetry: jest.fn(),
        logLoadingEvent: jest.fn()
    }
}));

// Mock TelemetryTimers
jest.mock("../../common/telemetry/TelemetryManager", () => ({
    TelemetryTimers: {
        LcwLoadToChatButtonTimer: {
            milliSecondsElapsed: 100
        }
    }
}));

// Mock utils
jest.mock("../../common/utils", () => ({
    createTimer: jest.fn(() => ({ milliSecondsElapsed: 100 })),
    setFocusOnElement: jest.fn()
}));

// Mock the ChatButton component from omnichannel-chat-components
jest.mock("@microsoft/omnichannel-chat-components", () => ({
    ChatButton: ({ controlProps }: any) => (
        <button 
            id={controlProps.id}
            onClick={controlProps.onClick}
            data-testid="chat-button"
        >
            {controlProps.titleText}
        </button>
    )
}));

describe("ChatButtonStateful OOH Button onClick Test", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should preserve OOH onClick handler even when outOfOfficeButtonProps contains onClick", async () => {
        // Mock startChat function
        const mockStartChat = jest.fn();
        
        // Create outOfOfficeButtonProps with its own onClick handler (this should be overridden)
        const mockOOHOnClick = jest.fn();
        const outOfOfficeButtonProps = {
            controlProps: {
                onClick: mockOOHOnClick, // This should NOT be called for OOH button
                someOtherProp: "test"
            }
        };

        const props = {
            buttonProps: {},
            outOfOfficeButtonProps: outOfOfficeButtonProps,
            startChat: mockStartChat
        };

        // Set state to indicate we're outside operating hours
        const oohState = {
            domainStates: {
                globalDir: "ltr"
            },
            appStates: {
                conversationState: ConversationState.Closed,
                outsideOperatingHours: true,
                isMinimized: false,
                unreadMessageCount: 0
            },
            uiStates: {
                focusChatButton: false
            }
        };

        // Mock the hook to return OOH state
        const useChatContextStore = require("../../hooks/useChatContextStore").default;
        useChatContextStore.mockReturnValue([oohState, mockDispatch]);

        const { getByTestId } = render(<ChatButtonStateful {...props} />);
        const chatButton = getByTestId("chat-button");

        // Click the chat button (should be OOH button since outsideOperatingHours is true)
        fireEvent.click(chatButton);

        // Wait for async onClick to complete
        await new Promise(resolve => setTimeout(resolve, 0));

        // Verify that the OOH-specific onClick handler was called (should dispatch SET_CONVERSATION_STATE to OutOfOffice)
        expect(mockDispatch).toHaveBeenCalledWith({
            type: LiveChatWidgetActionType.SET_CONVERSATION_STATE,
            payload: ConversationState.OutOfOffice
        });

        // Verify that the outOfOfficeButtonProps onClick was NOT called
        expect(mockOOHOnClick).not.toHaveBeenCalled();
        
        // Verify that startChat was NOT called (this is the key test - OOH button should not start chat)
        expect(mockStartChat).not.toHaveBeenCalled();
    });

    it("should call startChat for normal button when not in OOH", async () => {
        const mockStartChat = jest.fn();
        
        const props = {
            buttonProps: {},
            outOfOfficeButtonProps: {},
            startChat: mockStartChat
        };

        // Set state to indicate we're NOT outside operating hours
        const normalState = {
            domainStates: {
                globalDir: "ltr"
            },
            appStates: {
                conversationState: ConversationState.Closed,
                outsideOperatingHours: false,
                isMinimized: false,
                unreadMessageCount: 0
            },
            uiStates: {
                focusChatButton: false
            }
        };

        const useChatContextStore = require("../../hooks/useChatContextStore").default;
        useChatContextStore.mockReturnValue([normalState, mockDispatch]);

        const { getByTestId } = render(<ChatButtonStateful {...props} />);
        const chatButton = getByTestId("chat-button");

        // Click the chat button (should be normal button since outsideOperatingHours is false)
        fireEvent.click(chatButton);

        // Wait for async onClick to complete
        await new Promise(resolve => setTimeout(resolve, 0));

        // Verify that startChat was called for normal button
        expect(mockStartChat).toHaveBeenCalled();
    });
});