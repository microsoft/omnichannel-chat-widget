import { NotificationHandler } from "../../webchatcontainerstateful/webchatcontroller/notification/NotificationHandler";
import { NotificationLevel } from "../../webchatcontainerstateful/webchatcontroller/enums/NotificationLevel";
import { NotificationScenarios } from "../../webchatcontainerstateful/webchatcontroller/enums/NotificationScenarios";
import { defaultMiddlewareLocalizedTexts } from "../../webchatcontainerstateful/common/defaultProps/defaultMiddlewareLocalizedTexts";
import { ChatAdapterShim } from "./ChatAdapterShim";
import { PauseActivitySubscriber } from "./ActivitySubscriber/PauseActivitySubscriber";
import { BotAuthActivitySubscriber } from "./ActivitySubscriber/BotAuthActivitySubscriber";
import { HiddenAdaptiveCardActivitySubscriber } from "./ActivitySubscriber/HiddenAdaptiveCardActivitySubscriber";

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
        },
        ACSAdapter: {
            fileScan: {
                disabled: false
            }
        }
    };
    let adapter = await chatSDK.createChatAdapter(chatAdapterOptionalParams);
    //so far, there is no need to convert to the shim adapter when using visual tests
    if (chatSDK.isMockModeOn !== true) {
        adapter = new ChatAdapterShim(adapter);
        adapter.addSubscriber(new PauseActivitySubscriber());
        adapter.addSubscriber(new BotAuthActivitySubscriber());
        // Remove this code after https://portal.microsofticm.com/imp/v5/incidents/details/544623085/summary is fixed
        adapter.addSubscriber(new HiddenAdaptiveCardActivitySubscriber());
        return adapter.chatAdapter;
    }
    return adapter;
};
