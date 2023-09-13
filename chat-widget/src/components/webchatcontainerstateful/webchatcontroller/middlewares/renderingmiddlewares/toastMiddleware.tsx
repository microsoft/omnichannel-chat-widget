import React from "react";
import { NotificationScenarios } from "../../enums/NotificationScenarios";
import { INotificationPaneProps } from "@microsoft/omnichannel-chat-components/lib/types/components/notificationpane/interfaces/INotificationPaneProps";
import NotificationPaneStateful from "../../../../notificationpanestateful/NotificationPaneStateful";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createToastMiddleware = (notificationPaneProps: INotificationPaneProps | undefined, endChat: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, react/display-name
    const toastMiddleware = () => (next: any) => (card: any) => {
        const {notification} = card;
        
        if (notificationPaneProps) {
            if (notification.id === NotificationScenarios.ChatDisconnect) {
                return <NotificationPaneStateful notificationPaneProps={notificationPaneProps} notificationScenarioType={NotificationScenarios.ChatDisconnect} endChat={endChat} />;
            }
    
            // TODO: additional notification scenarios to be added...
        }
        
        return next(card);
    };

    return toastMiddleware;
};

export default createToastMiddleware;