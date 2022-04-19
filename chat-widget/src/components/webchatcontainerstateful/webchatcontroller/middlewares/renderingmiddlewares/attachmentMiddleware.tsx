/* eslint-disable @typescript-eslint/no-explicit-any */
/******
 * AttachmentMiddleware
 * 
 * Handles attachment downloading.
 ******/

import { Constants, MimeTypes, WebChatMiddlewareConstants } from "../../../../../common/Constants";
import React, { Dispatch } from "react";
import { getFileAttachmentIconData, isInlineMediaSupported } from "../../../common/utils/FileAttachmentIconManager";

import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { ILiveChatWidgetAction } from "../../../../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../../../../contexts/common/ILiveChatWidgetContext";
import { WebChatActionType } from "../../enums/WebChatActionType";
import { defaultAttachmentAdaptiveCardStyles } from "./defaultStyles/defaultAtttachmentAdaptiveCardStyles";
import { defaultAttachmentContentStyles } from "./defaultStyles/defaultAttachmentContentStyles";
import { defaultAttachmentDividerStyles } from "./defaultStyles/defaultAttachmentDividerStyles";
import { defaultAttachmentDownloadIconStyles } from "./defaultStyles/defaultAttachmentDownloadIconStyles";
import { defaultAttachmentFileNameStyles } from "./defaultStyles/defaultAttachmentFileNameStyles";
import { defaultAttachmentIconStyles } from "./defaultStyles/defaultAtttachmentIconStyles";
import { defaultAttachmentProps } from "../../../common/defaultProps/defaultAttachmentProps";
import { defaultAttachmentSizeStyles } from "./defaultStyles/defaultAttachmentSizeStyles";
import { defaultAttachmentStyles } from "./defaultStyles/defaultAtttachmentStyles";
import { useChatContextStore } from "../../../../..";

const AttachmentContent = (props: any) => {
    return (
        <div id={props.id} style={props.style} >
            {props.children}
        </div>
    );
};

const AttachmentIcon = (props: any) => {
    return (
        <div id={props.id} style={props.style} >
            <img src={props.src ?? getFileAttachmentIconData("txt")} />
        </div>
    );
};

const Attachment = (props: any) => {
    const { iconData, imageCard, textCard, renderer } = props;
    const [state, ]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    const attachmentId = state.domainStates.renderingMiddlewareProps?.attachmentProps?.webChatAttachmentId ?? defaultAttachmentProps.webChatAttachmentId;
    const attachmentDividerStyles = {...defaultAttachmentDividerStyles, ...state.domainStates.renderingMiddlewareProps?.attachmentDividerStyles};
    const attachmentIconStyles = {...defaultAttachmentIconStyles, ...state.domainStates.renderingMiddlewareProps?.attachmentIconStyles};
    const attachmentStyles = {...defaultAttachmentStyles, ...state.domainStates.renderingMiddlewareProps?.attachmentStyles};
    
    const attachmentSizeStylesString = (
        Object.entries({...defaultAttachmentSizeStyles, ...state.domainStates.renderingMiddlewareProps?.attachmentSizeStyles}).map(([k, v]) => `${k.replace(/[A-Z]/g, (match: string) => `-${match.toLowerCase()}`)}:${v}`).join(";"));
    const attachmentContentStylesString = (
        Object.entries({...defaultAttachmentContentStyles, ...state.domainStates.renderingMiddlewareProps?.attachmentContentStyles}).map(([k, v]) => `${k.replace(/[A-Z]/g, (match: string) => `-${match.toLowerCase()}`)}:${v}`).join(";"));
    const attachmentFileNameStylesString = (
        Object.entries({...defaultAttachmentFileNameStyles, ...state.domainStates.renderingMiddlewareProps?.attachmentFileNameStyles}).map(([k, v]) => `${k.replace(/[A-Z]/g, (match: string) => `-${match.toLowerCase()}`)}:${v}`).join(";"));
    const attachmentDownloadIconStylesString = (
        Object.entries({...defaultAttachmentDownloadIconStyles, ...state.domainStates.renderingMiddlewareProps?.attachmentDownloadIconStyles}).map(([k, v]) => `${k.replace(/[A-Z]/g, (match: string) => `-${match.toLowerCase()}`)}:${v}`).join(";"));
    
    return (
        <><style>{`
            .webchat__fileContent__size { ${attachmentSizeStylesString} }
            .webchat__fileContent { ${attachmentContentStylesString} }
            .webchat__fileContent__fileName { ${attachmentFileNameStylesString} }
            .webchat__fileContent__downloadIcon { ${attachmentDownloadIconStylesString} }
        `}</style>
        <div dir={state.domainStates.globalDir}>
            {imageCard && renderer(imageCard)}
            {imageCard && <hr id={attachmentId + "-divider"} style={attachmentDividerStyles} />}
            <AttachmentContent attachment={textCard.attachment} id={attachmentId} style={attachmentStyles}>
                <AttachmentIcon src={iconData} id={attachmentId + "-icon"} style={attachmentIconStyles} />
                {textCard && renderer(textCard)}
            </AttachmentContent>
        </div>
        </>
    );
};

