import { IWebChatContainerStatefulProps } from "../../interfaces/IWebChatContainerStatefulProps";
import MockAdapter from "../mockadapter";
import { defaultWebChatStatefulContainerStyles } from "../defaultStyles/defaultWebChatStatefulContainerStyles";
import { defaultWebChatStatefulProps } from "./defaultWebChatStatefulProps";
import { defaultWebChatStatefulStyles } from "../defaultStyles/defaultWebChatContainerStatefulStyles";
import { defaultAdaptiveCardStyles } from "../defaultStyles/defaultAdaptiveCardStyles";

export const defaultWebChatContainerStatefulProps: IWebChatContainerStatefulProps = {
    webChatStyles: defaultWebChatStatefulStyles,
    webChatProps: defaultWebChatStatefulProps,
    containerStyles: defaultWebChatStatefulContainerStyles,
    disableNewLineMarkdownSupport: false,
    disableMarkdownMessageFormatting: false,
    hyperlinkTextOverride: false,
    directLine: new MockAdapter(),
    adaptiveCardStyles: defaultAdaptiveCardStyles
};