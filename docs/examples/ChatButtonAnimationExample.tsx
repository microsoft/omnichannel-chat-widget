/**
 * Chat Button Animation Example
 * 
 * This example shows how to implement chat button animations without modifying 
 * the core chat components. Instead, we use external CSS and the existing 
 * generalStyleProps interface.
 */

import React from 'react';
import { ILiveChatWidgetProps } from '@microsoft/omnichannel-chat-widget';

// Import your CSS file containing the animations
import './chat-button-animations.css';

const ChatButtonAnimationExample: React.FC = () => {
    // Example 1: Shake animation on page load (ideal for Power Pages)
    const liveChatWidgetPropsWithShake: ILiveChatWidgetProps = {
        // ... your existing props
        chatButtonProps: {
            styleProps: {
                generalStyleProps: {
                    // This applies the shake animation: 3 shakes with 0.5s delay
                    animation: "chatButtonShake 0.5s ease-in-out 3 0.5s"
                }
            }
        }
    };

    // Example 2: Bounce animation on page load
    const liveChatWidgetPropsWithBounce: ILiveChatWidgetProps = {
        // ... your existing props
        chatButtonProps: {
            styleProps: {
                generalStyleProps: {
                    // This applies the bounce animation: 2 bounces with 1s delay
                    animation: "chatButtonBounce 0.6s ease-in-out 2 1s"
                }
            }
        }
    };

    // Example 3: Continuous pulse animation
    const liveChatWidgetPropsWithPulse: ILiveChatWidgetProps = {
        // ... your existing props
        chatButtonProps: {
            styleProps: {
                generalStyleProps: {
                    // This applies infinite pulse animation
                    animation: "chatButtonPulse 1s ease-in-out infinite"
                }
            }
        }
    };

    // Example 4: Using CSS class names instead
    const liveChatWidgetPropsWithClassName: ILiveChatWidgetProps = {
        // ... your existing props
        chatButtonProps: {
            styleProps: {
                classNames: {
                    // Apply animation using CSS class
                    generalClassName: "chat-button-shake-on-load"
                }
            }
        }
    };

    // Example 5: Custom animation with additional styles
    const liveChatWidgetPropsCustom: ILiveChatWidgetProps = {
        // ... your existing props
        chatButtonProps: {
            styleProps: {
                generalStyleProps: {
                    // Combine animation with other styles
                    animation: "chatButtonGlow 2s ease-in-out infinite",
                    backgroundColor: "#0078d4",
                    borderRadius: "25px",
                    padding: "15px"
                }
            }
        }
    };

    return (
        <div>
            <h2>Chat Button Animation Examples</h2>
            <p>These examples show different ways to apply animations to the chat button.</p>
            
            {/* You would render your LiveChatWidget component here with the desired props */}
            {/* <LiveChatWidget {...liveChatWidgetPropsWithShake} /> */}
        </div>
    );
};

export default ChatButtonAnimationExample;

/**
 * Available Animation Names:
 * - chatButtonShake: Horizontal shake movement
 * - chatButtonBounce: Vertical bounce movement  
 * - chatButtonPulse: Scale pulse effect
 * - chatButtonGlow: Glowing shadow effect
 * 
 * Available CSS Classes:
 * - chat-button-shake-on-load: Shake 3 times with 0.5s delay
 * - chat-button-bounce-on-load: Bounce 2 times with 1s delay
 * - chat-button-shake-repeating: Shake 3 times immediately
 * - chat-button-bounce-repeating: Bounce 2 times immediately
 * - chat-button-pulse-continuous: Continuous pulse effect
 * - chat-button-glow-continuous: Continuous glow effect
 * 
 * Animation Syntax:
 * animation: "name duration timing-function iteration-count delay"
 * 
 * Examples:
 * - "chatButtonShake 0.5s ease-in-out 3 0.5s" - Shake 3 times after 0.5s delay
 * - "chatButtonPulse 1s ease-in-out infinite" - Pulse continuously
 * - "chatButtonBounce 0.6s linear 1" - Bounce once immediately
 */