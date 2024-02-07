import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { ILiveChatWidgetProps } from "../interfaces/ILiveChatWidgetProps";
import { handleStartChatError } from "./startChatErrorHandler";
import { WidgetLoadCustomErrorString, WidgetLoadTelemetryMessage } from "../../../common/Constants";
import { ChatSDKError, ChatSDKErrorName } from "@microsoft/omnichannel-chat-sdk";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";
import { ConversationState } from "../../../contexts/common/ConversationState";
import { TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";

describe("startChatErrorHandler unit test", () => {
    it("handleStartChatError should log failed event and return if exception is undefined", () => {
        const dispatch = jest.fn();
        spyOn(BroadcastService, "postMessage").and.callFake(() => false);
        spyOn(TelemetryHelper, "logLoadingEvent").and.callFake(() => false);
        handleStartChatError(dispatch, {}, {} as ILiveChatWidgetProps, undefined, false);

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
        spyOn(BroadcastService, "postMessage").and.callFake(() => false);
        spyOn(TelemetryHelper, "logLoadingEvent").and.callFake(() => false);
        handleStartChatError(dispatch, {}, {} as ILiveChatWidgetProps, mockEx, false);

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
        spyOn(BroadcastService, "postMessage").and.callFake(() => false);
        spyOn(TelemetryHelper, "logLoadingEvent").and.callFake(() => false);
        handleStartChatError(dispatch, {}, {} as ILiveChatWidgetProps, mockEx, false);

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
        spyOn(BroadcastService, "postMessage").and.callFake(() => false);
        spyOn(TelemetryHelper, "logLoadingEvent").and.callFake(() => false);
        handleStartChatError(dispatch, {}, {} as ILiveChatWidgetProps, mockEx, false);

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
        spyOn(BroadcastService, "postMessage").and.callFake(() => false);
        spyOn(TelemetryHelper, "logLoadingEvent").and.callFake(() => false);
        handleStartChatError(dispatch, {}, {} as ILiveChatWidgetProps, mockEx, false);

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
        handleStartChatError(dispatch, {}, {} as ILiveChatWidgetProps, mockEx, false);

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
        spyOn(BroadcastService, "postMessage").and.callFake(() => false);
        spyOn(TelemetryHelper, "logLoadingEvent").and.callFake(() => false);
        handleStartChatError(dispatch, {}, {} as ILiveChatWidgetProps, mockEx, false);

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
        spyOn(BroadcastService, "postMessage").and.callFake(() => false);
        spyOn(TelemetryHelper, "logLoadingEvent").and.callFake(() => false);
        handleStartChatError(dispatch, {}, {} as ILiveChatWidgetProps, mockEx, false);

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
        spyOn(BroadcastService, "postMessage").and.callFake(() => false);
        spyOn(TelemetryHelper, "logLoadingEvent").and.callFake(() => false);
        handleStartChatError(dispatch, {}, {} as ILiveChatWidgetProps, mockEx, false);

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
        spyOn(BroadcastService, "postMessage").and.callFake(() => false);
        spyOn(TelemetryHelper, "logLoadingEvent").and.callFake(() => false);
        handleStartChatError(dispatch, {}, {} as ILiveChatWidgetProps, mockEx, false);

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
        spyOn(BroadcastService, "postMessage").and.callFake(() => false);
        spyOn(TelemetryHelper, "logLoadingEvent").and.callFake(() => false);
        handleStartChatError(dispatch, {}, {} as ILiveChatWidgetProps, mockEx, false);

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
        spyOn(BroadcastService, "postMessage").and.callFake(() => false);
        spyOn(TelemetryHelper, "logLoadingEvent").and.callFake(() => false);
        handleStartChatError(dispatch, {}, {} as ILiveChatWidgetProps, mockEx, false);

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
        spyOn(BroadcastService, "postMessage").and.callFake(() => false);
        spyOn(TelemetryHelper, "logLoadingEvent").and.callFake(() => false);
        handleStartChatError(dispatch, {}, {} as ILiveChatWidgetProps, mockEx, false);

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
        spyOn(BroadcastService, "postMessage").and.callFake(() => false);
        spyOn(TelemetryHelper, "logLoadingEvent").and.callFake(() => false);
        handleStartChatError(dispatch, {}, {} as ILiveChatWidgetProps, mockEx, false);

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
        spyOn(BroadcastService, "postMessage").and.callFake(() => false);
        spyOn(TelemetryHelper, "logLoadingEvent").and.callFake(() => false);
        handleStartChatError(dispatch, {}, {} as ILiveChatWidgetProps, mockEx, false);

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
        spyOn(BroadcastService, "postMessage").and.callFake(() => false);
        spyOn(TelemetryHelper, "logLoadingEvent").and.callFake(() => false);
        spyOn(TelemetryHelper, "logSDKEvent").and.callFake(() => false);
        handleStartChatError(dispatch, mockSDK, {} as ILiveChatWidgetProps, mockEx, true);

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