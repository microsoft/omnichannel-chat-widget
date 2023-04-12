import { LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";
import { createStore } from "botframework-webchat";
import { Dispatch } from "react";
import { IDataMaskingInfo } from "../../webchatcontainerstateful/interfaces/IDataMaskingInfo";
import { ILiveChatWidgetAction } from "../../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../../contexts/common/ILiveChatWidgetContext";
import { ILiveChatWidgetProps } from "../interfaces/ILiveChatWidgetProps";
import { IWebChatProps } from "../../webchatcontainerstateful/interfaces/IWebChatProps";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { WebChatStoreLoader } from "../../webchatcontainerstateful/webchatcontroller/WebChatStoreLoader";
import attachmentProcessingMiddleware from "../../webchatcontainerstateful/webchatcontroller/middlewares/storemiddlewares/attachmentProcessingMiddleware";
import { changeLanguageCodeFormatForWebChat } from "../../../common/utils";
import channelDataMiddleware from "../../webchatcontainerstateful/webchatcontroller/middlewares/storemiddlewares/channelDataMiddleware";
import { createActivityMiddleware } from "../../webchatcontainerstateful/webchatcontroller/middlewares/renderingmiddlewares/activityMiddleware";
import createAttachmentMiddleware from "../../webchatcontainerstateful/webchatcontroller/middlewares/renderingmiddlewares/attachmentMiddleware";
import createAttachmentUploadValidatorMiddleware from "../../webchatcontainerstateful/webchatcontroller/middlewares/storemiddlewares/attachmentUploadValidatorMiddleware";
import { createAvatarMiddleware } from "../../webchatcontainerstateful/webchatcontroller/middlewares/renderingmiddlewares/avatarMiddleware";
import createConversationEndMiddleware from "../../webchatcontainerstateful/webchatcontroller/middlewares/storemiddlewares/conversationEndMiddleware";
import createDataMaskingMiddleware from "../../webchatcontainerstateful/webchatcontroller/middlewares/storemiddlewares/dataMaskingMiddleware";
import { createMarkdown } from "./createMarkdown";
import createMaxMessageSizeValidator from "../../webchatcontainerstateful/webchatcontroller/middlewares/storemiddlewares/maxMessageSizeValidator";
import { createWebChatTelemetry } from "../../webchatcontainerstateful/webchatcontroller/webchattelemetry/WebChatLogger";
import { defaultAttachmentProps } from "../../webchatcontainerstateful/common/defaultProps/defaultAttachmentProps";
import { defaultMiddlewareLocalizedTexts } from "../../webchatcontainerstateful/common/defaultProps/defaultMiddlewareLocalizedTexts";
import { defaultWebChatContainerStatefulProps } from "../../webchatcontainerstateful/common/defaultProps/defaultWebChatContainerStatefulProps";
import { getLocaleStringFromId } from "@microsoft/omnichannel-chat-sdk";
import gifUploadMiddleware from "../../webchatcontainerstateful/webchatcontroller/middlewares/storemiddlewares/gifUploadMiddleware";
import htmlPlayerMiddleware from "../../webchatcontainerstateful/webchatcontroller/middlewares/storemiddlewares/htmlPlayerMiddleware";
import htmlTextMiddleware from "../../webchatcontainerstateful/webchatcontroller/middlewares/storemiddlewares/htmlTextMiddleware";
import preProcessingMiddleware from "../../webchatcontainerstateful/webchatcontroller/middlewares/storemiddlewares/preProcessingMiddleware";
import sanitizationMiddleware from "../../webchatcontainerstateful/webchatcontroller/middlewares/storemiddlewares/sanitizationMiddleware";
import { createCardActionMiddleware } from "../../webchatcontainerstateful/webchatcontroller/middlewares/renderingmiddlewares/cardActionMiddleware";
import createMessageTimeStampMiddleware from "../../webchatcontainerstateful/webchatcontroller/middlewares/renderingmiddlewares/messageTimestampMiddleware";
import { ConversationEndEntity, ParticipantType } from "../../../common/Constants";
import { getConversationDetails } from "./endChat";
import HyperlinkTextOverrideRenderer from "../../webchatcontainerstateful/webchatcontroller/markdownrenderers/HyperlinkTextOverrideRenderer";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const initWebChatComposer = (props: ILiveChatWidgetProps, state: ILiveChatWidgetContext, dispatch: Dispatch<ILiveChatWidgetAction>, chatSDK: any) => {
    const localizedTexts = {
        ...defaultMiddlewareLocalizedTexts,
        ...props.webChatContainerProps?.localizedTexts
    };

    const hyperlinkTextOverride = props.webChatContainerProps?.hyperlinkTextOverride ?? defaultWebChatContainerStatefulProps.hyperlinkTextOverride;
    const disableNewLineMarkdownSupport = props.webChatContainerProps?.disableNewLineMarkdownSupport ?? defaultWebChatContainerStatefulProps.disableNewLineMarkdownSupport;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const markdown = createMarkdown((props.webChatContainerProps?.disableMarkdownMessageFormatting ?? defaultWebChatContainerStatefulProps.disableMarkdownMessageFormatting)!, disableNewLineMarkdownSupport!);
    // Initialize Web Chat's redux store
    let webChatStore = WebChatStoreLoader.store;

    if (!webChatStore) {

        const conversationEndCallback = async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const conversationDetails: any = await getConversationDetails(chatSDK);
            if (conversationDetails?.participantType === ParticipantType.Bot) {
                dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_ENDED_BY, payload: ConversationEndEntity.Bot });
            } else {
                dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_ENDED_BY, payload: ConversationEndEntity.Agent });
            }

            TelemetryHelper.logActionEvent(LogLevel.INFO, {
                Event: TelemetryEvent.ConversationEndedThreadEventReceived,
                Description: "Conversation end by agent side or by timeout event received."
            });
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
            channelDataMiddleware,
            createConversationEndMiddleware(conversationEndCallback),
            createDataMaskingMiddleware(state.domainStates.liveChatConfig?.DataMaskingInfo as IDataMaskingInfo),
            createMessageTimeStampMiddleware,
            gifUploadMiddleware,
            htmlPlayerMiddleware,
            htmlTextMiddleware,
            createMaxMessageSizeValidator(localizedTexts),
            sanitizationMiddleware,
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
            const render = disableNewLineMarkdownSupport ? markdown.renderInline.bind(markdown) : markdown.render.bind(markdown);
            text = render(text);
        }

        markdownRenderers.forEach((renderer) => {
            text = renderer.render(text);
        });

        return text;
    };

    // Initialize the remaining Web Chat props
    const webChatProps: IWebChatProps = {
        ...defaultWebChatContainerStatefulProps.webChatProps,
        dir: state.domainStates.globalDir,
        locale: changeLanguageCodeFormatForWebChat(getLocaleStringFromId(state.domainStates.liveChatConfig?.ChatWidgetLanguage?.msdyn_localeid)),
        store: webChatStore,
        activityMiddleware: props.webChatContainerProps?.renderingMiddlewareProps?.disableActivityMiddleware ? undefined : createActivityMiddleware(state.domainStates.renderingMiddlewareProps?.systemMessageStyleProps, state.domainStates.renderingMiddlewareProps?.userMessageStyleProps),
        attachmentMiddleware: props.webChatContainerProps?.renderingMiddlewareProps?.disableAttachmentMiddleware ? undefined : createAttachmentMiddleware(state.domainStates.renderingMiddlewareProps?.attachmentProps?.enableInlinePlaying ?? defaultAttachmentProps.enableInlinePlaying),
        activityStatusMiddleware: props.webChatContainerProps?.renderingMiddlewareProps?.disableActivityStatusMiddleware ? undefined : defaultWebChatContainerStatefulProps.webChatProps?.activityStatusMiddleware,
        renderMarkdown,
        avatarMiddleware: props.webChatContainerProps?.renderingMiddlewareProps?.disableAvatarMiddleware ? undefined : createAvatarMiddleware(state.domainStates.renderingMiddlewareProps?.avatarStyleProps, state.domainStates.renderingMiddlewareProps?.avatarTextStyleProps),
        groupActivitiesMiddleware: props.webChatContainerProps?.renderingMiddlewareProps?.disableGroupActivitiesMiddleware ? undefined : defaultWebChatContainerStatefulProps.webChatProps?.groupActivitiesMiddleware,
        typingIndicatorMiddleware: props.webChatContainerProps?.renderingMiddlewareProps?.disableTypingIndicatorMiddleware ? undefined : defaultWebChatContainerStatefulProps.webChatProps?.typingIndicatorMiddleware,
        onTelemetry: createWebChatTelemetry(),
        cardActionMiddleware: createCardActionMiddleware(props.webChatContainerProps?.botMagicCode || undefined),
        sendTypingIndicator: true,
        ...props.webChatContainerProps?.webChatProps
    };

    return webChatProps;
};