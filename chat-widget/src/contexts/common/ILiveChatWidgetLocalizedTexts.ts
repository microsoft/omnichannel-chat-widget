export interface ILiveChatWidgetLocalizedTexts {

    /*
     * Error message shown when the file uploaded is null.
     */
    MIDDLEWARE_BANNER_FILE_NULL_ERROR?: string;

    /*
     * Error message shown when the file uploaded exceeds size limit and has no extension.
     * Variable replacement:
     * {0} - File size max limit
     * {2} - File name
     * e.g. "File {2} exceeds the allowed limit of {0} MB and please upload the file with an appropriate file extension."
     */
    MIDDLEWARE_BANNER_FILE_SIZE_WITHOUT_EXTENSION_ERROR?: string;

    /*
     * Error message shown when the file uploaded exceeds size limit and has an invalid extension.
     * Variable replacement (optional):
     * {0} - File size max limit
     * {1} - The invalid extension
     * {2} - File name
     * e.g. "File {2} exceeds the allowed limit of {0} MB and {1} files are not supported."
     */
    MIDDLEWARE_BANNER_FILE_SIZE_EXTENSION_ERROR?: string;

    /*
     * Error message shown when the file uploaded has no extension.
     * Variable replacement:
     * {2} - File name
     * e.g. "File upload error. Please upload the file {2} with an appropriate file extension."
     */
    MIDDLEWARE_BANNER_FILE_WITHOUT_EXTENSION?: string;

    /*
     * Error message shown when the file uploaded has an invalid extension.
     * Variable replacement:
     * {1} - The invalid extension
     * e.g. "{1} files are not supported."
     */
    MIDDLEWARE_BANNER_FILE_EXTENSION_ERROR?: string;

    /*
     * Error message shown when the file uploaded exceeds size limit.
     * Variable replacement:
     * {0} - File size max limit
     * {2} - File name
     * e.g. "File {2} exceeds the allowed limit of {0} MB."
     */
    MIDDLEWARE_BANNER_FILE_SIZE_ERROR?: string;

    /*
     * Error message shown when the file uploaded is empty.
     * Variable replacement:
     * {2} - File name
     * e.g. "This file {2} can't be attached because it's empty. Please try again with a different file."
     */
    MIDDLEWARE_BANNER_FILE_IS_EMPTY_ERROR?: string;

    /*
     * Error message shown on general file upload errors.
     */
    MIDDLEWARE_BANNER_ERROR_MESSAGE?: string;

    /*
     * Internet connection back online message.
     */
    MIDDLEWARE_BANNER_INTERNET_BACK_ONLINE?: string;

    /*
     * Error message shown when internet connection is offline.
     */
    MIDDLEWARE_BANNER_NO_INTERNET_CONNECTION?: string;

    /*
     * Error message shown when the send box text length exceeds the limit by 1 character.
     * Variable replacement (optional):
     * e.g. "This message is too long. Please shorten your message to avoid sending failure."
     */
    MIDDLEWARE_MAX_CHARACTER_COUNT_EXCEEDED?: string;

    /*
     * Typing indicator message when there's one person actively typing.
     * Variable replacement (optional):
     * {0} - Actively typing participant name
     * e.g. "{0} is typing ..."
     */
    MIDDLEWARE_TYPING_INDICATOR_ONE?: string;

    /*
     * Typing indicator message when there are two people actively typing.
     * Variable replacement (optional):
     * {0} - Actively typing participant 1 name
     * {1} - Actively typing participant 2 name
     * e.g. "{0} and {1} are typing ..."
     */
    MIDDLEWARE_TYPING_INDICATOR_TWO?: string;

    /*
     * Typing indicator message when there are more than two people actively typing.
     * Variable replacement (optional):
     * {0} - Number of actively typing participants
     * e.g. "{0} agents are typing ..."
     */
    MIDDLEWARE_TYPING_INDICATOR_MULTIPLE?: string;

    /*
     * Send status message for sending messages.
     */
    MIDDLEWARE_MESSAGE_SENDING?: string;

    /*
     * Send status message for sent messages.
     */
    MIDDLEWARE_MESSAGE_DELIVERED?: string;

    /*
     * Send status message for messages that fail to send.
     */
    MIDDLEWARE_MESSAGE_NOT_DELIVERED?: string;

    /*
     * Send status message action for retrying failed-to-send messages.
     */
    MIDDLEWARE_MESSAGE_RETRY?: string;

    /*
     * The alert text when a required field in the pre-chat survey is not filled.
     * Variable replacement (optional):
     * {0} - The required field name that's missing
     * e.g. "{0} field is required"
     */
    PRECHAT_REQUIRED_FIELD_MISSING_MESSAGE?: string;

    /*
     * Markdown Text for URL opening in a new window
     */
    MARKDOWN_EXTERNAL_LINK_ALT?: string;

    /*
     * Chat disconnect message.
     */
    MIDDLEWARE_BANNER_CHAT_DISCONNECT?: string;

    /*
     * Warning message when third party cookies are blocked.
     */
    THIRD_PARTY_COOKIES_BLOCKED_ALERT_MESSAGE?: string;

    /**
     * Error message shown when the file is malicious
     * Variable replacement:
     * {0} - File name
     * e.g. "{0} has been blocked because the file may contain a malware."
     */
    MIDDLEWARE_BANNER_FILE_IS_MALICIOUS?: string;

    /**
     * Success message, indicating the email address introduced has been registered to receive the transcript.
     */
    MIDDLEWARE_BANNER_FILE_EMAIL_ADDRESS_RECORDED_SUCCESS?: string;

    /**
     * Error message, indicating the email address introduced couldnt be registered.
     * {0} - e-mail address introduced
     */
    MIDDLEWARE_BANNER_FILE_EMAIL_ADDRESS_RECORDED_ERROR?: string;
}