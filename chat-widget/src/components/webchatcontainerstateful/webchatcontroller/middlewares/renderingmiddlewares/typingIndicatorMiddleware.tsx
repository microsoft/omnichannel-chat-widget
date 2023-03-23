/******
 * TypingIndicatorMiddleware
 *
 * This middleware changes the component that shows who's actively typing. It uses the default Microsoft LiveChatWidget styles.
 ******/

import React, { Dispatch, useCallback } from "react";

import { DirectLineSenderRole } from "../../enums/DirectLineSenderRole";
import { ILiveChatWidgetAction } from "../../../../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../../../../contexts/common/ILiveChatWidgetContext";
import { ILiveChatWidgetLocalizedTexts } from "../../../../../contexts/common/ILiveChatWidgetLocalizedTexts";
import { debounceLeading } from "../../../../../common/utils";
import { defaultMiddlewareLocalizedTexts } from "../../../common/defaultProps/defaultMiddlewareLocalizedTexts";
import { defaultTypingIndicatorBubbleStyles } from "./defaultStyles/defaultTypingIndicatorBubbleStyles";
import { defaultTypingIndicatorContainerStyles } from "./defaultStyles/defaultTypingIndicatorContainerStyles";
import { defaultTypingIndicatorMessageStyles } from "./defaultStyles/defaultTypingIndicatorMessageStyles";
import { useChatContextStore } from "../../../../..";
import useChatSDKStore from "../../../../../hooks/useChatSDKStore";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TypingIndicator = ({ activeTyping, visible }: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chatSDK: any = useChatSDKStore();
    const [state, ]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    const debounceTyping = useCallback(debounceLeading(() => chatSDK?.sendTypingEvent()), []);

    if (!activeTyping || Object.keys(activeTyping).length === 0 || (state.domainStates.liveChatConfig?.LiveChatVersion === 1 && !visible)) {
        return null;
    }

    activeTyping = Object.keys(activeTyping).map(key => activeTyping[key]);
    for (let i = 0; i < activeTyping.length; i++) {
        if (activeTyping[i].role && activeTyping[i].role === DirectLineSenderRole.User) {
            //visible is set to false if the current user is typing, in which case, we just send typing indicator to OC
            if (state.domainStates.liveChatConfig?.LiveChatVersion === 2 && !visible) {
                debounceTyping();
                return null;
            }
            activeTyping.splice(i, 1);
            i--;
        }
    }

    const localizedTexts = {
        ...defaultMiddlewareLocalizedTexts,
        ...state.domainStates.middlewareLocalizedTexts
    };
    const message = getTypingIndicatorMessage(activeTyping, localizedTexts);

    const typingIndicatorStyles = {...defaultTypingIndicatorContainerStyles, ...state.domainStates.renderingMiddlewareProps?.typingIndicatorStyleProps};
    const typingIndicatorBubbleStyles = {...defaultTypingIndicatorBubbleStyles, ...state.domainStates.renderingMiddlewareProps?.typingIndicatorBubbleStyleProps};
    const typingIndicatorMessageStyles = {...defaultTypingIndicatorMessageStyles, ...state.domainStates.renderingMiddlewareProps?.typingIndicatorMessageStyleProps};

    return (
        <>
            <style>{`
                @keyframes bounce {
                    0% {
                        -webkit-transform: translateY(0);
                        transform: translateY(0);
                        opacity: .7;
                    }
                    20% {
                        -webkit-transform: translateY(-6px);
                        transform: translateY(-6px);
                        opacity: 1;
                    }
                    40% {
                        -webkit-transform: translateY(0);
                        transform: translateY(0);
                        opacity: .7
                    }
                    to {
                        -webkit-transform: translateY(0);
                        transform: translateY(0)
                    }
                }
            `}</style>
            <div style={typingIndicatorStyles}>
                <div style={typingIndicatorBubbleStyles}></div>
                <div style={{animationDelay: ".166s", ...typingIndicatorBubbleStyles}}></div>
                <div style={{animationDelay: ".333s", ...typingIndicatorBubbleStyles}}></div>
                <div style={typingIndicatorMessageStyles}> {message} </div>
            </div>
        </>
    );
};

// eslint-disable-next-line react/display-name, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
export const typingIndicatorMiddleware = () => (next: any) => (args: any) => {
    const {
        activeTyping,
        visible
    } = args;

    return <TypingIndicator activeTyping={activeTyping} visible={visible} />;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getTypingIndicatorMessage = (activeTyping: any[], localizedTexts: ILiveChatWidgetLocalizedTexts) => {
    if (!activeTyping || activeTyping.length === 0) {
        return "";
    } else if (activeTyping.length === 1) {
        const message = localizedTexts.MIDDLEWARE_TYPING_INDICATOR_ONE;
        return message ? (message.includes("{0}") ? message.replace("{0}", activeTyping[0].name) : message) : "";
    } else if (activeTyping.length === 2) {
        const firstMember = activeTyping[0].name;
        const lastMember = activeTyping[1].name;
        let message = localizedTexts.MIDDLEWARE_TYPING_INDICATOR_TWO;
        if (!message) {
            return "";
        }
        if (message.includes("{0}")) {
            message = message.replace("{0}", firstMember);
        }
        if (message.includes("{1}")) {
            message = message.replace("{1}", lastMember);
        }
        return message;
    } else {
        const message = localizedTexts.MIDDLEWARE_TYPING_INDICATOR_MULTIPLE;
        return message ? (message.includes("{0}") ? message.replace("{0}", activeTyping.length.toString()) : message) : "";
    }
};