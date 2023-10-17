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
import { defaultAttachmentProps } from "../../../common/defaultProps/defaultAttachmentProps";
import { useChatContextStore } from "../../../../..";
import { NotificationHandler } from "../../notification/NotificationHandler";
import { NotificationScenarios } from "../../enums/NotificationScenarios";
import { defaultMiddlewareLocalizedTexts } from "../../../common/defaultProps/defaultMiddlewareLocalizedTexts";
import Attachment from "./attachments/Attachment";
import ScanInProgressAttachment from "./attachments/ScanInProgressAttachment";
import MaliciousAttachment from "./attachments/MaliciousAttachment";
import FileScanStatus from "./attachments/FileScanStatus";

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

            if (scanResult?.status === FileScanStatus.INPROGRESS) {
                return (
                    <ScanInProgressAttachment textCard={card} />
                );
            }

            if (scanResult?.status === FileScanStatus.MALWARE) {
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