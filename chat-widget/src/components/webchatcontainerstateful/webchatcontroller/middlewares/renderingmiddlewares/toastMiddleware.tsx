import React from "react";
import { NotificationScenarios } from "../../enums/NotificationScenarios";
import { INotificationPaneProps } from "@microsoft/omnichannel-chat-components/lib/types/components/notificationpane/interfaces/INotificationPaneProps";
import NotificationPaneStateful from "../../../../notificationpanestateful/NotificationPaneStateful";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createToastMiddleware = (notificationPaneProps: INotificationPaneProps | undefined, endChat: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, react/display-name
    const toastMiddleware = () => (next: any) => (card: any) => {
        console.log("ADAD toastMiddleware");
        const {notification} = card;
        console.log(notification);

        if (notification.id === NotificationScenarios.ChatDisconnect) {
            return <NotificationPaneStateful notificationPaneProps={notificationPaneProps} notificationScenarioType={NotificationScenarios.ChatDisconnect} endChat={endChat} />;
        }

        // if (notification.id === NotificationScenarios.AttachmentError) {
        //     return <NotificationPaneStateful notificationBannerProps={notificationBannerProps} notificationScenarioType={NotificationScenarios.AttachmentError} />;
        // }

        // ...additional notification scenarios to be added

        return next(card);
    };

    return toastMiddleware;
};

export default createToastMiddleware;