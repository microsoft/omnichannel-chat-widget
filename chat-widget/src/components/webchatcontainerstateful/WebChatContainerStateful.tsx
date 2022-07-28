import { IStackStyles, Stack } from "@fluentui/react";
import { LogLevel, TelemetryEvent } from "../../common/telemetry/TelemetryConstants";
import React, { Dispatch, useEffect } from "react";
import { Components } from "botframework-webchat";
import { ILiveChatWidgetAction } from "../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../contexts/common/ILiveChatWidgetContext";
import { IWebChatContainerStatefulProps } from "./interfaces/IWebChatContainerStatefulProps";
import { LiveChatWidgetActionType } from "../../contexts/common/LiveChatWidgetActionType";
import { TelemetryHelper } from "../../common/telemetry/TelemetryHelper";
import { defaultMiddlewareLocalizedTexts } from "./common/defaultProps/defaultMiddlewareLocalizedTexts";
import { defaultWebChatContainerStatefulProps } from "./common/defaultProps/defaultWebChatContainerStatefulProps";
import { setFocusOnSendBox } from "../../common/utils";
import { useChatContextStore } from "../..";
import { WebChatActionType } from "./webchatcontroller/enums/WebChatActionType";
import { WebChatStoreLoader } from "./webchatcontroller/WebChatStoreLoader";
import { Constants } from "../../common/Constants";

const postActivity = (activity: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    return {
        type: WebChatActionType.DIRECT_LINE_POST_ACTIVITY,
        meta: { method: "keyboard" },
        payload: {
            activity: {
                channelData: undefined,
                text: "",
                textFormat: "plain",
                type: Constants.message,
                ...activity
            }
        }
    };
};

