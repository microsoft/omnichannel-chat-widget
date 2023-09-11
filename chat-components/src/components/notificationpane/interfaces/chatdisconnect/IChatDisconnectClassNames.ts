import { INotificationPaneClassNames } from "../common/INotificationPaneClassNames";

/**
 * This interface will have all the class name properties as customized by C1 for chat disconnect scenario
 * It extends the common class names properties <INotificationPaneClassNames>
 */
export interface IChatDisconnectClassNames extends INotificationPaneClassNames {
    closeChatButtonClassName?: string;
}