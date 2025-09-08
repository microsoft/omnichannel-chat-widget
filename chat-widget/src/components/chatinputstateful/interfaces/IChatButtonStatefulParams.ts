import { IChatInputProps } from "@microsoft/omnichannel-chat-components/lib/types/components/chatinput/interfaces/IChatInputProps";
import { ISuggestionsProps } from "@microsoft/omnichannel-chat-components/lib/types/components/suggestions/interfaces/ISuggestionsProps";

// Extended props to include chatInput props and suggestions props
export interface IChatInputStatefulProps {
    // Props for the chat input component
    chatInputProps: IChatInputProps;

    // Props for the suggestions component
    suggestionsProps?: ISuggestionsProps;

    // overrideLocalizedStrings props
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    overrideLocalizedStrings?: any;
}