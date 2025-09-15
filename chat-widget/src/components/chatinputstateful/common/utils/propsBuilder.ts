import { useMemo } from "react";
import type { IChatInputProps } from "@microsoft/omnichannel-chat-components/lib/types/components/chatinput/interfaces/IChatInputProps";
import type { ISuggestionsProps } from "@microsoft/omnichannel-chat-components/lib/types/components/suggestions/interfaces/ISuggestionsProps";
import { mapWebChatSendBoxStyles } from "./mapStyleOptionsToChatInput";
import { mapLocalizedStringsToChatInputProps, mapLocalizedStringsToSuggestionsProps } from "./mapLocalizationStrings";
import { getDefaultControlProps } from "../defaultProps/defaultControlProps";
import { getDefaultStyleProps } from "../defaultProps/defaultStyleProps";
import { IChatInputStatefulProps } from "../../interfaces/IChatButtonStatefulParams";

/**
 * Simple deep merge utility for objects
 */
function deepMerge<T extends Record<string, unknown>>(target: T | undefined, source: T | undefined): T | undefined {
    if (!target && !source) return undefined;
    if (!target) return source;
    if (!source) return target;
    
    return { ...target, ...source } as T;
}

/**
 * Configuration for building ChatInput and Suggestions props
 */
export interface ChatInputPropsBuilderConfig {
    // Base props from parent components
    baseChatInputProps?: IChatInputProps;
    baseSuggestionsProps?: ISuggestionsProps;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webChatStyles?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webChatProps?: any;
}

/**
 * Comprehensive props builder that consolidates all prop merging logic
 * from LiveChatWidgetStateful for WebChat integration only.
 * Runtime event handlers are managed separately in ChatInputStateful.
 */
export function buildChatInputAndSuggestionsProps(config: ChatInputPropsBuilderConfig): IChatInputStatefulProps {
    const {
        baseChatInputProps = {},
        baseSuggestionsProps = {},
        webChatStyles,
        webChatProps
    } = config;

    // Extract additional WebChat props for ChatInput mapping
    const {
        hideUploadButton,
        uploadAccept, 
        uploadMultiple,
        overrideLocalizedStrings
    } = webChatProps;

    // 1. WEBCHAT STYLE MAPPING (from LiveChatWidgetStateful)
    const mappedStyles = webChatStyles ? mapWebChatSendBoxStyles(webChatStyles) : { chatInput: {}, suggestions: {} };

    // 2. LOCALIZATION MAPPING (from ChatInputStateful)
    const chatInputLocalizedStrings = overrideLocalizedStrings 
        ? mapLocalizedStringsToChatInputProps(overrideLocalizedStrings) 
        : {};
    
    const suggestionsLocalizedStrings = overrideLocalizedStrings 
        ? mapLocalizedStringsToSuggestionsProps(overrideLocalizedStrings)
        : {};

    // 3. BUILD CHATINPUT CONTROL PROPS (WebChat integration + additional props)
    // Extract nested props for deep merge to prevent overwriting
    const { 
        sendButtonProps: localizedSendButtonProps, 
        attachmentProps: localizedAttachmentProps,
        ...localizedPropsWithoutNested 
    } = chatInputLocalizedStrings;
    
    const chatInputControlProps = {
        // Start with defaults
        ...getDefaultControlProps(),
        // Apply base props
        ...baseChatInputProps?.controlProps,
        // Apply localization (excluding nested props to avoid overwrite)
        ...localizedPropsWithoutNested,
        // Deep merge sendButtonProps to preserve all customized props
        sendButtonProps: deepMerge(
            deepMerge(
                getDefaultControlProps().sendButtonProps,
                baseChatInputProps?.controlProps?.sendButtonProps
            ),
            localizedSendButtonProps
        ),
        // Deep merge attachmentProps (including WebChat mappings)
        attachmentProps: deepMerge(
            deepMerge(
                getDefaultControlProps().attachmentProps,
                baseChatInputProps?.controlProps?.attachmentProps
            ),
            {
                ...localizedAttachmentProps,
                // Apply WebChat upload configuration with fallbacks to base props
                attachmentAccept: uploadAccept ?? baseChatInputProps?.controlProps?.attachmentProps?.attachmentAccept,
                attachmentMultiple: uploadMultiple ?? baseChatInputProps?.controlProps?.attachmentProps?.attachmentMultiple,
                showAttachButton: hideUploadButton ?? baseChatInputProps?.controlProps?.attachmentProps?.showAttachButton,
            }
        ),
        // Apply hide sendbox logic with proper fallback
        hideSendBox: webChatStyles?.hideSendBox ?? baseChatInputProps?.controlProps?.hideSendBox,
    };

    // 4. BUILD CHATINPUT STYLE PROPS (combining all sources)
    const chatInputStyleProps = {
        // Start with defaults
        ...getDefaultStyleProps(),
        // Apply mapped WebChat styles
        ...mappedStyles.chatInput,
        // Apply base style props
        ...baseChatInputProps?.styleProps
    };

    // 5. BUILD SUGGESTIONS CONTROL PROPS (WebChat integration only)
    const suggestionsControlProps = {
        // Apply base props
        ...baseSuggestionsProps?.controlProps,
        // Apply localized strings (with proper type checking)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...((suggestionsLocalizedStrings as any)?.ariaLabel && { ariaLabel: (suggestionsLocalizedStrings as any).ariaLabel }),
        // Preserve horizontal alignment
        horizontalAlignment: baseSuggestionsProps?.controlProps?.horizontalAlignment
    };

    // 6. BUILD SUGGESTIONS STYLE PROPS
    const suggestionsStyleProps = {
        // Apply mapped WebChat styles
        ...mappedStyles.suggestions,
        // Apply base style props
        ...baseSuggestionsProps?.styleProps
    };

    // 7. FINAL ASSEMBLY
    const chatInputProps: IChatInputProps = {
        controlProps: chatInputControlProps,
        styleProps: chatInputStyleProps,
        componentOverrides: baseChatInputProps?.componentOverrides
    };

    const suggestionsProps: ISuggestionsProps = {
        controlProps: suggestionsControlProps,
        styleProps: suggestionsStyleProps,
        componentOverrides: baseSuggestionsProps?.componentOverrides
    };

    return {
        chatInputProps,
        suggestionsProps
    };
}

/**
 * hook to build chat input props
 * Memoizes the result to prevent unnecessary re-renders
 */
export function useBuildChatInputProps(config: ChatInputPropsBuilderConfig): IChatInputStatefulProps {
    return useMemo(() => buildChatInputAndSuggestionsProps(config), [
        config.baseChatInputProps,
        config.baseSuggestionsProps,
        config.webChatStyles,
        config.webChatProps
    ]);
}
