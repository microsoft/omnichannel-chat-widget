import { IChatInputControlProps } from "@microsoft/omnichannel-chat-components/lib/types/components/chatinput/interfaces/IChatInputControlProps";
import { Constants } from "../../../../common/Constants";

/**
 * Default control props configuration for ChatInput component
 */
export const getDefaultControlProps = (): IChatInputControlProps => ({
    chatInputId: Constants.chatInputId,
    charactersRemainingMessage: (remaining: number) => `${remaining} characters remaining`,
});