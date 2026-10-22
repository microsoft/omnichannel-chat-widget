export interface ISendBox {
    /**
     * Target the textarea element in the send box
     */
    textarea?: {
        /**
         * Customer can increase minHeight as a work-around to avoid bug when some languages (like Arabic, Chinese,
         * Hebrew, etc) will show a scrollbar in the textarea element when placeholder is visible
         */
        minHeight?: string;
    };
    /**
     * When true, pressing Enter inserts a new line and Shift+Enter sends the message.
     * Default WebChat behavior is Enter to send and Shift+Enter to insert a new line.
     * Only effective when sendBoxTextWrap is true in webChatStyles.
     */
    enterToNewLine?: boolean;
}
