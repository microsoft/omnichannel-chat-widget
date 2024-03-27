import { ILiveChatWidgetLocalizedTexts } from "../../../../contexts/common/ILiveChatWidgetLocalizedTexts";

/*
MIDDLEWARE_BANNER_FILE parameters:
{0} = File limit size
{1} = File extension
{2} = File name
*/

export const defaultMiddlewareLocalizedTexts: ILiveChatWidgetLocalizedTexts = {
    MIDDLEWARE_BANNER_FILE_NULL_ERROR: "There was an error uploading the file, please try again.",
    MIDDLEWARE_BANNER_FILE_SIZE_WITHOUT_EXTENSION_ERROR: "File {2} exceeds the allowed limit of {0} MB and please upload the file with an appropriate file extension.",
    MIDDLEWARE_BANNER_FILE_SIZE_EXTENSION_ERROR: "File {2} exceeds the allowed limit of {0} MB and {1} files are not supported.",
    MIDDLEWARE_BANNER_FILE_WITHOUT_EXTENSION: "File upload error. Please upload the file {2} with an appropriate file extension.",
    MIDDLEWARE_BANNER_FILE_EXTENSION_ERROR: "{1} files are not supported.",
    MIDDLEWARE_BANNER_FILE_SIZE_ERROR: "File {2} exceeds the allowed limit of {0} MB.",
    MIDDLEWARE_BANNER_FILE_IS_EMPTY_ERROR: "This file {2} can't be attached because it's empty. Please try again with a different file.",
    MIDDLEWARE_BANNER_ERROR_MESSAGE: "Upload failed, please try again.",
    MIDDLEWARE_BANNER_INTERNET_BACK_ONLINE: "You’re back online.",
    MIDDLEWARE_BANNER_NO_INTERNET_CONNECTION: "Unable to connect—please check your internet connection.",
    MIDDLEWARE_MAX_CHARACTER_COUNT_EXCEEDED: "This message is too long. Please shorten your message to avoid sending failure.",
    MIDDLEWARE_TYPING_INDICATOR_ONE: "{0} is typing ...",
    MIDDLEWARE_TYPING_INDICATOR_TWO: "{0} and {1} are typing ...",
    MIDDLEWARE_TYPING_INDICATOR_MULTIPLE: "{0} agents are typing ...",
    MIDDLEWARE_MESSAGE_SENDING: "Sending ...",
    MIDDLEWARE_MESSAGE_DELIVERED: "Sent",
    MIDDLEWARE_MESSAGE_NOT_DELIVERED: "Not Delivered",
    MIDDLEWARE_MESSAGE_RETRY: "Retry",
    MIDDLEWARE_BANNER_CHAT_DISCONNECT: "Your conversation has been disconnected. For additional assistance, please start a new chat.",
    THIRD_PARTY_COOKIES_BLOCKED_ALERT_MESSAGE: "Allow sites to save/read cookies in browser settings. Reloading page starts a new chat.",
    MIDDLEWARE_BANNER_FILE_IS_MALICIOUS: "{0} has been blocked because the file may contain a malware.",
    MIDDLEWARE_BANNER_FILE_EMAIL_ADDRESS_RECORDED_SUCCESS: "Email will be sent after chat ends!",
    MIDDLEWARE_BANNER_FILE_EMAIL_ADDRESS_RECORDED_ERROR: "Email {0} could not be saved, try again later."    
};