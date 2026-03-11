import { Constants, HtmlAttributeNames, HtmlClassNames } from "../../common/Constants";
import { IRawStyle, IStackStyles, Stack } from "@fluentui/react";
import { LogLevel, TelemetryEvent } from "../../common/telemetry/TelemetryConstants";
import React, { Dispatch, useEffect, useRef, useState } from "react";
import { createTimer, getDeviceType, setFocusOnSendBox } from "../../common/utils";

import { BotMagicCodeStore } from "./webchatcontroller/BotMagicCodeStore";
import CitationPaneStateful from "../citationpanestateful/CitationPaneStateful";
import { Components } from "botframework-webchat";
import { ExtendedChatConfig } from "./interfaces/IExtendedChatConffig";
import { FacadeChatSDK } from "../../common/facades/FacadeChatSDK";
import { ILiveChatWidgetAction } from "../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../contexts/common/ILiveChatWidgetContext";
import { ILiveChatWidgetProps } from "../livechatwidget/interfaces/ILiveChatWidgetProps";
import { ITimer } from "../../common/interfaces/ITimer";
import { LiveChatWidgetActionType } from "../../contexts/common/LiveChatWidgetActionType";
import { NotificationHandler } from "./webchatcontroller/notification/NotificationHandler";
import { NotificationScenarios } from "./webchatcontroller/enums/NotificationScenarios";
import { TelemetryHelper } from "../../common/telemetry/TelemetryHelper";
import { WebChatActionType } from "./webchatcontroller/enums/WebChatActionType";
import WebChatEventSubscribers from "./webchatcontroller/WebChatEventSubscribers";
import { WebChatStoreLoader } from "./webchatcontroller/WebChatStoreLoader";
import { createIOSOptimizedEmojiFont } from "./common/utils/fontUtils";
import { defaultAdaptiveCardStyles } from "./common/defaultStyles/defaultAdaptiveCardStyles";
import { defaultMiddlewareLocalizedTexts } from "./common/defaultProps/defaultMiddlewareLocalizedTexts";
import { defaultReceivedMessageAnchorStyles } from "./webchatcontroller/middlewares/renderingmiddlewares/defaultStyles/defaultReceivedMessageAnchorStyles";
import { defaultSentMessageAnchorStyles } from "./webchatcontroller/middlewares/renderingmiddlewares/defaultStyles/defaultSentMessageAnchorStyles";
import { defaultSystemMessageBoxStyles } from "./webchatcontroller/middlewares/renderingmiddlewares/defaultStyles/defaultSystemMessageBoxStyles";
import { defaultUserMessageBoxStyles } from "./webchatcontroller/middlewares/renderingmiddlewares/defaultStyles/defaultUserMessageBoxStyles";
import { defaultWebChatContainerStatefulProps } from "./common/defaultProps/defaultWebChatContainerStatefulProps";
import { shouldLoadPersistentChatHistory } from "../livechatwidget/common/liveChatConfigUtils";
import { useChatContextStore } from "../..";
import useFacadeSDKStore from "../../hooks/useFacadeChatSDKStore";
import usePersistentChatHistory from "./hooks/usePersistentChatHistory";

let uiTimer: ITimer;