export const WebChatContainerStateful = (props: IWebChatContainerStatefulProps) => {
    const { BasicWebChat } = Components;
    const [state, dispatch]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    const magicCodeBroadcastChannel = new BroadcastChannel(Constants.magicCodeBroadcastChannel);
    const magicCodeResponseBroadcastChannel = new BroadcastChannel(Constants.magicCodeResponseBroadcastChannel);

    const containerStyles: IStackStyles = {
        root: Object.assign(
            {}, defaultWebChatContainerStatefulProps.containerStyles, props?.containerStyles,
            {display: state.appStates.isMinimized ? "none" : ""}) // Use this instead of removing WebChat from the picture so that the activity observer inside the adapter is not invoked 
    };
    
    const localizedTexts = {
        ...defaultMiddlewareLocalizedTexts,
        ...props?.localizedTexts
    };

    useEffect(() => {
        setFocusOnSendBox();
        dispatch({type: LiveChatWidgetActionType.SET_RENDERING_MIDDLEWARE_PROPS, payload: props?.renderingMiddlewareProps});
        dispatch({type: LiveChatWidgetActionType.SET_MIDDLEWARE_LOCALIZED_TEXTS, payload: localizedTexts});
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
            Event: TelemetryEvent.WebChatLoaded
        });
    }, []);

    useEffect(() => {
        magicCodeBroadcastChannel.addEventListener("message", (event) => {
            const { data } = event;

            if (state.domainStates.botOAuthSignInId === data.signin) {
                const { signin, code } = data;
                const text = `${code}`;
                const action = postActivity({
                    text,
                    channelData: {
                        tags: [Constants.hiddenTag]
                    }
                });

                WebChatStoreLoader.store.dispatch(action);

                const response = {
                    signin,
                    result: "Success"
                };

                magicCodeResponseBroadcastChannel.postMessage(response);

                TelemetryHelper.logActionEvent(LogLevel.INFO, {
                    Event: TelemetryEvent.SuppressBotMagicCode
                });

                dispatch({type: LiveChatWidgetActionType.SET_BOT_OAUTH_SIGNIN_ID, payload: ""});
            } else {
                TelemetryHelper.logActionEvent(LogLevel.ERROR, {
                    Event: TelemetryEvent.SuppressBotMagicCode,
                    Description: "Signin does not match"
                });
            }
        });
    }, [state.domainStates.botOAuthSignInId]);

    return (
        <><style>{`
        .ms_lcw_webchat_received_message img.webchat__markdown__external-link-icon { 
            background-image : url(data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIzIDMgMTggMTgiICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik03LjI1MDEgNC41MDAxN0gxMC43NDk1QzExLjE2MzcgNC41MDAxNyAxMS40OTk1IDQuODM1OTYgMTEuNDk5NSA1LjI1MDE3QzExLjQ5OTUgNS42Mjk4NiAxMS4yMTczIDUuOTQzNjYgMTAuODUxMyA1Ljk5MzMyTDEwLjc0OTUgNi4wMDAxN0g3LjI0OTc0QzYuMDcwNzkgNS45OTk2MSA1LjEwMzQ5IDYuOTA2NTYgNS4wMDc4NiA4LjA2MTEyTDUuMDAwMjggOC4yMjAwM0w1LjAwMzEyIDE2Ljc1MDdDNS4wMDM0MyAxNy45NDE1IDUuOTI4ODUgMTguOTE2MSA3LjA5OTY2IDE4Ljk5NDlMNy4yNTM3MSAxOS4wMDAxTDE1Ljc1MTggMTguOTg4NEMxNi45NDE1IDE4Ljk4NjggMTcuOTE0NSAxOC4wNjIgMTcuOTkzNSAxNi44OTIzTDE3Ljk5ODcgMTYuNzM4NFYxMy4yMzIxQzE3Ljk5ODcgMTIuODE3OSAxOC4zMzQ1IDEyLjQ4MjEgMTguNzQ4NyAxMi40ODIxQzE5LjEyODQgMTIuNDgyMSAxOS40NDIyIDEyLjc2NDMgMTkuNDkxOCAxMy4xMzAzTDE5LjQ5ODcgMTMuMjMyMVYxNi43Mzg0QzE5LjQ5ODcgMTguNzQwNyAxNy45MjkzIDIwLjM3NjkgMTUuOTUyOCAyMC40ODI5TDE1Ljc1MzggMjAuNDg4NEw3LjI1ODI3IDIwLjUwMDFMNy4wNTQ5NSAyMC40OTQ5QzUuMTQyMzkgMjAuMzk1NCAzLjYwODk1IDE4Ljg2MjcgMy41MDgzNyAxNi45NTAyTDMuNTAzMTIgMTYuNzUxMUwzLjUwMDg5IDguMjUyN0wzLjUwNTI5IDguMDUwMkMzLjYwNTM5IDYuMTM3NDkgNS4xMzg2NyA0LjYwNDQ5IDcuMDUwOTYgNC41MDUyN0w3LjI1MDEgNC41MDAxN0gxMC43NDk1SDcuMjUwMVpNMTMuNzQ4MSAzLjAwMTQ2TDIwLjMwMTggMy4wMDE5N0wyMC40MDE0IDMuMDE1NzVMMjAuNTAyMiAzLjA0MzkzTDIwLjU1OSAzLjA2ODAzQzIwLjYxMjIgMy4wOTEyMiAyMC42NjM0IDMuMTIxNjMgMjAuNzExMSAzLjE1ODg1TDIwLjc4MDQgMy4yMjE1NkwyMC44NjQxIDMuMzIwMTRMMjAuOTE4MyAzLjQxMDI1TDIwLjk1NyAzLjUwMDU3TDIwLjk3NjIgMy41NjQ3NkwyMC45ODk4IDMuNjI4NjJMMjAuOTk5MiAzLjcyMjgyTDIwLjk5OTcgMTAuMjU1NEMyMC45OTk3IDEwLjY2OTYgMjAuNjYzOSAxMS4wMDU0IDIwLjI0OTcgMTEuMDA1NEMxOS44NyAxMS4wMDU0IDE5LjU1NjIgMTAuNzIzMiAxOS41MDY1IDEwLjM1NzFMMTkuNDk5NyAxMC4yNTU0TDE5LjQ5ODkgNS41NjE0N0wxMi4yNzk3IDEyLjc4NDdDMTIuMDEzNCAxMy4wNTEgMTEuNTk2OCAxMy4wNzUzIDExLjMwMzEgMTIuODU3NUwxMS4yMTkgMTIuNzg0OUMxMC45NTI3IDEyLjUxODcgMTAuOTI4NCAxMi4xMDIxIDExLjE0NjIgMTEuODA4NEwxMS4yMTg4IDExLjcyNDNMMTguNDM2OSA0LjUwMTQ2SDEzLjc0ODFDMTMuMzY4NCA0LjUwMTQ2IDEzLjA1NDYgNC4yMTkzMSAxMy4wMDUgMy44NTMyNEwxMi45OTgxIDMuNzUxNDZDMTIuOTk4MSAzLjM3MTc3IDEzLjI4MDMgMy4wNTc5NyAxMy42NDY0IDMuMDA4MzFMMTMuNzQ4MSAzLjAwMTQ2WiIgZmlsbD0iI0ZGRkZGRiIgLz48L3N2Zz4) !important;
            height: '.75em';
            marginLeft: '.25em'; 
        }
        pre {
            white-space: pre-wrap;
            white-space: -moz-pre-wrap;
            white-space: -pre-wrap;
            white-space: -o-pre-wrap;
            word-wrap: break-word;
        }
        .ms_lcw_webchat_received_message a:link,
        .ms_lcw_webchat_received_message a:visited,
        .ms_lcw_webchat_received_message a:hover,
        .ms_lcw_webchat_received_message a:active {
            color: white;
        } `}</style>
        <Stack styles={containerStyles}>
            <BasicWebChat></BasicWebChat>
        </Stack>
        </>
    );
};

export default WebChatContainerStateful;