import { NotificationHandler } from "../../webchatcontainerstateful/webchatcontroller/notification/NotificationHandler";
import { NotificationLevel } from "../../webchatcontainerstateful/webchatcontroller/enums/NotificationLevel";
import { NotificationScenarios } from "../../webchatcontainerstateful/webchatcontroller/enums/NotificationScenarios";
import { defaultMiddlewareLocalizedTexts } from "../../webchatcontainerstateful/common/defaultProps/defaultMiddlewareLocalizedTexts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createAdapter = async (chatSDK: any) => {
    const chatAdapterOptionalParams = {
        IC3Adapter: {
            options: {
                callbackOnNotification: (notification: { id: string; level: NotificationLevel; message: string; }) => {
                    if (notification.id === NotificationScenarios.InternetConnection && notification.level == NotificationLevel.Error) {
                        notification.message = defaultMiddlewareLocalizedTexts.MIDDLEWARE_BANNER_NO_INTERNET_CONNECTION as string;
                    }

                    if (notification.id === NotificationScenarios.InternetConnection && notification.level == NotificationLevel.Success) {
                        notification.message = defaultMiddlewareLocalizedTexts.MIDDLEWARE_BANNER_INTERNET_BACK_ONLINE as string;
                    }

                    if (notification.id && notification.message) {
                        NotificationHandler.notifyWithLevel(notification.id, notification.message, notification.level);
                    }
                }
            }
        }
    };
    return await chatSDK.createChatAdapter(chatAdapterOptionalParams);
};