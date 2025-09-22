import { IStyle } from "@fluentui/react";

export interface IPersistentChatHistoryProps {
        persistentChatHistoryEnabled?: boolean;
        pageSize?: number;
        dividerActivityStyle?: IStyle;
        bannerStyle?: IStyle;
}