import { BroadcastEvent, LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";
import { BroadcastService, BroadcastServiceInitialize, decodeComponentString } from "@microsoft/omnichannel-chat-components";
import { IStackStyles, Stack } from "@fluentui/react";
import React, { Dispatch, useEffect, useRef, useState } from "react";
import { checkIfConversationStillValid, initStartChat, prepareStartChat, setPreChatAndInitiateChat } from "../common/startChat";
import { createTimer, getBroadcastChannelName, getLocaleDirection, getStateFromCache, getWidgetCacheId, getWidgetEndChatEventName, isNullOrEmptyString, isUndefinedOrEmpty } from "../../../common/utils";
import { endChat, prepareEndChat } from "../common/endChat";
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
    shouldShowWebChatContainer
} from "../../../controller/componentController";

import { ActivityStreamHandler } from "../common/ActivityStreamHandler";
import CallingContainerStateful from "../../callingcontainerstateful/CallingContainerStateful";
import ChatButtonStateful from "../../chatbuttonstateful/ChatButtonStateful";
import { Components } from "botframework-webchat";
import ConfirmationPaneStateful from "../../confirmationpanestateful/ConfirmationPaneStateful";
import { ConversationState } from "../../../contexts/common/ConversationState";
import { DataStoreManager } from "../../../common/contextDataStore/DataStoreManager";
import { Constants, E2VVOptions } from "../../../common/Constants";
import { ElementType } from "@microsoft/omnichannel-chat-components";
import EmailTranscriptPaneStateful from "../../emailtranscriptpanestateful/EmailTranscriptPaneStateful";
import HeaderStateful from "../../headerstateful/HeaderStateful";
import { ICustomEvent } from "@microsoft/omnichannel-chat-components/lib/types/interfaces/ICustomEvent";
import { ILiveChatWidgetAction } from "../../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../../contexts/common/ILiveChatWidgetContext";
import { ILiveChatWidgetProps } from "../interfaces/ILiveChatWidgetProps";
import { IScrollBarProps } from "../interfaces/IScrollBarProps";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";
import LoadingPaneStateful from "../../loadingpanestateful/LoadingPaneStateful";
import OutOfOfficeHoursPaneStateful from "../../ooohpanestateful/OOOHPaneStateful";
import PostChatLoadingPaneStateful from "../../postchatloadingpanestateful/PostChatLoadingPaneStateful";
import PostChatSurveyPaneStateful from "../../postchatsurveypanestateful/PostChatSurveyPaneStateful";
import PreChatSurveyPaneStateful from "../../prechatsurveypanestateful/PreChatSurveyPaneStateful";
import ProactiveChatPaneStateful from "../../proactivechatpanestateful/ProactiveChatPaneStateful";
import ReconnectChatPaneStateful from "../../reconnectchatpanestateful/ReconnectChatPaneStateful";
import StartChatOptionalParams from "@microsoft/omnichannel-chat-sdk/lib/core/StartChatOptionalParams";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { TelemetryTimers } from "../../../common/telemetry/TelemetryManager";
import WebChatContainerStateful from "../../webchatcontainerstateful/WebChatContainerStateful";
import { createFooter } from "../common/createFooter";
import { createInternetConnectionChangeHandler } from "../common/createInternetConnectionChangeHandler";
import { defaultClientDataStoreProvider } from "../../../common/storage/default/defaultClientDataStoreProvider";
import { defaultScrollBarProps } from "../common/defaultProps/defaultScrollBarProps";
import { defaultWebChatContainerStatefulProps } from "../../webchatcontainerstateful/common/defaultProps/defaultWebChatContainerStatefulProps";
import { disposeTelemetryLoggers } from "../common/disposeTelemetryLoggers";
import { getGeneralStylesForButton } from "../common/getGeneralStylesForButton";
import { initCallingSdk } from "../common/initCallingSdk";
import { initConfirmationPropsComposer } from "../common/initConfirmationPropsComposer";
import { initWebChatComposer } from "../common/initWebChatComposer";
import { registerBroadcastServiceForLocalStorage } from "../../../common/storage/default/defaultCacheManager";
import { registerTelemetryLoggers } from "../common/registerTelemetryLoggers";
import { setPostChatContextAndLoadSurvey } from "../common/setPostChatContextAndLoadSurvey";
import { startProactiveChat } from "../common/startProactiveChat";
import useChatAdapterStore from "../../../hooks/useChatAdapterStore";
import useChatContextStore from "../../../hooks/useChatContextStore";
import useChatSDKStore from "../../../hooks/useChatSDKStore";

