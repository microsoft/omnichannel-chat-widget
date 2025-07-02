import { IStyle } from "@fluentui/react";

/**
 * Pre-defined animation styles for ChatButton component
 * These can be used directly in the generalStyleProps to add animations to the chat button
 */

export const chatButtonShakeAnimation: IStyle = {
    animation: "chatButtonShake 0.5s ease-in-out"
};

export const chatButtonBounceAnimation: IStyle = {
    animation: "chatButtonBounce 0.6s ease-in-out"
};

export const chatButtonPulseAnimation: IStyle = {
    animation: "chatButtonPulse 1s ease-in-out infinite"
};

export const chatButtonGlowAnimation: IStyle = {
    animation: "chatButtonGlow 2s ease-in-out infinite"
};

/**
 * Repeating animations that play multiple times
 */
export const chatButtonShakeRepeating: IStyle = {
    animation: "chatButtonShake 0.5s ease-in-out 3"
};

export const chatButtonBounceRepeating: IStyle = {
    animation: "chatButtonBounce 0.6s ease-in-out 2"
};

/**
 * Animation on page load - plays once with a slight delay
 */
export const chatButtonShakeOnLoad: IStyle = {
    animation: "chatButtonShake 0.5s ease-in-out 3 0.5s"
};

export const chatButtonBounceOnLoad: IStyle = {
    animation: "chatButtonBounce 0.6s ease-in-out 2 1s"
};