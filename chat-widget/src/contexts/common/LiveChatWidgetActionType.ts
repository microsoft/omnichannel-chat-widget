export enum LiveChatWidgetActionType {
    /*
        Parameters:
        - true: When the minimize button is clicked 
        - false: When the chat button is clicked after the chat is minimized (not closed)
    */
    SET_WIDGET_ELEMENT_ID,

    /*
        Parameters:
        - props: The rendering middleware props 
    */
    SET_RENDERING_MIDDLEWARE_PROPS,

    /*
        Parameters:
        - props: The localized middlware texts 
    */
    SET_MIDDLEWARE_LOCALIZED_TEXTS,

    /*
        Parameters:
        - dir: The global direction prop that will apply to each component if noit specified
    */
    SET_GLOBAL_DIR,

    /*
        Parameters:
        - true: When the minimize button is clicked 
        - false: When the chat button is clicked after the chat is minimized (not closed)
    */
    SET_MINIMIZED,

    /*
        Parameters:
        ConversationState enum : Enum that controls different Conversation behaviour
    */
    SET_CONVERSATION_STATE,

    /*
        Parameters:
        string or null: The element id that the control will return to after a popup/modal is closed
    */
    SET_PREVIOUS_FOCUSED_ELEMENT_ID,

    /*
        Parameters:
        - true: When chat is failing to start
        - false: When chat is functioning normally
    */
    SET_START_CHAT_FAILING,

    /*
        Parameters:
        - string: The start chat failure type
    */
    SET_START_CHAT_FAILURE_TYPE,

    /*
        Parameters:
        - true: When chat is outside operating hours
        - false: When chat is not outside operatin hours
    */
    SET_OUTSIDE_OPERATING_HOURS,

    /*
        Parameters:
        string: The PreChat Survey JSON payload in string format
    */
    SET_PRE_CHAT_SURVEY_RESPONSE,

    /*
        Parameters:
        string: The custom context in json format
    */
    SET_CUSTOM_CONTEXT,

    /*
        Parameters:
        - true: When close chat button is clicked
        - false: when clicked on Confirm button on confirmation pane
    */
    SET_SHOW_CONFIRMATION,

    /*
        Parameters:
        - true: When Email Transcript button is clicked
        - false: when Done button clicked on Email Transcript pane
    */
    SET_SHOW_EMAIL_TRANSCRIPT_PANE,

    /*
        Parameters:
        string: Email id from prechat survey pane(if available)
    */
    SET_PRECHAT_RESPONSE_EMAIL,

    /*
        Parameters:
        true: When audio notification on
        null: During initialization
        false: When audio notification off
    */
    SET_AUDIO_NOTIFICATION,

    /*
        Parameters:
        true: If voice and video calling is enabled 
        false: Incase of disabled
    */
    SET_E2VV_ENABLED,

    /*
        Parameters:
        any: Contains the Post Chat Context information if set
    */
    SET_POST_CHAT_CONTEXT,

    /*
        Parameters:
        true: When call is initiated from from an agent
        false: To hide the calling container
    */
    SHOW_CALLING_CONTAINER,

    /*
        Parameters:
        true: To show the incoming call container
        false: When call is accepted or rejected
    */
    SET_INCOMING_CALL,

    /*
        Parameters:
        true: When both local and remote video are disabled to hide video calling container
        false: If any of remote or local video is enabled to Show video calling container
    */
    DISABLE_VIDEO_CALL,

    /*
        Parameters:
        true/false: Local video toggle
    */
    DISABLE_LOCAL_VIDEO,

    /*
        Parameters:
        true/false: remote video toggle
    */
    DISABLE_REMOTE_VIDEO,

    /*
        Parameters:
        any: Contains the chat token data
    */
    SET_CHAT_TOKEN,

    /*
        Parameters:
        true/false: Decides whether to show the start chat button
    */
    SET_START_CHAT_BUTTON_DISPLAY,

    /*
        Parameters:
        any: Proactive chat parameter when proactive chat starts
    */
    SET_PROACTIVE_CHAT_PARAMS,

    /*
        Parameters:
        IInternalTelemetryData: Sets internal telemetry data for telemetry logging
    */
    SET_TELEMETRY_DATA,

    /*
        Parameters:
        string: Reconnect Id for chat reconnect
    */
    SET_RECONNECT_ID,

    /*
        Parameters:
        number: Keeps track of unread message count on chat minimize
    */
    SET_UNREAD_MESSAGE_COUNT,

    /*
        Parameters:
        number: Toggle focus on chat button
    */
    SET_FOCUS_CHAT_BUTTON,

    /*
        Parameters:
        any: Set conversation ended by agent state
    */
    SET_CONVERSATION_ENDED_BY_AGENT_EVENT_RECEIVED,

    /*
        Parameters:
        any: Set conversation ended entity
    */
    SET_CONVERSATION_ENDED_BY,

    /*
        Parameters:
        any: Set widget state from cache
    */
    SET_WIDGET_STATE,

    /*
        Parameters:
        any: Set live chat context
    */
    SET_LIVE_CHAT_CONTEXT,

    /*
        string: SignIn ID for authentication
    */
    SET_BOT_OAUTH_SIGNIN_ID,

    /*
        Parameters:
        any: Set height and width of Widget
    */
    SET_WIDGET_SIZE,

    /*
        Parameters:
        any: Set widget instance id
    */
    SET_WIDGET_INSTANCE_ID,

    /*
        Parameters:
        any: Set live chat config
    */
    SET_LIVE_CHAT_CONFIG,

    /*
        Parameters:
        true/false: Checks if Postchat workflow is already initiated
    */
    SET_POST_CHAT_WORKFLOW_IN_PROGRESS,

    /*
        Parameters:
        any: Set initial chat sdk request id (for reconnect scenario when start new chat is deferred)
    */
    SET_INITIAL_CHAT_SDK_REQUEST_ID,

    /*
        Parameters:
        true/false: To check if bot configured survey needs to be used
    */
    SET_SHOULD_USE_BOT_SURVEY,

    /*
        Parameters:
        any: Set customer disconnect
    */
    SET_CHAT_DISCONNECT_EVENT_RECEIVED,

    /*
        Parameters:
        any: Set selected survey mode
    */
    SET_SURVEY_MODE,

    /*
        Parameters:
        ConfirmationState: Set confirmation state(OK/Cancel/NotSet)
    */
    SET_CONFIRMATION_STATE,

    /*
        Parameters:
        ParticipantType: Set participant type when rendering post chat survey
    */
    SET_POST_CHAT_PARTICIPANT_TYPE,

    /*
        Parameters:
        null payload, simply returns the existing inMemory state
    */
    GET_IN_MEMORY_STATE,
}