import { Dispatch } from "react";
import { ILiveChatWidgetAction } from "../../../../../contexts/common/ILiveChatWidgetAction";
import { LiveChatWidgetActionType } from "../../../../../contexts/common/LiveChatWidgetActionType";
import { IBotMagicCodeFeatureConfig } from "../../../../livechatwidget/interfaces/IFeatureConfig";

enum CardActionType {
    OpenUrl = "openUrl",
    SignIn = "signin"
}

const validCardActionTypes = [CardActionType.OpenUrl, CardActionType.SignIn];
const botOauthUrlRegex = /[\S]+.botframework.com\/api\/oauth\/signin\?signin=([\S]+)/;

export const createCardActionMiddleware = (botMagicCodeConfig: IBotMagicCodeFeatureConfig | undefined, dispatch: Dispatch<ILiveChatWidgetAction>) => {
    const cardActionMiddleware = () => (next: any) => (...args: any) => {
        const [card] = args;
        
        if (card.cardAction && validCardActionTypes.indexOf(card.cardAction.type) >= 0 && card.cardAction.value) {

            // Override signin url only if fwdUrl is valid & feature is enabled
            if (botMagicCodeConfig?.disabled === true && botMagicCodeConfig?.fwdUrl) {
                const baseUrl = window.location.origin;
                const result = botOauthUrlRegex.exec(card.cardAction.value);

                if (result) {
                    dispatch({type: LiveChatWidgetActionType.SET_BOT_OAUTH_SIGNIN_ID, payload: `${result[1]}`});
                }

                // fwdUrl must be on the same domain as the chat widget
                if (botMagicCodeConfig?.fwdUrl.startsWith(baseUrl)) {
                    card.cardAction.value += `&fwdUrl=${botMagicCodeConfig.fwdUrl}`;
                }
            }
        }

        return next(...args);
    };

    return cardActionMiddleware;
};