import { ConversationEndEntity, ParticipantType } from "../../../common/Constants";
import { LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";
import { changeLanguageCodeFormatForWebChat, getConversationDetailsCall } from "../../../common/utils";
import { getOverriddenLocalizedStrings, localizedStringsBotInitialsMiddleware } from "../../webchatcontainerstateful/webchatcontroller/middlewares/storemiddlewares/localizedStringsBotInitialsMiddleware";

import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { Constants } from "../../../common/Constants";
import { ConversationState } from "../../../contexts/common/ConversationState";
import DOMPurify from "dompurify";
import createDOMPurify from "dompurify";
import { Dispatch } from "react";
import { FacadeChatSDK } from "../../../common/facades/FacadeChatSDK";
import HyperlinkTextOverrideRenderer from "../../webchatcontainerstateful/webchatcontroller/markdownrenderers/HyperlinkTextOverrideRenderer";
import { IDataMaskingInfo } from "../../webchatcontainerstateful/interfaces/IDataMaskingInfo";
import { ILiveChatWidgetAction } from "../../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../../contexts/common/ILiveChatWidgetContext";
import { ILiveChatWidgetProps } from "../interfaces/ILiveChatWidgetProps";
import { IWebChatProps } from "../../webchatcontainerstateful/interfaces/IWebChatProps";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { WebChatStoreLoader } from "../../webchatcontainerstateful/webchatcontroller/WebChatStoreLoader";
import attachmentProcessingMiddleware from "../../webchatcontainerstateful/webchatcontroller/middlewares/storemiddlewares/attachmentProcessingMiddleware";
import attachmentSentAnnouncementMiddleware from "../../webchatcontainerstateful/webchatcontroller/middlewares/storemiddlewares/attachmentSentAnnouncementMiddleware";
import channelDataMiddleware from "../../webchatcontainerstateful/webchatcontroller/middlewares/storemiddlewares/channelDataMiddleware";
import { createActivityMiddleware } from "../../webchatcontainerstateful/webchatcontroller/middlewares/renderingmiddlewares/activityMiddleware";
import { createActivityStatusMiddleware } from "../../webchatcontainerstateful/webchatcontroller/middlewares/renderingmiddlewares/activityStatusMiddleware";
import { createAttachmentMiddleware } from "../../webchatcontainerstateful/webchatcontroller/middlewares/renderingmiddlewares/attachmentMiddleware";
import createAttachmentUploadValidatorMiddleware from "../../webchatcontainerstateful/webchatcontroller/middlewares/storemiddlewares/attachmentUploadValidatorMiddleware";
import { createAvatarMiddleware } from "../../webchatcontainerstateful/webchatcontroller/middlewares/renderingmiddlewares/avatarMiddleware";
import createCallActionMiddleware from "../../webchatcontainerstateful/webchatcontroller/middlewares/storemiddlewares/callActionMiddleware";
import { createCardActionMiddleware } from "../../webchatcontainerstateful/webchatcontroller/middlewares/renderingmiddlewares/cardActionMiddleware";
import { createCitationsMiddleware } from "../../webchatcontainerstateful/webchatcontroller/middlewares/storemiddlewares/citationsMiddleware";
import createConversationEndMiddleware from "../../webchatcontainerstateful/webchatcontroller/middlewares/storemiddlewares/conversationEndMiddleware";
import createCustomEventMiddleware from "../../webchatcontainerstateful/webchatcontroller/middlewares/storemiddlewares/customEventMiddleware";
import createDataMaskingMiddleware from "../../webchatcontainerstateful/webchatcontroller/middlewares/storemiddlewares/dataMaskingMiddleware";
import { createMarkdown } from "./createMarkdown";
import createMaxMessageSizeValidator from "../../webchatcontainerstateful/webchatcontroller/middlewares/storemiddlewares/maxMessageSizeValidator";
import { createMessageSequenceIdOverrideMiddleware } from "../../webchatcontainerstateful/webchatcontroller/middlewares/renderingmiddlewares/messageSequenceIdOverrideMiddleware";
import { createMessageTimeStampMiddleware } from "../../webchatcontainerstateful/webchatcontroller/middlewares/renderingmiddlewares/messageTimestampMiddleware";
import { createQueueOverflowMiddleware } from "../../webchatcontainerstateful/webchatcontroller/middlewares/storemiddlewares/queueOverflowHandlerMiddleware";
import { createStore } from "botframework-webchat";
import { createToastMiddleware } from "../../webchatcontainerstateful/webchatcontroller/middlewares/renderingmiddlewares/toastMiddleware";
import { createWebChatTelemetry } from "../../webchatcontainerstateful/webchatcontroller/webchattelemetry/WebChatLogger";
import { defaultAttachmentProps } from "../../webchatcontainerstateful/common/defaultProps/defaultAttachmentProps";
import { defaultMiddlewareLocalizedTexts } from "../../webchatcontainerstateful/common/defaultProps/defaultMiddlewareLocalizedTexts";
import { defaultWebChatContainerStatefulProps } from "../../webchatcontainerstateful/common/defaultProps/defaultWebChatContainerStatefulProps";
import { executeReducer } from "../../../contexts/createReducer";
import { getLocaleStringFromId } from "@microsoft/omnichannel-chat-sdk";
import gifUploadMiddleware from "../../webchatcontainerstateful/webchatcontroller/middlewares/storemiddlewares/gifUploadMiddleware";
import htmlPlayerMiddleware from "../../webchatcontainerstateful/webchatcontroller/middlewares/storemiddlewares/htmlPlayerMiddleware";
import htmlTextMiddleware from "../../webchatcontainerstateful/webchatcontroller/middlewares/storemiddlewares/htmlTextMiddleware";
import preProcessingMiddleware from "../../webchatcontainerstateful/webchatcontroller/middlewares/storemiddlewares/preProcessingMiddleware";
import sanitizationMiddleware from "../../webchatcontainerstateful/webchatcontroller/middlewares/storemiddlewares/sanitizationMiddleware";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const initWebChatComposer = (props: ILiveChatWidgetProps, state: ILiveChatWidgetContext, dispatch: Dispatch<ILiveChatWidgetAction>, facadeChatSDK: FacadeChatSDK, endChat: any) => {
    // Add a hook to make all links open a new window
    postDomPurifyActivities();
    const localizedTexts = {
        ...defaultMiddlewareLocalizedTexts,
        ...props.webChatContainerProps?.localizedTexts
    };

    const hyperlinkTextOverride = props.webChatContainerProps?.hyperlinkTextOverride ?? defaultWebChatContainerStatefulProps.hyperlinkTextOverride;
    
    const disableNewLineMarkdownSupport = props.webChatContainerProps?.disableNewLineMarkdownSupport ?? defaultWebChatContainerStatefulProps.disableNewLineMarkdownSupport;
    const disableMarkdownMessageFormatting = props.webChatContainerProps?.disableMarkdownMessageFormatting ?? defaultWebChatContainerStatefulProps.disableMarkdownMessageFormatting;
    const opensMarkdownLinksInSameTab = props.webChatContainerProps?.opensMarkdownLinksInSameTab;
    const honorsTargetInHTMLLinks = props.webChatContainerProps?.honorsTargetInHTMLLinks;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const markdown = createMarkdown(disableMarkdownMessageFormatting!, disableNewLineMarkdownSupport!, opensMarkdownLinksInSameTab);
    // Initialize Web Chat's redux store
    let webChatStore = WebChatStoreLoader.store;

    if (!webChatStore) {

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const addConversationalSurveyTagsCallback = (action: any) => {
            const inMemoryState = executeReducer(state, { type: LiveChatWidgetActionType.GET_IN_MEMORY_STATE, payload: null });
            const isConversationalSurvey = inMemoryState.appStates?.isConversationalSurvey;
            if (isConversationalSurvey) {
                if (!action.payload.activity.channelData.tags.includes(Constants.c2ConversationalSurveyMessageTag)) {
                    action.payload.activity.channelData.tags.push(Constants.c2ConversationalSurveyMessageTag);
                }
            }
            return action;
        };

        const conversationEndCallback = async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const conversationDetails: any = await getConversationDetailsCall(facadeChatSDK);
            if (conversationDetails?.participantType === ParticipantType.Bot) {
                TelemetryHelper.logActionEvent(LogLevel.INFO, {
                    Event: TelemetryEvent.ConversationEndedThreadEventReceived,
                    Description: "Conversation end by bot or timeout event received."
                });
                dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_ENDED_BY, payload: ConversationEndEntity.Bot });
            } else {
                TelemetryHelper.logActionEvent(LogLevel.INFO, {
                    Event: TelemetryEvent.ConversationEndedThreadEventReceived,
                    Description: "Conversation end by agent or timeout event received."
                });
                dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_ENDED_BY, payload: ConversationEndEntity.Agent });
            }

            if (conversationDetails?.participantType === ParticipantType.Bot || conversationDetails?.participantType === ParticipantType.User) {
                dispatch({ type: LiveChatWidgetActionType.SET_POST_CHAT_PARTICIPANT_TYPE, payload: conversationDetails?.participantType });
            }
        };

        const startConversationalSurveyCallback = async () => {
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATIONAL_SURVEY_DISPLAY, payload: true });
        };

        const endConversationalSurveyCallback = async () => {
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.InActive });
        };

        webChatStore = createStore(
            {}, //initial state
            preProcessingMiddleware,
            attachmentProcessingMiddleware,
            createAttachmentUploadValidatorMiddleware(
                state.domainStates.liveChatConfig?.allowedFileExtensions as string,
                state.domainStates.liveChatConfig?.maxUploadFileSize as string,
                localizedTexts
            ),
            attachmentSentAnnouncementMiddleware,
            createCustomEventMiddleware(BroadcastService),
            createQueueOverflowMiddleware(state, dispatch),
            channelDataMiddleware(addConversationalSurveyTagsCallback),
            createConversationEndMiddleware(conversationEndCallback, startConversationalSurveyCallback, endConversationalSurveyCallback),
            createDataMaskingMiddleware(state.domainStates.liveChatConfig?.DataMaskingInfo as IDataMaskingInfo),
            createMessageTimeStampMiddleware,
            createMessageSequenceIdOverrideMiddleware,
            createCitationsMiddleware(state, dispatch),
            gifUploadMiddleware,
            htmlPlayerMiddleware,
            htmlTextMiddleware(honorsTargetInHTMLLinks),
            createMaxMessageSizeValidator(localizedTexts),
            sanitizationMiddleware,
            createCallActionMiddleware(),
            // Pass a callback so middleware can push initials into React context for reactivity
            localizedStringsBotInitialsMiddleware((initials: string) => {
                dispatch({ type: LiveChatWidgetActionType.SET_BOT_AVATAR_INITIALS, payload: initials });
            }),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...(props.webChatContainerProps?.storeMiddlewares as any[] ?? [])
        );
        WebChatStoreLoader.store = webChatStore;
    }

    const hyperlinkTextOverrideRenderer = new HyperlinkTextOverrideRenderer(hyperlinkTextOverride as boolean);
    const markdownRenderers = [hyperlinkTextOverrideRenderer];
    const renderMarkdown = (text: string): string => {

        if (props.webChatContainerProps?.webChatProps?.renderMarkdown) {
            text = props.webChatContainerProps?.webChatProps.renderMarkdown(text);
        } else {
            const render = disableMarkdownMessageFormatting ? markdown.renderInline.bind(markdown) : markdown.render.bind(markdown);
            text = render(text);
        }

        markdownRenderers.forEach((renderer) => {
            text = renderer.render(text);
        });

        // EXISTING sanitization (continues to work as before)
        const config = {
            FORBID_TAGS: ["form", "button", "script", "div", "input"],
            FORBID_ATTR: ["action"],
            ADD_ATTR: ["target"]
        };
        text = DOMPurify.sanitize(text, config);

        // MONITOR-ONLY: Test what the stricter allowlist would remove (Phase 1)
        // This does NOT modify the text, only logs telemetry
        // Run during browser idle time to avoid blocking message flow and adding latency
        const textToMonitor = text; // Capture current text value

        // Schedule monitoring to run during browser idle time
        const scheduleMonitoring = () => {
            try {
                monitorStrictSanitization(textToMonitor, state);
            } catch (error) {
                // Silently catch errors to prevent blocking message flow
                if (process.env.NODE_ENV === "development") {
                    console.error("[Monitor] HTML sanitization monitoring failed:", error);
                }
            }
        };

        // Use requestIdleCallback for truly idle execution, fallback to setTimeout for older browsers
        if (typeof window !== "undefined" && "requestIdleCallback" in window) {
            window.requestIdleCallback(scheduleMonitoring);
        } else {
            setTimeout(scheduleMonitoring, 0);
        }

        return text;
    };

    /**
     * Monitor-only sanitization (Phase 1: Gather telemetry)
     * Tests what a stricter allowlist-based sanitization would remove
     * WITHOUT actually removing it. Logs telemetry for analysis.
     *
     * IMPORTANT: This function is wrapped in try-catch and runs asynchronously
     * to ensure failures don't block message flow or add latency.
     *
     * ISOLATION: Uses a separate DOMPurify instance to completely isolate
     * monitoring hooks from other sanitization paths (e.g., postDomPurifyActivities).
     * The instance is garbage collected after use, no cleanup needed.
     *
     * @param html - The HTML text that was already sanitized with existing config
     * @param state - Widget state containing orgId and chatId
     */
    const monitorStrictSanitization = (html: string, state: ILiveChatWidgetContext): void => {
        // Early exit for empty content
        if (!html) return;

        // Track execution time for performance monitoring
        const startTime = performance.now();

        try {
            // Create a separate DOMPurify instance for monitoring
            // This completely isolates monitoring from other sanitization paths
            const monitorDOMPurify = createDOMPurify(window);

            // Strict allowlist configuration (proposed new rules)
            // Note: DOMPurify blocks event handlers (onclick, onerror, etc.) by default
            const strictConfig = {
                ALLOWED_TAGS: [
                    "b", "strong",      // Bold text
                    "i", "em", "u",     // Italic, emphasis, underline
                    "br", "p",          // Line breaks and paragraphs
                    "ul", "ol", "li",   // Lists
                    "a"                 // Links (with restricted attributes)
                ],
                ALLOWED_ATTR: [
                    "href",    // For links (will be restricted to http/https)
                    "target",  // For link behavior
                    "rel"      // For security (noopener, noreferrer)
                ],
                FORBID_TAGS: [
                    "img", "video", "audio",                    // Media (tracking beacons)
                    "iframe", "object", "embed",                // Embedded content
                    "script", "style",                          // Script and styling
                    "form", "input", "textarea", "button",      // Form elements
                    "link", "meta", "base",                     // Document metadata
                    "div", "span"                               // Layout elements
                ],
                FORBID_ATTR: [
                    "style",        // Inline CSS
                    "action"        // Form action attribute (event handlers blocked by default)
                ],
                ALLOWED_URI_REGEXP: /^https?:/i,
                ALLOW_DATA_ATTR: false,
                ALLOW_UNKNOWN_PROTOCOLS: false
            };

            // Track what would be removed
            const removedTags: string[] = [];
            const removedAttributes: string[] = [];

            // Add hooks to the isolated monitoring instance
            monitorDOMPurify.addHook("uponSanitizeElement", (node, data) => {
                try {
                    const tagName = data.tagName.toLowerCase();
                    // Filter out "body" tag which is DOMPurify's internal wrapper
                    if (node.nodeType === 1 && !strictConfig.ALLOWED_TAGS.includes(tagName) && tagName !== "body") {
                        removedTags.push(tagName);
                    }
                } catch (hookError) {
                    // Silently ignore hook errors
                }
            });

            monitorDOMPurify.addHook("uponSanitizeAttribute", (node, data) => {
                try {
                    const attrName = data.attrName.toLowerCase();
                    if (!strictConfig.ALLOWED_ATTR.includes(attrName) && attrName !== "class" && attrName !== "id") {
                        removedAttributes.push(attrName);
                    }
                } catch (hookError) {
                    // Silently ignore hook errors
                }
            });

            // Run sanitization on the isolated instance (we discard the result)
            // No cleanup needed - the instance will be garbage collected with its hooks
            monitorDOMPurify.sanitize(html, strictConfig);

            // Log telemetry if content would be affected by strict rules
            if (removedTags.length > 0 || removedAttributes.length > 0) {
                try {
                    const uniqueTags = [...new Set(removedTags)];
                    const uniqueAttrs = [...new Set(removedAttributes)];

                    // Calculate execution time
                    const endTime = performance.now();
                    const executionTimeMs = Math.round((endTime - startTime) * 100) / 100; // Round to 2 decimal places

                    // Get context for telemetry (with safe fallbacks)
                    const orgId = state?.domainStates?.telemetryInternalData?.orgId || "unknown";
                    const conversationId = state?.domainStates?.chatToken?.chatId || "unknown";

                    TelemetryHelper.logActionEvent(LogLevel.INFO, {
                        Event: TelemetryEvent.HTMLSanitized,
                        Description: "HTML content would be sanitized by stricter allowlist (monitor-only)",
                        ElapsedTimeInMilliseconds: executionTimeMs,
                        CustomProperties: {
                            OrganizationId: orgId,
                            ConversationId: conversationId,
                            RemovedTags: uniqueTags.join(", "),
                            RemovedAttributes: uniqueAttrs.join(", "),
                            Phase: "Monitor"
                        }
                    });

                    // Log to console in development for debugging
                    if (process.env.NODE_ENV === "development") {
                        console.warn("[Monitor] Stricter HTML sanitization would remove:", {
                            orgId,
                            conversationId,
                            removedTags: uniqueTags,
                            removedAttributes: uniqueAttrs,
                            executionTimeMs
                        });
                    }
                } catch (telemetryError) {
                    // Silently ignore telemetry errors to prevent blocking
                    if (process.env.NODE_ENV === "development") {
                        console.error("[Monitor] Telemetry logging failed:", telemetryError);
                    }
                }
            }
        } catch (error) {
            // Catch-all for any unexpected errors
            // Silently fail to ensure monitoring never blocks message flow
            if (process.env.NODE_ENV === "development") {
                console.error("[Monitor] Monitoring failed:", error);
            }
        }
    };

    function postDomPurifyActivities() {
        DOMPurify.addHook("afterSanitizeAttributes", function (node) {
            const target = node.getAttribute(Constants.Target);
            if (target === Constants.TargetSelf) {
                node.setAttribute(Constants.Target, Constants.TargetTop);
            } else if (!target) {
                node.setAttribute(Constants.Target, Constants.Blank);
            }
        });
    }
    // Initialize the remaining Web Chat props
    const webChatProps: IWebChatProps = {
        ...defaultWebChatContainerStatefulProps.webChatProps,
        dir: state.domainStates.globalDir,
        locale: changeLanguageCodeFormatForWebChat(getLocaleStringFromId(state.domainStates.liveChatConfig?.ChatWidgetLanguage?.msdyn_localeid)),
        store: webChatStore,
        activityMiddleware: props.webChatContainerProps?.renderingMiddlewareProps?.disableActivityMiddleware ? undefined : createActivityMiddleware(
            renderMarkdown,
            state.domainStates.renderingMiddlewareProps?.systemMessageStyleProps,
            state.domainStates.renderingMiddlewareProps?.userMessageStyleProps,
            localizedTexts
        ),
        attachmentMiddleware: props.webChatContainerProps?.renderingMiddlewareProps?.disableAttachmentMiddleware ? undefined : createAttachmentMiddleware(state.domainStates.renderingMiddlewareProps?.attachmentProps?.enableInlinePlaying ?? defaultAttachmentProps.enableInlinePlaying),
        activityStatusMiddleware: props.webChatContainerProps?.renderingMiddlewareProps?.disableActivityStatusMiddleware ? undefined : createActivityStatusMiddleware(getLocaleStringFromId(state.domainStates.liveChatConfig?.ChatWidgetLanguage?.msdyn_localeid)),
        toastMiddleware: props.webChatContainerProps?.renderingMiddlewareProps?.disableToastMiddleware ? undefined: createToastMiddleware(props.notificationPaneProps, endChat),
        renderMarkdown,
        avatarMiddleware: props.webChatContainerProps?.renderingMiddlewareProps?.disableAvatarMiddleware ? undefined : createAvatarMiddleware(state.domainStates.renderingMiddlewareProps?.avatarStyleProps, state.domainStates.renderingMiddlewareProps?.avatarTextStyleProps),
        groupActivitiesMiddleware: props.webChatContainerProps?.renderingMiddlewareProps?.disableGroupActivitiesMiddleware ? undefined : defaultWebChatContainerStatefulProps.webChatProps?.groupActivitiesMiddleware,
        typingIndicatorMiddleware: props.webChatContainerProps?.renderingMiddlewareProps?.disableTypingIndicatorMiddleware ? undefined : defaultWebChatContainerStatefulProps.webChatProps?.typingIndicatorMiddleware,
        onTelemetry: createWebChatTelemetry(),
        cardActionMiddleware: createCardActionMiddleware(props.webChatContainerProps?.botMagicCode || undefined),
        sendTypingIndicator: true,
        overrideLocalizedStrings: getOverriddenLocalizedStrings(props.webChatContainerProps?.webChatProps?.overrideLocalizedStrings),
        ...props.webChatContainerProps?.webChatProps
    };

    return webChatProps;
};
