import { IChatInputControlProps } from "@microsoft/omnichannel-chat-components/lib/types/components/chatinput/interfaces/IChatInputControlProps";
import { Constants } from "../../../../common/Constants";
import { createSendIcon, createAttachmentIcon } from "./defaultIcons";

/**
 * Default control props configuration for ChatInput component
 */
export const getDefaultControlProps = (): IChatInputControlProps => ({
    chatInputId: Constants.chatInputId,
    charactersRemainingMessage: (remaining: number) => `${remaining} characters remaining`,
    sendButtonProps: {
        sendIcon: createSendIcon(),
        appearance: "transparent",
        stopBackground: { style: { display: "none" } }
    },
    attachmentProps: {
        attachmentButtonIcon: createAttachmentIcon()
    }
});