import { ConversationEndEntity, ParticipantType } from "../../../common/Constants";
import { LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";
import { changeLanguageCodeFormatForWebChat, getConversationDetailsCall } from "../../../common/utils";

import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { Constants } from "../../../common/Constants";
import { ConversationState } from "../../../contexts/common/ConversationState";
import DOMPurify from "dompurify";
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
import channelDataMiddleware from "../../webchatcontainerstateful/webchatcontroller/middlewares/storemiddlewares/channelDataMiddleware";
import { createActivityMiddleware } from "../../webchatcontainerstateful/webchatcontroller/middlewares/renderingmiddlewares/activityMiddleware";
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
import { localizedStringsBotInitialsMiddleware, getOverriddenLocalizedStrings } from "../../webchatcontainerstateful/webchatcontroller/middlewares/storemiddlewares/localizedStringsBotInitialsMiddleware";

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
            localizedStringsBotInitialsMiddleware(),
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

        const config = {
            FORBID_TAGS: ["form", "button", "script", "div", "input"],
            FORBID_ATTR: ["action"],
            ADD_ATTR: ["target"]
        };
        text = DOMPurify.sanitize(text, config);
        return text;
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
        activityMiddleware: props.webChatContainerProps?.renderingMiddlewareProps?.disableActivityMiddleware ? undefined : createActivityMiddleware(renderMarkdown, state.domainStates.renderingMiddlewareProps?.systemMessageStyleProps, state.domainStates.renderingMiddlewareProps?.userMessageStyleProps),
        attachmentMiddleware: props.webChatContainerProps?.renderingMiddlewareProps?.disableAttachmentMiddleware ? undefined : createAttachmentMiddleware(state.domainStates.renderingMiddlewareProps?.attachmentProps?.enableInlinePlaying ?? defaultAttachmentProps.enableInlinePlaying),
        activityStatusMiddleware: props.webChatContainerProps?.renderingMiddlewareProps?.disableActivityStatusMiddleware ? undefined : defaultWebChatContainerStatefulProps.webChatProps?.activityStatusMiddleware,
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
