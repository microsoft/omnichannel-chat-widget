import React, { Dispatch, useEffect, useReducer, useState } from "react";

import { ChatAdapterStore } from "../../contexts/ChatAdapterStore";
import { ChatContextStore } from "../../contexts/ChatContextStore";
import { ChatSDKStore } from "../../contexts/ChatSDKStore";
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

    // isAuthenticatedChat determines if FacadeChatSDK should require authentication:
    //
    // Note: Mid-auth and persistent chat are MUTUALLY EXCLUSIVE (cannot be enabled together in admin)
    // 
    // Cases:
    // 1. Persistent chat enabled -> always authenticated (existing behavior)
    // 2. Mid-auth DISABLED + auth settings exist -> authenticated from start (existing behavior - normal Auth)
    // 3. Mid-auth ENABLED + NOT authenticated -> starts unauthenticated (new mid-auth behavior)
    // 4. Mid-auth ENABLED + HAS authenticated (pre-auth or mid-auth) -> authenticated (for reconnect)
    let isAuthenticatedChat: boolean;
    
    if (midAuthEnabled) {
        // MID-AUTH SPECIFIC: Only require auth if user already authenticated or persistent chat
        isAuthenticatedChat = persistentChatEnabled || hasUserAuthenticated;
    } else {
        // EXISTING BEHAVIOR (mid-auth disabled): Normal auth flow
        isAuthenticatedChat = persistentChatEnabled || hasAuthClientFn;
    }

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