import { IWebChatContainerStatefulProps } from "../../interfaces/IWebChatContainerStatefulProps";
import MockAdapter from "../mockadapter";
import { defaultWebChatStatefulContainerStyles } from "../defaultStyles/defaultWebChatStatefulContainerStyles";
import { defaultWebChatStatefulProps } from "./defaultWebChatStatefulProps";
import { defaultWebChatStatefulStyles } from "../defaultStyles/defaultWebChatContainerStatefulStyles";

export const defaultWebChatContainerStatefulProps: IWebChatContainerStatefulProps = {
    webChatStyles: defaultWebChatStatefulStyles,
    webChatProps: defaultWebChatStatefulProps,
    containerStyles: defaultWebChatStatefulContainerStyles,
    disableNewLineMarkdownSupport: false,
    disableMarkdownMessageFormatting: false,
    directLine: new MockAdapter()
};