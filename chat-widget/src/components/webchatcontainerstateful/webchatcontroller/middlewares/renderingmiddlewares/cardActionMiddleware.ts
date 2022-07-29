import { IBotMagicCodeConfig } from "../../../interfaces/IBotMagicCodeConfig";
import { BotMagicCodeStore } from "../../BotMagicCodeStore";

enum CardActionType {
    OpenUrl = "openUrl",
    SignIn = "signin"
}

const validCardActionTypes = [CardActionType.OpenUrl, CardActionType.SignIn];
const botOauthUrlRegex = /[\S]+.botframework.com\/api\/oauth\/signin\?signin=([\S]+)/;

export const createCardActionMiddleware = (botMagicCodeConfig: IBotMagicCodeConfig | undefined) => {
    const cardActionMiddleware = () => (next: any) => (...args: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        const [card] = args;
        
        if (card.cardAction && validCardActionTypes.indexOf(card.cardAction.type) >= 0 && card.cardAction.value) {

            // Override signin url only if fwdUrl is valid & feature is enabled
            if (botMagicCodeConfig?.disabled === true && botMagicCodeConfig?.fwdUrl) {
                const baseUrl = window.location.origin;
                const result = botOauthUrlRegex.exec(card.cardAction.value);

                if (result) {
                    BotMagicCodeStore.botOAuthSignInId = `${result[1]}`;
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