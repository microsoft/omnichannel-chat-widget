import { IChatInputControlProps } from "@microsoft/omnichannel-chat-components/lib/types/components/chatinput/interfaces/IChatInputControlProps";

/**
 * Default control props configuration for ChatInput component
 */
export const getDefaultControlProps = (): IChatInputControlProps => ({
    id: "lcw-chat-input-wrapper",
    charactersRemainingMessage: (remaining: number) => `${remaining} characters remaining`,
});