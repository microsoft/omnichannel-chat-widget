import { BroadcastService, decodeComponentString } from "@microsoft/omnichannel-chat-components";
import { IStackStyles, Stack } from "@fluentui/react";
import React, { Dispatch, useEffect, useRef, useState } from "react";
import { createTimer, getLocaleDirection } from "../../../common/utils";
import { getReconnectIdForAuthenticatedChat, handleUnauthenticatedReconnectChat } from "../common/reconnectChatHelper";
import { initStartChat, prepareStartChat } from "../common/startChat";
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

import CallingContainerStateful from "../../callingcontainerstateful/CallingContainerStateful";
import ChatButtonStateful from "../../chatbuttonstateful/ChatButtonStateful";
import { Components } from "botframework-webchat";
import ConfirmationPaneStateful from "../../confirmationpanestateful/ConfirmationPaneStateful";
import { ConversationState } from "../../../contexts/common/ConversationState";
import { ElementType } from "@microsoft/omnichannel-chat-components";
import EmailTranscriptPaneStateful from "../../emailtranscriptpanestateful/EmailTranscriptPaneStateful";
import HeaderStateful from "../../headerstateful/HeaderStateful";
import { ICustomEvent } from "@microsoft/omnichannel-chat-components/lib/types/interfaces/ICustomEvent";
import { ILiveChatWidgetAction } from "../../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../../contexts/common/ILiveChatWidgetContext";
import { ILiveChatWidgetProps } from "../interfaces/ILiveChatWidgetProps";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";
import LoadingPaneStateful from "../../loadingpanestateful/LoadingPaneStateful";
import OutOfOfficeHoursPaneStateful from "../../ooohpanestateful/OOOHPaneStateful";
import PostChatLoadingPaneStateful from "../../postchatloadingpanestateful/PostChatLoadingPaneStateful";
import PostChatSurveyPaneStateful from "../../postchatsurveypanestateful/PostChatSurveyPaneStateful";
import PreChatSurveyPaneStateful from "../../prechatsurveypanestateful/PreChatSurveyPaneStateful";
import ProactiveChatPaneStateful from "../../proactivechatpanestateful/ProactiveChatPaneStateful";
import ReconnectChatPaneStateful from "../../reconnectchatpanestateful/ReconnectChatPaneStateful";
import { TelemetryTimers } from "../../../common/telemetry/TelemetryManager";
import WebChatContainerStateful from "../../webchatcontainerstateful/WebChatContainerStateful";
import { createFooter } from "../common/createFooter";
import { createInternetConnectionChangeHandler } from "../common/createInternetConnectionChangeHandler";
import { defaultWebChatContainerStatefulProps } from "../../webchatcontainerstateful/common/defaultProps/defaultWebChatContainerStatefulProps";
import { endChat } from "../common/endChat";
import { getGeneralStylesForButton } from "../common/getGeneralStylesForButton";
import { initCallingSdk } from "../common/initCallingSdk";
import { initConfirmationPropsComposer } from "../common/initConfirmationPropsComposer";
import { initWebChatComposer } from "../common/initWebChatComposer";
import { registerTelemetryLoggers } from "../common/registerTelemetryLoggers";
import { setPostChatContextAndLoadSurvey } from "../common/setPostChatContextAndLoadSurvey";

