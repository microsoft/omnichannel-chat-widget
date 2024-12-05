/* eslint-disable @typescript-eslint/no-explicit-any */

import { IRawStyle, IStackStyles, Stack } from "@fluentui/react";
import { LogLevel, TelemetryEvent } from "../../common/telemetry/TelemetryConstants";
import React, { Dispatch, useEffect } from "react";

import { BotMagicCodeStore } from "./webchatcontroller/BotMagicCodeStore";
import { Components } from "botframework-webchat";
import { Constants } from "../../common/Constants";
import { ILiveChatWidgetAction } from "../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../contexts/common/ILiveChatWidgetContext";
import { ILiveChatWidgetProps } from "../livechatwidget/interfaces/ILiveChatWidgetProps";
import { LiveChatWidgetActionType } from "../../contexts/common/LiveChatWidgetActionType";
import { NotificationHandler } from "./webchatcontroller/notification/NotificationHandler";
import { NotificationScenarios } from "./webchatcontroller/enums/NotificationScenarios";
import { TelemetryHelper } from "../../common/telemetry/TelemetryHelper";
import { WebChatActionType } from "./webchatcontroller/enums/WebChatActionType";
import { WebChatStoreLoader } from "./webchatcontroller/WebChatStoreLoader";
import { defaultAdaptiveCardStyles } from "./common/defaultStyles/defaultAdaptiveCardStyles";
import { defaultMiddlewareLocalizedTexts } from "./common/defaultProps/defaultMiddlewareLocalizedTexts";
import { defaultReceivedMessageAnchorStyles } from "./webchatcontroller/middlewares/renderingmiddlewares/defaultStyles/defaultReceivedMessageAnchorStyles";
import { defaultSentMessageAnchorStyles } from "./webchatcontroller/middlewares/renderingmiddlewares/defaultStyles/defaultSentMessageAnchorStyles";
import { defaultSystemMessageBoxStyles } from "./webchatcontroller/middlewares/renderingmiddlewares/defaultStyles/defaultSystemMessageBoxStyles";
import { defaultUserMessageBoxStyles } from "./webchatcontroller/middlewares/renderingmiddlewares/defaultStyles/defaultUserMessageBoxStyles";
import { defaultWebChatContainerStatefulProps } from "./common/defaultProps/defaultWebChatContainerStatefulProps";
import { setFocusOnSendBox } from "../../common/utils";
import { useChatContextStore } from "../..";

