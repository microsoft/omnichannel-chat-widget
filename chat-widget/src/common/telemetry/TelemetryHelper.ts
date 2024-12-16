import { ACSAdapterContract, ActionsContract, BaseContract, CallingContract, ConfigValidationContract, IC3ClientContract, LoadContract, OCChatSDKContract, TelemetryContract, WebChatContract } from "./definitions/Contracts";
import { ACSAdapterTelemetryData, ActionTelemetryData, CallingTelemetryData, ConfigValidationTelemetryData, IC3ClientTelemetryData, LoadTelemetryData, OCChatSDKTelemetryData, TelemetryData, WebChatTelemetryData } from "./definitions/Payload";
import { LogLevel, ScenarioType, TelemetryEvent, TelemetryInput } from "./TelemetryConstants";

import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import ChatConfig from "@microsoft/omnichannel-chat-sdk/lib/core/ChatConfig";
import { IInternalTelemetryData } from "./interfaces/IInternalTelemetryData";
import { ITelemetryConfig } from "./interfaces/ITelemetryConfig";
import { ITelemetryEvent } from "./interfaces/ITelemetryEvents";
import LiveChatContext from "@microsoft/omnichannel-chat-sdk/lib/core/LiveChatContext";
import LiveWorkItemDetails from "@microsoft/omnichannel-chat-sdk/lib/core/LiveWorkItemDetails";
import { TelemetryManager } from "./TelemetryManager";
import { newGuid } from "../utils";

export interface TelemetryEventWrapper {
    Event: TelemetryEvent;
    Description?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ExceptionDetails?: any;
    ElapsedTimeInMilliseconds?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Data?: any;
}

export class TelemetryHelper {
    public static callId: string;
    public static elapsedTime: string;

    public static buildTelemetryEvent(level: LogLevel, input: TelemetryInput): TelemetryContract {
        switch (input.scenarioType) {
            case ScenarioType.LOAD: return TelemetryHelper.conformToLoadContract(level, input);
            case ScenarioType.IC3_CLIENT: return TelemetryHelper.conformToIC3ClientContract(level, input);
            case ScenarioType.WEBCHAT: return TelemetryHelper.conformToWebChatContract(level, input);
            case ScenarioType.OCCHATSDK:
            case ScenarioType.SDK: return TelemetryHelper.conformToOCChatSDKContract(level, input);
            case ScenarioType.ACTIONS: return TelemetryHelper.conformToActionsContract(level, input);
            case ScenarioType.CALLING: return TelemetryHelper.conformToCallingContract(level, input);
            case ScenarioType.ACS_ADAPTER: return TelemetryHelper.conformToACSAdapterContract(level, input);
            default:
            case ScenarioType.CONFIG_VALIDATION: return TelemetryHelper.conformToConfigValidationContract(level, input);
        }
    }

    public static populateBasicProperties(
        level: LogLevel,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        telemetryData: TelemetryData): BaseContract {
        return {
            WidgetId: TelemetryManager.InternalTelemetryData?.widgetId ?? "",
            ChatId: TelemetryManager.InternalTelemetryData?.chatId ?? "",
            ChannelId: TelemetryManager.InternalTelemetryData?.channelId ?? "lcw2.0",
            ConversationId: TelemetryManager.InternalTelemetryData?.conversationId ?? "",
            OrganizationId: TelemetryManager.InternalTelemetryData?.orgId ?? "",
            OrganizationUrl: TelemetryManager.InternalTelemetryData?.orgUrl ?? "",
            LCWRuntimeId: TelemetryManager.InternalTelemetryData?.lcwRuntimeId ?? "",
            CurrentRequestId: TelemetryManager.InternalTelemetryData?.currentRequestId ?? "",
            LogLevel: level,
            OCChatSDKVersion: TelemetryManager.InternalTelemetryData?.OCChatSDKVersion ?? "",
            OCChatWidgetVersion: TelemetryManager.InternalTelemetryData?.chatWidgetVersion ?? "",
            OCChatComponentsVersion: TelemetryManager.InternalTelemetryData?.chatComponentVersion ?? ""
        };
    }

    private static populate<T extends BaseContract>(
        level: LogLevel,
        telemetryData: TelemetryData,
        configure: (e: T) => void): T {

        const base = TelemetryHelper.populateBasicProperties(
            level,
            telemetryData);

        const event: T = base as T;
        configure(event);

        return event;
    }

    private static conformToActionsContract(level: LogLevel, input: TelemetryInput): ActionsContract {
        const payload = input.payload as ActionTelemetryData;

        return TelemetryHelper.populate<ActionsContract>(level, payload,
            event => {
                event.Event = payload.Event;
                event.ActionType = payload.ActionType;
                event.ElapsedTimeInMilliseconds = payload.ElapsedTimeInMilliseconds;
                event.ExceptionDetails = JSON.stringify(payload.ExceptionDetails);
                event.Description = payload.Description;
                event.CustomProperties = JSON.stringify(payload.CustomProperties);
            });
    }

