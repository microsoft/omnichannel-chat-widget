import { createStyleSet } from "botframework-webchat";
import type { StyleOptions } from "botframework-webchat";

type WebChatStyleSet = ReturnType<typeof createStyleSet>;

const sendBoxRootSelector = "&.webchat__send-box-text-box";
const sendBoxInputSelector = "& .webchat__send-box-text-box__input, & .webchat__send-box-text-box__html-text-area";
const placeholderSelector = "&::placeholder";

// Safari can make the document taller and scroll the send box off-screen when a form control's
// native placeholder pseudo-element has any style rule. Keep the placeholder, but use its native style.
// https://github.com/microsoft/BotFramework-WebChat/issues/4732
export const createIOSCompatibleStyleSet = (
    styleOptions: StyleOptions,
    styleSet?: WebChatStyleSet
): WebChatStyleSet => {
    const resolvedStyleSet = styleSet ?? createStyleSet(styleOptions);
    const sendBoxTextBox = resolvedStyleSet.sendBoxTextBox;
    const sendBoxRootStyle = sendBoxTextBox?.[sendBoxRootSelector];
    const sendBoxInputStyle = sendBoxRootStyle?.[sendBoxInputSelector];

    if (!sendBoxInputStyle || !Object.prototype.hasOwnProperty.call(sendBoxInputStyle, placeholderSelector)) {
        return resolvedStyleSet;
    }

    const sendBoxInputStyleWithoutPlaceholder = { ...sendBoxInputStyle };
    Reflect.deleteProperty(sendBoxInputStyleWithoutPlaceholder, placeholderSelector);

    return {
        ...resolvedStyleSet,
        sendBoxTextBox: {
            ...sendBoxTextBox,
            [sendBoxRootSelector]: {
                ...sendBoxRootStyle,
                [sendBoxInputSelector]: sendBoxInputStyleWithoutPlaceholder
            }
        }
    };
};
