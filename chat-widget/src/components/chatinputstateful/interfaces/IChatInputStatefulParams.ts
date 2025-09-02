import { IChatInputProps } from "@microsoft/omnichannel-chat-components/lib/types/components/chatinput/interfaces/IChatInputProps";

export interface IChatInputStatefulParams {
    /**
     * Props to pass to the core ChatInput component
     */
    chatInputProps?: IChatInputProps;

    /**
     * Whether to hide the chat input (controlled by conversation state)
     */
    hideTextInput?: boolean;

    /**
     * Whether the widget is minimized
     */
    isMinimized?: boolean;
}
