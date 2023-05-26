import { StyleOptions } from "botframework-webchat-api";
import { IDownloadTranscriptProps } from "../../footerstateful/downloadtranscriptstateful/interfaces/IDownloadTranscriptProps";

const createDownloadTranscriptProps = (downloadTranscriptProps: IDownloadTranscriptProps, webChatStyles: StyleOptions) => {
    const props = {
        ...downloadTranscriptProps,
        webChatTranscript: {
            ...downloadTranscriptProps?.webChatTranscript,
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