import React, { Dispatch, useReducer, useState } from "react";

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
import overridePropsOnMockIfApplicable from "./common/overridePropsOnMockIfApplicable";

export const LiveChatWidget = (props: ILiveChatWidgetProps) => {

    const reducer = createReducer();
    const [state, dispatch]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useReducer(reducer, getLiveChatWidgetContextInitialState(props));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [adapter, setAdapter]: [any, (adapter: any) => void] = useState(undefined);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [facadeChatSDK, setFacadeChatSDK]: [any, (facade: any) => void] = useState(undefined);
    const chatSDK = getMockChatSDKIfApplicable(props.chatSDK, props?.mock?.type);

    overridePropsOnMockIfApplicable(props);

    if (!props.chatConfig) {
        throw new Error("chatConfig is required");
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isAuthenticatedChat = ((props.chatConfig?.LiveChatConfigAuthSettings as any)?.msdyn_javascriptclientfunction  
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    && (props.chatConfig?.LiveChatConfigAuthSettings as any)?.msdyn_javascriptclientfunction === true)? true : false;

    if (!facadeChatSDK) {
        setFacadeChatSDK(new FacadeChatSDK(
            {
                "chatSDK": chatSDK,
                "chatConfig": props.chatConfig,
                "isAuthenticated": isAuthenticatedChat,
                "getAuthToken": props?.getAuthToken
            }
        ));
    }

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