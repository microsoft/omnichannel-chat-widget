import { ChatSDKError, ChatSDKErrorName } from "@microsoft/omnichannel-chat-sdk";
import { WidgetLoadCustomErrorString, WidgetLoadTelemetryMessage } from "../../../common/Constants";

import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { ConversationState } from "../../../contexts/common/ConversationState";
import { ILiveChatWidgetProps } from "../interfaces/ILiveChatWidgetProps";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";
import { TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { handleStartChatError } from "./startChatErrorHandler";

describe("startChatErrorHandler unit test", () => {
    it("handleStartChatError should log failed event and return if exception is undefined", () => {
        const dispatch = jest.fn();
        const mockFacade = { getChatSDK: jest.fn()};

        spyOn(BroadcastService, "postMessage").and.callFake(() => false);
        spyOn(TelemetryHelper, "logLoadingEvent").and.callFake(() => false);
        handleStartChatError(dispatch, mockFacade, {} as ILiveChatWidgetProps, undefined, false);

        expect(TelemetryHelper.logLoadingEvent).toHaveBeenCalledTimes(1);
        expect(TelemetryHelper.logLoadingEvent).toHaveBeenCalledWith("ERROR", expect.objectContaining({
            ExceptionDetails: expect.objectContaining({
                Exception: "Widget load complete with error: undefined"
            })
        }));
        expect(dispatch).not.toHaveBeenCalled();
    });

    it("handleStartChatError should log failed with error event for AuthenticationFailedErrorString", () => {
        const dispatch = jest.fn();
        const mockEx = new Error(WidgetLoadCustomErrorString.AuthenticationFailedErrorString);
        const mockFacade = { getChatSDK: jest.fn()};
        spyOn(BroadcastService, "postMessage").and.callFake(() => false);
        spyOn(TelemetryHelper, "logLoadingEvent").and.callFake(() => false);
        handleStartChatError(dispatch, mockFacade, {} as ILiveChatWidgetProps, mockEx, false);

        expect(TelemetryHelper.logLoadingEvent).toHaveBeenCalledTimes(2);
        expect(TelemetryHelper.logLoadingEvent).toHaveBeenCalledWith("WARN", expect.objectContaining({
            ExceptionDetails: expect.objectContaining({
                Exception: `Widget load complete with error: Error: ${WidgetLoadCustomErrorString.AuthenticationFailedErrorString}`
            })
        }));
        expect(dispatch).toHaveBeenCalledTimes(4);
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
            type: LiveChatWidgetActionType.SET_CONVERSATION_STATE
        }));
    });

    it("handleStartChatError should log failed with error event for NetworkErrorString", () => {
        const dispatch = jest.fn();
        const mockEx = new Error(WidgetLoadCustomErrorString.NetworkErrorString);
        const mockFacade = { getChatSDK: jest.fn()};
        spyOn(BroadcastService, "postMessage").and.callFake(() => false);
        spyOn(TelemetryHelper, "logLoadingEvent").and.callFake(() => false);
        handleStartChatError(dispatch, mockFacade , {} as ILiveChatWidgetProps, mockEx, false);

        expect(TelemetryHelper.logLoadingEvent).toHaveBeenCalledTimes(2);
        expect(TelemetryHelper.logLoadingEvent).toHaveBeenCalledWith("WARN", expect.objectContaining({
            ExceptionDetails: expect.objectContaining({
                Exception: `Widget load complete with error: Error: ${WidgetLoadCustomErrorString.NetworkErrorString}`
            })
        }));
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
            type: LiveChatWidgetActionType.SET_CONVERSATION_STATE
        }));
    });

    it("handleStartChatError should log complete event for WidgetUseOutsideOperatingHour", () => {
        const dispatch = jest.fn();
        const mockEx = new ChatSDKError(ChatSDKErrorName.WidgetUseOutsideOperatingHour);
        const mockFacade = { getChatSDK: jest.fn()};
        spyOn(BroadcastService, "postMessage").and.callFake(() => false);
        spyOn(TelemetryHelper, "logLoadingEvent").and.callFake(() => false);
        handleStartChatError(dispatch, mockFacade, {} as ILiveChatWidgetProps, mockEx, false);

        expect(TelemetryHelper.logLoadingEvent).toHaveBeenCalledTimes(1);
        expect(TelemetryHelper.logLoadingEvent).toHaveBeenCalledWith("INFO", expect.objectContaining({
            Description: `Widget load complete. ${WidgetLoadTelemetryMessage.OOOHMessage}`
        }));
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
            type: LiveChatWidgetActionType.SET_CONVERSATION_STATE
        }));
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
            type: LiveChatWidgetActionType.SET_OUTSIDE_OPERATING_HOURS
        }));
    });

    it("handleStartChatError should log failed with error event for PersistentChatConversationRetrievalFailure for non-400 status", () => {
        const dispatch = jest.fn();
        const mockEx = new ChatSDKError(ChatSDKErrorName.PersistentChatConversationRetrievalFailure, 429);
        const mockFacade = { getChatSDK: jest.fn()};
        spyOn(BroadcastService, "postMessage").and.callFake(() => false);
        spyOn(TelemetryHelper, "logLoadingEvent").and.callFake(() => false);
        handleStartChatError(dispatch, mockFacade, {} as ILiveChatWidgetProps, mockEx, false);

        expect(TelemetryHelper.logLoadingEvent).toHaveBeenCalledTimes(2);
        expect(TelemetryHelper.logLoadingEvent).toHaveBeenCalledWith("WARN", expect.objectContaining({
            Description: "Widget load complete with error",
            ExceptionDetails: expect.objectContaining({
                Exception: `Widget load complete with error: ${ChatSDKErrorName.PersistentChatConversationRetrievalFailure}`,
                HttpResponseStatusCode: 429
            })
        }));
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
            type: LiveChatWidgetActionType.SET_CONVERSATION_STATE
        }));
    });

    it("handleStartChatError should log failed event for PersistentChatConversationRetrievalFailure for 400 status", () => {
        const dispatch = jest.fn();
        const mockEx = new ChatSDKError(ChatSDKErrorName.PersistentChatConversationRetrievalFailure, 400);
        spyOn(BroadcastService, "postMessage").and.callFake(() => false);
        spyOn(TelemetryHelper, "logLoadingEvent").and.callFake(() => false);
        const mockFacade = { getChatSDK: jest.fn()};
        handleStartChatError(dispatch, mockFacade, {} as ILiveChatWidgetProps, mockEx, false);

        expect(TelemetryHelper.logLoadingEvent).toHaveBeenCalledTimes(2);
        expect(TelemetryHelper.logLoadingEvent).toHaveBeenCalledWith("ERROR", expect.objectContaining({
            ExceptionDetails: expect.objectContaining({
                Exception: `Widget load complete with error: ${ChatSDKErrorName.PersistentChatConversationRetrievalFailure}`,
                HttpResponseStatusCode: 400
            })
        }));
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
            type: LiveChatWidgetActionType.SET_CONVERSATION_STATE
        }));
    });

    it("handleStartChatError should log failed with error event for ConversationInitializationFailure for non-400 status", () => {
        const dispatch = jest.fn();
        const mockEx = new ChatSDKError(ChatSDKErrorName.ConversationInitializationFailure, 429);
        const mockFacade = { getChatSDK: jest.fn()};
        spyOn(BroadcastService, "postMessage").and.callFake(() => false);
        spyOn(TelemetryHelper, "logLoadingEvent").and.callFake(() => false);
        handleStartChatError(dispatch, mockFacade, {} as ILiveChatWidgetProps, mockEx, false);

        expect(TelemetryHelper.logLoadingEvent).toHaveBeenCalledTimes(2);
        expect(TelemetryHelper.logLoadingEvent).toHaveBeenCalledWith("WARN", expect.objectContaining({
            Description: "Widget load complete with error",
            ExceptionDetails: expect.objectContaining({
                Exception: `Widget load complete with error: ${ChatSDKErrorName.ConversationInitializationFailure}`,
                HttpResponseStatusCode: 429
            })
        }));
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
            type: LiveChatWidgetActionType.SET_CONVERSATION_STATE
        }));
    });

    it("handleStartChatError should log failed event for ConversationInitializationFailure for 400 status", () => {
        const dispatch = jest.fn();
        const mockEx = new ChatSDKError(ChatSDKErrorName.ConversationInitializationFailure, 400);
        const mockFacade = { getChatSDK: jest.fn()};
        spyOn(BroadcastService, "postMessage").and.callFake(() => false);
        spyOn(TelemetryHelper, "logLoadingEvent").and.callFake(() => false);
        handleStartChatError(dispatch, mockFacade, {} as ILiveChatWidgetProps, mockEx, false);

        expect(TelemetryHelper.logLoadingEvent).toHaveBeenCalledTimes(2);
        expect(TelemetryHelper.logLoadingEvent).toHaveBeenCalledWith("ERROR", expect.objectContaining({
            ExceptionDetails: expect.objectContaining({
                Exception: `Widget load complete with error: ${ChatSDKErrorName.ConversationInitializationFailure}`,
                HttpResponseStatusCode: 400
            })
        }));
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
            type: LiveChatWidgetActionType.SET_CONVERSATION_STATE
        }));
    });

    it("handleStartChatError should log failed with error event for ChatTokenRetrievalFailure for non-400 status", () => {
        const dispatch = jest.fn();
        const mockEx = new ChatSDKError(ChatSDKErrorName.ChatTokenRetrievalFailure, 429);
        const mockFacade = { getChatSDK: jest.fn()};
        spyOn(BroadcastService, "postMessage").and.callFake(() => false);
        spyOn(TelemetryHelper, "logLoadingEvent").and.callFake(() => false);
        handleStartChatError(dispatch, mockFacade, {} as ILiveChatWidgetProps, mockEx, false);

        expect(TelemetryHelper.logLoadingEvent).toHaveBeenCalledTimes(2);
        expect(TelemetryHelper.logLoadingEvent).toHaveBeenCalledWith("WARN", expect.objectContaining({
            Description: "Widget load complete with error",
            ExceptionDetails: expect.objectContaining({
                Exception: `Widget load complete with error: ${ChatSDKErrorName.ChatTokenRetrievalFailure}`,
                HttpResponseStatusCode: 429
            })
        }));
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
            type: LiveChatWidgetActionType.SET_CONVERSATION_STATE
        }));
    });

    it("handleStartChatError should log failed event for ChatTokenRetrievalFailure for 400 status", () => {
        const dispatch = jest.fn();
        const mockEx = new ChatSDKError(ChatSDKErrorName.ChatTokenRetrievalFailure, 400);
        const mockFacade = { getChatSDK: jest.fn()};
        spyOn(BroadcastService, "postMessage").and.callFake(() => false);
        spyOn(TelemetryHelper, "logLoadingEvent").and.callFake(() => false);
        handleStartChatError(dispatch, mockFacade, {} as ILiveChatWidgetProps, mockEx, false);

        expect(TelemetryHelper.logLoadingEvent).toHaveBeenCalledTimes(2);
        expect(TelemetryHelper.logLoadingEvent).toHaveBeenCalledWith("ERROR", expect.objectContaining({
            ExceptionDetails: expect.objectContaining({
                Exception: `Widget load complete with error: ${ChatSDKErrorName.ChatTokenRetrievalFailure}`,
                HttpResponseStatusCode: 400
            })
        }));
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
            type: LiveChatWidgetActionType.SET_CONVERSATION_STATE
        }));
    });

    it("handleStartChatError should log failed with error event for ChatTokenRetrievalFailure for 401 status", () => {
        const dispatch = jest.fn();
        const mockEx = new ChatSDKError(ChatSDKErrorName.ChatTokenRetrievalFailure, 401);
        const mockFacade = { getChatSDK: jest.fn()};
        spyOn(BroadcastService, "postMessage").and.callFake(() => false);
        spyOn(TelemetryHelper, "logLoadingEvent").and.callFake(() => false);
        handleStartChatError(dispatch, mockFacade, {} as ILiveChatWidgetProps, mockEx, false);

        expect(TelemetryHelper.logLoadingEvent).toHaveBeenCalledTimes(2);
        expect(TelemetryHelper.logLoadingEvent).toHaveBeenCalledWith("WARN", expect.objectContaining({
            ExceptionDetails: expect.objectContaining({
                Exception: `Widget load complete with error: ${ChatSDKErrorName.ChatTokenRetrievalFailure}`,
                HttpResponseStatusCode: 401
            })
        }));
        expect(dispatch).toHaveBeenCalledTimes(3);
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
            type: LiveChatWidgetActionType.SET_CONVERSATION_STATE
        }));
    });

    it("handleStartChatError should log failed with error event for UninitializedChatSDK", () => {
        const dispatch = jest.fn();
        const mockEx = new ChatSDKError(ChatSDKErrorName.UninitializedChatSDK);
        const mockFacade = { getChatSDK: (jest.fn())};
        spyOn(BroadcastService, "postMessage").and.callFake(() => false);
        spyOn(TelemetryHelper, "logLoadingEvent").and.callFake(() => false);
        handleStartChatError(dispatch, mockFacade, {} as ILiveChatWidgetProps, mockEx, false);

        expect(TelemetryHelper.logLoadingEvent).toHaveBeenCalledTimes(2);
        expect(TelemetryHelper.logLoadingEvent).toHaveBeenCalledWith("WARN", expect.objectContaining({
            Description: "Widget load complete with error",
            ExceptionDetails: expect.objectContaining({
                Exception: `Widget load complete with error: ${ChatSDKErrorName.UninitializedChatSDK}`
            })
        }));
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
            type: LiveChatWidgetActionType.SET_CONVERSATION_STATE
        }));
    });

    it("handleStartChatError should log failed with error event for InvalidConversation", () => {
        const dispatch = jest.fn();
        const mockEx = new ChatSDKError(ChatSDKErrorName.InvalidConversation);
        const mockFacade = { getChatSDK: ()=>{ return {}; }};
        
        spyOn(BroadcastService, "postMessage").and.callFake(() => false);
        spyOn(TelemetryHelper, "logLoadingEvent").and.callFake(() => false);
        handleStartChatError(dispatch, mockFacade, {} as ILiveChatWidgetProps, mockEx, false);

        expect(TelemetryHelper.logLoadingEvent).toHaveBeenCalledTimes(1);
        expect(TelemetryHelper.logLoadingEvent).toHaveBeenCalledWith("WARN", expect.objectContaining({
            Description: "Widget load complete with error",
            ExceptionDetails: expect.objectContaining({
                Exception: `Widget load complete with error: ${ChatSDKErrorName.InvalidConversation}`
            })
        }));
        expect(dispatch).toHaveBeenCalledTimes(16);
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
            type: LiveChatWidgetActionType.SET_CONVERSATION_STATE,
            payload: ConversationState.Closed
        }));
    });

    it("handleStartChatError should log failed with error event for ClosedConversation", () => {
        const dispatch = jest.fn();
        const mockEx = new ChatSDKError(ChatSDKErrorName.ClosedConversation);
        const mockFacade = { getChatSDK: ()=> { return {}; }};

        spyOn(BroadcastService, "postMessage").and.callFake(() => false);
        spyOn(TelemetryHelper, "logLoadingEvent").and.callFake(() => false);


        handleStartChatError(dispatch, mockFacade, {} as ILiveChatWidgetProps, mockEx, false);

        expect(TelemetryHelper.logLoadingEvent).toHaveBeenCalledTimes(1);
        expect(TelemetryHelper.logLoadingEvent).toHaveBeenCalledWith("WARN", expect.objectContaining({
            Description: "Widget load complete with error",
            ExceptionDetails: expect.objectContaining({
                Exception: `Widget load complete with error: ${ChatSDKErrorName.ClosedConversation}`
            })
        }));
        expect(dispatch).toHaveBeenCalledTimes(16);
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
            type: LiveChatWidgetActionType.SET_CONVERSATION_STATE,
            payload: ConversationState.Closed
        }));
    });

    it("handleStartChatError should log failed event for any other errors", () => {
        const dispatch = jest.fn();
        const mockEx = new ChatSDKError(ChatSDKErrorName.ScriptLoadFailure, 405);
        const mockFacade = {
            getChatSDK: jest.fn()
        };

        spyOn(BroadcastService, "postMessage").and.callFake(() => false);
        spyOn(TelemetryHelper, "logLoadingEvent").and.callFake(() => false);
        handleStartChatError(dispatch, mockFacade, {} as ILiveChatWidgetProps, mockEx, false);

        expect(TelemetryHelper.logLoadingEvent).toHaveBeenCalledTimes(2);
        expect(TelemetryHelper.logLoadingEvent).toHaveBeenCalledWith("ERROR", expect.objectContaining({
            ExceptionDetails: expect.objectContaining({
                Exception: `Widget load complete with error: ${ChatSDKErrorName.ScriptLoadFailure}`,
                HttpResponseStatusCode: 405
            })
        }));
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
            type: LiveChatWidgetActionType.SET_CONVERSATION_STATE
        }));
    });

    it("handleStartChatError should force end chat if isStartChatSuccessful is true", () => {
        const dispatch = jest.fn();
        const mockEx = new ChatSDKError(ChatSDKErrorName.ScriptLoadFailure, 405);
        const mockSDK = {
            endChat: jest.fn()
        };

        const mockFacade = {
            getChatSDK: () => {
                return mockSDK;
            }
        };

        spyOn(BroadcastService, "postMessage").and.callFake(() => false);
        spyOn(TelemetryHelper, "logLoadingEvent").and.callFake(() => false);
        spyOn(TelemetryHelper, "logSDKEvent").and.callFake(() => false);
        handleStartChatError(dispatch, mockFacade, {} as ILiveChatWidgetProps, mockEx, true);

        expect(TelemetryHelper.logLoadingEvent).toHaveBeenCalledTimes(2);
        expect(TelemetryHelper.logSDKEvent).toHaveBeenCalledWith("INFO", expect.objectContaining({
            Event: TelemetryEvent.EndChatSDKCall
        }));
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
            type: LiveChatWidgetActionType.SET_CONVERSATION_STATE
        }));
        expect(mockSDK.endChat).toHaveBeenCalled();
    });
});