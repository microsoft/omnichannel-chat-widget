/* eslint-disable @typescript-eslint/no-explicit-any */

import { IStackStyles, Stack } from "@fluentui/react";
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

        .ms_lcw_webchat_received_message img.webchat__render-markdown__external-link-icon, img.webchat__render-markdown__external-link-icon {
            background-image : url(data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIzIDMgMTggMTgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTcuMjUwMSA0LjUwMDE3SDEwLjc0OTVDMTEuMTYzNyA0LjUwMDE3IDExLjQ5OTUgNC44MzU5NiAxMS40OTk1IDUuMjUwMTdDMTEuNDk5NSA1LjYyOTg2IDExLjIxNzMgNS45NDM2NiAxMC44NTEzIDUuOTkzMzJMMTAuNzQ5NSA2LjAwMDE3SDcuMjQ5NzRDNi4wNzA3OSA1Ljk5OTYxIDUuMTAzNDkgNi45MDY1NiA1LjAwNzg2IDguMDYxMTJMNS4wMDAyOCA4LjIyMDAzTDUuMDAzMTIgMTYuNzUwN0M1LjAwMzQzIDE3Ljk0MTUgNS45Mjg4NSAxOC45MTYxIDcuMDk5NjYgMTguOTk0OUw3LjI1MzcxIDE5LjAwMDFMMTUuNzUxOCAxOC45ODg0QzE2Ljk0MTUgMTguOTg2OCAxNy45MTQ1IDE4LjA2MiAxNy45OTM1IDE2Ljg5MjNMMTcuOTk4NyAxNi43Mzg0VjEzLjIzMjFDMTcuOTk4NyAxMi44MTc5IDE4LjMzNDUgMTIuNDgyMSAxOC43NDg3IDEyLjQ4MjFDMTkuMTI4NCAxMi40ODIxIDE5LjQ0MjIgMTIuNzY0MyAxOS40OTE4IDEzLjEzMDNMMTkuNDk4NyAxMy4yMzIxVjE2LjczODRDMTkuNDk4NyAxOC43NDA3IDE3LjkyOTMgMjAuMzc2OSAxNS45NTI4IDIwLjQ4MjlMMTUuNzUzOCAyMC40ODg0TDcuMjU4MjcgMjAuNTAwMUw3LjA1NDk1IDIwLjQ5NDlDNS4xNDIzOSAyMC4zOTU0IDMuNjA4OTUgMTguODYyNyAzLjUwODM3IDE2Ljk1MDJMMy41MDMxMiAxNi43NTExTDMuNTAwODkgOC4yNTI3TDMuNTA1MjkgOC4wNTAyQzMuNjA1MzkgNi4xMzc0OSA1LjEzODY3IDQuNjA0NDkgNy4wNTA5NiA0LjUwNTI3TDcuMjUwMSA0LjUwMDE3SDEwLjc0OTVINy4yNTAxWk0xMy43NDgxIDMuMDAxNDZMMjAuMzAxOCAzLjAwMTk3TDIwLjQwMTQgMy4wMTU3NUwyMC41MDIyIDMuMDQzOTNMMjAuNTU5IDMuMDY4MDNDMjAuNjEyMiAzLjA5MTIyIDIwLjY2MzQgMy4xMjE2MyAyMC43MTExIDMuMTU4ODVMMjAuNzgwNCAzLjIyMTU2TDIwLjg2NDEgMy4zMjAxNEwyMC45MTgzIDMuNDEwMjVMMjAuOTU3IDMuNTAwNTdMMjAuOTc2MiAzLjU2NDc2TDIwLjk4OTggMy42Mjg2MkwyMC45OTkyIDMuNzIyODJMMjAuOTk5NyAxMC4yNTU0QzIwLjk5OTcgMTAuNjY5NiAyMC42NjM5IDExLjAwNTQgMjAuMjQ5NyAxMS4wMDU0QzE5Ljg3IDExLjAwNTQgMTkuNTU2MiAxMC43MjMyIDE5LjUwNjUgMTAuMzU3MUwxOS40OTk3IDEwLjI1NTRMMTkuNDk4OSA1LjU2MTQ3TDEyLjI3OTcgMTIuNzg0N0MxMi4wMTM0IDEzLjA1MSAxMS41OTY4IDEzLjA3NTMgMTEuMzAzMSAxMi44NTc1TDExLjIxOSAxMi43ODQ5QzEwLjk1MjcgMTIuNTE4NyAxMC45Mjg0IDEyLjEwMjEgMTEuMTQ2MiAxMS44MDg0TDExLjIxODggMTEuNzI0M0wxOC40MzY5IDQuNTAxNDZIMTMuNzQ4MUMxMy4zNjg0IDQuNTAxNDYgMTMuMDU0NiA0LjIxOTMxIDEzLjAwNSAzLjg1MzI0TDEyLjk5ODEgMy43NTE0NkMxMi45OTgxIDMuMzcxNzcgMTMuMjgwMyAzLjA1Nzk3IDEzLjY0NjQgMy4wMDgzMUwxMy43NDgxIDMuMDAxNDZaIiBmaWxsPSIjMjEyMTIxIiAvPjwvc3ZnPg==) !important;
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
        `}</style>
        <Stack styles={containerStyles}>
            <BasicWebChat></BasicWebChat>
        </Stack>
        </>
    );
};

export default WebChatContainerStateful;