    private static conformToWebChatContract(level: LogLevel, input: TelemetryInput): WebChatContract {
        const payload = input.payload as WebChatTelemetryData;

        return TelemetryHelper.populate<WebChatContract>(level, payload,
            event => {
                event.Event = payload.type;
                event.EventInfo = payload.name;
                event.Dimensions = payload.dimensions;
                event.Data = payload.data;
                event.Duration = payload.duration;
                event.ExceptionDetails = JSON.stringify(payload.error);
            });
    }

    private static conformToConfigValidationContract(level: LogLevel, input: TelemetryInput): ConfigValidationContract {
        const payload = input.payload as ConfigValidationTelemetryData;

        return TelemetryHelper.populate<ConfigValidationContract>(level, payload,
            event => {
                event.Event = payload.Event;
                event.RequestId = payload.RequestId;
                event.LCWVersion = TelemetryManager.InternalTelemetryData?.environmentVersion;
                event.CloudType = payload.CloudType;
                event.Domain = TelemetryManager.InternalTelemetryData?.hostName;
                event.ElapsedTimeInMilliseconds = payload.ElapsedTimeInMilliseconds;
                event.ExceptionDetails = JSON.stringify(payload.ExceptionDetails);
                event.Language = TelemetryManager.InternalTelemetryData?.chatWidgetLocaleLCID || "";
                event.Description = payload.Data;
            });
    }

    private static conformToLoadContract(level: LogLevel, input: TelemetryInput): LoadContract {
        const payload = input.payload as LoadTelemetryData;

        return TelemetryHelper.populate<LoadContract>(level, payload,
            event => {
                event.Event = payload.Event;
                event.Description = payload.Description;
                event.ResourcePath = payload.ResourcePath;
                event.WidgetState = payload.WidgetState;
                event.ChatState = payload.ChatState;
                event.ChatType = payload.ChatType;
                event.ElapsedTimeInMilliseconds = payload.ElapsedTimeInMilliseconds;
                event.ExceptionDetails = JSON.stringify(payload.ExceptionDetails);
            });
    }

    private static conformToIC3ClientContract(level: LogLevel, input: TelemetryInput): IC3ClientContract {
        const payload = input.payload as IC3ClientTelemetryData;
        return TelemetryHelper.populate<IC3ClientContract>(level, payload,
            event => {
                event.Event = payload.Event;
                event.IC3ClientVersion = TelemetryManager.InternalTelemetryData?.IC3ClientVersion;
                event.SubscriptionId = payload.SubscriptionId;
                event.EndpointUrl = payload.EndpointUrl;
                event.EndpointId = payload.EndpointId;
                event.ErrorCode = payload.ErrorCode;
                event.ElapsedTimeInMilliseconds = payload.ElapsedTimeInMilliseconds;
                event.ExceptionDetails = JSON.stringify(payload.ExceptionDetails);
                event.ShouldBubbleToHost = payload.ShouldBubbleToHost;
                event.Description = payload.Description;
            });
    }

    private static conformToACSAdapterContract(level: LogLevel, input: TelemetryInput): ACSAdapterContract {
        const payload = input.payload as ACSAdapterTelemetryData;
        return TelemetryHelper.populate<ACSAdapterContract>(level, payload,
            event => {
                event.Description = payload.Description;
                event.ACSUserId = payload.ACSUserId;
                event.ChatThreadId = payload.ChatThreadId;
                event.ChatMessageId = payload.ChatMessageId;
                event.TimeStamp = payload.TimeStamp;
                event.Event = payload.Event;
                event.ErrorCode = payload.ErrorCode;
                event.ExceptionDetails = payload.ExceptionDetails;
            });
    }

    private static conformToCallingContract(level: LogLevel, input: TelemetryInput): CallingContract {
        const payload = input.payload as CallingTelemetryData;
        return TelemetryHelper.populate<CallingContract>(level, payload,
            event => {
                event.CallId = payload.CallId;
                event.Event = payload.Event;
                event.ElapsedTimeInMilliseconds = payload.ElapsedTimeInMilliseconds;
                event.ExceptionDetails = JSON.stringify(payload.ExceptionDetails);
                event.Description = payload.Description;
            });
    }

    private static conformToOCChatSDKContract(level: LogLevel, input: TelemetryInput): OCChatSDKContract {
        const payload = input.payload as OCChatSDKTelemetryData;

        return TelemetryHelper.populate<OCChatSDKContract>(level, payload,
            event => {
                event.RequestId = payload.RequestId;
                event.Event = payload.Event;
                event.OCChatSDKVersion = TelemetryManager.InternalTelemetryData.OCChatSDKVersion ?? "";
                event.TransactionId = payload.TransactionId;
                event.ElapsedTimeInMilliseconds = payload.ElapsedTimeInMilliseconds;
                event.ExceptionDetails = JSON.stringify(payload.ExceptionDetails);
                event.Description = payload.Description;
            });
    }

