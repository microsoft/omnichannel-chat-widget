export interface ILiveChatWidgetLocalizedTexts {

    /*
     * Error message shown when the file uploaded is null.
     */
    MIDDLEWARE_BANNER_FILE_NULL_ERROR?: string;

    /*
     * Error message shown when the file uploaded exceeds size limit and has no extension.
     * Variable replacement (This is optional. If {0} is not given, the whole string will be used and variable replacement will be skipped. Same below.):
     * {0} - File size max limit
     * e.g. "File exceeds the allowed limit of {0} MB and please upload the file with an appropriate file extension."
     */
    MIDDLEWARE_BANNER_FILE_SIZE_WITHOUT_EXTENSION_ERROR?: string;

    /*
     * Error message shown when the file uploaded exceeds size limit and has an invalid extension.
     * Variable replacement (optional):
     * {0} - File size max limit
     * {1} - The invalid extension
     * e.g. "File exceeds the allowed limit of {0} MB and {1} files are not supported."
     */
    MIDDLEWARE_BANNER_FILE_SIZE_EXTENSION_ERROR?: string;

    /*
     * Error message shown when the file uploaded has no extension.
     */
    MIDDLEWARE_BANNER_FILE_WITHOUT_EXTENSION?: string;

    /*
     * Error message shown when the file uploaded has an invalid extension.
     * Variable replacement (optional):
     * {0} - The invalid extension
     * e.g. "{0} files are not supported."
     */
    MIDDLEWARE_BANNER_FILE_EXTENSION_ERROR?: string;

    /*
     * Error message shown when the file uploaded exceeds size limit.
     * Variable replacement (optional):
     * {0} - File size max limit
     * e.g. "File exceeds the allowed limit of {0} MB."
     */
    MIDDLEWARE_BANNER_FILE_SIZE_ERROR?: string;

    /*
     * Error message shown when the file uploaded is empty.
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
}