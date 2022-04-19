/******
 * AttachmentUploadValidatorMiddleware
 * 
 * Checks if the attachment being uploaded satisfies Omnichannel's requirement on file extensions and file size.
 ******/

import { IWebChatAction } from "../../../interfaces/IWebChatAction";
import { NotificationHandler } from "../../notification/NotificationHandler";
import { NotificationScenarios } from "../../enums/NotificationScenarios";
import { WebChatActionType } from "../../enums/WebChatActionType";
import { ILiveChatWidgetLocalizedTexts } from "../../../../../contexts/common/ILiveChatWidgetLocalizedTexts";

const MBtoBRatio = 1000000;

/*
* If an attachment is invalid, delete this attachment from the attachments list
* If the result attachment list is empty, return a dummy action
*/
const validateAttachment = (action: IWebChatAction, allowedFileExtensions: string, maxUploadFileSize: string, localizedTexts: ILiveChatWidgetLocalizedTexts): IWebChatAction => {
    const attachments = action?.payload?.activity?.attachments;
    const attachmentSizes = action?.payload?.activity?.channelData?.attachmentSizes;
    if (attachments) {
        for (let i = 0; i < attachments.length; i++) {
            const fileExtensionValid = validateFileExtension(attachments[i], allowedFileExtensions);
            const fileSizeValid = validateFileSize(attachmentSizes[i], maxUploadFileSize);
            const fileIsEmpty = parseInt(attachmentSizes[i]) == 0;
            if (!fileExtensionValid || !fileSizeValid || fileIsEmpty) {
                NotificationHandler.notifyError(NotificationScenarios.AttachmentError, buildErrorMessage(attachments[i].name, fileExtensionValid, fileSizeValid, fileIsEmpty, maxUploadFileSize, localizedTexts));
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

const validateFileSize = (attachmentSize: string, maxUploadFileSize: string): boolean => {
    return (maxUploadFileSize && parseInt(maxUploadFileSize) * MBtoBRatio) > parseInt(attachmentSize);
};

const buildErrorMessage = (fileName: string, supportedFileExtension: boolean, supportedFileSize: boolean, fileIsEmpty: boolean, maxUploadFileSize: string, localizedTexts: ILiveChatWidgetLocalizedTexts): string => {
    let errorMessage = "";
    if (!fileName || !maxUploadFileSize) {
        return localizedTexts.MIDDLEWARE_BANNER_FILE_NULL_ERROR ?? "";
    }

    if (!supportedFileExtension && !supportedFileSize) {
        errorMessage = getFileSizeAndFileExtensionErrorMessage(fileName, maxUploadFileSize, localizedTexts);
    } else if (!supportedFileSize) {
        errorMessage = getFileSizeErrorMessage(maxUploadFileSize, localizedTexts);
    } else if (!supportedFileExtension) {
        errorMessage = getFileExtensionErrorMessage(fileName, localizedTexts);
    } else if (fileIsEmpty) {
        errorMessage = localizedTexts.MIDDLEWARE_BANNER_FILE_IS_EMPTY_ERROR ?? "";
    } else {
        errorMessage = localizedTexts.MIDDLEWARE_BANNER_ERROR_MESSAGE ?? "";
    }
    return errorMessage;
};

const getFileSizeAndFileExtensionErrorMessage = (fileName: string, maxUploadFileSize: string, localizedTexts: ILiveChatWidgetLocalizedTexts): string => {
    const index = fileName.lastIndexOf(".");
    let errorMessage;
    if (index < 0) {
        errorMessage = localizedTexts.MIDDLEWARE_BANNER_FILE_SIZE_WITHOUT_EXTENSION_ERROR;
    } else {
        const fileExtension = fileName.substring(index);
        errorMessage = localizedTexts.MIDDLEWARE_BANNER_FILE_SIZE_EXTENSION_ERROR;
        if (errorMessage?.includes("{1}")) {
            errorMessage = errorMessage.replace("{1}", fileExtension);
        }
    }

    return errorMessage ? (errorMessage.includes("{0}") ? errorMessage.replace("{0}", maxUploadFileSize) : errorMessage) : "";
};

const getFileExtensionErrorMessage = (fileName: string, localizedTexts: ILiveChatWidgetLocalizedTexts): string => {
    const index = fileName.lastIndexOf(".");
    if (index < 0) {
        return localizedTexts.MIDDLEWARE_BANNER_FILE_WITHOUT_EXTENSION ?? "";
    } else {
        const fileExtension = fileName.substring(index);
        const errorMessage = localizedTexts.MIDDLEWARE_BANNER_FILE_EXTENSION_ERROR;
        return errorMessage ? (errorMessage.includes("{0}") ? errorMessage.replace("{0}", fileExtension) : errorMessage) : "";
    }
};

const getFileSizeErrorMessage = (maxUploadFileSize: string, localizedTexts: ILiveChatWidgetLocalizedTexts): string => {
    const errorMessage = localizedTexts.MIDDLEWARE_BANNER_FILE_SIZE_ERROR;
    return errorMessage ? (errorMessage.includes("{0}") ? errorMessage.replace("{0}", maxUploadFileSize) : errorMessage) : "";
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
const createAttachmentUploadValidatorMiddleware = (allowedFileExtensions: string, maxUploadFileSize: string, localizedTexts: ILiveChatWidgetLocalizedTexts) => ({ dispatch }: { dispatch: any }) => (next: any) => (action: IWebChatAction) => {
    if (action.type === WebChatActionType.DIRECT_LINE_POST_ACTIVITY) {
        const {
            payload
        } = action;

        if (payload?.activity?.attachments && payload?.activity?.channelData?.attachmentSizes &&
            payload?.activity?.attachments?.length === payload?.activity?.channelData?.attachmentSizes?.length) {
            return next(validateAttachment(action, allowedFileExtensions, maxUploadFileSize, localizedTexts));
        }
    }
    return next(action);
};

export default createAttachmentUploadValidatorMiddleware;