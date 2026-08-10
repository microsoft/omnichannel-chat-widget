import type { StyleOptions } from "botframework-webchat-api";

import { defaultWebChatStyles } from "../../webchatcontainerstateful/common/defaultStyles/defaultWebChatStyles";
import type { IWebChatContainerStatefulProps } from "../../webchatcontainerstateful/interfaces/IWebChatContainerStatefulProps";

export type BubbleStyleOptions = Pick<StyleOptions, "bubbleBackground" | "bubbleTextColor">;

export const resolveBubbleStyleOptions = (
    webChatContainerProps?: IWebChatContainerStatefulProps
): BubbleStyleOptions => ({
    bubbleBackground: webChatContainerProps?.webChatStyles?.bubbleBackground ??
        webChatContainerProps?.adaptiveCardStyles?.background ??
        defaultWebChatStyles.bubbleBackground,
    bubbleTextColor: webChatContainerProps?.webChatStyles?.bubbleTextColor ??
        webChatContainerProps?.adaptiveCardStyles?.color ??
        defaultWebChatStyles.bubbleTextColor
});