import { startProactiveChat } from "../common/startProactiveChat";
import useChatAdapterStore from "../../../hooks/useChatAdapterStore";
import useChatContextStore from "../../../hooks/useChatContextStore";
import useChatSDKStore from "../../../hooks/useChatSDKStore";
import { TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";
import { disposeTelemetryLoggers } from "../common/disposeTelemetryLoggers";

export const LiveChatWidgetStateful = (props: ILiveChatWidgetProps) => {
    const [state, dispatch]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [adapter, setAdapter]: [any, (adapter: any) => void] = useChatAdapterStore();
    const [webChatStyles, setWebChatStyles] = useState({ ...defaultWebChatContainerStatefulProps.webChatStyles, ...props.webChatContainerProps?.webChatStyles });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chatSDK: any = useChatSDKStore();
    const [voiceVideoCallingSDK, setVoiceVideoCallingSDK] = useState(undefined);
    const { Composer } = Components;
    const canStartProactiveChat = useRef(true);

    // Process general styles
    const generalStyles: IStackStyles = {
        root: Object.assign({}, getGeneralStylesForButton(state), props.styleProps?.generalStyles)
    };

    TelemetryTimers.LcwLoadToChatButtonTimer = createTimer();

    const widgetElementId: string = props.controlProps?.id || "oc-lcw";
    const currentMessageCountRef = useRef<number>(0);

    useEffect(() => {
        registerTelemetryLoggers(props, dispatch);
        createInternetConnectionChangeHandler();

        dispatch({ type: LiveChatWidgetActionType.SET_WIDGET_ELEMENT_ID, payload: widgetElementId });
        dispatch({ type: LiveChatWidgetActionType.SET_SKIP_CHAT_BUTTON_RENDERING, payload: props.controlProps?.skipChatButtonRendering || false });
        initCallingSdk(chatSDK, setVoiceVideoCallingSDK)
            .then((sdkCreated: boolean) => {
                sdkCreated && dispatch({ type: LiveChatWidgetActionType.SET_E2VV_ENABLED, payload: true });
            });

        if (!props.controlProps?.skipChatButtonRendering && props.reconnectChatPaneProps?.reconnectId) {
            handleUnauthenticatedReconnectChat(dispatch, props.reconnectChatPaneProps?.reconnectId, initStartChat);
        }

        // Initialize global dir
        const globalDir = props.controlProps?.dir ?? getLocaleDirection(props.chatConfig?.ChatWidgetLanguage?.msdyn_localeid);
        dispatch({ type: LiveChatWidgetActionType.SET_GLOBAL_DIR, payload: globalDir });

        if (state.domainStates?.chatToken) {
            const optionalParams = { liveChatContext: { chatToken: state.domainStates?.chatToken } };
            initStartChat(chatSDK, dispatch, setAdapter, optionalParams);
        }
    }, []);

    useEffect(() => {
        if (state.appStates.skipChatButtonRendering) {
            if (props.reconnectChatPaneProps?.reconnectId && !state.appStates.reconnectId) {
                handleUnauthenticatedReconnectChat(dispatch, props.reconnectChatPaneProps?.reconnectId, initStartChat);
            } else {
                getReconnectIdForAuthenticatedChat(props, chatSDK).then((authReconnectId) => {
                    if (authReconnectId && !state.appStates.reconnectId) {
                        dispatch({ type: LiveChatWidgetActionType.SET_RECONNECT_ID, payload: authReconnectId });
                        dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.ReconnectChat });
                    } else {
                        dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Loading });
                        initStartChat(chatSDK, dispatch, setAdapter);
                    }
                });
            }
        }
    }, [state.appStates.skipChatButtonRendering]);

    useEffect(() => {
        BroadcastService.getMessageByEventName("StartProactiveChat").subscribe((msg: ICustomEvent) => {
            if (canStartProactiveChat.current) {
                startProactiveChat(dispatch, msg?.payload?.bodyTitle, msg?.payload?.showPrechat, msg?.payload?.inNewWindow);
            }
        });
        window.addEventListener("beforeunload", (event) => {
            disposeTelemetryLoggers();
        });
        if (state.appStates.conversationEndedByAgent) {
            endChat(props, chatSDK, setAdapter, setWebChatStyles, dispatch, adapter);
        }
    }, []);

    useEffect(() => {
        canStartProactiveChat.current = state.appStates.conversationState === ConversationState.Closed;

        if (state.appStates.conversationState === ConversationState.Active) {
            chatSDK?.onNewMessage(() => {
                BroadcastService.postMessage({ eventName: "NewMessageNotification" });
            });
        }

        // Track the message count
        if (state.appStates.conversationState == ConversationState.Active) {
            chatSDK?.onNewMessage(() => {
                currentMessageCountRef.current++;
                dispatch({ type: LiveChatWidgetActionType.SET_UNREAD_MESSAGE_COUNT, payload: currentMessageCountRef.current + 1 });
            });
        }
    }, [state.appStates.conversationState]);

    // Reset the UnreadMessageCount when minimized is toggled and broadcast it.
    useEffect(() => {
        currentMessageCountRef.current = -1;
        dispatch({ type: LiveChatWidgetActionType.SET_UNREAD_MESSAGE_COUNT, payload: 0 });
        const customEvent: ICustomEvent = {
            elementType: ElementType.Custom,
            eventName: "UnreadMessageCount",
            payload: 0
        };
        BroadcastService.postMessage(customEvent);
    }, [state.appStates.isMinimized]);

    // Broadcast the UnreadMessageCount state on any change.
    useEffect(() => {
        if (state.appStates.isMinimized && state.appStates.unreadMessageCount > 0) {
            const customEvent: ICustomEvent = {
                elementType: ElementType.Custom,
                eventName: "UnreadMessageCount",
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
    
    const webChatProps = initWebChatComposer(props, chatSDK, state, dispatch, setWebChatStyles);
    const setPostChatContextRelay = () => setPostChatContextAndLoadSurvey(chatSDK, dispatch, true);
    const endChatRelay = () => endChat(props, chatSDK, setAdapter, setWebChatStyles, dispatch, adapter);
    const prepareStartChatRelay = () => prepareStartChat(props, chatSDK, state, dispatch, setAdapter);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const initStartChatRelay = (optionalParams?: any) => initStartChat(chatSDK, dispatch, setAdapter, optionalParams);
    const confirmationPaneProps = initConfirmationPropsComposer(props);
    
    // publish chat widget state
    const chatWidgetStateChangeEvent: ICustomEvent = {
        eventName: TelemetryEvent.ChatWidgetStateChanged,
        payload: {
            ...state
        }
    };
    BroadcastService.postMessage(chatWidgetStateChangeEvent);

    return (
        <Composer
            {...webChatProps}
            styleOptions={webChatStyles}
            directLine={props.webChatContainerProps?.directLine ?? adapter ?? defaultWebChatContainerStatefulProps.directLine}>
            <Stack
                id={widgetElementId}
                styles={generalStyles}
                className={props.styleProps?.className}>

                {!props.controlProps?.hideChatButton && shouldShowChatButton(state) && (decodeComponentString(props.componentOverrides?.chatButton) || <ChatButtonStateful buttonProps={props.chatButtonProps} outOfOfficeButtonProps={props.outOfOfficeChatButtonProps} startChat={prepareStartChatRelay} />)}

                {!props.controlProps?.hideProactiveChatPane && shouldShowProactiveChatPane(state) && (decodeComponentString(props.componentOverrides?.proactiveChatPane) || <ProactiveChatPaneStateful proactiveChatProps={props.proactiveChatPaneProps} startChat={prepareStartChatRelay} />)}

                {!props.controlProps?.hideHeader && shouldShowHeader(state) && (decodeComponentString(props.componentOverrides?.header) || <HeaderStateful headerProps={props.headerProps} outOfOfficeHeaderProps={props.outOfOfficeHeaderProps} endChat={endChatRelay} />)}

                {!props.controlProps?.hideLoadingPane && shouldShowLoadingPane(state) && (decodeComponentString(props.componentOverrides?.loadingPane) || <LoadingPaneStateful {...props.loadingPaneProps} />)}

                {!props.controlProps?.hideOutOfOfficeHoursPane && shouldShowOutOfOfficeHoursPane(state) && (decodeComponentString(props.componentOverrides?.outOfOfficeHoursPane) || <OutOfOfficeHoursPaneStateful {...props.outOfOfficeHoursPaneProps} />)}

                {!props.controlProps?.hideReconnectChatPane && shouldShowReconnectChatPane(state) && (decodeComponentString(props.componentOverrides?.reconnectChatPane) || <ReconnectChatPaneStateful reconnectChatProps={props.reconnectChatPaneProps} initStartChat={initStartChatRelay} />)}

                {!props.controlProps?.hidePreChatSurveyPane && shouldShowPreChatSurveyPane(state) && <PreChatSurveyPaneStateful surveyProps={props.preChatSurveyPaneProps} initStartChat={initStartChatRelay} />}

                {!props.controlProps?.hideCallingContainer && shouldShowCallingContainer(state) && <CallingContainerStateful voiceVideoCallingSdk={voiceVideoCallingSDK} {...props.callingContainerProps} />}

                {!props.controlProps?.hideWebChatContainer && shouldShowWebChatContainer(state) && (decodeComponentString(props.componentOverrides?.webChatContainer) || <WebChatContainerStateful {...props.webChatContainerProps} />)}

                {!props.controlProps?.hideConfirmationPane && shouldShowConfirmationPane(state) && (decodeComponentString(props.componentOverrides?.confirmationPane) || <ConfirmationPaneStateful {...confirmationPaneProps} setPostChatContext={setPostChatContextRelay} endChat={endChatRelay} />)}

                {!props.controlProps?.hidePostChatLoadingPane && shouldShowPostChatLoadingPane(state) && (decodeComponentString(props.componentOverrides?.postChatLoadingPane) || <PostChatLoadingPaneStateful {...props.postChatLoadingPaneProps} />)}

                {shouldShowPostChatSurveyPane(state) && (decodeComponentString(props.componentOverrides?.postChatSurveyPane) || <PostChatSurveyPaneStateful {...props.postChatSurveyPaneProps} {...props.chatSDK} />)}

                {createFooter(props, state)}

                {shouldShowEmailTranscriptPane(state) && (decodeComponentString(props.componentOverrides?.emailTranscriptPane) || <EmailTranscriptPaneStateful {...props.emailTranscriptPane} />)}
            </Stack>
        </Composer>
    );
};

export default LiveChatWidgetStateful;