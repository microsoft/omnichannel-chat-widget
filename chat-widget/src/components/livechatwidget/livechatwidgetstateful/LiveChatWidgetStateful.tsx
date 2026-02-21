import { BroadcastEvent, ConversationStage, LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";
import { BroadcastService, BroadcastServiceInitialize, decodeComponentString } from "@microsoft/omnichannel-chat-components";
import { Components, StyleOptions } from "botframework-webchat";
import { ConfirmationState, Constants, ConversationEndEntity, E2VVOptions, LiveWorkItemState, PrepareEndChatDescriptionConstants, StorageType, WidgetLoadCustomErrorString } from "../../../common/Constants";
import { IStackStyles, Stack } from "@fluentui/react";
import React, { Dispatch, useEffect, useRef, useState } from "react";
import { TelemetryManager, TelemetryTimers } from "../../../common/telemetry/TelemetryManager";
import { chatSDKStateCleanUp, endChat, endChatStateCleanUp, prepareEndChat } from "../common/endChat";
import { checkIfConversationStillValid, initStartChat, prepareStartChat, setPreChatAndInitiateChat } from "../common/startChat";
import {
    createTimer,
    getBroadcastChannelName,
    getConversationDetailsCall,
    getLocaleDirection,
    getStateFromCache,
    getWidgetCacheIdfromProps,
    getWidgetEndChatEventName,
    isNullOrEmptyString,
    isNullOrUndefined,
    isThisSessionPopout,
    isUndefinedOrEmpty,
    setOcUserAgent
} from "../../../common/utils";
import { customEventCallback, subscribeToSendCustomEvent } from "../common/customEventHandler";
import { defaultClientDataStoreProvider, isCookieAllowed } from "../../../common/storage/default/defaultClientDataStoreProvider";
import { handleChatReconnect, isPersistentEnabled, isReconnectEnabled } from "../common/reconnectChatHelper";
import {
    shouldShowCallingContainer,
    shouldShowChatButton,
    shouldShowConfirmationPane,
    shouldShowEmailTranscriptPane,
    shouldShowHeader,
    shouldShowLoadingPane,
    shouldShowOutOfOfficeHoursPane,
    shouldShowPostChatLoadingPane,
    shouldShowPostChatSurveyPane,
    shouldShowPreChatSurveyPane,
    shouldShowProactiveChatPane,
    shouldShowReconnectChatPane,
    shouldShowStartChatErrorPane,
    shouldShowWebChatContainer
} from "../../../controller/componentController";

import { ActivityStreamHandler } from "../common/ActivityStreamHandler";
import CallingContainerStateful from "../../callingcontainerstateful/CallingContainerStateful";
import ChatButtonStateful from "../../chatbuttonstateful/ChatButtonStateful";
import ConfirmationPaneStateful from "../../confirmationpanestateful/ConfirmationPaneStateful";
import { ConversationState } from "../../../contexts/common/ConversationState";
import { ExtendedChatConfig } from "../../webchatcontainerstateful/interfaces/IExtendedChatConffig";
import { DataStoreManager } from "../../../common/contextDataStore/DataStoreManager";
import DraggableChatWidget from "../../draggable/DraggableChatWidget";
import { ElementType } from "@microsoft/omnichannel-chat-components";
import EmailTranscriptPaneStateful from "../../emailtranscriptpanestateful/EmailTranscriptPaneStateful";
import { FacadeChatSDK } from "../../../common/facades/FacadeChatSDK";
import HeaderStateful from "../../headerstateful/HeaderStateful";
import { ICustomEvent } from "@microsoft/omnichannel-chat-components/lib/types/interfaces/ICustomEvent";
import { IDownloadTranscriptProps } from "../../footerstateful/downloadtranscriptstateful/interfaces/IDownloadTranscriptProps";
import { ILiveChatWidgetAction } from "../../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../../contexts/common/ILiveChatWidgetContext";
import { ILiveChatWidgetProps } from "../interfaces/ILiveChatWidgetProps";
import { IScrollBarProps } from "../interfaces/IScrollBarProps";
import { ITimer } from "../../../common/interfaces/ITimer";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";
import LoadingPaneStateful from "../../loadingpanestateful/LoadingPaneStateful";
import OutOfOfficeHoursPaneStateful from "../../ooohpanestateful/OOOHPaneStateful";
import PostChatLoadingPaneStateful from "../../postchatloadingpanestateful/PostChatLoadingPaneStateful";
import PostChatSurveyPaneStateful from "../../postchatsurveypanestateful/PostChatSurveyPaneStateful";
import PreChatSurveyPaneStateful from "../../prechatsurveypanestateful/PreChatSurveyPaneStateful";
import ProactiveChatPaneStateful from "../../proactivechatpanestateful/ProactiveChatPaneStateful";
import ReconnectChatPaneStateful from "../../reconnectchatpanestateful/ReconnectChatPaneStateful";
import StartChatErrorPaneStateful from "../../startchaterrorpanestateful/StartChatErrorPaneStateful";
import { StartChatFailureType } from "../../../contexts/common/StartChatFailureType";
import StartChatOptionalParams from "@microsoft/omnichannel-chat-sdk/lib/core/StartChatOptionalParams";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import WebChatContainerStateful from "../../webchatcontainerstateful/WebChatContainerStateful";
import createDownloadTranscriptProps from "../common/createDownloadTranscriptProps";
import { createFooter } from "../common/createFooter";
import { createInternetConnectionChangeHandler } from "../common/createInternetConnectionChangeHandler";
import { defaultAdaptiveCardStyles } from "../../webchatcontainerstateful/common/defaultStyles/defaultAdaptiveCardStyles";
import { defaultScrollBarProps } from "../common/defaultProps/defaultScrollBarProps";
import { defaultWebChatContainerStatefulProps } from "../../webchatcontainerstateful/common/defaultProps/defaultWebChatContainerStatefulProps";
import { disposeTelemetryLoggers } from "../common/disposeTelemetryLoggers";
import { executeReducer } from "../../../contexts/createReducer";
import { getGeneralStylesForButton } from "../common/getGeneralStylesForButton";
import { handleChatDisconnect } from "../common/chatDisconnectHelper";
import { initCallingSdk } from "../common/initCallingSdk";
import { initConfirmationPropsComposer } from "../common/initConfirmationPropsComposer";
import { initWebChatComposer } from "../common/initWebChatComposer";
import { registerBroadcastServiceForStorage } from "../../../common/storage/default/defaultCacheManager";
import { setPostChatContextAndLoadSurvey } from "../common/setPostChatContextAndLoadSurvey";
import { shouldLoadPersistentChatHistory } from "../common/liveChatConfigUtils";
import { startProactiveChat } from "../common/startProactiveChat";
import useChatAdapterStore from "../../../hooks/useChatAdapterStore";
import useChatContextStore from "../../../hooks/useChatContextStore";
import useFacadeSDKStore from "../../../hooks/useFacadeChatSDKStore";
import { getPostChatContext, initiatePostChat } from "../common/renderSurveyHelpers";
import PostChatContext from "@microsoft/omnichannel-chat-sdk/lib/core/PostChatContext";

let uiTimer : ITimer;

export const LiveChatWidgetStateful = (props: ILiveChatWidgetProps) => {

    useEffect(() => {
        uiTimer = createTimer();
        TelemetryHelper.logLoadingEventToAllTelemetry(LogLevel.INFO, {
            Event: TelemetryEvent.UXLiveChatWidgetStart,
            Description: "Live chat widget loading started.",
            CustomProperties: { ConversationStage: ConversationStage.Initialization }
        });
    }, []);


    const [state, dispatch]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [adapter, setAdapter]: [any, (adapter: any) => void] = useChatAdapterStore();
    const [webChatStyles, setWebChatStyles] = useState({ ...defaultWebChatContainerStatefulProps.webChatStyles, ...props.webChatContainerProps?.webChatStyles });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [facadeChatSDK]: [FacadeChatSDK, (facadeChatSDK: FacadeChatSDK) => void] = useFacadeSDKStore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [voiceVideoCallingSDK, setVoiceVideoCallingSDK] = useState<any>(undefined);
    const [conversationId, setConversationId] = useState<string>("");
    const { Composer } = Components;
    const canStartProactiveChat = useRef(true);
    const bubbleBackground = props.webChatContainerProps?.webChatStyles?.bubbleBackground ??
        (props.webChatContainerProps?.adaptiveCardStyles?.background ?? defaultAdaptiveCardStyles.background);
    const bubbleTextColor = props.webChatContainerProps?.webChatStyles?.bubbleTextColor ??
        (props.webChatContainerProps?.adaptiveCardStyles?.color ?? defaultAdaptiveCardStyles.color);

    // Process general styles
    const generalStyles: IStackStyles = {
        root: Object.assign({}, getGeneralStylesForButton(state), props.styleProps?.generalStyles)
    };

    //Scrollbar styles
    const scrollbarProps: IScrollBarProps = Object.assign({}, defaultScrollBarProps, props?.scrollBarProps);
    const sendBoxTextArea = props?.webChatContainerProps?.sendBoxTextBox?.textarea;

    // In case the broadcast channel is already initialized elsewhere; One tab can only hold 1 instance
    if (props?.controlProps?.skipBroadcastChannelInit !== true) {
        const broadcastServiceChannelName = getBroadcastChannelName(facadeChatSDK.getChatSDK()?.omnichannelConfig?.widgetId, props.controlProps?.widgetInstanceId ?? "");
        BroadcastServiceInitialize(broadcastServiceChannelName);
    }
    TelemetryTimers.LcwLoadToChatButtonTimer = createTimer();

    const widgetElementId: string = props.controlProps?.id || "oc-lcw";
    const currentMessageCountRef = useRef<number>(0);
    let widgetStateEventId = "";
    const lastLWICheckTimeRef = useRef<number>(0);
    const callInProgress = useRef<boolean>(false);
    let optionalParams: StartChatOptionalParams;
    let activeCachedChatExist = false;

    const setOptionalParams = () => {
        if (!isUndefinedOrEmpty(state.appStates?.reconnectId)) {
            activeCachedChatExist = true;
            optionalParams = { reconnectId: state?.appStates?.reconnectId };
        } else if (!isUndefinedOrEmpty(state?.domainStates?.liveChatContext) &&
            state?.appStates?.conversationState === ConversationState.Active) {
            activeCachedChatExist = true;
            optionalParams = { liveChatContext: state?.domainStates?.liveChatContext };
        } else {
            activeCachedChatExist = false;
            optionalParams = {};
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const startChat = async (props: ILiveChatWidgetProps, localState?: any) => {
        const isReconnectTriggered = async (): Promise<boolean> => {
            if (isReconnectEnabled(props.chatConfig) === true && !isPersistentEnabled(props.chatConfig)) {
                const noValidReconnectId = await handleChatReconnect(facadeChatSDK, props, dispatch, setAdapter, initStartChat, state);
                const inMemoryState = executeReducer(state, { type: LiveChatWidgetActionType.GET_IN_MEMORY_STATE, payload: null });
                // If chat reconnect has kicked in chat state will become Active or Reconnect. So just exit, else go next
                if (!noValidReconnectId && (inMemoryState.appStates.conversationState === ConversationState.Active
                    || inMemoryState.appStates.conversationState === ConversationState.ReconnectChat)) {
                    return true;
                }
            }
            return false;
        };

        let isChatValid = false;
        //Start a chat from cache/reconnectid
        if (activeCachedChatExist === true) {
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Loading });

            //Check if conversation state is not in wrapup or closed state
            isChatValid = await checkIfConversationStillValid(facadeChatSDK, dispatch, state);
            if (isChatValid === true) {
                const reconnectTriggered = await isReconnectTriggered();
                if (!reconnectTriggered) {
                    await initStartChat(facadeChatSDK, dispatch, setAdapter, state, props, optionalParams);
                }
                return;
            }

            BroadcastService.postMessage({
                eventName: BroadcastEvent.OnWidgetError,
                payload: {
                    errorMessage: "Chat found in cache but invalid as the conversation status is inactive."
                }
            });
        }

        if (isChatValid === false) {
            if (localState) {
                // adding the reconnect logic for the case when customer tries to reconnect from a new browser or InPrivate browser
                const reconnectTriggered = await isReconnectTriggered();
                if (!reconnectTriggered) {
                    const inMemoryState = executeReducer(state, { type: LiveChatWidgetActionType.GET_IN_MEMORY_STATE, payload: null });
                    await setPreChatAndInitiateChat(facadeChatSDK, dispatch, setAdapter, undefined, undefined, inMemoryState, props);
                }
                return;
            } else {
                // To avoid showing blank screen in popout
                if (state?.appStates?.hideStartChatButton === false) {
                    dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Closed });
                    return;
                }
                dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Loading });
            }
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const setupClientDataStore = () => {
        // Add default localStorage support for widget
        const widgetCacheId = getWidgetCacheIdfromProps(props);

        if (props.contextDataStore === undefined) {
            const cacheTtlInMins = props?.controlProps?.cacheTtlInMins ?? Constants.CacheTtlInMinutes;
            const storageType = props?.useSessionStorage === true ? StorageType.sessionStorage : StorageType.localStorage;
            DataStoreManager.clientDataStore = defaultClientDataStoreProvider(cacheTtlInMins, storageType);
            registerBroadcastServiceForStorage(widgetCacheId, cacheTtlInMins, storageType);
        } else {
            DataStoreManager.clientDataStore = props.contextDataStore;
        }
    };

    useEffect(() => {
        dispatch({ type: LiveChatWidgetActionType.SET_START_CHAT_FAILING, payload: false });
        dispatch({ type: LiveChatWidgetActionType.SET_START_CHAT_FAILURE_TYPE, payload: StartChatFailureType.Generic });
        state.domainStates.confirmationPaneConfirmedOptionClicked = false;
        state.domainStates.confirmationState = ConfirmationState.NotSet;
        setupClientDataStore();
        createInternetConnectionChangeHandler(state);
        dispatch({ type: LiveChatWidgetActionType.SET_WIDGET_ELEMENT_ID, payload: widgetElementId });
        dispatch({ type: LiveChatWidgetActionType.SET_START_CHAT_BUTTON_DISPLAY, payload: props.controlProps?.hideStartChatButton || false });
        dispatch({ type: LiveChatWidgetActionType.SET_E2VV_ENABLED, payload: false });
        if (props.controlProps?.widgetInstanceId && !isNullOrEmptyString(props.controlProps?.widgetInstanceId)) {
            dispatch({ type: LiveChatWidgetActionType.SET_WIDGET_INSTANCE_ID, payload: props.controlProps?.widgetInstanceId });
        }

        if (props.chatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_callingoptions !== E2VVOptions.NoCalling) {
            initCallingSdk(facadeChatSDK, setVoiceVideoCallingSDK)
                .then((sdkCreated: boolean) => {
                    sdkCreated && dispatch({ type: LiveChatWidgetActionType.SET_E2VV_ENABLED, payload: true });
                });
        }

        if (props.initialCustomContext) {
            dispatch({ type: LiveChatWidgetActionType.SET_CUSTOM_CONTEXT, payload: props.initialCustomContext });
        }

        // Initialize global dir
        const globalDir = props.controlProps?.dir ?? getLocaleDirection(props.chatConfig?.ChatWidgetLanguage?.msdyn_localeid);
        dispatch({ type: LiveChatWidgetActionType.SET_GLOBAL_DIR, payload: globalDir });

        setOptionalParams();

        // Unauth chat
        if (state?.appStates?.hideStartChatButton === false) {
            startChat(props);
        }
    }, []);

    // useEffect for when skip chat button rendering
    useEffect(() => {
        if (state?.appStates?.hideStartChatButton === true) {
            //handle OOH pane
            // Only set OutOfOffice state for new conversations, allow existing Active/InActive conversations to continue
            if (state.appStates.outsideOperatingHours === true && 
                state.appStates.conversationState !== ConversationState.Active) {
                dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.OutOfOffice });
                BroadcastService.postMessage({
                    eventName: BroadcastEvent.OnWidgetError,
                    payload: {
                        errorMessage: "Out-of-office hours status is shown."
                    }
                });
                return;
            }

            BroadcastService.postMessage({
                eventName: BroadcastEvent.ChatInitiated
            });
            //Pass the state to avoid getting stale state
            startChat(props, state);
        }
    }, [state?.appStates?.hideStartChatButton]);

    // useEffect for custom context
    useEffect(() => {
        // Add the custom context on receiving the SetCustomContext event
        BroadcastService.getMessageByEventName(BroadcastEvent.SetCustomContext).subscribe((msg: ICustomEvent) => {
            TelemetryHelper.logActionEvent(LogLevel.INFO, {
                Event: TelemetryEvent.CustomContextReceived,
                Description: "CustomContext received."
            });
            dispatch({ type: LiveChatWidgetActionType.SET_CUSTOM_CONTEXT, payload: msg?.payload });
        });

        BroadcastService.getMessageByEventName(BroadcastEvent.StartProactiveChat).subscribe((msg: ICustomEvent) => {

            TelemetryHelper.logActionEvent(LogLevel.INFO, {
                Event: TelemetryEvent.StartProactiveChatEventReceived,
                Description: "Start proactive chat event received."
            });
            if (canStartProactiveChat.current === true) {
                startProactiveChat(dispatch, msg?.payload?.notificationConfig, msg?.payload?.enablePreChat, msg?.payload?.inNewWindow);
            } else {
                TelemetryHelper.logActionEvent(LogLevel.INFO, {
                    Event: TelemetryEvent.ChatAlreadyTriggered,
                    Description: "Start proactive chat method called, when chat was already triggered."
                });
            }
        });

        // Toggle chat visibility
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        BroadcastService.getMessageByEventName(BroadcastEvent.HideChatVisibilityChangeEvent).subscribe(async (event: any) => {
            if (event?.payload?.isChatHidden !== undefined) {
                if (props.controlProps?.hideStartChatButton) {
                    dispatch({ type: LiveChatWidgetActionType.SET_MINIMIZED, payload: event?.payload?.isChatHidden });
                }
                const dateNow = Date.now();

                if (isThisSessionPopout(window?.location?.href)) {
                    return;
                }

                /** 
                 * callInProgress acts as "thread lock" to prevent multiple calls to getConversationDetailsCall, 
                 * in case of multiple switchs between tabs
                 */
                if (callInProgress.current === false && (dateNow - lastLWICheckTimeRef.current) > Constants.LWICheckOnVisibilityTimeout) {

                    lastLWICheckTimeRef.current = dateNow;
                    callInProgress.current = true;
                    const conversationDetails = await getConversationDetailsCall(facadeChatSDK);

                    if (conversationDetails?.state === LiveWorkItemState.WrapUp || conversationDetails?.state === LiveWorkItemState.Closed) {
                        dispatch({ type: LiveChatWidgetActionType.SET_CHAT_DISCONNECT_EVENT_RECEIVED, payload: true });
                        TelemetryHelper.logActionEvent(LogLevel.INFO, {
                            Event: TelemetryEvent.ChatDisconnectThreadEventReceived,
                            Description: "Chat disconnected due to timeout, left or removed."
                        });
                    }
                    callInProgress.current = false;
                }
            }
        });

        BroadcastService.getMessageByEventName(BroadcastEvent.NetworkReconnected).subscribe(async () => {
            const inMemoryState = executeReducer(state, { type: LiveChatWidgetActionType.GET_IN_MEMORY_STATE, payload: null });
            if (isThisSessionPopout(window?.location?.href) || inMemoryState?.appStates?.conversationState !== ConversationState.Active) {
                return;
            }
            const conversationDetails = await getConversationDetailsCall(facadeChatSDK);

            if (conversationDetails?.state === LiveWorkItemState.WrapUp || conversationDetails?.state === LiveWorkItemState.Closed) {
                dispatch({ type: LiveChatWidgetActionType.SET_CHAT_DISCONNECT_EVENT_RECEIVED, payload: true });
                const desc = "Chat disconnected due to timeout, user went offline or blocked the device (including closing laptop)";
                TelemetryHelper.logActionEvent(LogLevel.INFO, {
                    Event: TelemetryEvent.ChatDisconnectThreadEventReceived,
                    Description: desc
                });

                BroadcastService.postMessage({
                    eventName: BroadcastEvent.OnWidgetError,
                    payload: {
                        errorMessage: desc
                    }
                });
            }
        });

        /**
         * This will allow to sync multiple tabs to handle minimize and maximize state, 
         * the event is expected to be emitted from scripting layer.
         */
        BroadcastService.getMessageByEventName(BroadcastEvent.SyncMinimize).subscribe((msg: ICustomEvent) => {
            dispatch({ type: LiveChatWidgetActionType.SET_MINIMIZED, payload: msg?.payload?.minimized });
        });

        // Start chat from SDK Event
        BroadcastService.getMessageByEventName(BroadcastEvent.StartChat).subscribe((msg: ICustomEvent) => {  
            // If chat is out of operating hours chat widget sets the conversation state to OutOfOffice.
            if (state.appStates.outsideOperatingHours && state.appStates.conversationState !== ConversationState.Active) {
                dispatch({ type: LiveChatWidgetActionType.SET_MINIMIZED, payload: false });
                dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.OutOfOffice });
                return;
            }
            // If the startChat event is not initiated by the same tab. Ignore the call
            if (!isNullOrUndefined(msg?.payload?.runtimeId) && msg?.payload?.runtimeId !== TelemetryManager.InternalTelemetryData.lcwRuntimeId) {
                return;
            }

            if (msg?.payload?.customContext) {
                TelemetryHelper.logActionEventToAllTelemetry(LogLevel.INFO, {
                    Event: TelemetryEvent.CustomContextReceived,
                    Description: "CustomContext received through startChat event."
                });
                dispatch({ type: LiveChatWidgetActionType.SET_CUSTOM_CONTEXT, payload: msg?.payload?.customContext });
            }


            TelemetryHelper.logActionEvent(LogLevel.INFO, {
                Event: TelemetryEvent.StartChatEventReceived,
                Description: "Start chat event received."
            });

            const inMemoryState = executeReducer(state, { type: LiveChatWidgetActionType.GET_IN_MEMORY_STATE, payload: null });
            inMemoryState.domainStates.customContext = msg?.payload?.customContext;
            /*
            * If the conversation is in closed state then we start a new chat, 
            * else if the conversation is in active state then we maximize the chat
            *  If the conversation is in inactive or postchat state then we maximize the chat.
            * 
            * To start a new chat, it needs to be called via the close button or close chat via SDK.
            * 
            * NOTE : Transition from OOH to business hours will follow this path, since during intialization conversation
            * state is being set to closed.
            * 
            * Maximization has been added as part of the initialization chat, since it wont go further than this block.
            **/ 
            if (inMemoryState.appStates?.conversationState === ConversationState.Closed) {
                BroadcastService.postMessage({
                    eventName: BroadcastEvent.ChatInitiated
                });
                prepareStartChat(props, facadeChatSDK, inMemoryState, dispatch, setAdapter);
                return;
            }

            // If minimized, maximize the chat
            if (inMemoryState?.appStates?.isMinimized === true || inMemoryState?.appStates?.isMinimized === undefined) {
                dispatch({ type: LiveChatWidgetActionType.SET_MINIMIZED, payload: false });
                BroadcastService.postMessage({
                    eventName: BroadcastEvent.MaximizeChat,
                    payload: {
                        height: inMemoryState?.domainStates?.widgetSize?.height,
                        width: inMemoryState?.domainStates?.widgetSize?.width,
                        lcwRuntimeId: TelemetryManager.InternalTelemetryData.lcwRuntimeId
                    }
                });
                return;
            }
        });

        const handleInitiateEndChatForPersistentChat = async (msg: ICustomEvent, conversationDetails: {
            state?: string,
            canRenderPostChat?: string
        }) => {

            //If the payload does NOT include the skipSessionCloseForPersistentChat flag, default is false. Upon receiving the customer event, always ending session from C2.
            const skipSessionCloseForPersistentChat = typeof(msg?.payload?.[Constants.SkipSessionCloseForPersistentChatFlag]) === Constants.String && (msg?.payload?.[Constants.SkipSessionCloseForPersistentChatFlag] as string).toLowerCase() === Constants.true || msg?.payload?.[Constants.SkipSessionCloseForPersistentChatFlag] === true;

            TelemetryHelper.logSDKEventToAllTelemetry(LogLevel.INFO, {
                Event: TelemetryEvent.EndChatEventReceived,
                Description: "Processing initiateEndChat for persistent chat",
                CustomProperties: { conversationDetails }
            });
            const conversationState = conversationDetails?.state;
            if (conversationState !== LiveWorkItemState.Closed && conversationState !== LiveWorkItemState.WrapUp) {
                if (skipSessionCloseForPersistentChat) {
                    if (conversationDetails.canRenderPostChat?.toLowerCase() === "true") {
                        
                        TelemetryHelper.logSDKEventToAllTelemetry(LogLevel.INFO, {
                            Event: TelemetryEvent.EndChatEventReceived,
                            Description: "Processing initiateEndChat, fetching postChatContext"
                        });
                        const postchatContext: PostChatContext = await getPostChatContext(facadeChatSDK, state, dispatch) ?? state?.domainStates?.postChatContext;
                        if (postchatContext) {
                            TelemetryHelper.logSDKEventToAllTelemetry(LogLevel.INFO, {
                                Event: TelemetryEvent.EndChatEventReceived,
                                Description: "Processing initiateEndChat, initiatePostChat",
                                CustomProperties: {
                                    postchatContext
                                }
                            });
                            await initiatePostChat(props, conversationDetails, state, dispatch, postchatContext);
                        }
                    }
                } else {
                    const skipEndChatSDK = false;
                    const skipCloseChat = false;
                    TelemetryHelper.logSDKEventToAllTelemetry(LogLevel.INFO, {
                        Event: TelemetryEvent.EndChatEventReceived,
                        Description: "Processing initiateEndChat, trigger endChat",
                    });
                    await endChat(props, facadeChatSDK, state, dispatch, setAdapter, setWebChatStyles, adapter, skipEndChatSDK, skipCloseChat);
                }
                
            }
            //if conversation already closed, it is safe to unmount it upon receiving the closeChat event
            else {
                BroadcastService.postMessage({
                    eventName: BroadcastEvent.CloseChat
                });
            }
        };

        // End chat
        BroadcastService.getMessageByEventName(BroadcastEvent.InitiateEndChat).subscribe(async (msg: ICustomEvent) => {
            TelemetryHelper.logSDKEventToAllTelemetry(LogLevel.INFO, {
                Event: TelemetryEvent.EndChatEventReceived,
                Description: "Received InitiateEndChat BroadcastEvent.",
                CustomProperties: { ConversationStage: ConversationStage.ConversationEnd, payload: msg?.payload }
            });

            const conversationDetails = await getConversationDetailsCall(facadeChatSDK);
            const { chatConfig } = props;
            const isPersistent = isPersistentEnabled(chatConfig);
            TelemetryHelper.logSDKEventToAllTelemetry(LogLevel.INFO, {
                Event: TelemetryEvent.EndChatEventReceived,
                Description: "Processing initiateEndChat, fetched conversation details",
                CustomProperties: {
                    conversationDetails,
                    isPersistent
                }
            });

            if (isPersistent && conversationDetails) {
                await handleInitiateEndChatForPersistentChat(msg, conversationDetails);
                return;
            }

            const persistedState = getStateFromCache(getWidgetCacheIdfromProps(props));
            if (persistedState && persistedState.appStates.conversationState === ConversationState.Active) {
                TelemetryHelper.logSDKEvent(LogLevel.INFO, {
                    Event: TelemetryEvent.PrepareEndChat,
                    Description: PrepareEndChatDescriptionConstants.InitiateEndChatReceivedActiveChat
                });
                //We need to simulate states for closing chat, in order to messup with close confirmation pane.
                dispatch({ type: LiveChatWidgetActionType.SET_CONFIRMATION_STATE, payload: ConfirmationState.Ok });
                dispatch({ type: LiveChatWidgetActionType.SET_SHOW_CONFIRMATION, payload: false });

                dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_ENDED_BY, payload: ConversationEndEntity.Customer });
            } else {
                const skipEndChatSDK = true;
                const skipCloseChat = false;
                TelemetryHelper.logSDKEvent(LogLevel.INFO, {
                    Event: TelemetryEvent.PrepareEndChat,
                    Description: PrepareEndChatDescriptionConstants.InitiateEndChatReceived
                });
                await endChat(props, facadeChatSDK, state, dispatch, setAdapter, setWebChatStyles, adapter, skipEndChatSDK, skipCloseChat);
            }
        });

        // End chat on browser unload
        BroadcastService.getMessageByEventName(BroadcastEvent.InitiateEndChatOnBrowserUnload).subscribe(() => {
            initiateEndChatOnBrowserUnload();
        });

        // Listen to end chat event from other tabs
        const endChatEventName = getWidgetEndChatEventName(
            facadeChatSDK.getChatSDK()?.omnichannelConfig?.orgId,
            facadeChatSDK.getChatSDK()?.omnichannelConfig?.widgetId,
            props.controlProps?.widgetInstanceId ?? "");

        BroadcastService.getMessageByEventName(endChatEventName).subscribe((msg: ICustomEvent) => {
            if (msg?.payload?.runtimeId !== TelemetryManager.InternalTelemetryData.lcwRuntimeId) {
                TelemetryHelper.logSDKEvent(LogLevel.INFO, {
                    Event: TelemetryEvent.PrepareEndChat,
                    Description: "Received EndChat BroadcastEvent from other tabs. Closing this chat."
                });
                endChat(props, facadeChatSDK, state, dispatch, setAdapter, setWebChatStyles, adapter, true, false, false);
                endChatStateCleanUp(dispatch);
                chatSDKStateCleanUp(facadeChatSDK.getChatSDK());
                return;
            }
        });

        //Listen to WidgetSize, used for minimize to maximize
        BroadcastService.getMessageByEventName("WidgetSize").subscribe((msg: ICustomEvent) => {
            dispatch({ type: LiveChatWidgetActionType.SET_WIDGET_SIZE, payload: msg?.payload });
        });

        // Reset state variables
        BroadcastService.getMessageByEventName(BroadcastEvent.RaiseErrorEvent).subscribe(() => {
            dispatch({ type: LiveChatWidgetActionType.SET_LIVE_CHAT_CONFIG, payload: undefined });
            dispatch({ type: LiveChatWidgetActionType.SET_CUSTOM_CONTEXT, payload: undefined });
            dispatch({ type: LiveChatWidgetActionType.SET_CHAT_TOKEN, payload: undefined });
            dispatch({ type: LiveChatWidgetActionType.SET_LIVE_CHAT_CONTEXT, payload: undefined });
        });

        // Retrieve convId
        BroadcastService.getMessageByEventName(BroadcastEvent.UpdateConversationDataForTelemetry).subscribe((msg: ICustomEvent) => {
            if (msg.payload?.liveWorkItem?.conversationId) {
                setConversationId(msg.payload.liveWorkItem.conversationId);
            }
        });

        // subscribe custom event
        subscribeToSendCustomEvent(BroadcastService, facadeChatSDK, customEventCallback);

        // Check for TPC and log in telemetry if blocked
        isCookieAllowed();

        return () => {
            disposeTelemetryLoggers();
        };
    }, []);

    useEffect(() => {
        // On new message
        if (state.appStates.conversationState === ConversationState.Active) {
            facadeChatSDK?.onNewMessage(() => {
                // Track the message count
                currentMessageCountRef.current++;
                dispatch({ type: LiveChatWidgetActionType.SET_UNREAD_MESSAGE_COUNT, payload: currentMessageCountRef.current + 1 });

                // New message notification
                BroadcastService.postMessage({
                    eventName: BroadcastEvent.NewMessageNotification
                });
            }, {disablePolling: true});

            facadeChatSDK?.onAgentEndSession((event) => {  
                const inMemoryState = executeReducer(state, { type: LiveChatWidgetActionType.GET_IN_MEMORY_STATE, payload: null });
                if ("participantsRemoved" in event && inMemoryState?.appStates?.conversationState === ConversationState.Active) {
                    if (inMemoryState?.appStates?.isConversationalSurveyEnabled === false) {
                        setWebChatStyles((styles: StyleOptions) => { return { ...styles, hideSendBox: true }; });
                    }
                    TelemetryHelper.logSDKEvent(LogLevel.INFO, {
                        Event: TelemetryEvent.ParticipantsRemovedEvent,
                        Description: "Participants removed event received."
                    });
                    return;
                }
            });
        }

        if (state.appStates.conversationState === ConversationState.InActive) {
            if (props?.webChatContainerProps?.renderingMiddlewareProps?.hideSendboxOnConversationEnd !== false) {
                setWebChatStyles((styles: StyleOptions) => { return { ...styles, hideSendBox: true }; });
            }
        }

    }, [state.appStates.conversationState]);

    useEffect(() => {
        canStartProactiveChat.current = state.appStates.conversationState === ConversationState.Closed &&
            !state.appStates.proactiveChatStates.proactiveChatInNewWindow;
    }, [state.appStates.conversationState, state.appStates.proactiveChatStates.proactiveChatInNewWindow]);

    // Reset the UnreadMessageCount when minimized is toggled and broadcast it.
    useEffect(() => {
        if (state.appStates.isMinimized) {
            ActivityStreamHandler.cork();
        } else {
            const extendedChatConfig = state?.domainStates?.liveChatConfig as ExtendedChatConfig | undefined;
            if (shouldLoadPersistentChatHistory(extendedChatConfig)) {
                requestAnimationFrame(() => {
                    setTimeout(() => ActivityStreamHandler.uncork(), 500);
                });
            } else {
                setTimeout(() => ActivityStreamHandler.uncork(), 500);
            }
        }

    }, [state.appStates.isMinimized]);

    // Broadcast the UnreadMessageCount state on any change.
    useEffect(() => {
        if (state.appStates.isMinimized === true && state.appStates.unreadMessageCount > 0) {
            const customEvent: ICustomEvent = {
                elementType: ElementType.Custom,
                eventName: BroadcastEvent.UnreadMessageCount,
                payload: `${state.appStates.unreadMessageCount}`
            };
            BroadcastService.postMessage(customEvent);
        }
        if (state.appStates.unreadMessageCount === 0) {
            currentMessageCountRef.current = -1;
            const customEvent: ICustomEvent = {
                elementType: ElementType.Custom,
                eventName: BroadcastEvent.UnreadMessageCount,
                payload: 0
            };
            BroadcastService.postMessage(customEvent);
        }
    }, [state.appStates.unreadMessageCount]);

    useEffect(() => {
        setWebChatStyles({
            ...webChatStyles,
            ...props.webChatContainerProps?.webChatStyles
        });
    }, [props.webChatContainerProps?.webChatStyles]);

    useEffect(() => {
        //Confirmation pane dismissing through OK option, so proceed with end chat
        if (state.domainStates.confirmationState === ConfirmationState.Ok) {
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_ENDED_BY, payload: ConversationEndEntity.Customer });
        }
    }, [state.domainStates.confirmationState]);

    useEffect(() => {
        const inMemoryState = executeReducer(state, { type: LiveChatWidgetActionType.GET_IN_MEMORY_STATE, payload: null });
        // Do not process anything during initialization
        if (inMemoryState?.appStates?.conversationEndedBy === ConversationEndEntity.NotSet) {
            TelemetryHelper.logSDKEvent(LogLevel.INFO, {
                Event: TelemetryEvent.PrepareEndChat,
                Description: "conversationEndedBy is not set"
            });
            return;
        }
        
        // If start chat failed, and C2 is trying to close chat widget
        if (inMemoryState?.appStates?.startChatFailed || inMemoryState?.appStates?.conversationState === ConversationState.Postchat) {
            TelemetryHelper.logSDKEvent(LogLevel.INFO, {
                Event: TelemetryEvent.PrepareEndChat,
                Description: PrepareEndChatDescriptionConstants.CustomerCloseChatOnFailureOrPostChat
            });
            endChat(props, facadeChatSDK, state, dispatch, setAdapter, setWebChatStyles, adapter, true, false, true);
            return;
        }
        
        // Scenario -> Chat was InActive and closing the chat (Refresh scenario on post chat)
        if (inMemoryState?.appStates?.conversationState === ConversationState.InActive) {
            TelemetryHelper.logSDKEvent(LogLevel.INFO, {
                Event: TelemetryEvent.PrepareEndChat,
                Description: PrepareEndChatDescriptionConstants.CustomerCloseInactiveChat
            });
            endChat(props, facadeChatSDK, state, dispatch, setAdapter, setWebChatStyles, adapter, false, false, true);
            return;
        }
        
        const isConversationalSurveyEnabled = inMemoryState?.appStates?.isConversationalSurveyEnabled;

        // In conversational survey, we need to check post chat survey logics before we set ConversationState to InActive
        // Hence setting ConversationState to InActive will be done later in the post chat flows
        if (!isConversationalSurveyEnabled && (inMemoryState?.appStates?.conversationEndedBy === ConversationEndEntity.Agent ||
                    inMemoryState?.appStates?.conversationEndedBy === ConversationEndEntity.Bot)) {
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.InActive });
        }
        
        // All other cases
        prepareEndChat(props, facadeChatSDK, inMemoryState, dispatch, setAdapter, setWebChatStyles, adapter);
    }, [state?.appStates?.conversationEndedBy]);

    // Publish chat widget state
    useEffect(() => {
        // Only activate these windows events when conversation state is active and chat widget is in popout mode
        // Ghost chat scenarios
        /* COMMENTING THIS CODE FOR PARITY WITH OLD LCW
        if (state.appStates.conversationState === ConversationState.Active &&
            props.controlProps?.hideStartChatButton === true) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any

            window.onbeforeunload = function () {
                const prompt = Constants.BrowserUnloadConfirmationMessage;
                return prompt;
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            window.onunload = function () {
                initiateEndChatOnBrowserUnload();
            };
        }*/

        widgetStateEventId = getWidgetCacheIdfromProps(props);

        const chatWidgetStateChangeEvent: ICustomEvent = {
            eventName: widgetStateEventId,
            payload: {
                ...state
            }
        };
        BroadcastService.postMessage(chatWidgetStateChangeEvent);
    }, [state]);

    // Handle Chat disconnect cases
    useEffect(() => {
        const inMemoryState = executeReducer(state, { type: LiveChatWidgetActionType.GET_IN_MEMORY_STATE, payload: null });
        handleChatDisconnect(props, inMemoryState, setWebChatStyles);
        const chatDisconnectState = inMemoryState?.appStates?.chatDisconnectEventReceived;

        if (chatDisconnectState && adapter) {
            try {
                adapter.end();
                adapter.close();
            } catch (e) {
                TelemetryHelper.logWebChatEvent(LogLevel.ERROR, {
                    Event: TelemetryEvent.EndingAdapterAfterDisconnectionError,
                    Description: WidgetLoadCustomErrorString.CloseAdapterAfterDisconnectionErrorString
                });
            }
        }
    }, [state.appStates.chatDisconnectEventReceived]);


    // if props state gets updates we need to update the renderingMiddlewareProps in the state
    useEffect(() => {
        dispatch({ type: LiveChatWidgetActionType.SET_RENDERING_MIDDLEWARE_PROPS, payload: props.webChatContainerProps?.renderingMiddlewareProps });
    }, [props.webChatContainerProps?.renderingMiddlewareProps]);

    useEffect(() => {
        TelemetryHelper.logLoadingEventToAllTelemetry(LogLevel.INFO, {
            Event: TelemetryEvent.UXLiveChatWidgetCompleted,
            Description: "Live chat widget loading completed.",
            ElapsedTimeInMilliseconds: uiTimer.milliSecondsElapsed,
            CustomProperties: { ConversationStage: ConversationStage.Initialization }
        });
    }, []);

    const initiateEndChatOnBrowserUnload = () => {
        TelemetryHelper.logActionEvent(LogLevel.INFO, {
            Event: TelemetryEvent.BrowserUnloadEventStarted,
            Description: "Browser unload event received."
        });
        TelemetryHelper.logSDKEvent(LogLevel.INFO, {
            Event: TelemetryEvent.PrepareEndChat,
            Description: PrepareEndChatDescriptionConstants.BrowserUnload
        });
        endChat(props, facadeChatSDK, state, dispatch, setAdapter, setWebChatStyles, adapter, false, false, false);
        // Clean local storage
        DataStoreManager.clientDataStore?.removeData(widgetStateEventId);

        //Dispose calling instance
        if (voiceVideoCallingSDK) {
            voiceVideoCallingSDK?.close();
        }
        //Message for clearing window[popouTab]
        BroadcastService.postMessage({ eventName: BroadcastEvent.ClosePopoutWindow });
    };

    const setPostChatContextRelay = () => setPostChatContextAndLoadSurvey(facadeChatSDK, dispatch);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const endChatRelay = (adapter: any, skipEndChatSDK: any, skipCloseChat: any, postMessageToOtherTab?: boolean) => endChat(props, facadeChatSDK, state, dispatch, setAdapter, setWebChatStyles, adapter, skipEndChatSDK, skipCloseChat, postMessageToOtherTab);
    const prepareStartChatRelay = () => prepareStartChat(props, facadeChatSDK, state, dispatch, setAdapter);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const initStartChatRelay = (optionalParams?: any, persistedState?: any) => initStartChat(facadeChatSDK, dispatch, setAdapter, state, props, optionalParams, persistedState);
    const confirmationPaneProps = initConfirmationPropsComposer(props);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prepareEndChatRelay = () => prepareEndChat(props, facadeChatSDK, state, dispatch, setAdapter, setWebChatStyles, adapter);
    const webChatProps = initWebChatComposer(props, state, dispatch, facadeChatSDK, endChatRelay);

    const downloadTranscriptProps = createDownloadTranscriptProps(props.downloadTranscriptProps as IDownloadTranscriptProps,
        {
            ...defaultWebChatContainerStatefulProps?.webChatStyles,
            ...props.webChatContainerProps?.webChatStyles
        },
        props.webChatContainerProps);

    const livechatProps = { ...props, downloadTranscriptProps };

    const chatWidgetDraggableConfig = {
        elementId: widgetElementId,
        channel: props.controlProps?.widgetInstanceId ?? "lcw",
        disabled: props.draggableChatWidgetProps?.disabled !== true // Draggable by default, unless explicitly disabled
    };

    // Disable receiving IDraggableEvent in current window
    if (props.draggableChatWidgetProps?.disabled === false && props.draggableChatWidgetProps?.targetIframe) {
        chatWidgetDraggableConfig.disabled = true;
    }

    const headerDraggableConfig = {
        draggableEventChannel: chatWidgetDraggableConfig.channel ?? "lcw",
        draggableEventEmitterTargetWindow: props.draggableChatWidgetProps?.targetIframe ? window.parent : window,
        draggable: props.draggableChatWidgetProps?.disabled !== true // Draggable by default, unless explicitly disabled
    };

    // Add 'omnichannel-chat-widget' OC User Agent if not already set
    setOcUserAgent(facadeChatSDK.getChatSDK());

    const directLine = livechatProps.webChatContainerProps?.directLine ?? adapter ?? defaultWebChatContainerStatefulProps.directLine;
    const userID = directLine.getState ? directLine?.getState("acs.userId") : "teamsvisitor";

    const styleOptions = React.useMemo(() => ({
        ...webChatStyles,
        bubbleBackground,
        bubbleTextColor
    }), [webChatStyles, bubbleBackground, bubbleTextColor]);

    // React to dynamic bot avatar initials updates from context
    useEffect(() => {
        if (state.domainStates.botAvatarInitials && state.domainStates.botAvatarInitials !== webChatStyles.botAvatarInitials) {
            /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
            setWebChatStyles((styles: StyleOptions) => ({ ...styles, botAvatarInitials: state.domainStates.botAvatarInitials! }));
        }
    }, [state.domainStates.botAvatarInitials]);

    // WebChat's Composer can only be rendered if a directLine object is defined
    return directLine && (
        <>
            <style>{`
            #oc-lcw .webchat__basic-transcript__scrollable::-webkit-scrollbar {
                width: ${scrollbarProps.width};
            }

            #oc-lcw .webchat__basic-transcript__scrollable::-webkit-scrollbar-track {
                background: ${scrollbarProps.trackBackgroundColor};
            }

            #oc-lcw .webchat__basic-transcript__scrollable::-webkit-scrollbar-thumb {
                background: ${scrollbarProps.thumbBackgroundColor};
                border-radius: ${scrollbarProps.thumbBorderRadius};
            }

            #oc-lcw .webchat__basic-transcript__scrollable::-webkit-scrollbar-thumb:hover {
                background: ${scrollbarProps.thumbHoverColor};
            }

            /* High Contrast mode support - optimized for all variants */
            @media (prefers-contrast: high), (-ms-high-contrast: active), (forced-colors: active) {
                #oc-lcw .webchat__basic-transcript__scrollable::-webkit-scrollbar-track {
                    background: Canvas !important;
                    border: 1px solid CanvasText !important;
                }

                #oc-lcw .webchat__basic-transcript__scrollable::-webkit-scrollbar-thumb {
                    background: CanvasText !important;
                    border: 1px solid Canvas !important;
                    min-height: 20px !important;
                }

                #oc-lcw .webchat__basic-transcript__scrollable::-webkit-scrollbar-thumb:hover {
                    background: Highlight !important;
                    border: 1px solid CanvasText !important;
                }

                #oc-lcw .webchat__basic-transcript__scrollable::-webkit-scrollbar-corner {
                    background: Canvas !important;
                }
            }

            .webchat__basic-transcript__activity-markdown-body > :last-child {
                margin-bottom: 0px;
            }
           
            .webchat__basic-transcript__activity-markdown-body > :first-child {
                margin-top: 0px;
            }
                
            .webchat__basic-transcript__activity-markdown-body img.webchat__render-markdown__external-link-icon {
                background-image : url(data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIzIDMgMTggMTgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTcuMjUwMSA0LjUwMDE3SDEwLjc0OTVDMTEuMTYzNyA0LjUwMDE3IDExLjQ5OTUgNC44MzU5NiAxMS40OTk1IDUuMjUwMTdDMTEuNDk5NSA1LjYyOTg2IDExLjIxNzMgNS45NDM2NiAxMC44NTEzIDUuOTkzMzJMMTAuNzQ5NSA2LjAwMDE3SDcuMjQ5NzRDNi4wNzA3OSA1Ljk5OTYxIDUuMTAzNDkgNi45MDY1NiA1LjAwNzg2IDguMDYxMTJMNS4wMDAyOCA4LjIyMDAzTDUuMDAzMTIgMTYuNzUwN0M1LjAwMzQzIDE3Ljk0MTUgNS45Mjg4NSAxOC45MTYxIDcuMDk5NjYgMTguOTk0OUw3LjI1MzcxIDE5LjAwMDFMMTUuNzUxOCAxOC45ODg0QzE2Ljk0MTUgMTguOTg2OCAxNy45MTQ1IDE4LjA2MiAxNy45OTM1IDE2Ljg5MjNMMTcuOTk4NyAxNi43Mzg0VjEzLjIzMjFDMTcuOTk4NyAxMi44MTc5IDE4LjMzNDUgMTIuNDgyMSAxOC43NDg3IDEyLjQ4MjFDMTkuMTI4NCAxMi40ODIxIDE5LjQ0MjIgMTIuNzY0MyAxOS40OTE4IDEzLjEzMDNMMTkuNDk4NyAxMy4yMzIxVjE2LjczODRDMTkuNDk4NyAxOC43NDA3IDE3LjkyOTMgMjAuMzc2OSAxNS45NTI4IDIwLjQ4MjlMMTUuNzUzOCAyMC40ODg0TDcuMjU4MjcgMjAuNTAwMUw3LjA1NDk1IDIwLjQ5NDlDNS4xNDIzOSAyMC4zOTU0IDMuNjA4OTUgMTguODYyNyAzLjUwODM3IDE2Ljk1MDJMMy41MDMxMiAxNi43NTExTDMuNTAwODkgOC4yNTI3TDMuNTA1MjkgOC4wNTAyQzMuNjA1MzkgNi4xMzc0OSA1LjEzODY3IDQuNjA0NDkgNy4wNTA5NiA0LjUwNTI3TDcuMjUwMSA0LjUwMDE3SDEwLjc0OTVINy4yNTAxWk0xMy43NDgxIDMuMDAxNDZMMjAuMzAxOCAzLjAwMTk3TDIwLjQwMTQgMy4wMTU3NUwyMC41MDIyIDMuMDQzOTNMMjAuNTU5IDMuMDY4MDNDMjAuNjEyMiAzLjA5MTIyIDIwLjY2MzQgMy4xMjE2MyAyMC43MTExIDMuMTU4ODVMMjAuNzgwNCAzLjIyMTU2TDIwLjg2NDEgMy4zMjAxNEwyMC45MTgzIDMuNDEwMjVMMjAuOTU3IDMuNTAwNTdMMjAuOTc2MiAzLjU2NDc2TDIwLjk4OTggMy42Mjg2MkwyMC45OTkyIDMuNzIyODJMMjAuOTk5NyAxMC4yNTU0QzIwLjk5OTcgMTAuNjY5NiAyMC42NjM5IDExLjAwNTQgMjAuMjQ5NyAxMS4wMDU0QzE5Ljg3IDExLjAwNTQgMTkuNTU2MiAxMC43MjMyIDE5LjUwNjUgMTAuMzU3MUwxOS40OTk3IDEwLjI1NTRMMTkuNDk4OSA1LjU2MTQ3TDEyLjI3OTcgMTIuNzg0N0MxMi4wMTM0IDEzLjA1MSAxMS41OTY4IDEzLjA3NTMgMTEuMzAzMSAxMi44NTc1TDExLjIxOSAxMi43ODQ5QzEwLjk1MjcgMTIuNTE4NyAxMC45Mjg0IDEyLjEwMjEgMTEuMTQ2MiAxMS44MDg0TDExLjIxODggMTEuNzI0M0wxOC40MzY5IDQuNTAxNDZIMTMuNzQ4MUMxMy4zNjg0IDQuNTAxNDYgMTMuMDU0NiA0LjIxOTMxIDEzLjAwNSAzLjg1MzI0TDEyLjk5ODEgMy43NTE0NkMxMi45OTgxIDMuMzcxNzcgMTMuMjgwMyAzLjA1Nzk3IDEzLjY0NjQgMy4wMDgzMUwxMy43NDgxIDMuMDAxNDZaIiBmaWxsPSIjMjEyMTIxIiAvPjwvc3ZnPg==) !important;
                height: .75em;
                margin-left: .25em;
            }

            .webchat__link-definitions__header-text {
                color: ${bubbleBackground}
            }
            
            .webchat__link-definitions__header-chevron {
                color: ${bubbleBackground}
            }

            ${sendBoxTextArea?.minHeight && `
            .webchat__auto-resize-textarea.webchat__send-box-text-box__text-area {
                min-height: ${sendBoxTextArea?.minHeight} !important;
            }`}
            `}</style>
            <DraggableChatWidget {...chatWidgetDraggableConfig}>
                <Composer
                    {...webChatProps}
                    userID={userID}
                    styleOptions={styleOptions}
                    directLine={directLine}>
                    <Stack
                        id={widgetElementId}
                        styles={generalStyles}
                        className={livechatProps.styleProps?.className}>

                        {!livechatProps.controlProps?.hideChatButton && !livechatProps.controlProps?.hideStartChatButton && shouldShowChatButton(state) && (decodeComponentString(livechatProps.componentOverrides?.chatButton) || <ChatButtonStateful buttonProps={livechatProps.chatButtonProps} outOfOfficeButtonProps={livechatProps.outOfOfficeChatButtonProps} startChat={prepareStartChatRelay} />)}

                        {!livechatProps.controlProps?.hideProactiveChatPane && shouldShowProactiveChatPane(state) && (decodeComponentString(livechatProps.componentOverrides?.proactiveChatPane) || <ProactiveChatPaneStateful proactiveChatProps={livechatProps.proactiveChatPaneProps} startChat={prepareStartChatRelay} />)}

                        {!livechatProps.controlProps?.hideHeader && shouldShowHeader(state) && (decodeComponentString(livechatProps.componentOverrides?.header) || <HeaderStateful headerProps={livechatProps.headerProps} outOfOfficeHeaderProps={livechatProps.outOfOfficeHeaderProps} endChat={endChatRelay} {...headerDraggableConfig} />)}

                        {!livechatProps.controlProps?.hideLoadingPane && shouldShowLoadingPane(state) && (decodeComponentString(livechatProps.componentOverrides?.loadingPane) || <LoadingPaneStateful loadingPaneProps={livechatProps.loadingPaneProps} startChatErrorPaneProps={livechatProps.startChatErrorPaneProps} />)}

                        {!livechatProps.controlProps?.hideErrorUIPane && shouldShowStartChatErrorPane(state) && (decodeComponentString(livechatProps.componentOverrides?.startChatErrorPane) || <StartChatErrorPaneStateful {...livechatProps.startChatErrorPaneProps} />)}

                        {!livechatProps.controlProps?.hideOutOfOfficeHoursPane && shouldShowOutOfOfficeHoursPane(state) && (decodeComponentString(livechatProps.componentOverrides?.outOfOfficeHoursPane) || <OutOfOfficeHoursPaneStateful {...livechatProps.outOfOfficeHoursPaneProps} />)}

                        {!livechatProps.controlProps?.hideReconnectChatPane && shouldShowReconnectChatPane(state) && (decodeComponentString(livechatProps.componentOverrides?.reconnectChatPane) || <ReconnectChatPaneStateful reconnectChatProps={livechatProps.reconnectChatPaneProps} initStartChat={initStartChatRelay} />)}

                        {!livechatProps.controlProps?.hidePreChatSurveyPane && shouldShowPreChatSurveyPane(state) && (decodeComponentString(livechatProps.componentOverrides?.preChatSurveyPane) || <PreChatSurveyPaneStateful surveyProps={livechatProps.preChatSurveyPaneProps} initStartChat={initStartChatRelay} />)}

                        {!livechatProps.controlProps?.hideCallingContainer && shouldShowCallingContainer(state) && <CallingContainerStateful voiceVideoCallingSdk={voiceVideoCallingSDK} {...livechatProps.callingContainerProps} />}

                        {!livechatProps.controlProps?.hideWebChatContainer && shouldShowWebChatContainer(state) && (decodeComponentString(livechatProps.componentOverrides?.webChatContainer) || <WebChatContainerStateful {...livechatProps} />)}

                        {!livechatProps.controlProps?.hideConfirmationPane && shouldShowConfirmationPane(state) && (decodeComponentString(livechatProps.componentOverrides?.confirmationPane) || <ConfirmationPaneStateful {...confirmationPaneProps} setPostChatContext={setPostChatContextRelay} prepareEndChat={prepareEndChatRelay} />)}

                        {!livechatProps.controlProps?.hidePostChatLoadingPane && shouldShowPostChatLoadingPane(state) && (decodeComponentString(livechatProps.componentOverrides?.postChatLoadingPane) || <PostChatLoadingPaneStateful {...livechatProps.postChatLoadingPaneProps} />)}

                        {shouldShowPostChatSurveyPane(state) && (decodeComponentString(livechatProps.componentOverrides?.postChatSurveyPane) || <PostChatSurveyPaneStateful {...livechatProps.postChatSurveyPaneProps } {...livechatProps.chatSDK} customerVoiceSurveyCorrelationId={conversationId} />)}

                        {createFooter(livechatProps, state)}

                        {shouldShowEmailTranscriptPane(state) && (decodeComponentString(livechatProps.componentOverrides?.emailTranscriptPane) || <EmailTranscriptPaneStateful {...livechatProps.emailTranscriptPane} />)}
                    </Stack>
                </Composer>
            </DraggableChatWidget>
        </>
    );
};

export default LiveChatWidgetStateful;
