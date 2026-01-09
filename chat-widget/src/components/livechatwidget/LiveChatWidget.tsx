import React, { Dispatch, useEffect, useReducer, useState } from "react";

import { ChatAdapterStore } from "../../contexts/ChatAdapterStore";
import { ChatContextStore } from "../../contexts/ChatContextStore";
import { ChatSDKStore } from "../../contexts/ChatSDKStore";
import ErrorBoundary from "../errorboundary/ErrorBoundary";
import { FacadeChatSDK } from "../../common/facades/FacadeChatSDK";
import { FacadeChatSDKStore } from "../../contexts/FacadeChatSDKStore";
import { ILiveChatWidgetAction } from "../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../contexts/common/ILiveChatWidgetContext";
import { ILiveChatWidgetProps } from "./interfaces/ILiveChatWidgetProps";
import LiveChatWidgetStateful from "./livechatwidgetstateful/LiveChatWidgetStateful";
import { createReducer } from "../../contexts/createReducer";
import { getLiveChatWidgetContextInitialState } from "../../contexts/common/LiveChatWidgetContextInitialState";
import { getMockChatSDKIfApplicable } from "./common/getMockChatSDKIfApplicable";
import { isNullOrUndefined } from "../../common/utils";
import { isPersistentChatEnabled, isMidAuthEnabled } from "./common/liveChatConfigUtils";
import { logWidgetLoadWithUnexpectedError } from "./common/startChatErrorHandler";
import overridePropsOnMockIfApplicable from "./common/overridePropsOnMockIfApplicable";
import { registerTelemetryLoggers } from "./common/registerTelemetryLoggers";

export const LiveChatWidget = (props: ILiveChatWidgetProps) => {

    const reducer = createReducer();
    const [state, dispatch]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useReducer(reducer, getLiveChatWidgetContextInitialState(props));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [adapter, setAdapter]: [any, (adapter: any) => void] = useState(undefined);

    const [facadeChatSDK, setFacadeChatSDK]: [FacadeChatSDK | undefined, (facadeChatSDK: FacadeChatSDK) => void] = useState<FacadeChatSDK | undefined>(undefined);

    const chatSDK = getMockChatSDKIfApplicable(props.chatSDK, props?.mock);

    const disableReauthentication = props.featureConfigProps?.disableReauthentication === true;

    overridePropsOnMockIfApplicable(props);

    if (!props.chatConfig) {
        throw new Error("chatConfig is required");
    }

    // Check configuration flags
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hasAuthClientFn = !!((props.chatConfig?.LiveChatConfigAuthSettings as any)?.msdyn_javascriptclientfunction);
    const persistentChatEnabled = isPersistentChatEnabled(props.chatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_conversationmode);
    const midAuthEnabled = isMidAuthEnabled(props.chatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_authenticatedsigninoptional);

    // Check if user authenticated (pre-auth or mid-auth) from cached state for reconnect scenarios
    const hasUserAuthenticated = state?.appStates?.hasUserAuthenticated === true;

    //const hasLiveChatContext = !isUndefinedOrEmpty(state?.domainStates?.liveChatContext);
    //const conversationState = state?.appStates?.conversationState;

    //const isTerminalState = conversationState === ConversationState.Closed ||
    //    conversationState === ConversationState.Postchat ||
    //    conversationState === ConversationState.PostchatLoading ||
    //    conversationState === ConversationState.Error;

    // we can use if we want more state specific scenarios for mid-auth reconnect
    //const isMidAuthReconnect = hasUserAuthenticated && hasLiveChatContext && !isTerminalState;

    // isAuthenticatedChat determines if FacadeChatSDK should require authentication:
    // 
    // Note: Mid-auth and persistent chat are MUTUALLY EXCLUSIVE (cannot be enabled together in admin)
    // - Persistent chat: Always requires auth from start
    // - Mid-auth: Starts unauthenticated, can authenticate during conversation
    // 
    // Cases:
    // 1. Persistent chat enabled -> always authenticated
    // 2. Mid-auth disabled + auth settings exist -> authenticated from start (normal Auth)
    // 3. Mid-auth enabled + NOT authenticated -> starts unauthenticated
    // 4. Mid-auth enabled + HAS authenticated (pre-auth or mid-auth) -> authenticated (for reconnect)
    const isAuthenticatedChat = persistentChatEnabled ||                    // Persistent chat always authenticated
        (!midAuthEnabled && hasAuthClientFn) ||                             // Normal auth (mid-auth disabled)
        hasUserAuthenticated;                                               // User authenticated (pre-auth or mid-auth reconnect)

    // Debug trace
    // eslint-disable-next-line no-console
    console.info("[LCW][LiveChatWidget] Auth Configuration:", {
        persistentChatEnabled,
        midAuthEnabled,
        hasAuthClientFn,
        hasUserAuthenticated,
        isAuthenticatedChat,
        hasGetAuthToken: !!props?.getAuthToken
    });

    if (!facadeChatSDK) {
        setFacadeChatSDK(new FacadeChatSDK(
            {
                "chatSDK": chatSDK,
                "chatConfig": props.chatConfig,
                "isAuthenticated": isAuthenticatedChat,
                "getAuthToken": props?.getAuthToken,
                //when type is not undefined, it means the SDK is mocked
                "isSDKMocked": !isNullOrUndefined(props?.mock?.type),
            }, disableReauthentication));
    }

    useEffect(() => {
        registerTelemetryLoggers(props, dispatch);
    }, [dispatch]);

    return (
        <FacadeChatSDKStore.Provider value={[facadeChatSDK, setFacadeChatSDK]}>
            <ChatSDKStore.Provider value={chatSDK}>
                <ChatAdapterStore.Provider value={[adapter, setAdapter]}>
                    <ChatContextStore.Provider value={[state, dispatch]}>
                        <LiveChatWidgetStateful {...props} />
                    </ChatContextStore.Provider>
                </ChatAdapterStore.Provider>
            </ChatSDKStore.Provider>
        </FacadeChatSDKStore.Provider>
    );
};

export default LiveChatWidget;