import { IChatInputStyleProps } from "@microsoft/omnichannel-chat-components/lib/types/components/chatinput/interfaces/IChatInputStyleProps";

/**
 * Default style props configuration for ChatInput component
 */
export const getDefaultStyleProps = (): IChatInputStyleProps => ({
    // Container div (outermost wrapper)
    containerStyleProps: {
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        borderRadius: "15px",
        backgroundColor: "#ffffff", // RED - Container wrapper
        border: "1px solid #ddd",
        boxShadow: "none",
        position: "relative",
        padding: "0px",
        overflow: "hidden" // Ensures child elements respect the border radius
    },

    // Input container div (fai-ChatInput) - this is the main visible container
    inputContainerStyleProps: {
        borderRadius: "15px",
        // Gradient background: gray at top, gradually fading to white at bottom
        background: "linear-gradient(to bottom, #e0e0e0 0%, #f5f5f5 50%, #ffffff 100%)",
        
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)", // Subtle shadow instead
        padding: "5px",
        overflow: "hidden" // Ensures child elements respect the border radius
    },

    // Input wrapper div (fai-ChatInput__inputWrapper) - the middle layer
    inputWrapperStyleProps: {
        // borderRadius: "15px",
        // backgroundColor: "#ffe66d", // YELLOW - Input wrapper
        border: "none",
        boxShadow: "none",
        backgroundImage: "none",
        backgroundSize: "auto",
        backgroundRepeat: "no-repeat"
    },

    // Style the actual input field to remove any default styling
    inputFieldStyleProps: {
        // borderRadius: "15px", // Match the container radius
        outline: "none", // Remove focus outline
        boxShadow: "none", // Remove any field-level shadows
        border: "none" // Remove default border
    }
});
