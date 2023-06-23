import { IWebChatContainerStatefulProps } from "../../interfaces/IWebChatContainerStatefulProps";
import MockAdapter from "../mockadapter";
import { defaultWebChatStatefulContainerStyles } from "../defaultStyles/defaultWebChatStatefulContainerStyles";
import { defaultWebChatStatefulProps } from "./defaultWebChatStatefulProps";
import { defaultWebChatStyles } from "../defaultStyles/defaultWebChatStyles";
import { defaultAdaptiveCardStyles } from "../defaultStyles/defaultAdaptiveCardStyles";

export const defaultWebChatContainerStatefulProps: IWebChatContainerStatefulProps = {
    webChatStyles: defaultWebChatStyles,
    webChatProps: defaultWebChatStatefulProps,
    containerStyles: defaultWebChatStatefulContainerStyles,
    disableNewLineMarkdownSupport: false,
    disableMarkdownMessageFormatting: false,
    hyperlinkTextOverride: false,
    directLine: new MockAdapter(),
    adaptiveCardStyles: defaultAdaptiveCardStyles
};