export const LiveChatWidgetStateful = (props: ILiveChatWidgetProps) => {
    const [state, dispatch]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [adapter, setAdapter]: [any, (adapter: any) => void] = useChatAdapterStore();
    const [webChatStyles, setWebChatStyles] = useState({ ...defaultWebChatContainerStatefulProps.webChatStyles, ...props.webChatContainerProps?.webChatStyles });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chatSDK: any = useChatSDKStore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [voiceVideoCallingSDK, setVoiceVideoCallingSDK] = useState<any>(undefined);
    const { Composer } = Components;
    const canStartProactiveChat = useRef(true);

    // Process general styles
    const generalStyles: IStackStyles = {
        root: Object.assign({}, getGeneralStylesForButton(state), props.styleProps?.generalStyles)
    };

    //Scrollbar styles
    const scrollbarProps: IScrollBarProps = Object.assign({}, defaultScrollBarProps, props?.scrollBarProps);

    const broadcastServiceChannelName = getBroadcastChannelName(chatSDK?.omnichannelConfig?.widgetId, props.controlProps?.widgetInstanceId ?? "");
    BroadcastServiceInitialize(broadcastServiceChannelName);
    TelemetryTimers.LcwLoadToChatButtonTimer = createTimer();

    const widgetElementId: string = props.controlProps?.id || "oc-lcw";
    const currentMessageCountRef = useRef<number>(0);
    let widgetStateEventName = "";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let optionalParams: StartChatOptionalParams;
    let activeCachedChatExist = false;

    const setOptionalParams = () => {
        if (!isUndefinedOrEmpty(state.appStates?.reconnectId)) {
            activeCachedChatExist = true;
            optionalParams = { reconnectId: state.appStates.reconnectId };
        } else if (!isUndefinedOrEmpty(state.domainStates?.liveChatContext)) {
            activeCachedChatExist = true;
            optionalParams = { liveChatContext: state.domainStates?.liveChatContext };
        } else {
            activeCachedChatExist = false;
            optionalParams = {};
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const startChat = async (props: any, localState?: any) => {
        let isChatValid = false;

        //Start a chat from cache/reconnectid
        if (activeCachedChatExist === true) {
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Loading });
            if (localState) {
                localState.appStates.conversationState = ConversationState.Loading;
            }

            //Check if conversation state is not in wrapup or closed state
            isChatValid = await checkIfConversationStillValid(chatSDK, props, state.domainStates?.liveChatContext?.requestId, dispatch);
            if (isChatValid === true) {
                await initStartChat(chatSDK, props.chatConfig, props.getAuthToken, dispatch, setAdapter, optionalParams);
                return;
            }
        }

        if (isChatValid === false) {
            if (localState) {
                await setPreChatAndInitiateChat(chatSDK, dispatch, setAdapter, undefined, undefined, localState, props);
                return;
            } else {
                dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Closed });
            }
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const setupClientDataStore = () => {
        // Add default localStorage support for widget
        if (props.contextDataStore === undefined) {
            const cacheTtlInMins = props?.controlProps?.cacheTtlInMins ?? Constants.CacheTtlInMinutes;
            DataStoreManager.clientDataStore = defaultClientDataStoreProvider(cacheTtlInMins);
            registerBroadcastServiceForLocalStorage(chatSDK?.omnichannelConfig?.orgId,
                chatSDK?.omnichannelConfig?.widgetId,
                props?.controlProps?.widgetInstanceId ?? "", cacheTtlInMins);
        } else {
            DataStoreManager.clientDataStore = props.contextDataStore;
        }
    };

    useEffect(() => {
        setupClientDataStore();
        registerTelemetryLoggers(props, dispatch);
        createInternetConnectionChangeHandler();
        dispatch({ type: LiveChatWidgetActionType.SET_WIDGET_ELEMENT_ID, payload: widgetElementId });
        dispatch({ type: LiveChatWidgetActionType.SET_START_CHAT_BUTTON_DISPLAY, payload: props.controlProps?.hideStartChatButton || false });
        dispatch({ type: LiveChatWidgetActionType.SET_E2VV_ENABLED, payload: false });
        if (props.controlProps?.widgetInstanceId && !isNullOrEmptyString(props.controlProps?.widgetInstanceId)) {
            dispatch({ type: LiveChatWidgetActionType.SET_WIDGET_INSTANCE_ID, payload: props.controlProps?.widgetInstanceId });
        }

        if (props.chatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_callingoptions !== E2VVOptions.NoCalling) {
            initCallingSdk(chatSDK, setVoiceVideoCallingSDK)
                .then((sdkCreated: boolean) => {
                    sdkCreated && dispatch({ type: LiveChatWidgetActionType.SET_E2VV_ENABLED, payload: true });
                });
        }

        // Initialize global dir
        const globalDir = props.controlProps?.dir ?? getLocaleDirection(props.chatConfig?.ChatWidgetLanguage?.msdyn_localeid);
        dispatch({ type: LiveChatWidgetActionType.SET_GLOBAL_DIR, payload: globalDir });

        setOptionalParams();

        // Unauth chat
        if (state.appStates.hideStartChatButton === false) {
            startChat(props);
        }
    }, []);

    // useEffect for when skip chat button rendering
    useEffect(() => {
        if (state.appStates.hideStartChatButton === true) {
            BroadcastService.postMessage({
                eventName: BroadcastEvent.ChatInitiated
            });
            //Pass the state to avoid getting stale state
            startChat(props, state);
        }
    }, [state.appStates.hideStartChatButton]);

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

        // Start chat from SDK Event
        BroadcastService.getMessageByEventName(BroadcastEvent.StartChat).subscribe(() => {
            TelemetryHelper.logActionEvent(LogLevel.INFO, {
                Event: TelemetryEvent.StartChatEventRecevied,
                Description: "Start chat event received."
            });

            const persistedState = getStateFromCache(chatSDK?.omnichannelConfig?.orgId,
                chatSDK?.omnichannelConfig?.widgetId,
                props?.controlProps?.widgetInstanceId ?? "");

            // Chat not found in cache
            if (persistedState === undefined) {
                BroadcastService.postMessage({
                    eventName: BroadcastEvent.ChatInitiated
                });
                prepareStartChat(props, chatSDK, state, dispatch, setAdapter);
                return;
            }

            // Chat exist in cache
            if (persistedState) {
                // Only initiate new chat if widget state in cache in one of the followings
                if (persistedState.appStates.conversationState === ConversationState.Closed ||
                    persistedState.appStates.conversationState === ConversationState.InActive ||
                    persistedState.appStates.conversationState === ConversationState.Postchat) {
                    BroadcastService.postMessage({
                        eventName: BroadcastEvent.ChatInitiated
                    });
                    prepareStartChat(props, chatSDK, state, dispatch, setAdapter);
                    return;
                }

                // If minimized, maximize the chat
                dispatch({ type: LiveChatWidgetActionType.SET_MINIMIZED, payload: false });
                BroadcastService.postMessage({
                    eventName: BroadcastEvent.MaximizeChat,
                    payload: {
                        height: persistedState?.domainStates?.widgetSize?.height,
                        width: persistedState?.domainStates?.widgetSize?.width
                    }
                });
            }
        });

        // End chat
        BroadcastService.getMessageByEventName(BroadcastEvent.InitiateEndChat).subscribe(async () => {
            if (state.appStates.hideStartChatButton === false) {
                // This is to ensure to get latest state from cache in multitab
                const persistedState = getStateFromCache(chatSDK?.omnichannelConfig?.orgId,
                    chatSDK?.omnichannelConfig?.widgetId,
                    props?.controlProps?.widgetInstanceId ?? "");

                if (persistedState &&
                    persistedState.appStates.conversationState === ConversationState.Active) {
                    prepareEndChat(props, chatSDK, setAdapter, setWebChatStyles, dispatch, adapter, state);
                } else {
                    const skipEndChatSDK = true;
                    const skipCloseChat = false;
                    endChat(props, chatSDK, setAdapter, setWebChatStyles, dispatch, adapter, skipEndChatSDK, skipCloseChat);
                }
            }

            BroadcastService.postMessage({
                eventName: BroadcastEvent.CloseChat
            });
        });

        // End chat on browser unload
        BroadcastService.getMessageByEventName(BroadcastEvent.InitiateEndChatOnBrowserUnload).subscribe(() => {
            initiateEndChatOnBrowserUnload();
        });

        // Listen to end chat event from other tabs
        const endChatEventName = getWidgetEndChatEventName(
            chatSDK?.omnichannelConfig?.orgId,
            chatSDK?.omnichannelConfig?.widgetId,
            props.controlProps?.widgetInstanceId ?? "");

        BroadcastService.getMessageByEventName(endChatEventName).subscribe(async () => {
            endChat(props, chatSDK, setAdapter, setWebChatStyles, dispatch, adapter, false, false, false);
            return;
        });

        // When conversation ended by agent
        if (state.appStates.conversationEndedByAgent) {
            endChat(props, chatSDK, setAdapter, setWebChatStyles, dispatch, adapter);
        }

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

        return () => {
            disposeTelemetryLoggers();
        };
    }, []);

    useEffect(() => {
        // On new message
        if (state.appStates.conversationState === ConversationState.Active) {
            chatSDK?.onNewMessage(() => {
                // Track the message count
                currentMessageCountRef.current++;
                dispatch({ type: LiveChatWidgetActionType.SET_UNREAD_MESSAGE_COUNT, payload: currentMessageCountRef.current + 1 });

                // New message notification
                BroadcastService.postMessage({
                    eventName: BroadcastEvent.NewMessageNotification
                });
            });
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
            setTimeout(() => ActivityStreamHandler.uncork(), 500);
        }

        currentMessageCountRef.current = -1;
        dispatch({ type: LiveChatWidgetActionType.SET_UNREAD_MESSAGE_COUNT, payload: 0 });
        const customEvent: ICustomEvent = {
            elementType: ElementType.Custom,
            eventName: BroadcastEvent.UnreadMessageCount,
            payload: 0
        };
        BroadcastService.postMessage(customEvent);
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
    }, [state.appStates.unreadMessageCount]);

    useEffect(() => {
        setWebChatStyles({
            ...webChatStyles,
            ...props.webChatContainerProps?.webChatStyles
        });
    }, [props.webChatContainerProps?.webChatStyles]);

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

        widgetStateEventName = getWidgetCacheId(props?.chatSDK?.omnichannelConfig?.orgId,
            props?.chatSDK?.omnichannelConfig?.widgetId,
            props?.controlProps?.widgetInstanceId ?? "");

        const chatWidgetStateChangeEvent: ICustomEvent = {
            eventName: widgetStateEventName,
            payload: {
                ...state
            }
        };
        BroadcastService.postMessage(chatWidgetStateChangeEvent);
    }, [state]);

    const initiateEndChatOnBrowserUnload = () => {
        TelemetryHelper.logActionEvent(LogLevel.INFO, {
            Event: TelemetryEvent.BrowserUnloadEventStarted,
            Description: "Browser unload event received."
        });
        endChat(props, chatSDK, setAdapter, setWebChatStyles, dispatch, adapter, false, false, false);
        // Clean local storage
        DataStoreManager.clientDataStore?.removeData(widgetStateEventName, "localStorage");

        //Dispose calling instance
        if (voiceVideoCallingSDK) {
            voiceVideoCallingSDK?.close();
        }
        //Message for clearing window[popouTab]
        BroadcastService.postMessage({ eventName: BroadcastEvent.ClosePopoutWindow });
    };

    const webChatProps = initWebChatComposer(props, chatSDK, state, dispatch, setWebChatStyles);
    const setPostChatContextRelay = () => setPostChatContextAndLoadSurvey(chatSDK, dispatch);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const endChatRelay = (adapter: any, skipEndChatSDK: any, skipCloseChat: any, postMessageToOtherTab?: boolean) => endChat(props, chatSDK, setAdapter, setWebChatStyles, dispatch, adapter, skipEndChatSDK, skipCloseChat, postMessageToOtherTab);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prepareEndChatRelay = (adapter: any, state: ILiveChatWidgetContext) => prepareEndChat(props, chatSDK, setAdapter, setWebChatStyles, dispatch, adapter, state);
    const prepareStartChatRelay = () => prepareStartChat(props, chatSDK, state, dispatch, setAdapter);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const initStartChatRelay = (optionalParams?: any, persistedState?: any) => initStartChat(chatSDK, props.chatConfig, props.getAuthToken, dispatch, setAdapter, optionalParams, persistedState);
    const confirmationPaneProps = initConfirmationPropsComposer(props);

    return (
        <>
            <style>{`
            ::-webkit-scrollbar {
                width: ${scrollbarProps.width};
            }
            
            ::-webkit-scrollbar-track {
                background: ${scrollbarProps.trackBackgroundColor};
            }
            
            ::-webkit-scrollbar-thumb {
                background: ${scrollbarProps.thumbBackgroundColor};
                border-radius: ${scrollbarProps.thumbBorderRadius};
            }
            
            ::-webkit-scrollbar-thumb:hover {
                background: ${scrollbarProps.thumbHoverColor};
            } 
            `}</style>
            <Composer
                {...webChatProps}
                styleOptions={webChatStyles}
                directLine={props.webChatContainerProps?.directLine ?? adapter ?? defaultWebChatContainerStatefulProps.directLine}>
                <Stack
                    id={widgetElementId}
                    styles={generalStyles}
                    className={props.styleProps?.className}>

                    {!props.controlProps?.hideChatButton && !props.controlProps?.hideStartChatButton && shouldShowChatButton(state) && (decodeComponentString(props.componentOverrides?.chatButton) || <ChatButtonStateful buttonProps={props.chatButtonProps} outOfOfficeButtonProps={props.outOfOfficeChatButtonProps} startChat={prepareStartChatRelay} />)}

                    {!props.controlProps?.hideProactiveChatPane && shouldShowProactiveChatPane(state) && (decodeComponentString(props.componentOverrides?.proactiveChatPane) || <ProactiveChatPaneStateful proactiveChatProps={props.proactiveChatPaneProps} startChat={prepareStartChatRelay} />)}

                    {!props.controlProps?.hideHeader && shouldShowHeader(state) && (decodeComponentString(props.componentOverrides?.header) || <HeaderStateful headerProps={props.headerProps} outOfOfficeHeaderProps={props.outOfOfficeHeaderProps} endChat={endChatRelay} />)}

                    {!props.controlProps?.hideLoadingPane && shouldShowLoadingPane(state) && (decodeComponentString(props.componentOverrides?.loadingPane) || <LoadingPaneStateful {...props.loadingPaneProps} />)}

                    {!props.controlProps?.hideOutOfOfficeHoursPane && shouldShowOutOfOfficeHoursPane(state) && (decodeComponentString(props.componentOverrides?.outOfOfficeHoursPane) || <OutOfOfficeHoursPaneStateful {...props.outOfOfficeHoursPaneProps} />)}

                    {!props.controlProps?.hideReconnectChatPane && shouldShowReconnectChatPane(state) && (decodeComponentString(props.componentOverrides?.reconnectChatPane) || <ReconnectChatPaneStateful reconnectChatProps={props.reconnectChatPaneProps} initStartChat={initStartChatRelay} />)}

                    {!props.controlProps?.hidePreChatSurveyPane && shouldShowPreChatSurveyPane(state) && (decodeComponentString(props.componentOverrides?.preChatSurveyPane) || <PreChatSurveyPaneStateful surveyProps={props.preChatSurveyPaneProps} initStartChat={initStartChatRelay} />)}

                    {!props.controlProps?.hideCallingContainer && shouldShowCallingContainer(state) && <CallingContainerStateful voiceVideoCallingSdk={voiceVideoCallingSDK} {...props.callingContainerProps} />}

                    {!props.controlProps?.hideWebChatContainer && shouldShowWebChatContainer(state) && (decodeComponentString(props.componentOverrides?.webChatContainer) || <WebChatContainerStateful {...props.webChatContainerProps} />)}

                    {!props.controlProps?.hideConfirmationPane && shouldShowConfirmationPane(state) && (decodeComponentString(props.componentOverrides?.confirmationPane) || <ConfirmationPaneStateful {...confirmationPaneProps} setPostChatContext={setPostChatContextRelay} prepareEndChat={prepareEndChatRelay} />)}

                    {!props.controlProps?.hidePostChatLoadingPane && shouldShowPostChatLoadingPane(state) && (decodeComponentString(props.componentOverrides?.postChatLoadingPane) || <PostChatLoadingPaneStateful {...props.postChatLoadingPaneProps} />)}

                    {shouldShowPostChatSurveyPane(state) && (decodeComponentString(props.componentOverrides?.postChatSurveyPane) || <PostChatSurveyPaneStateful {...props.postChatSurveyPaneProps} {...props.chatSDK} />)}

                    {createFooter(props, state)}

                    {shouldShowEmailTranscriptPane(state) && (decodeComponentString(props.componentOverrides?.emailTranscriptPane) || <EmailTranscriptPaneStateful {...props.emailTranscriptPane} />)}
                </Stack>
            </Composer>
        </>
    );
};

export default LiveChatWidgetStateful;