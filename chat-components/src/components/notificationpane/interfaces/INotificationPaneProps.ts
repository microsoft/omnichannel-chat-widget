import { IChatDisconnectNotificationProps } from "./chatdisconnect/IChatDisconnectNotificationProps";

/**
 * This interface acts as the entry point to the notification pane.
 * It will have all the scenarios based props which will get processed in stateful
 */
export interface INotificationPaneProps {
    chatDisconnectNotificationProps?: IChatDisconnectNotificationProps;
    
    // ...other notification scenarios to be added
}