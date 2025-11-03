import { IStyle } from "@fluentui/react";

export interface IPersistentChatHistoryProps {
        pageSize?: number;
        dividerActivityStyle?: IStyle;
        /**
         * Accessible label announced by screen readers for the conversation divider element.
         * If not supplied, a default provided in defaultPersistentChatHistoryProps will be used.
         */
        dividerActivityAriaLabel?: string;
        bannerStyle?: IStyle;
}