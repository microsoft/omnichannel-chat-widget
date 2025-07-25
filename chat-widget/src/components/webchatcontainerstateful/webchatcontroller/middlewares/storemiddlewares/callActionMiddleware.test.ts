import "@testing-library/jest-dom";
import { IWebChatAction } from "../../../interfaces/IWebChatAction";
import { WebChatActionType } from "../../enums/WebChatActionType";
import createCallActionMiddleware from "./callActionMiddleware";

describe("CallActionMiddleware", () => {
    let nextMock: jest.Mock;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let middleware: any;

    beforeEach(() => {
        // Mock the next function in the middleware chain
        nextMock = jest.fn((action) => action);
        
        // Create the middleware instance
        const callActionMiddleware = createCallActionMiddleware();
        middleware = callActionMiddleware()(nextMock);
        
        jest.resetAllMocks();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("when processing DIRECT_LINE_INCOMING_ACTIVITY", () => {
        it("should convert call actions to openUrl actions with tel: scheme", () => {
            // Arrange
            const mockAction: IWebChatAction = {
                type: WebChatActionType.DIRECT_LINE_INCOMING_ACTIVITY,
                payload: {
                    activity: {
                        suggestedActions: {
                            actions: [
                                {
                                    type: "call",
                                    value: "+1234567890",
                                    title: "Call Support"
                                },
                                {
                                    type: "openUrl",
                                    value: "https://example.com",
                                    title: "Visit Website"
                                }
                            ]
                        }
                    }
                }
            };

            // Act
            middleware(mockAction);

            // Assert
            expect(nextMock).toHaveBeenCalledWith(mockAction);
            
            const suggestedActions = mockAction.payload.activity.suggestedActions.actions;
            expect(suggestedActions[0]).toEqual({
                type: "openUrl",
                value: "tel:+1234567890",
                title: "Call Support"
            });
            
            // Non-call actions should remain unchanged
            expect(suggestedActions[1]).toEqual({
                type: "openUrl",
                value: "https://example.com",
                title: "Visit Website"
            });
        });

        it("should handle multiple call actions correctly", () => {
            // Arrange
            const mockAction: IWebChatAction = {
                type: WebChatActionType.DIRECT_LINE_INCOMING_ACTIVITY,
                payload: {
                    activity: {
                        suggestedActions: {
                            actions: [
                                {
                                    type: "call",
                                    value: "+1234567890",
                                    title: "Call Sales"
                                },
                                {
                                    type: "call",
                                    value: "+0987654321",
                                    title: "Call Support"
                                }
                            ]
                        }
                    }
                }
            };

            // Act
            middleware(mockAction);

            // Assert
            const suggestedActions = mockAction.payload.activity.suggestedActions.actions;
            expect(suggestedActions[0]).toEqual({
                type: "openUrl",
                value: "tel:+1234567890",
                title: "Call Sales"
            });
            expect(suggestedActions[1]).toEqual({
                type: "openUrl",
                value: "tel:+0987654321",
                title: "Call Support"
            });
        });

        it("should handle call actions with different phone number formats", () => {
            // Arrange
            const mockAction: IWebChatAction = {
                type: WebChatActionType.DIRECT_LINE_INCOMING_ACTIVITY,
                payload: {
                    activity: {
                        suggestedActions: {
                            actions: [
                                {
                                    type: "call",
                                    value: "123-456-7890",
                                    title: "Call with dashes"
                                },
                                {
                                    type: "call",
                                    value: "(123) 456-7890",
                                    title: "Call with parentheses"
                                },
                                {
                                    type: "call",
                                    value: "1234567890",
                                    title: "Call without formatting"
                                }
                            ]
                        }
                    }
                }
            };

            // Act
            middleware(mockAction);

            // Assert
            const suggestedActions = mockAction.payload.activity.suggestedActions.actions;
            expect(suggestedActions[0].value).toBe("tel:123-456-7890");
            expect(suggestedActions[1].value).toBe("tel:(123) 456-7890");
            expect(suggestedActions[2].value).toBe("tel:1234567890");
        });

        it("should preserve all properties of call actions except type and value", () => {
            // Arrange
            const mockAction: IWebChatAction = {
                type: WebChatActionType.DIRECT_LINE_INCOMING_ACTIVITY,
                payload: {
                    activity: {
                        suggestedActions: {
                            actions: [
                                {
                                    type: "call",
                                    value: "+1234567890",
                                    title: "Call Support",
                                    image: "phone-icon.png",
                                    displayText: "Tap to call",
                                    customProperty: "custom-value"
                                }
                            ]
                        }
                    }
                }
            };

            // Act
            middleware(mockAction);

            // Assert
            const convertedAction = mockAction.payload.activity.suggestedActions.actions[0];
            expect(convertedAction).toEqual({
                type: "openUrl",
                value: "tel:+1234567890",
                title: "Call Support",
                image: "phone-icon.png",
                displayText: "Tap to call",
                customProperty: "custom-value"
            });
        });

        it("should not modify actions that are not call type", () => {
            // Arrange
            const mockAction: IWebChatAction = {
                type: WebChatActionType.DIRECT_LINE_INCOMING_ACTIVITY,
                payload: {
                    activity: {
                        suggestedActions: {
                            actions: [
                                {
                                    type: "openUrl",
                                    value: "https://example.com",
                                    title: "Visit Website"
                                }
                            ]
                        }
                    }
                }
            };

            // Act
            middleware(mockAction);

            // Assert
            expect(nextMock).toHaveBeenCalledWith(mockAction);
            expect(mockAction.payload.activity.suggestedActions.actions[0]).toEqual({
                type: "openUrl",
                value: "https://example.com",
                title: "Visit Website"
            });
        });
    });
});