const broadcastChannelMessageEvent = "message";
const postActivity = (activity: any) => { 
    // eslint-disable-line @typescript-eslint/no-explicit-any
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

const createMagicCodeSuccessResponse = (signin: string) => {
    return {
        signin,
        result: "Success"
    };
};

export const WebChatContainerStateful = (props: ILiveChatWidgetProps) => {
    const { BasicWebChat } = Components;
    const [state, dispatch]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    const {webChatContainerProps, contextDataStore} = props;

    const containerStyles: IStackStyles = {
        root: Object.assign(
            {}, defaultWebChatContainerStatefulProps.containerStyles, webChatContainerProps?.containerStyles,
            { display: state.appStates.isMinimized ? "none" : "" }) // Use this instead of removing WebChat from the picture so that the activity observer inside the adapter is not invoked
    };

    const localizedTexts = {
        ...defaultMiddlewareLocalizedTexts,
        ...webChatContainerProps?.localizedTexts
    };

    useEffect(() => {
        setFocusOnSendBox();
        dispatch({ type: LiveChatWidgetActionType.SET_RENDERING_MIDDLEWARE_PROPS, payload: webChatContainerProps?.renderingMiddlewareProps });
        dispatch({ type: LiveChatWidgetActionType.SET_MIDDLEWARE_LOCALIZED_TEXTS, payload: localizedTexts });
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
            Event: TelemetryEvent.WebChatLoaded
        });

        if (props.webChatContainerProps?.renderingMiddlewareProps?.disableThirdPartyCookiesAlert !== true && !contextDataStore) {
            try {
                localStorage;
                sessionStorage;
            } catch (error) {
                if (!(window as any).TPCWarningShown) {
                    NotificationHandler.notifyWarning(NotificationScenarios.TPC, localizedTexts?.THIRD_PARTY_COOKIES_BLOCKED_ALERT_MESSAGE ?? "");
                    (window as any).TPCWarningShown = true;
                }
            }
        }
    }, []);

    useEffect(() => {
        if (!props.webChatContainerProps?.botMagicCode?.disabled) {
            return;
        }

        if (!(window as any).BroadcastChannel) { // eslint-disable-line @typescript-eslint/no-explicit-any
            TelemetryHelper.logActionEvent(LogLevel.ERROR, {
                Event: TelemetryEvent.SuppressBotMagicCodeFailed,
                Description: "BroadcastChannel not supported by default on current browser"
            });

            return;
        }

        const magicCodeBroadcastChannel = new (window as any).BroadcastChannel(Constants.magicCodeBroadcastChannel); // eslint-disable-line @typescript-eslint/no-explicit-any
        const magicCodeResponseBroadcastChannel = new (window as any).BroadcastChannel(Constants.magicCodeResponseBroadcastChannel); // eslint-disable-line @typescript-eslint/no-explicit-any

        const eventListener = (event: { data: any; }) => { // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-function
            const { data } = event;
            if (BotMagicCodeStore.botOAuthSignInId === data.signin) {
                const { signin, code } = data;
                const text = `${code}`;
                const action = postActivity({
                    text,
                    channelData: {
                        tags: [Constants.hiddenTag]
                    }
                });

                WebChatStoreLoader.store.dispatch(action);

                const response = createMagicCodeSuccessResponse(signin);
                magicCodeResponseBroadcastChannel.postMessage(response);

                TelemetryHelper.logActionEvent(LogLevel.INFO, {
                    Event: TelemetryEvent.SuppressBotMagicCodeSucceeded
                });

                BotMagicCodeStore.botOAuthSignInId = "";
                magicCodeBroadcastChannel.close();
                magicCodeResponseBroadcastChannel.close();
            } else {
                TelemetryHelper.logActionEvent(LogLevel.ERROR, {
                    Event: TelemetryEvent.SuppressBotMagicCodeFailed,
                    Description: "Signin does not match"
                });
            }
        };

        magicCodeBroadcastChannel.addEventListener(broadcastChannelMessageEvent, eventListener);
    }, []);

    return (
        <><style>{`
        .webchat__stacked-layout__content .ac-pushButton {
            cursor: pointer;
        }

        .webchat__bubble__content>div#ms_lcw_webchat_adaptive_card {
            background: ${webChatContainerProps?.adaptiveCardStyles?.background ?? defaultAdaptiveCardStyles.background};
        }

        .webchat__stacked-layout__content div.webchat__stacked-layout__message-row div.webchat__bubble--from-user {
            max-width: ${webChatContainerProps?.renderingMiddlewareProps?.userMessageBoxStyles?.maxWidth ?? defaultUserMessageBoxStyles?.maxWidth}
        }

        .webchat__stacked-layout--show-avatar div.webchat__stacked-layout__content div.webchat__stacked-layout__message-row div.webchat__stacked-layout__message {
            max-width: ${webChatContainerProps?.renderingMiddlewareProps?.systemMessageBoxStyles?.maxWidth ?? defaultSystemMessageBoxStyles?.maxWidth}
        }

        div[class="ac-textBlock"] *,
        div[class="ac-input-container"] * {white-space:${webChatContainerProps?.adaptiveCardStyles?.textWhiteSpace ?? defaultAdaptiveCardStyles.textWhiteSpace}}

        div[class="ac-input-container"] input.ac-multichoiceInput,
        div[class="ac-input-container"] select.ac-multichoiceInput {
            ${webChatContainerProps?.adaptiveCardStyles?.choiceInputPadding ? `padding: ${webChatContainerProps.adaptiveCardStyles.choiceInputPadding} !important;` : ""}
        }

        .ms_lcw_webchat_received_message>div.webchat__stacked-layout>div.webchat__stacked-layout__main>div.webchat__stacked-layout__content>div.webchat__stacked-layout__message-row>[class^=webchat]:not(.webchat__bubble--from-user)>.webchat__bubble__content {
            background-color: ${props.webChatContainerProps?.webChatStyles?.bubbleBackground ?? defaultWebChatContainerStatefulProps.webChatStyles?.bubbleBackground};
            color:${props.webChatContainerProps?.webChatStyles?.bubbleTextColor ?? defaultWebChatContainerStatefulProps.webChatStyles?.bubbleTextColor};
        }

        div[class="ac-textBlock"] a:link,
        div[class="ac-textBlock"] a:visited,
        div[class="ac-textBlock"] a:hover,
        div[class="ac-textBlock"] a:active {
            color: ${webChatContainerProps?.adaptiveCardStyles?.anchorColor ?? defaultAdaptiveCardStyles.anchorColor};
        }

        .webchat__stacked-layout__content .ac-actionSet > .ac-pushButton > div {white-space: ${webChatContainerProps?.adaptiveCardStyles?.buttonWhiteSpace ?? defaultAdaptiveCardStyles.buttonWhiteSpace} !important;}

        .ms_lcw_webchat_received_message img.webchat__render-markdown__external-link-icon {
            background-image: url(data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIzIDMgMTggMTgiICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik03LjI1MDEgNC41MDAxN0gxMC43NDk1QzExLjE2MzcgNC41MDAxNyAxMS40OTk1IDQuODM1OTYgMTEuNDk5NSA1LjI1MDE3QzExLjQ5OTUgNS42Mjk4NiAxMS4yMTczIDUuOTQzNjYgMTAuODUxMyA1Ljk5MzMyTDEwLjc0OTUgNi4wMDAxN0g3LjI0OTc0QzYuMDcwNzkgNS45OTk2MSA1LjEwMzQ5IDYuOTA2NTYgNS4wMDc4NiA4LjA2MTEyTDUuMDAwMjggOC4yMjAwM0w1LjAwMzEyIDE2Ljc1MDdDNS4wMDM0MyAxNy45NDE1IDUuOTI4ODUgMTguOTE2MSA3LjA5OTY2IDE4Ljk5NDlMNy4yNTM3MSAxOS4wMDAxTDE1Ljc1MTggMTguOTg4NEMxNi45NDE1IDE4Ljk4NjggMTcuOTE0NSAxOC4wNjIgMTcuOTkzNSAxNi44OTIzTDE3Ljk5ODcgMTYuNzM4NFYxMy4yMzIxQzE3Ljk5ODcgMTIuODE3OSAxOC4zMzQ1IDEyLjQ4MjEgMTguNzQ4NyAxMi40ODIxQzE5LjEyODQgMTIuNDgyMSAxOS40NDIyIDEyLjc2NDMgMTkuNDkxOCAxMy4xMzAzTDE5LjQ5ODcgMTMuMjMyMVYxNi43Mzg0QzE5LjQ5ODcgMTguNzQwNyAxNy45MjkzIDIwLjM3NjkgMTUuOTUyOCAyMC40ODI5TDE1Ljc1MzggMjAuNDg4NEw3LjI1ODI3IDIwLjUwMDFMNy4wNTQ5NSAyMC40OTQ5QzUuMTQyMzkgMjAuMzk1NCAzLjYwODk1IDE4Ljg2MjcgMy41MDgzNyAxNi45NTAyTDMuNTAzMTIgMTYuNzUxMUwzLjUwMDg5IDguMjUyN0wzLjUwNTI5IDguMDUwMkMzLjYwNTM5IDYuMTM3NDkgNS4xMzg2NyA0LjYwNDQ5IDcuMDUwOTYgNC41MDUyN0w3LjI1MDEgNC41MDAxN0gxMC43NDk1SDcuMjUwMVpNMTMuNzQ4MSAzLjAwMTQ2TDIwLjMwMTggMy4wMDE5N0wyMC40MDE0IDMuMDE1NzVMMjAuNTAyMiAzLjA0MzkzTDIwLjU1OSAzLjA2ODAzQzIwLjYxMjIgMy4wOTEyMiAyMC42NjM0IDMuMTIxNjMgMjAuNzExMSAzLjE1ODg1TDIwLjc4MDQgMy4yMjE1NkwyMC44NjQxIDMuMzIwMTRMMjAuOTE4MyAzLjQxMDI1TDIwLjk1NyAzLjUwMDU3TDIwLjk3NjIgMy41NjQ3NkwyMC45ODk4IDMuNjI4NjJMMjAuOTk5MiAzLjcyMjgyTDIwLjk5OTcgMTAuMjU1NEMyMC45OTk3IDEwLjY2OTYgMjAuNjYzOSAxMS4wMDU0IDIwLjI0OTcgMTEuMDA1NEMxOS44NyAxMS4wMDU0IDE5LjU1NjIgMTAuNzIzMiAxOS41MDY1IDEwLjM1NzFMMTkuNDk5NyAxMC4yNTU0TDE5LjQ5ODkgNS41NjE0N0wxMi4yNzk3IDEyLjc4NDdDMTIuMDEzNCAxMy4wNTEgMTEuNTk2OCAxMy4wNzUzIDExLjMwMzEgMTIuODU3NUwxMS4yMTkgMTIuNzg0OUMxMC45NTI3IDEyLjUxODcgMTAuOTI4NCAxMi4xMDIxIDExLjE0NjIgMTEuODA4NEwxMS4yMTg4IDExLjcyNDNMMTguNDM2OSA0LjUwMTQ2SDEzLjc0ODFDMTMuMzY4NCA0LjUwMTQ2IDEzLjA1NDYgNC4yMTkzMSAxMy4wMDUgMy44NTMyNEwxMi45OTgxIDMuNzUxNDZDMTIuOTk4MSAzLjM3MTc3IDEzLjI4MDMgMy4wNTc5NyAxMy42NDY0IDMuMDA4MzFMMTMuNzQ4MSAzLjAwMTQ2WiIgZmlsbD0iI0ZGRkZGRiIgLz48L3N2Zz4) !important;
            height: .75em;
            margin-left: .25em;
            filter:${webChatContainerProps?.renderingMiddlewareProps?.receivedMessageAnchorStyles?.filter ?? defaultReceivedMessageAnchorStyles?.filter};
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
            color: ${webChatContainerProps?.renderingMiddlewareProps?.receivedMessageAnchorStyles?.color ?? defaultReceivedMessageAnchorStyles?.color};
        }
        .ms_lcw_webchat_sent_message a:link,
        .ms_lcw_webchat_sent_message a:visited,
        .ms_lcw_webchat_sent_message a:hover,
        .ms_lcw_webchat_sent_message a:active {
            color: ${webChatContainerProps?.renderingMiddlewareProps?.sentMessageAnchorStyles?.color ?? defaultSentMessageAnchorStyles?.color};
        }

        .webchat__bubble:not(.webchat__bubble--from-user) .webchat__bubble__content {
            border-radius: 0 !important; /* Override border-radius */
        }

        .webchat__stacked-layout_container>div {
            background: ${(props?.webChatContainerProps?.containerStyles as IRawStyle)?.background?? ""}
        }
        .webchat__toaster__expandText {
            display: flex;
        }
        `}</style>
        <Stack styles={containerStyles} className="webchat__stacked-layout_container">
            <BasicWebChat></BasicWebChat>
        </Stack>
        </>
    );
};

export default WebChatContainerStateful;