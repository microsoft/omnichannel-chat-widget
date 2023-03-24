/******
 * AttachmentUploadValidatorMiddleware
 * 
 * Checks if the attachment being uploaded satisfies Omnichannel's requirement on file extensions and file size.
 ******/

import { LogLevel, TelemetryEvent } from "../../../../../common/telemetry/TelemetryConstants";
import { IWebChatAction } from "../../../interfaces/IWebChatAction";
import { NotificationHandler } from "../../notification/NotificationHandler";
import { NotificationScenarios } from "../../enums/NotificationScenarios";
import { WebChatActionType } from "../../enums/WebChatActionType";
import { TelemetryHelper } from "../../../../../common/telemetry/TelemetryHelper";
import { ILiveChatWidgetLocalizedTexts } from "../../../../../contexts/common/ILiveChatWidgetLocalizedTexts";
import { AMSConstants } from "../../../../../common/Constants";

const MBtoBRatio = 1000000;

/*
* If an attachment is invalid, delete this attachment from the attachments list
* If the result attachment list is empty, return a dummy action
*/
const validateAttachment = (action: IWebChatAction, allowedFileExtensions: string, maxFileSizeSupportedByDynamics: string, localizedTexts: ILiveChatWidgetLocalizedTexts): IWebChatAction => {
    const attachments = action?.payload?.activity?.attachments;
    const attachmentSizes = action?.payload?.activity?.channelData?.attachmentSizes;
    if (attachments) {
        for (let i = 0; i < attachments.length; i++) {
            const maxUploadFileSize = getMaxUploadFileSize(maxFileSizeSupportedByDynamics, attachments[i].contentType);
            const fileExtensionValid = validateFileExtension(attachments[i], allowedFileExtensions);
            const fileSizeValid = validateFileSize(attachmentSizes[i], maxUploadFileSize);
            const fileIsEmpty = parseInt(attachmentSizes[i]) == 0;
            if (!fileExtensionValid || !fileSizeValid || fileIsEmpty) {
                NotificationHandler.notifyError(NotificationScenarios.AttachmentError, buildErrorMessage(attachments[i].name, fileExtensionValid, fileSizeValid, fileIsEmpty, maxUploadFileSize.toString(), maxFileSizeSupportedByDynamics, localizedTexts));
                attachments.splice(i, 1);
                attachmentSizes.splice(i, 1);
                i--;
            }
        }
    }

    if (action?.payload?.activity?.attachments?.length > 0) {
        return action;
    } else {
        return {
            type: "",
            payload: null
        };
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const validateFileExtension = (attachment: any, allowedFileExtensions: string): boolean => {
    if (!allowedFileExtensions) {
        return true;
    }
    const fileName = attachment.name.toLowerCase();
    const index = fileName.lastIndexOf(".");
    if (!index) {
        return false;
    }
    const fileExtension = fileName.substring(index);
    const allExtensions = allowedFileExtensions?.toLowerCase().split(",");
    return allExtensions.indexOf(fileExtension) > -1;
};

const validateFileSize = (attachmentSize: string, maxUploadFileSize: number): boolean => {
    return (maxUploadFileSize * MBtoBRatio) > parseInt(attachmentSize);
};

const getMaxUploadFileSize = (maxFileSizeSupportedByDynamicsStr: string, contentType: string): number => {
    const maxFileSizeSupportedByDynamics = maxFileSizeSupportedByDynamicsStr && parseInt(maxFileSizeSupportedByDynamicsStr) ? parseInt(maxFileSizeSupportedByDynamicsStr) : AMSConstants.maxSupportedFileSize;
    const amsAttachmentSizeLimit = isImage(contentType) ? AMSConstants.maxSupportedImageSize : AMSConstants.maxSupportedFileSize;
    // Takes the smallest max file size configure betteween AMS and Dynamics Config
    return maxFileSizeSupportedByDynamics < amsAttachmentSizeLimit ? maxFileSizeSupportedByDynamics : amsAttachmentSizeLimit;
};

const isImage = (contentType: string): boolean => {
    return AMSConstants.supportedImagesMimeTypes.includes(contentType);
};

const textEllipsis = (str: string, maxLength = 20): string => {
    const ellipsis = "...";
    return (str.length > maxLength) ? str.slice(0, maxLength - ellipsis.length) + ellipsis : str;
};

const buildErrorMessage = (fileName: string, supportedFileExtension: boolean, supportedFileSize: boolean, fileIsEmpty: boolean, maxUploadFileSize: string, maxFileSizeSupportedByDynamics: string, localizedTexts: ILiveChatWidgetLocalizedTexts): string => {
    let errorMessage = "";
    if (!fileName || !maxUploadFileSize) {
        TelemetryHelper.logActionEvent(LogLevel.ERROR, {
            Event: TelemetryEvent.AttachmentUploadValidatorMiddlewareFailed,
            Description: "Attachment validation failed",
            ExceptionDetails: { ErrorDetails: "File provided is null" }
        });
        return localizedTexts.MIDDLEWARE_BANNER_FILE_NULL_ERROR ?? "";
    }

    if (!supportedFileExtension && !supportedFileSize) {
        errorMessage = getFileSizeAndFileExtensionErrorMessage(fileName, maxUploadFileSize, maxFileSizeSupportedByDynamics, localizedTexts);
    } else if (!supportedFileSize) {
        errorMessage = getFileSizeErrorMessage(fileName, maxUploadFileSize, maxFileSizeSupportedByDynamics, localizedTexts);
    } else if (!supportedFileExtension) {
        errorMessage = getFileExtensionErrorMessage(fileName, localizedTexts);
    } else if (fileIsEmpty) {
        TelemetryHelper.logActionEvent(LogLevel.ERROR, {
            Event: TelemetryEvent.AttachmentUploadValidatorMiddlewareFailed,
            Description: "Attachment validation failed",
            ExceptionDetails: { ErrorDetails: "File provided is empty" }
        });
        errorMessage = localizedTexts.MIDDLEWARE_BANNER_FILE_IS_EMPTY_ERROR || "";
        if (errorMessage?.includes("{2}")) errorMessage = errorMessage.replace("{2}", textEllipsis(fileName));
    } else {
        TelemetryHelper.logActionEvent(LogLevel.ERROR, {
            Event: TelemetryEvent.AttachmentUploadValidatorMiddlewareFailed,
            Description: "Attachment validation failed",
            ExceptionDetails: { ErrorDetails: `Unexpected error: supportedFileExtension=${supportedFileExtension} supportedFileSize=${supportedFileSize} fileIsEmpty=${!fileIsEmpty}` }
        });
        errorMessage = localizedTexts.MIDDLEWARE_BANNER_ERROR_MESSAGE ?? "";
    }
    return errorMessage;
};

const getFileSizeAndFileExtensionErrorMessage = (fileName: string, maxUploadFileSize: string, maxFileSizeSupportedByDynamics: string, localizedTexts: ILiveChatWidgetLocalizedTexts): string => {
    const index = fileName.lastIndexOf(".");
    let errorMessage, exceptionDetails: string;
    if (index < 0) {
        errorMessage = localizedTexts.MIDDLEWARE_BANNER_FILE_SIZE_WITHOUT_EXTENSION_ERROR;
        exceptionDetails = `File exceeded the allowed limit of ${maxUploadFileSize} MB and File provided without file extension`;
    } else {
        const fileExtension = fileName.substring(index);
        errorMessage = localizedTexts.MIDDLEWARE_BANNER_FILE_SIZE_EXTENSION_ERROR;
        if (errorMessage?.includes("{1}")) errorMessage = errorMessage.replace("{1}", fileExtension);
        exceptionDetails = `File exceeds the allowed limit of ${maxUploadFileSize} MB and ${fileExtension} files are not supported`;
    }
    TelemetryHelper.logActionEvent(LogLevel.ERROR, {
        Event: TelemetryEvent.AttachmentUploadValidatorMiddlewareFailed,
        Description: "Attachment validation failed",
        ExceptionDetails: { ErrorDetails: `${exceptionDetails} Dynamics file size limit=${maxFileSizeSupportedByDynamics} AMS image size limit=${AMSConstants.maxSupportedImageSize} AMS file size limit=${AMSConstants.maxSupportedFileSize}` }
    });
    if (errorMessage?.includes("{0}")) errorMessage = errorMessage.replace("{0}", maxUploadFileSize);
    return errorMessage ? (errorMessage.includes("{2}") ? errorMessage.replace("{2}", textEllipsis(fileName)) : errorMessage) : "";
};

const getFileExtensionErrorMessage = (fileName: string, localizedTexts: ILiveChatWidgetLocalizedTexts): string => {
    const index = fileName.lastIndexOf(".");
    let errorMessage;
    if (index < 0) {
        TelemetryHelper.logActionEvent(LogLevel.ERROR, {
            Event: TelemetryEvent.AttachmentUploadValidatorMiddlewareFailed,
            Description: "Attachment validation failed",
            ExceptionDetails: { ErrorDetails: "File provided without file extension" }
        });
        errorMessage = localizedTexts.MIDDLEWARE_BANNER_FILE_WITHOUT_EXTENSION;
        return errorMessage ? (errorMessage.includes("{2}") ? errorMessage.replace("{2}", textEllipsis(fileName)) : errorMessage) : "";
    } else {
        const fileExtension = fileName.substring(index);
        TelemetryHelper.logActionEvent(LogLevel.ERROR, {
            Event: TelemetryEvent.AttachmentUploadValidatorMiddlewareFailed,
            Description: "Attachment validation failed",
            ExceptionDetails: { ErrorDetails: `${fileExtension} files extension is not supported.` }
        });
        errorMessage = localizedTexts.MIDDLEWARE_BANNER_FILE_EXTENSION_ERROR;
        if(errorMessage?.includes("{0}")) errorMessage = errorMessage.replace("{0}", fileExtension); //keeping backwards compatibility for this localized string
        if(errorMessage?.includes("{1}")) errorMessage = errorMessage.replace("{1}", fileExtension);
        return errorMessage && errorMessage.length>0 ? errorMessage : "";
    }
};

const getFileSizeErrorMessage = (fileName: string, maxUploadFileSize: string, maxFileSizeSupportedByDynamics: string, localizedTexts: ILiveChatWidgetLocalizedTexts): string => {
    TelemetryHelper.logActionEvent(LogLevel.ERROR, {
        Event: TelemetryEvent.AttachmentUploadValidatorMiddlewareFailed,
        Description: "Attachment validation failed",
        ExceptionDetails: { ErrorDetails: `File exceeds the allowed limit of ${maxUploadFileSize}MB. Dynamics file size limit=${maxFileSizeSupportedByDynamics} AMS image size limit=${AMSConstants.maxSupportedImageSize} AMS file size limit=${AMSConstants.maxSupportedFileSize}` }
    });
    let errorMessage = localizedTexts.MIDDLEWARE_BANNER_FILE_SIZE_ERROR;
    if (errorMessage?.includes("{0}")) errorMessage = errorMessage.replace("{0}", maxUploadFileSize);
    return errorMessage ? (errorMessage.includes("{2}") ? errorMessage.replace("{2}", textEllipsis(fileName)) : errorMessage) : "";
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
const createAttachmentUploadValidatorMiddleware = (allowedFileExtensions: string, maxFileSizeSupportedByDynamics: string, localizedTexts: ILiveChatWidgetLocalizedTexts) => ({ dispatch }: { dispatch: any }) => (next: any) => (action: IWebChatAction) => {
    if (action.type === WebChatActionType.DIRECT_LINE_POST_ACTIVITY) {
        const {
            payload
        } = action;

        if (payload?.activity?.attachments && payload?.activity?.channelData?.attachmentSizes &&
            payload?.activity?.attachments?.length === payload?.activity?.channelData?.attachmentSizes?.length) {
            return next(validateAttachment(action, allowedFileExtensions, maxFileSizeSupportedByDynamics, localizedTexts));
        }
    }
    return next(action);
};

export default createAttachmentUploadValidatorMiddleware;