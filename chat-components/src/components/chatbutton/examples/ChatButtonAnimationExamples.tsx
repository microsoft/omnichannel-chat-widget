import React from "react";
import ChatButton from "../ChatButton";
import { chatButtonShakeOnLoad, chatButtonBounceRepeating, chatButtonPulseAnimation } from "../common/animationStyles/chatButtonAnimationStyles";
import { defaultChatButtonProps } from "../common/defaultProps/defaultChatButtonProps";

/**
 * Example demonstrating different animation effects for the ChatButton component
 */
export const ChatButtonAnimationExamples = () => {
    // Example 1: Shake animation on page load
    const shakeOnLoadProps = {
        ...defaultChatButtonProps,
        styleProps: {
            ...defaultChatButtonProps.styleProps,
            generalStyleProps: Object.assign(
                {},
                defaultChatButtonProps.styleProps?.generalStyleProps,
                chatButtonShakeOnLoad,
                {
                    position: "static" as const,
                    margin: "10px",
                    display: "inline-flex" as const
                }
            )
        }
    };

    // Example 2: Bounce animation repeating
    const bounceRepeatingProps = {
        ...defaultChatButtonProps,
        styleProps: {
            ...defaultChatButtonProps.styleProps,
            generalStyleProps: Object.assign(
                {},
                defaultChatButtonProps.styleProps?.generalStyleProps,
                chatButtonBounceRepeating,
                {
                    position: "static" as const,
                    margin: "10px",
                    display: "inline-flex" as const
                }
            )
        }
    };

    // Example 3: Continuous pulse animation
    const pulseProps = {
        ...defaultChatButtonProps,
        styleProps: {
            ...defaultChatButtonProps.styleProps,
            generalStyleProps: Object.assign(
                {},
                defaultChatButtonProps.styleProps?.generalStyleProps,
                chatButtonPulseAnimation,
                {
                    position: "static" as const,
                    margin: "10px",
                    display: "inline-flex" as const
                }
            )
        }
    };

    // Example 4: Custom animation with specific timing
    const customAnimationProps = {
        ...defaultChatButtonProps,
        styleProps: {
            ...defaultChatButtonProps.styleProps,
            generalStyleProps: Object.assign(
                {},
                defaultChatButtonProps.styleProps?.generalStyleProps,
                {
                    animation: "chatButtonShake 0.3s ease-in-out 5 2s", // shake 5 times, 2s delay
                    position: "static" as const,
                    margin: "10px",
                    display: "inline-flex" as const
                }
            )
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>ChatButton Animation Examples</h2>
            
            <h3>1. Shake on Load (with 0.5s delay)</h3>
            <ChatButton {...shakeOnLoadProps} />
            
            <h3>2. Bounce Repeating (2 times)</h3>
            <ChatButton {...bounceRepeatingProps} />
            
            <h3>3. Continuous Pulse</h3>
            <ChatButton {...pulseProps} />
            
            <h3>4. Custom Animation (5 shakes with 2s delay)</h3>
            <ChatButton {...customAnimationProps} />
        </div>
    );
};

export default ChatButtonAnimationExamples;