/* eslint-disable @typescript-eslint/no-explicit-any */
/******
 * AttachmentMiddleware
 *
 * Handles attachment downloading.
 ******/

import { Constants, MimeTypes, WebChatMiddlewareConstants } from "../../../../../common/Constants";
import React, { Dispatch } from "react";
import { getFileAttachmentIconData, isInlineMediaSupported } from "../../../common/utils/FileAttachmentIconManager";
import { BroadcastEvent } from "../../../../../common/telemetry/TelemetryConstants";
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
import { CrossIcon, FileScanInProgressIcon, MaliciousFileIcon } from "../../../../../assets/Icons";
import { NotificationHandler } from "../../notification/NotificationHandler";
import { NotificationScenarios } from "../../enums/NotificationScenarios";
import { defaultMiddlewareLocalizedTexts } from "../../../common/defaultProps/defaultMiddlewareLocalizedTexts";

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

const Spinner = (props: any) => {
    const spinnerStyle: any = {
        boxSizing: "border-box",
        borderRadius: "50%",
        borderWidth: props.borderWidth || 2,
        borderStyle: "solid",
        borderColor: "rgb(0,120,212) rgb(199,224,244) rgb(199,224,244)",
        borderImage: "initial",
        animationName: "spin",
        animationDuration: "1.3s",
        animationIterationCount: "infinite",
        animationTimingFunction: "cubic-bezier(0.53, 0.21, 0.29, 0.67)",
        width: props.size || 20,
        height: props.size || 20,
    };

    return (
        <>
            <style>{`
                @keyframes spin {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
            <div className="spinner" style={spinnerStyle}></div>
        </>
    );
};

const ScanInProgressAttachment = (props: any) => {
    const renderer = () => (
        <div style={{display: "flex", padding: "10px 10px 10px 8px", width: "100%"}}>
            <div style={{fontSize: 12, fontFamily: "Segoe UI, Arial, sans-serif"}}> {props.textCard.attachment.name} </div>
            <div style={{marginLeft: "auto", paddingRight: "10px"}}>
                <Spinner size={16}/>
            </div>
        </div>
    );

    return (
        <Attachment {...props} iconData={FileScanInProgressIcon} imageCard={undefined} renderer={renderer}/>
    );
};

const MaliciousAttachment = (props: any) => {
    const renderer = () => (
        <div style={{display: "flex", padding: "10px 10px 10px 8px", width: "100%"}}>
            <div style={{fontSize: 12, fontFamily: "Segoe UI, Arial, sans-serif"}}> {props.textCard.attachment.name} </div>
            <div style={{marginLeft: "auto", paddingRight: "10px"}}>
                <img src={CrossIcon} alt="Malicious" />
            </div>
        </div>
    );

    return (
        <Attachment {...props} iconData={MaliciousFileIcon} imageCard={undefined} renderer={renderer}/>
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
    // eslint-disable-next-line react/display-name
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
                    eventName: BroadcastEvent.InvalidAdaptiveCardFormat,
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
        } else if (contentType.startsWith(Constants.adaptiveCardContentTypePrefix)) {
            console.warn(`${contentType} adaptive card type is currently not supported.`);
        }

        if (card.activity.channelData?.middlewareData) {
            attachment.contentUrl = card.activity.channelData.middlewareData[attachment.name];
        } else if (attachment?.tempContentUrl) {
            attachment.contentUrl = attachment.tempContentUrl;
        }

        if (!attachment.name) {
            return next(...args);
        }

        if (card.activity.channelData && card.activity.channelData.fileScan) {
            const index = attachments.findIndex((attachment: any) => (attachment.name === card.attachment.name));
            const {activity: {channelData: {fileScan}}} = card;

            const scanResult = fileScan[index];

            if (scanResult?.status === "in progress") {
                return (
                    <ScanInProgressAttachment textCard={card} />
                );
            }

            if (scanResult?.status === "malware") {
                const localizedText = state.domainStates.middlewareLocalizedTexts?.MIDDLEWARE_BANNER_FILE_IS_MALICIOUS ?? defaultMiddlewareLocalizedTexts.MIDDLEWARE_BANNER_FILE_IS_MALICIOUS;
                NotificationHandler.notifyError(NotificationScenarios.AttachmentError, (localizedText as string).replace("{0}", attachment.name));

                return (
                    <MaliciousAttachment textCard={card} />
                );
            }
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

        const isUnknownImageObject = contentType.toLowerCase().includes("image") && !imageExtension;
        if (fileExtension === "txt" || isUnknownImageObject) {
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