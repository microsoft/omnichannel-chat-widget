import { IStyle } from "@fluentui/react";
import { INotificationPaneStyleProps } from "../common/INotificationPaneStyleProps";
import { IChatDisconnectClassNames } from "./IChatDisconnectClassNames";

/**
 * This interface will have all the style properties as customized by C1 for chat disconnect scenario
 * It extends the common style properties <INotificationPaneStyleProps>
 */
export interface IChatDisconnectStyleProps extends INotificationPaneStyleProps {
    closeChatButtonStyleProps?: IStyle;
    closeChatButtonHoverStyleProps?: IStyle;

    buttonGroupStyleProps?: IStyle;

    classNames?: IChatDisconnectClassNames;
}