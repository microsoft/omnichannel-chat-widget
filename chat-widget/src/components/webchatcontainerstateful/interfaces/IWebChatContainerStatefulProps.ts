import { IBotMagicCodeConfig } from "./IBotMagicCodeConfig";
import { ILiveChatWidgetLocalizedTexts } from "../../../contexts/common/ILiveChatWidgetLocalizedTexts";
import { IRenderingMiddlewareProps } from "./IRenderingMiddlewareProps";
import { IStyle } from "@fluentui/react";
import { IWebChatProps } from "./IWebChatProps";
import { StyleOptions } from "botframework-webchat-api";
import { IAdaptiveCardStyles } from "./IAdaptiveCardStyles";
import { IBotAuthConfig } from "./IBotAuthConfig";

export interface IWebChatContainerStatefulProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    containerStyles?: IStyle;
    disableNewLineMarkdownSupport?: boolean;
    disableMarkdownMessageFormatting?: boolean;
    webChatStyles?: StyleOptions;
    webChatProps?: IWebChatProps;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    directLine?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    storeMiddlewares?: any[];
    renderingMiddlewareProps?: IRenderingMiddlewareProps;
    localizedTexts?: ILiveChatWidgetLocalizedTexts;
    botMagicCode?: IBotMagicCodeConfig;
    botAuthConfig?: IBotAuthConfig;
    hyperlinkTextOverride?: boolean;
    adaptiveCardStyles?: IAdaptiveCardStyles;
}