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
    }
}
