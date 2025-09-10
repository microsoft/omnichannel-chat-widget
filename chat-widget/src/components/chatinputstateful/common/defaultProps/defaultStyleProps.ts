import { IChatInputStyleProps } from "@microsoft/omnichannel-chat-components/lib/types/components/chatinput/interfaces/IChatInputStyleProps";

/**
 * Default style props configuration for ChatInput component
 */
export const getDefaultStyleProps = (): IChatInputStyleProps => ({
    // Container div (outermost wrapper)
    containerStyleProps: {
        // borderRadius: "0px",
    },

    // Input container div (fai-ChatInput) - this is the main visible container
    inputContainerStyleProps: {
        // borderRadius: "0px",
        // border: "2px solid #f5f5f5",
        // Gradient background: gray at top, gradually fading to white at bottom
        background: "linear-gradient(to bottom, #e0e0e0 0%, #f5f5f5 50%, #ffffff 100%)",
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)", // Subtle shadow instead
        padding: "2px",
        // borderTop: "2px solid #f5f5f5",
        // borderLeft: "2px solid #f5f5f5",
        // borderRight: "2px solid #f5f5f5",
        // borderBottom: "0"
    },

    // Input wrapper div (fai-ChatInput__inputWrapper) - the middle layer
    inputWrapperStyleProps: {
        // borderRadius: "0px",
    },

    // Style the actual input field to remove any default styling
    inputFieldStyleProps: {
        borderRadius: "0px"
    }
});
