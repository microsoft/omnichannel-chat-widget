import { StyleOptions } from "botframework-webchat-api";
import { IDownloadTranscriptProps } from "../../footerstateful/downloadtranscriptstateful/interfaces/IDownloadTranscriptProps";
import { IWebChatContainerStatefulProps } from "../../webchatcontainerstateful/interfaces/IWebChatContainerStatefulProps";
import { defaultWebChatContainerStatefulProps } from "../../webchatcontainerstateful/common/defaultProps/defaultWebChatContainerStatefulProps";

const createDownloadTranscriptProps = (downloadTranscriptProps: IDownloadTranscriptProps, webChatStyles: StyleOptions, webChatContainerProps?: IWebChatContainerStatefulProps) => {
    const disableNewLineMarkdownSupport = webChatContainerProps?.disableNewLineMarkdownSupport ?? defaultWebChatContainerStatefulProps.disableNewLineMarkdownSupport;
    const disableMarkdownMessageFormatting = webChatContainerProps?.disableMarkdownMessageFormatting ?? defaultWebChatContainerStatefulProps.disableMarkdownMessageFormatting;
    const props = {
        ...downloadTranscriptProps,
        webChatTranscript: {
            ...downloadTranscriptProps?.webChatTranscript,
            disableNewLineMarkdownSupport,
            disableMarkdownMessageFormatting,
            transcriptBackgroundColor: webChatStyles?.backgroundColor,
            agentAvatarBackgroundColor: webChatStyles?.bubbleBackground,
            agentAvatarFontColor: webChatStyles?.bubbleTextColor,
            customerAvatarBackgroundColor: webChatStyles?.bubbleFromUserBackground,
            customerAvatarFontColor: webChatStyles?.bubbleFromUserTextColor
        }
    };

    return props;
};

export default createDownloadTranscriptProps;