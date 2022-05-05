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
        HTML element: The element that the control will return to after a popup/modal is closed
    */
    SET_PREVIOUS_FOCUSED_ELEMENT,

    /*
        Parameters:
        - true: When the chat starts successfully
        - false: When the chat ends or crashes unexpectedly
    */
    SET_OUTSIDE_OPERATING_HOURS,
    
    /*
        Parameters:
        string: The PreChat Survey JSON payload in string format
    */    
    SET_PRE_CHAT_SURVEY_RESPONSE,

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
        boolean: Is set all conditions are met to show post chat
    */
    SET_SHOULD_SHOW_POST_CHAT,

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
        true/false: Decides whether to skip the chat button rendering
    */
    SET_SKIP_CHAT_BUTTON_RENDERING,
    
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
        number: Set to true, when the agent ends the conversation
    */
    SET_CONVERSATION_ENDED_BY_AGENT
}