/**
* Patch card with different attachment data.
* @param card
* @param newAttachment
*/
const patchAttachment = (card : any, newAttachment: any) => {
    const { activity, attachment } = card;
    const patchedAttachment = Object.assign({}, attachment);
    patchedAttachment.contentType = newAttachment.contentType;
    patchedAttachment.thumbnailUrl = newAttachment.thumbnailUrl;
    
    const patchedAttachments = activity.attachments.map((target: any) =>
        target === attachment ? patchedAttachment : target
    );

    const patchedActivity = Object.assign({}, activity);
    patchedActivity.attachments = patchedAttachments;
    return {
        activity: patchedActivity,
        attachment: patchedAttachment
    };
};

const genPreviewCardWithAttachment = (card: any, iconData: any, next: any) => {
    const patchedTextCard = patchAttachment(card, {
        contentType: MimeTypes.UnknownFileType,
        thumbnailUrl: undefined
    });
    return (
        <Attachment iconData={iconData} imageCard={card} textCard={patchedTextCard} renderer={next} />
    );
};

const createAttachmentMiddleware = (enableInlinePlaying: boolean | undefined) => {    
    const attachmentMiddleware = () => (next: any) => (...args: any) => {
        const [card] = args;
        if (!card?.activity) {
            return next(...args);
        }
    
        const { activity: { attachments }, attachment } : {activity: { attachments: any}, attachment: any} = card;
        // No attachment
        if (!attachments || !attachments.length || !attachment) {
            return next(...args);
        }
    
        // Check for Adaptive cards
        // eslint-disable-next-line prefer-const
        let { content, contentType } = attachment || { content: "", contentType: "" };
        let { type } = content || { type: "" };
    
        if (!type && content && Constants.supportedAdaptiveCardContentTypes.indexOf(contentType) >= 0) {
            try {
                content = JSON.parse(content);
                type = content.type;
                card.attachment.content = content;
            } catch (e) {
                const errorData = "Unable to parse the adaptive card format";
                BroadcastService.postMessage({
                    eventName: "InvalidAdaptiveCardFormat",
                    payload: {
                        Message: errorData,
                        ExceptionDetails: e
                    }
                });
            }
        }

        const [state, ]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
        const attachmentId = state.domainStates.renderingMiddlewareProps?.attachmentProps?.adaptiveCardAttachmentId ?? defaultAttachmentProps.adaptiveCardAttachmentId;
        const atttachmentAdaptiveCardStyles = {...defaultAttachmentAdaptiveCardStyles, ...state.domainStates.renderingMiddlewareProps?.attachmentAdaptiveCardStyles};

        if (type === WebChatMiddlewareConstants.adaptiveCard || Constants.supportedAdaptiveCardContentTypes.indexOf(contentType) >= 0) {
            return (
                <div id={attachmentId} style={atttachmentAdaptiveCardStyles}>
                    {next(...args)}
                </div>
            );
        }
    
        if (card.activity.channelData?.middlewareData) {
            attachment.contentUrl = card.activity.channelData.middlewareData[attachment.name];
        } else if (attachment?.tempContentUrl) {
            attachment.contentUrl = attachment.tempContentUrl;
        }
    
        const fileExtension = attachment.name.substring(attachment.name.lastIndexOf(".") + 1, attachment.name.length) || attachment.name;
        const imageExtension = Constants.imageRegex.test(attachment.name);
    
        const audioExtension = Constants.audioMediaRegex.test(attachment.name);
        const videoExtension = Constants.videoMediaRegex.test(attachment.name);
               
        const iconData = getFileAttachmentIconData(fileExtension);
        if (imageExtension) {
            return genPreviewCardWithAttachment(card, iconData, next);
        }
    
        if (audioExtension || videoExtension){
            if (enableInlinePlaying && card.activity.actionType && card.activity.actionType === WebChatActionType.DIRECT_LINE_INCOMING_ACTIVITY &&  isInlineMediaSupported(attachment.name)) {
                return genPreviewCardWithAttachment(card, iconData, next);
            }
            
            return (
                <Attachment
                    iconData={iconData}
                    textCard={patchAttachment(card, { contentType: MimeTypes.UnknownFileType, thumbnailUrl: undefined })}
                    renderer={next}
                />
            );
        }
    
        if (fileExtension === "txt") {
            return (
                <Attachment
                    iconData={iconData}
                    textCard={patchAttachment(card, { contentType: MimeTypes.UnknownFileType, thumbnailUrl: undefined })}
                    renderer={next}
                />
            );
        }
    
        return (
            <Attachment iconData={iconData} textCard={card} renderer={next} />
        );
    };
    return attachmentMiddleware;
};

export default createAttachmentMiddleware;