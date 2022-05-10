import { StyleOptions, createStore } from "botframework-webchat";

import { ConversationState } from "../../../contexts/common/ConversationState";
import { Dispatch } from "react";
import { IDataMaskingInfo } from "../../webchatcontainerstateful/interfaces/IDataMaskingInfo";
import { ILiveChatWidgetAction } from "../../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../../contexts/common/ILiveChatWidgetContext";
import { ILiveChatWidgetProps } from "../interfaces/ILiveChatWidgetProps";
import { IWebChatProps } from "../../webchatcontainerstateful/interfaces/IWebChatProps";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";
import { PostChatSurveyMode } from "../../postchatsurveypanestateful/enums/PostChatSurveyMode";
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
import { defaultAttachmentProps } from "../../webchatcontainerstateful/common/defaultProps/defaultAttachmentProps";
import { defaultMiddlewareLocalizedTexts } from "../../webchatcontainerstateful/common/defaultProps/defaultMiddlewareLocalizedTexts";
import { defaultWebChatContainerStatefulProps } from "../../webchatcontainerstateful/common/defaultProps/defaultWebChatContainerStatefulProps";
import { getLocaleStringFromId } from "@microsoft/omnichannel-chat-sdk";
import gifUploadMiddleware from "../../webchatcontainerstateful/webchatcontroller/middlewares/storemiddlewares/gifUploadMiddleware";
import htmlPlayerMiddleware from "../../webchatcontainerstateful/webchatcontroller/middlewares/storemiddlewares/htmlPlayerMiddleware";
import htmlTextMiddleware from "../../webchatcontainerstateful/webchatcontroller/middlewares/storemiddlewares/htmlTextMiddleware";
import preProcessingMiddleware from "../../webchatcontainerstateful/webchatcontroller/middlewares/storemiddlewares/preProcessingMiddleware";
import sanitizationMiddleware from "../../webchatcontainerstateful/webchatcontroller/middlewares/storemiddlewares/sanitizationMiddleware";
import { setPostChatContextAndLoadSurvey } from "./setPostChatContextAndLoadSurvey";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const initWebChatComposer = (props: ILiveChatWidgetProps, chatSDK: any, state: ILiveChatWidgetContext, dispatch: Dispatch<ILiveChatWidgetAction>, setWebChatStyles: any) => {
    const localizedTexts = {
        ...defaultMiddlewareLocalizedTexts,
        ...props.webChatContainerProps?.localizedTexts
    };

    const disableNewLineMarkdownSupport = props.webChatContainerProps?.disableNewLineMarkdownSupport ?? defaultWebChatContainerStatefulProps.disableNewLineMarkdownSupport;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const markdown = createMarkdown((props.webChatContainerProps?.disableMarkdownMessageFormatting ?? defaultWebChatContainerStatefulProps.disableMarkdownMessageFormatting)!, disableNewLineMarkdownSupport!);
    const isPostChatEnabled = state.domainStates.liveChatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_postconversationsurveyenable;
    const postChatSurveyMode = state.domainStates.liveChatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_postconversationsurveymode;

    // Initialize Web Chat's redux store
    let webChatStore = WebChatStoreLoader.store;
    if (!webChatStore) {
        const conversationEndCallback = async () => {
            if (props?.webChatContainerProps?.renderingMiddlewareProps?.hideSendboxOnConversationEnd !== false) {
                setWebChatStyles((styles: StyleOptions) => { return { ...styles, hideSendBox: true }; });
            }
            if (isPostChatEnabled === "true" && postChatSurveyMode === PostChatSurveyMode.Embed) {
                dispatch({ type: LiveChatWidgetActionType.SET_SHOULD_SHOW_POST_CHAT, payload: true });
                dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Loading });

                await setPostChatContextAndLoadSurvey(chatSDK, dispatch, true);
            } else {
                dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_ENDED_BY_AGENT, payload: true });
            }
            dispatch({ type: LiveChatWidgetActionType.SET_CHAT_TOKEN, payload: undefined });
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

    // Initialize the remaining Web Chat props
    const webChatProps: IWebChatProps = {
        ...defaultWebChatContainerStatefulProps.webChatProps,
        dir: state.domainStates.globalDir,
        locale: changeLanguageCodeFormatForWebChat(getLocaleStringFromId(state.domainStates.liveChatConfig?.ChatWidgetLanguage?.msdyn_localeid)),
        store: webChatStore,
        activityMiddleware: props.webChatContainerProps?.renderingMiddlewareProps?.disableActivityMiddleware ? undefined : createActivityMiddleware(state.domainStates.renderingMiddlewareProps?.systemMessageStyleProps, state.domainStates.renderingMiddlewareProps?.userMessageStyleProps),
        attachmentMiddleware: props.webChatContainerProps?.renderingMiddlewareProps?.disableAttachmentMiddleware ? undefined : createAttachmentMiddleware(state.domainStates.renderingMiddlewareProps?.attachmentProps?.enableInlinePlaying ?? defaultAttachmentProps.enableInlinePlaying),
        activityStatusMiddleware: props.webChatContainerProps?.renderingMiddlewareProps?.disableActivityStatusMiddleware ? undefined : defaultWebChatContainerStatefulProps.webChatProps?.activityStatusMiddleware,
        renderMarkdown: props.webChatContainerProps?.webChatProps?.renderMarkdown ?? (disableNewLineMarkdownSupport ? markdown.renderInline.bind(markdown) : markdown.render.bind(markdown)),
        avatarMiddleware: props.webChatContainerProps?.renderingMiddlewareProps?.disableAvatarMiddleware ? undefined : createAvatarMiddleware(state.domainStates.renderingMiddlewareProps?.avatarStyleProps, state.domainStates.renderingMiddlewareProps?.avatarTextStyleProps),
        groupActivitiesMiddleware: props.webChatContainerProps?.renderingMiddlewareProps?.disableGroupActivitiesMiddleware ? undefined : defaultWebChatContainerStatefulProps.webChatProps?.groupActivitiesMiddleware,
        typingIndicatorMiddleware: props.webChatContainerProps?.renderingMiddlewareProps?.disableTypingIndicatorMiddleware ? undefined : defaultWebChatContainerStatefulProps.webChatProps?.typingIndicatorMiddleware,
        ...props.webChatContainerProps?.webChatProps
    };

    return webChatProps;
};