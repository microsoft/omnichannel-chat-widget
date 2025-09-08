/**
 * Utility to map Web Chat localized strings to ChatInput control props
 * This bridges the gap between Web Chat's localization system and ChatInput component props
 */

import { IChatInputControlProps } from "@microsoft/omnichannel-chat-components/lib/types/components/chatinput/interfaces/IChatInputControlProps";

export interface LocalizedChatInputStrings {
    TEXT_INPUT_PLACEHOLDER?: string;
    TEXT_INPUT_ALT?: string;
    TEXT_INPUT_LENGTH_EXCEEDED_ALT?: string;
    TEXT_INPUT_CHAR_REMAINING?: string | ((params: { remaining: number }) => string);
    TEXT_INPUT_DROP_ZONE?: string;
    TEXT_INPUT_SEND_BUTTON_ALT?: string;
    TEXT_INPUT_UPLOAD_BUTTON_ALT?: string;
    TEXT_INPUT_OVERFLOW_MENU_ARIA_LABEL?: string;
    SUGGESTED_ACTIONS_LABEL_ALT?: string;
}

/**
 * Maps Web Chat localized strings to ChatInput control props
 * @param localizedStrings - Localized strings from Web Chat (base + overrides)
 * @returns Partial control props with localized values
 */
export function mapLocalizedStringsToChatInputProps(localizedStrings: LocalizedChatInputStrings): Partial<IChatInputControlProps> {
    return {
        placeholderValue: localizedStrings.TEXT_INPUT_PLACEHOLDER,
        chatInputAriaLabel: localizedStrings.TEXT_INPUT_ALT,
        characterLimitErrorMessage: localizedStrings.TEXT_INPUT_LENGTH_EXCEEDED_ALT,
        dragDropOverlayText: localizedStrings.TEXT_INPUT_DROP_ZONE,
        
        // 🔧 COMPLEX LOGIC: Handles both string and function types
        charactersRemainingMessage: (remaining: number) => {
            const charRemainingStr = localizedStrings.TEXT_INPUT_CHAR_REMAINING;
            if (typeof charRemainingStr === "function") {
                return charRemainingStr({ remaining });
            } else if (typeof charRemainingStr === "string") {
                return charRemainingStr.replace("{remaining}", remaining.toString());
            }
            return `${remaining} characters remaining`;
        },
  
        sendButtonProps: localizedStrings.TEXT_INPUT_SEND_BUTTON_ALT ? {
            "aria-label": localizedStrings.TEXT_INPUT_SEND_BUTTON_ALT
        } : undefined,
        
        attachmentProps: {
            attachmentButtonAriaLabel: localizedStrings.TEXT_INPUT_UPLOAD_BUTTON_ALT,
            overflowMenuAriaLabel: localizedStrings.TEXT_INPUT_OVERFLOW_MENU_ARIA_LABEL,
        }
    };
}

/**
 * Additional utility functions for specialized localization needs
 */

/**
 * Generates localized suggestions props
 * @param localizedStrings - Localized strings from Web Chat  
 * @returns Suggestions control props with localized values
 */
export function mapLocalizedStringsToSuggestionsProps(localizedStrings: LocalizedChatInputStrings) {
    return {
        ariaLabel: localizedStrings.SUGGESTED_ACTIONS_LABEL_ALT
    };
}
