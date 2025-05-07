import { BotAuthActivitySubscriber } from "./ActivitySubscriber/BotAuthActivitySubscriber";
import { ChatAdapterShim } from "./ChatAdapterShim";
import { FacadeChatSDK } from "../../../common/facades/FacadeChatSDK";
import { HiddenAdaptiveCardActivitySubscriber } from "./ActivitySubscriber/HiddenAdaptiveCardActivitySubscriber";
import { ILiveChatWidgetProps } from "../interfaces/ILiveChatWidgetProps";
import { MockChatSDK } from "../../webchatcontainerstateful/common/mockchatsdk";
import { NotificationHandler } from "../../webchatcontainerstateful/webchatcontroller/notification/NotificationHandler";
import { NotificationLevel } from "../../webchatcontainerstateful/webchatcontroller/enums/NotificationLevel";
import { NotificationScenarios } from "../../webchatcontainerstateful/webchatcontroller/enums/NotificationScenarios";
import { PauseActivitySubscriber } from "./ActivitySubscriber/PauseActivitySubscriber";
import { defaultMiddlewareLocalizedTexts } from "../../webchatcontainerstateful/common/defaultProps/defaultMiddlewareLocalizedTexts";

const defaultBotAuthConfig = {
    fetchBotAuthConfigRetries: 3,
    fetchBotAuthConfigRetryInterval: 1000
};

export const createAdapter = async (facadeChatSDK: FacadeChatSDK, props?: ILiveChatWidgetProps) => {
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
    let adapter = await facadeChatSDK.createChatAdapter(chatAdapterOptionalParams);
    //so far, there is no need to convert to the shim adapter when using visual tests
    const isMocked = facadeChatSDK.getChatSDK() instanceof MockChatSDK;

    if (isMocked !== true ) {

        const botAuthActivitySubscriberOptionalParams = {
            fetchBotAuthConfigRetries: props?.webChatContainerProps?.botAuthConfig?.fetchBotAuthConfigRetries || defaultBotAuthConfig.fetchBotAuthConfigRetries,
            fetchBotAuthConfigRetryInterval: props?.webChatContainerProps?.botAuthConfig?.fetchBotAuthConfigRetryInterval || defaultBotAuthConfig.fetchBotAuthConfigRetryInterval
        };

        adapter = new ChatAdapterShim(adapter);
        adapter.addSubscriber(new PauseActivitySubscriber());
        adapter.addSubscriber(new BotAuthActivitySubscriber(botAuthActivitySubscriberOptionalParams));
        // Remove this code after ICM ID:544623085 is fixed
        adapter.addSubscriber(new HiddenAdaptiveCardActivitySubscriber());
        return adapter.chatAdapter;
    }
    return adapter;
};