const broadcastChannelMessageEvent = "message";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    const [facadeChatSDK]: [FacadeChatSDK | undefined, (facadeChatSDK: FacadeChatSDK) => void] = useFacadeSDKStore();

    // Create a font family that includes emoji support, based on the primary font or default
    const webChatStyles = props.webChatContainerProps?.webChatStyles ?? defaultWebChatContainerStatefulProps.webChatStyles;
    const primaryFont = webChatStyles?.primaryFont ?? defaultWebChatContainerStatefulProps.webChatStyles?.primaryFont;

    // Use iOS-optimized emoji font that prioritizes system-ui for proper emoji rendering
    const fontFamilyWithEmojis = createIOSOptimizedEmojiFont(primaryFont);

    useEffect(() => {
        uiTimer = createTimer();
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
            Event: TelemetryEvent.UXWebchatContainerCompleted
        });
    }, []);

    // Citation pane state
    const [citationPaneOpen, setCitationPaneOpen] = useState(false);
    const [citationPaneText, setCitationPaneText] = useState("");

    // Guard to prevent handling multiple rapid clicks which could cause
    // the dim layer and pane to re-render out of sync and create a flicker.
    const citationOpeningRef = useRef(false);


    const { BasicWebChat } = Components;
    const [ state, dispatch ]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    const { webChatContainerProps, contextDataStore } = props;

    // Type the chatConfig properly to avoid 'any' usage
    const extendedChatConfig = props.chatConfig as ExtendedChatConfig | undefined;

    // Determine if persistent chat history should be loaded based on all conditions
    const shouldLoadPersistentHistoryMessages = shouldLoadPersistentChatHistory(extendedChatConfig);

    if (shouldLoadPersistentHistoryMessages) {

        TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
            Event: TelemetryEvent.PersistentChatHistoryEnabled
        });
        usePersistentChatHistory(facadeChatSDK, props?.persistentChatHistoryProps ?? {});
    }
    // Delegated click handler for citation anchors. Placed after state is
    // available so we can prefer reading citations from app state and fall
    // back to the legacy window map for backward-compatibility in tests.
    useEffect(() => {
        const clickHandler = (ev: MouseEvent) => {
            try {
                if (citationOpeningRef.current) {
                    return;
                }

                const target = ev.target as HTMLElement;
                // Only consider anchors whose href starts with the citation scheme
                const anchor = target.closest && (target.closest("a[href^=\"cite:\"]") as HTMLAnchorElement);

                if (anchor) {
                    ev.preventDefault();
                    citationOpeningRef.current = true;
                    // Rely only on the href to identify the citation key
                    let text = "";
                    try {
                        const cid = anchor.getAttribute("href");
                        // Prefer state-based citations injected by middleware
                        if (state?.domainStates?.citations && cid) {
                            text = state.domainStates.citations[cid] ?? "";
                        }
                        // If state lookup failed, fall back to the anchor's title or innerText
                        if (!text) {
                            text = anchor.getAttribute("title") || anchor.innerText || "";
                        }
                    } catch (e) {
                        // ignore
                    }

                    setCitationPaneOpen(true);
                    setCitationPaneText(text);

                    // Simple debounce - reset guard after a short delay
                    setTimeout(() => {
                        citationOpeningRef.current = false;
                    }, 100);
                }
            } catch (e) {
                citationOpeningRef.current = false;
            }
        };

        document.addEventListener("click", clickHandler);
        return () => document.removeEventListener("click", clickHandler);
    }, [state]);

    const minimizedStyles = state.appStates.isMinimized
        ? (shouldLoadPersistentHistoryMessages
            ? { visibility: "hidden", position: "absolute", width: 0, height: 0, overflow: "hidden", pointerEvents: "none" }
            : { display: "none" })
        : {};

    const containerStyles: IStackStyles = {
        root: Object.assign(
            {}, defaultWebChatContainerStatefulProps.containerStyles, webChatContainerProps?.containerStyles,
            minimizedStyles) // Use visibility-based hiding instead of display:none to preserve scroll position across minimize/maximize
    };

    const localizedTexts = {
        ...defaultMiddlewareLocalizedTexts,
        ...webChatContainerProps?.localizedTexts
    };

    useEffect(() => {
        if (getDeviceType() !== "standard" && webChatContainerProps?.webChatHistoryMobileAccessibilityLabel !== undefined) {
            const chatHistoryElement = document.querySelector(`.${HtmlClassNames.webChatHistoryContainer}`);

            if (chatHistoryElement) {
                chatHistoryElement.setAttribute(HtmlAttributeNames.ariaLabel, webChatContainerProps.webChatHistoryMobileAccessibilityLabel);
            }
        }
        dispatch({
            type: LiveChatWidgetActionType.SET_RENDERING_MIDDLEWARE_PROPS,
            payload: webChatContainerProps?.renderingMiddlewareProps
        });
        dispatch({type: LiveChatWidgetActionType.SET_MIDDLEWARE_LOCALIZED_TEXTS, payload: localizedTexts});
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
            Event: TelemetryEvent.WebChatLoaded
        });

        if (props.webChatContainerProps?.renderingMiddlewareProps?.disableThirdPartyCookiesAlert !== true && !contextDataStore) {
            try {
                localStorage;
                sessionStorage;
            } catch (error) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if (!(window as any).TPCWarningShown) {
                    NotificationHandler.notifyWarning(NotificationScenarios.TPC, localizedTexts?.THIRD_PARTY_COOKIES_BLOCKED_ALERT_MESSAGE ?? "");
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    useEffect(() => {
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
            Event: TelemetryEvent.UXWebchatContainerCompleted,
            ElapsedTimeInMilliseconds: uiTimer.milliSecondsElapsed
        });
    }, []);

    // Set focus to the sendbox
    useEffect(() => {
        if (!state.appStates.isMinimized) {
            setFocusOnSendBox();
        }
    }, [state.appStates.isMinimized]);

    return (
        <>
            <style>{`
        .webchat__stacked-layout__content .ac-pushButton {
            cursor: pointer;
            border: 1px solid ${webChatContainerProps?.adaptiveCardStyles?.color ?? defaultAdaptiveCardStyles.color}  !important;
            color: ${webChatContainerProps?.adaptiveCardStyles?.color ?? defaultAdaptiveCardStyles.color}  !important;
            background-color: ${webChatContainerProps?.adaptiveCardStyles?.background ?? defaultAdaptiveCardStyles.background};
        }

        .webchat__bubble__content>div#ms_lcw_webchat_adaptive_card {
            background: ${webChatContainerProps?.adaptiveCardStyles?.background ?? defaultAdaptiveCardStyles.background};
        }

        .webchat__bubble__content>div#ms_lcw_webchat_adaptive_card .ac-textBlock[role=heading] {
            color: ${webChatContainerProps?.adaptiveCardStyles?.color ?? defaultAdaptiveCardStyles.color}  !important;
        }

        .webchat__bubble__content>div#ms_lcw_webchat_adaptive_card label .ac-textRun:first-child {
            color: ${webChatContainerProps?.adaptiveCardStyles?.color ?? defaultAdaptiveCardStyles.color}  !important;
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

        .webchat__stacked-layout__content .ac-actionSet {
          flex-wrap: ${webChatContainerProps?.adaptiveCardStyles?.buttonFlexWrap ?? defaultAdaptiveCardStyles.buttonFlexWrap} !important;
          gap: ${webChatContainerProps?.adaptiveCardStyles?.buttonGap ?? defaultAdaptiveCardStyles.buttonGap} !important;
         }

        .webchat__stacked-layout__content .ac-actionSet > .ac-pushButton > div {
          white-space: ${webChatContainerProps?.adaptiveCardStyles?.buttonWhiteSpace ?? defaultAdaptiveCardStyles.buttonWhiteSpace} !important;
        }

        .ms_lcw_webchat_received_message img.webchat__render-markdown__external-link-icon {
            /* Fallback for browsers that don't support mask */
            background-image: url(data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIzIDMgMTggMTgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTcuMjUwMSA0LjUwMDE3SDEwLjc0OTVDMTEuMTYzNyA0LjUwMDE3IDExLjQ5OTUgNC44MzU5NiAxMS40OTk1IDUuMjUwMTdDMTEuNDk5NSA1LjYyOTg2IDExLjIxNzMgNS45NDM2NiAxMC44NTEzIDUuOTkzMzJMMTAuNzQ5NSA2LjAwMDE3SDcuMjQ5NzRDNi4wNzA3OSA1Ljk5OTYxIDUuMTAzNDkgNi45MDY1NiA1LjAwNzg2IDguMDYxMTJMNS4wMDAyOCA4LjIyMDAzTDUuMDAzMTIgMTYuNzUwN0M1LjAwMzQzIDE3Ljk0MTUgNS45Mjg4NSAxOC45MTYxIDcuMDk5NjYgMTguOTk0OUw3LjI1MzcxIDE5LjAwMDFMMTUuNzUxOCAxOC45ODg0QzE2Ljk0MTUgMTguOTg2OCAxNy45MTQ1IDE4LjA2MiAxNy45OTM1IDE2Ljg5MjNMMTcuOTk4NyAxNi43Mzg0VjEzLjIzMjFDMTcuOTk4NyAxMi44MTc5IDE4LjMzNDUgMTIuNDgyMSAxOC43NDg3IDEyLjQ4MjFDMTkuMTI4NCAxMi40ODIxIDE5LjQ0MjIgMTIuNzY0MyAxOS40OTE4IDEzLjEzMDNMMTkuNDk4NyAxMy4yMzIxVjE2LjczODRDMTkuNDk4NyAxOC43NDA3IDE3LjkyOTMgMjAuMzc2OSAxNS45NTI4IDIwLjQ4MjlMMTUuNzUzOCAyMC40ODg0TDcuMjU4MjcgMjAuNTAwMUw3LjA1NDk1IDIwLjQ5NDlDNS4xNDIzOSAyMC4zOTU0IDMuNjA4OTUgMTguODYyNyAzLjUwODM3IDE2Ljk1MDJMMy41MDMxMiAxNi43NTExTDMuNTAwODkgOC4yNTI3TDMuNTA1MjkgOC4wNTAyQzMuNjA1MzkgNi4xMzc0OSA1LjEzODY3IDQuNjA0NDkgNy4wNTA5NiA0LjUwNTI3TDcuMjUwMSA0LjUwMDE3SDEwLjc0OTVINy4yNTAxWk0xMy43NDgxIDMuMDAxNDZMMjAuMzAxOCAzLjAwMTk3TDIwLjQwMTQgMy4wMTU3NUwyMC41MDIyIDMuMDQzOTNMMjAuNTU5IDMuMDY4MDNDMjAuNjEyMiAzLjA5MTIyIDIwLjY2MzQgMy4xMjE2MyAyMC43MTExIDMuMTU4ODVMMjAuNzgwNCAzLjIyMTU2TDIwLjg2NDEgMy4zMjAxNEwyMC45MTgzIDMuNDEwMjVMMjAuOTU3IDMuNTAwNTdMMjAuOTc2MiAzLjU2NDc2TDIwLjk4OTggMy42Mjg2MkwyMC45OTkyIDMuNzIyODJMMjAuOTk5NyAxMC4yNTU0QzIwLjk5OTcgMTAuNjY5NiAyMC42NjM5IDExLjAwNTQgMjAuMjQ5NyAxMS4wMDU0QzE5Ljg3IDExLjAwNTQgMTkuNTU2MiAxMC43MjMyIDE5LjUwNjUgMTAuMzU3MUwxOS40OTk3IDEwLjI1NTRMMTkuNDk4OSA1LjU2MTQ3TDEyLjI3OTcgMTIuNzg0N0MxMi4wMTM0IDEzLjA1MSAxMS41OTY4IDEzLjA3NTMgMTEuMzAzMSAxMi44NTc1TDExLjIxOSAxMi43ODQ5QzEwLjk1MjcgMTIuNTE4NyAxMC45Mjg0IDEyLjEwMjEgMTEuMTQ2MiAxMS44MDg0TDExLjIxODggMTEuNzI0M0wxOC40MzY5IDQuNTAxNDZIMTMuNzQ4MUMxMy4zNjg0IDQuNTAxNDYgMTMuMDU0NiA0LjIxOTMxIDEzLjAwNSAzLjg1MzI0TDEyLjk5ODEgMy43NTE0NkMxMi45OTgxIDMuMzcxNzcgMTMuMjgwMyAzLjA1Nzk3IDEzLjY0NjQgMy4wMDgzMUwxMy43NDgxIDMuMDAxNDZaIiBmaWxsPSIjRkZGRkZGIiAvPjwvc3ZnPg==);
            filter: ${webChatContainerProps?.renderingMiddlewareProps?.receivedMessageAnchorStyles?.filter ?? defaultReceivedMessageAnchorStyles?.filter};
            height: .75em;
            width: .75em;
            margin-left: .25em;
            display: inline-block;
        }

        .ms_lcw_webchat_sent_message img.webchat__render-markdown__external-link-icon {
            /* Fallback for browsers that don't support mask */
            background-image: url(data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIzIDMgMTggMTgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTcuMjUwMSA0LjUwMDE3SDEwLjc0OTVDMTEuMTYzNyA0LjUwMDE3IDExLjQ5OTUgNC44MzU5NiAxMS40OTk1IDUuMjUwMTdDMTEuNDk5NSA1LjYyOTg2IDExLjIxNzMgNS45NDM2NiAxMC44NTEzIDUuOTkzMzJMMTAuNzQ5NSA2LjAwMDE3SDcuMjQ5NzRDNi4wNzA3OSA1Ljk5OTYxIDUuMTAzNDkgNi45MDY1NiA1LjAwNzg2IDguMDYxMTJMNS4wMDAyOCA4LjIyMDAzTDUuMDAzMTIgMTYuNzUwN0M1LjAwMzQzIDE3Ljk0MTUgNS45Mjg4NSAxOC45MTYxIDcuMDk5NjYgMTguOTk0OUw3LjI1MzcxIDE5LjAwMDFMMTUuNzUxOCAxOC45ODg0QzE2Ljk0MTUgMTguOTg2OCAxNy45MTQ1IDE4LjA2MiAxNy45OTM1IDE2Ljg5MjNMMTcuOTk4NyAxNi43Mzg0VjEzLjIzMjFDMTcuOTk4NyAxMi44MTc5IDE4LjMzNDUgMTIuNDgyMSAxOC43NDg3IDEyLjQ4MjFDMTkuMTI4NCAxMi40ODIxIDE5LjQ0MjIgMTIuNzY0MyAxOS40OTE4IDEzLjEzMDNMMTkuNDk4NyAxMy4yMzIxVjE2LjczODRDMTkuNDk4NyAxOC43NDA3IDE3LjkyOTMgMjAuMzc2OSAxNS45NTI4IDIwLjQ4MjlMMTUuNzUzOCAyMC40ODg0TDcuMjU4MjcgMjAuNTAwMUw3LjA1NDk1IDIwLjQ5NDlDNS4xNDIzOSAyMC4zOTU0IDMuNjA4OTUgMTguODYyNyAzLjUwODM3IDE2Ljk1MDJMMy41MDMxMiAxNi43NTExTDMuNTAwODkgOC4yNTI3TDMuNTA1MjkgOC4wNTAyQzMuNjA1MzkgNi4xMzc0OSA1LjEzODY3IDQuNjA0NDkgNy4wNTA5NiA0LjUwNTI3TDcuMjUwMSA0LjUwMDE3SDEwLjc0OTVINy4yNTAxWk0xMy43NDgxIDMuMDAxNDZMMjAuMzAxOCAzLjAwMTk3TDIwLjQwMTQgMy4wMTU3NUwyMC41MDIyIDMuMDQzOTNMMjAuNTU5IDMuMDY4MDNDMjAuNjEyMiAzLjA5MTIyIDIwLjY2MzQgMy4xMjE2MyAyMC43MTExIDMuMTU4ODVMMjAuNzgwNCAzLjIyMTU2TDIwLjg2NDEgMy4zMjAxNEwyMC45MTgzIDMuNDEwMjVMMjAuOTU3IDMuNTAwNTdMMjAuOTc2MiAzLjU2NDc2TDIwLjk4OTggMy42Mjg2MkwyMC45OTkyIDMuNzIyODJMMjAuOTk5NyAxMC4yNTU0QzIwLjk5OTcgMTAuNjY5NiAyMC42NjM5IDExLjAwNTQgMjAuMjQ5NyAxMS4wMDU0QzE5Ljg3IDExLjAwNTQgMTkuNTU2MiAxMC43MjMyIDE5LjUwNjUgMTAuMzU3MUwxOS40OTk3IDEwLjI1NTRMMTkuNDk4OSA1LjU2MTQ3TDEyLjI3OTcgMTIuNzg0N0MxMi4wMTM0IDEzLjA1MSAxMS41OTY4IDEzLjA3NTMgMTEuMzAzMSAxMi44NTc1TDExLjIxOSAxMi43ODQ5QzEwLjk1MjcgMTIuNTE4NyAxMC45Mjg0IDEyLjEwMjEgMTEuMTQ2MiAxMS44MDg0TDExLjIxODggMTEuNzI0M0wxOC40MzY5IDQuNTAxNDZIMTMuNzQ4MUMxMy4zNjg0IDQuNTAxNDYgMTMuMDU0NiA0LjIxOTMxIDEzLjAwNSAzLjg1MzI0TDEyLjk5ODEgMy43NTE0NkMxMi45OTgxIDMuMzcxNzcgMTMuMjgwMyAzLjA1Nzk3IDEzLjY0NjQgMy4wMDgzMUwxMy43NDgxIDMuMDAxNDZaIiBmaWxsPSIjRkZGRkZGIiAvPjwvc3ZnPg==);
            filter: ${webChatContainerProps?.renderingMiddlewareProps?.sentMessageAnchorStyles?.filter ?? defaultSentMessageAnchorStyles?.filter};
            height: .75em;
            width: .75em;
            margin-left: .25em;
            display: inline-block;
        }

        /* Modern browsers with mask support */
        @supports (mask: url()) or (-webkit-mask: url()) {
            .ms_lcw_webchat_received_message img.webchat__render-markdown__external-link-icon {
                background-color: ${webChatContainerProps?.renderingMiddlewareProps?.receivedMessageAnchorStyles?.color ?? defaultReceivedMessageAnchorStyles?.color} !important;
                background-image: none !important;
                filter: none !important;
                mask: url("data:image/svg+xml,%3Csvg viewBox='3 3 18 18' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M7.2501 4.50017H10.7495C11.1637 4.50017 11.4995 4.83596 11.4995 5.25017C11.4995 5.62986 11.2173 5.94366 10.8513 5.99332L10.7495 6.00017H7.24974C6.07079 5.99961 5.10349 6.90656 5.00786 8.06112L5.00028 8.22003L5.00312 16.7507C5.00343 17.9415 5.92885 18.9161 7.09966 18.9949L7.25371 19.0001L15.7518 18.9884C16.9415 18.9868 17.9145 18.062 17.9935 16.8923L17.9987 16.7384V13.2321C17.9987 12.8179 18.3345 12.4821 18.7487 12.4821C19.1284 12.4821 19.4422 12.7643 19.4918 13.1303L19.4987 13.2321V16.7384C19.4987 18.7407 17.9293 20.3769 15.9528 20.4829L15.7538 20.4884L7.25827 20.5001L7.05495 20.4949C5.14239 20.3954 3.60895 18.8627 3.50837 16.9502L3.50312 16.7511L3.50089 8.2527L3.50529 8.0502C3.60539 6.13749 5.13867 4.60449 7.05096 4.50527L7.2501 4.50017H10.7495H7.2501ZM13.7481 3.00146L20.3018 3.00197L20.4014 3.01575L20.5022 3.04393L20.559 3.06803C20.6122 3.09122 20.6634 3.12163 20.7111 3.15885L20.7804 3.22156L20.8641 3.32014L20.9183 3.41025L20.957 3.50057L20.9762 3.56476L20.9898 3.62862L20.9992 3.72282L20.9997 10.2554C20.9997 10.6696 20.6639 11.0054 20.2497 11.0054C19.87 11.0054 19.5562 10.7232 19.5065 10.3571L19.4997 10.2554L19.4989 5.56147L12.2797 12.7847C12.0134 13.051 11.5968 13.0753 11.3031 12.8575L11.219 12.7849C10.9527 12.5187 10.9284 12.1021 11.1462 11.8084L11.2188 11.7243L18.4369 4.50146H13.7481C13.3684 4.50146 13.0546 4.21931 13.005 3.85324L12.9981 3.75146C12.9981 3.37177 13.2803 3.05797 13.6464 3.00831L13.7481 3.00146Z' fill='currentColor' /%3E%3C/svg%3E") no-repeat center;
                -webkit-mask: url("data:image/svg+xml,%3Csvg viewBox='3 3 18 18' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M7.2501 4.50017H10.7495C11.1637 4.50017 11.4995 4.83596 11.4995 5.25017C11.4995 5.62986 11.2173 5.94366 10.8513 5.99332L10.7495 6.00017H7.24974C6.07079 5.99961 5.10349 6.90656 5.00786 8.06112L5.00028 8.22003L5.00312 16.7507C5.00343 17.9415 5.92885 18.9161 7.09966 18.9949L7.25371 19.0001L15.7518 18.9884C16.9415 18.9868 17.9145 18.062 17.9935 16.8923L17.9987 16.7384V13.2321C17.9987 12.8179 18.3345 12.4821 18.7487 12.4821C19.1284 12.4821 19.4422 12.7643 19.4918 13.1303L19.4987 13.2321V16.7384C19.4987 18.7407 17.9293 20.3769 15.9528 20.4829L15.7538 20.4884L7.25827 20.5001L7.05495 20.4949C5.14239 20.3954 3.60895 18.8627 3.50837 16.9502L3.50312 16.7511L3.50089 8.2527L3.50529 8.0502C3.60539 6.13749 5.13867 4.60449 7.05096 4.50527L7.2501 4.50017H10.7495H7.2501ZM13.7481 3.00146L20.3018 3.00197L20.4014 3.01575L20.5022 3.04393L20.559 3.06803C20.6122 3.09122 20.6634 3.12163 20.7111 3.15885L20.7804 3.22156L20.8641 3.32014L20.9183 3.41025L20.957 3.50057L20.9762 3.56476L20.9898 3.62862L20.9992 3.72282L20.9997 10.2554C20.9997 10.6696 20.6639 11.0054 20.2497 11.0054C19.87 11.0054 19.5562 10.7232 19.5065 10.3571L19.4997 10.2554L19.4989 5.56147L12.2797 12.7847C12.0134 13.051 11.5968 13.0753 11.3031 12.8575L11.219 12.7849C10.9527 12.5187 10.9284 12.1021 11.1462 11.8084L11.2188 11.7243L18.4369 4.50146H13.7481C13.3684 4.50146 13.0546 4.21931 13.005 3.85324L12.9981 3.75146C12.9981 3.37177 13.2803 3.05797 13.6464 3.00831L13.7481 3.00146Z' fill='currentColor' /%3E%3C/svg%3E") no-repeat center;
                mask-size: contain;
                -webkit-mask-size: contain;
            }

            .ms_lcw_webchat_sent_message img.webchat__render-markdown__external-link-icon {
                background-color: ${webChatContainerProps?.renderingMiddlewareProps?.sentMessageAnchorStyles?.color ?? defaultSentMessageAnchorStyles?.color} !important;
                background-image: none !important;
                filter: none !important;
                mask: url("data:image/svg+xml,%3Csvg viewBox='3 3 18 18' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M7.2501 4.50017H10.7495C11.1637 4.50017 11.4995 4.83596 11.4995 5.25017C11.4995 5.62986 11.2173 5.94366 10.8513 5.99332L10.7495 6.00017H7.24974C6.07079 5.99961 5.10349 6.90656 5.00786 8.06112L5.00028 8.22003L5.00312 16.7507C5.00343 17.9415 5.92885 18.9161 7.09966 18.9949L7.25371 19.0001L15.7518 18.9884C16.9415 18.9868 17.9145 18.062 17.9935 16.8923L17.9987 16.7384V13.2321C17.9987 12.8179 18.3345 12.4821 18.7487 12.4821C19.1284 12.4821 19.4422 12.7643 19.4918 13.1303L19.4987 13.2321V16.7384C19.4987 18.7407 17.9293 20.3769 15.9528 20.4829L15.7538 20.4884L7.25827 20.5001L7.05495 20.4949C5.14239 20.3954 3.60895 18.8627 3.50837 16.9502L3.50312 16.7511L3.50089 8.2527L3.50529 8.0502C3.60539 6.13749 5.13867 4.60449 7.05096 4.50527L7.2501 4.50017H10.7495H7.2501ZM13.7481 3.00146L20.3018 3.00197L20.4014 3.01575L20.5022 3.04393L20.559 3.06803C20.6122 3.09122 20.6634 3.12163 20.7111 3.15885L20.7804 3.22156L20.8641 3.32014L20.9183 3.41025L20.957 3.50057L20.9762 3.56476L20.9898 3.62862L20.9992 3.72282L20.9997 10.2554C20.9997 10.6696 20.6639 11.0054 20.2497 11.0054C19.87 11.0054 19.5562 10.7232 19.5065 10.3571L19.4997 10.2554L19.4989 5.56147L12.2797 12.7847C12.0134 13.051 11.5968 13.0753 11.3031 12.8575L11.219 12.7849C10.9527 12.5187 10.9284 12.1021 11.1462 11.8084L11.2188 11.7243L18.4369 4.50146H13.7481C13.3684 4.50146 13.0546 4.21931 13.005 3.85324L12.9981 3.75146C12.9981 3.37177 13.2803 3.05797 13.6464 3.00831L13.7481 3.00146Z' fill='currentColor' /%3E%3C/svg%3E") no-repeat center;
                -webkit-mask: url("data:image/svg+xml,%3Csvg viewBox='3 3 18 18' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M7.2501 4.50017H10.7495C11.1637 4.50017 11.4995 4.83596 11.4995 5.25017C11.4995 5.62986 11.2173 5.94366 10.8513 5.99332L10.7495 6.00017H7.24974C6.07079 5.99961 5.10349 6.90656 5.00786 8.06112L5.00028 8.22003L5.00312 16.7507C5.00343 17.9415 5.92885 18.9161 7.09966 18.9949L7.25371 19.0001L15.7518 18.9884C16.9415 18.9868 17.9145 18.062 17.9935 16.8923L17.9987 16.7384V13.2321C17.9987 12.8179 18.3345 12.4821 18.7487 12.4821C19.1284 12.4821 19.4422 12.7643 19.4918 13.1303L19.4987 13.2321V16.7384C19.4987 18.7407 17.9293 20.3769 15.9528 20.4829L15.7538 20.4884L7.25827 20.5001L7.05495 20.4949C5.14239 20.3954 3.60895 18.8627 3.50837 16.9502L3.50312 16.7511L3.50089 8.2527L3.50529 8.0502C3.60539 6.13749 5.13867 4.60449 7.05096 4.50527L7.2501 4.50017H10.7495H7.2501ZM13.7481 3.00146L20.3018 3.00197L20.4014 3.01575L20.5022 3.04393L20.559 3.06803C20.6122 3.09122 20.6634 3.12163 20.7111 3.15885L20.7804 3.22156L20.8641 3.32014L20.9183 3.41025L20.957 3.50057L20.9762 3.56476L20.9898 3.62862L20.9992 3.72282L20.9997 10.2554C20.9997 10.6696 20.6639 11.0054 20.2497 11.0054C19.87 11.0054 19.5562 10.7232 19.5065 10.3571L19.4997 10.2554L19.4989 5.56147L12.2797 12.7847C12.0134 13.051 11.5968 13.0753 11.3031 12.8575L11.219 12.7849C10.9527 12.5187 10.9284 12.1021 11.1462 11.8084L11.2188 11.7243L18.4369 4.50146H13.7481C13.3684 4.50146 13.0546 4.21931 13.005 3.85324L12.9981 3.75146C12.9981 3.37177 13.2803 3.05797 13.6464 3.00831L13.7481 3.00146Z' fill='currentColor' /%3E%3C/svg%3E") no-repeat center;
                mask-size: contain;
                -webkit-mask-size: contain;
            }
        }
        pre {
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

        // we had a nasty bug long time ago with crashing borders messing with the sendbox, so if customer adds this value, they need to deal with that
        .webchat__bubble:not(.webchat__bubble--from-user) .webchat__bubble__content {
            border-radius: ${webChatContainerProps?.webChatStyles?.bubbleBorderRadius ?? 0} !important; /* Override border-radius */
        }

        .webchat__stacked-layout_container>div {
            background: ${(props?.webChatContainerProps?.containerStyles as IRawStyle)?.background ?? ""}
        }
        .webchat__toast_text {
            display: flex;
            
        }
        .webchat__toaster {
            overflow-y: unset;
            }

        /* Custom styles for carousel hero cards */
		ul.webchat__carousel-filmstrip__attachments .ac-image {
			width: 200px !important;
			height: 150px !important;
			object-fit: cover !important;
			border-radius: 8px !important;
			border: 1px solid #e0e0e0 !important;
		}

		.webchat__carousel-filmstrip-attachment .webchat__bubble {
			height: 100% !important;
		}

		.webchat__carousel-filmstrip-attachment .webchat__bubble #ms_lcw_webchat_adaptive_card {
			height: 100% !important;
		}

        .webchat__auto-resize-textarea__textarea.webchat__send-box-text-box__html-text-area {
            font-family: ${fontFamilyWithEmojis} !important;
        }

        /* Suggested actions carousel previous/next navigation focus */
        .webchat__suggested-actions .webchat__suggested-actions__carousel .react-film__flipper:focus-visible .react-film__flipper__body {
            outline: ${webChatContainerProps?.webChatStyles?.suggestedActionKeyboardFocusIndicatorBorderStyle ?? "dashed"} ${webChatContainerProps?.webChatStyles?.suggestedActionKeyboardFocusIndicatorBorderWidth ?? "1px"} ${webChatContainerProps?.webChatStyles?.suggestedActionKeyboardFocusIndicatorBorderColor ?? "#605E5C"} !important;
            outline-offset: ${webChatContainerProps?.webChatStyles?.suggestedActionKeyboardFocusIndicatorInset ?? "2px"} !important;

        `}</style>
            <Stack styles={containerStyles} className="webchat__stacked-layout_container">
                <div id="ms_lcw_webchat_root" style={{height: "100%", width: "100%"}}>
                    {shouldLoadPersistentHistoryMessages && <WebChatEventSubscribers/>}
                    <BasicWebChat></BasicWebChat>
                </div>
            </Stack>
            {citationPaneOpen && (
                <CitationPaneStateful
                    id={props.citationPaneProps?.id || HtmlAttributeNames.ocwCitationPaneClassName}
                    title={props.citationPaneProps?.title || HtmlAttributeNames.ocwCitationPaneTitle}
                    contentHtml={citationPaneText}
                    onClose={() => setCitationPaneOpen(false)}
                    componentOverrides={props.citationPaneProps?.componentOverrides}
                    controlProps={props.citationPaneProps?.controlProps}
                    styleProps={props.citationPaneProps?.styleProps}/>
            )}
        </>
    );
};

export default WebChatContainerStateful;