    public static addChatConfigDataToTelemetry(chatConfig: ChatConfig, telemetryInternalData: IInternalTelemetryData): IInternalTelemetryData {
        const telemetryDataLocal: IInternalTelemetryData = telemetryInternalData;
        telemetryDataLocal.chatWidgetLocaleLCID = chatConfig.ChatWidgetLanguage?.msdyn_localeid;

        return telemetryDataLocal;
    }

    public static addWidgetDataToTelemetry(telemetryConfig: ITelemetryConfig, telemetryInternalData: IInternalTelemetryData): IInternalTelemetryData {
        const telemetryDataLocal: IInternalTelemetryData = telemetryInternalData;

        if (!telemetryConfig?.appId || telemetryConfig?.appId.trim() === "") {
            throw new Error("TelemetryConfig.appId is not set");
        }

        if (!telemetryConfig?.orgId || telemetryConfig?.orgId.trim() === "") {
            throw new Error("TelemetryConfig.orgId is not set");
        }

        if (!telemetryConfig?.orgUrl || telemetryConfig?.orgUrl.trim() === "") {
            throw new Error("TelemetryConfig.orgUrl is not set");
        }
        
        telemetryDataLocal.widgetId = telemetryConfig?.appId;
        telemetryDataLocal.orgId = telemetryConfig?.orgId;
        telemetryDataLocal.orgUrl = telemetryConfig?.orgUrl;
        telemetryDataLocal.lcwRuntimeId = telemetryConfig.LCWRuntimeId ?? newGuid();

        return telemetryDataLocal;
    }

    public static addSessionDataToTelemetry(chatSession: LiveChatContext, telemetryInternalData: IInternalTelemetryData): IInternalTelemetryData {
        const telemetryDataLocal: IInternalTelemetryData = telemetryInternalData;

        telemetryDataLocal.chatId = chatSession?.chatToken?.chatId;
        telemetryDataLocal.currentRequestId = chatSession?.chatToken?.requestId;
        return telemetryInternalData;
    }

    public static addConversationDataToTelemetry(liveWorkItem: LiveWorkItemDetails, telemetryInternalData: IInternalTelemetryData): IInternalTelemetryData {
        const telemetryDataLocal: IInternalTelemetryData = telemetryInternalData;
        telemetryDataLocal.conversationId = liveWorkItem.conversationId;
        return telemetryDataLocal;
    }

    public static logCallingEvent = (logLevel: LogLevel, payload: TelemetryEventWrapper, callId?: string) => {
        const telemetryEvent: ITelemetryEvent = {
            eventName: payload?.Event ?? "",
            logLevel: logLevel,
            payload: {
                ...payload,
                CallId: callId
            } as CallingTelemetryData
        };
        BroadcastService.postMessage(telemetryEvent);
    }

    public static logLoadingEvent = (logLevel: LogLevel, payload: TelemetryEventWrapper) => {
        const telemetryEvent: ITelemetryEvent = {
            eventName: payload?.Event ?? "",
            logLevel: logLevel,
            payload: {
                ...payload
            } as LoadTelemetryData
        };
        BroadcastService.postMessage(telemetryEvent);
    }

    public static logActionEvent = (logLevel: LogLevel, payload: TelemetryEventWrapper) => {
        const telemetryEvent: ITelemetryEvent = {
            eventName: payload?.Event ?? "",
            logLevel: logLevel,
            payload: {
                ...payload
            } as ActionTelemetryData
        };
        BroadcastService.postMessage(telemetryEvent);
    }

    public static logSDKEvent = (logLevel: LogLevel, payload: TelemetryEventWrapper) => {
        const telemetryEvent: ITelemetryEvent = {
            eventName: payload?.Event ?? "",
            logLevel: logLevel,
            payload: {
                ...payload,
                TransactionId: newGuid(),
                RequestId: TelemetryManager.InternalTelemetryData?.currentRequestId,
            } as OCChatSDKTelemetryData
        };
        BroadcastService.postMessage(telemetryEvent);
    }

    public static logConfigDataEvent = (logLevel: LogLevel, payload: TelemetryEventWrapper) => {
        const telemetryEvent: ITelemetryEvent = {
            eventName: payload?.Event ?? "",
            logLevel: logLevel,
            payload: {
                ...payload
            } as ConfigValidationTelemetryData
        };
        BroadcastService.postMessage(telemetryEvent);
    }

    public static logWebChatEvent = (logLevel: LogLevel, payload: TelemetryEventWrapper) => {
        const telemetryEvent: ITelemetryEvent = {
            eventName: TelemetryEvent.WebChatEvent,
            logLevel: logLevel,
            payload: {
                ...payload,
                type: TelemetryEvent.WebChatEvent,
                scenarioType: ScenarioType.WEBCHAT
            } as WebChatTelemetryData
        };
        BroadcastService.postMessage(telemetryEvent);
    }
}