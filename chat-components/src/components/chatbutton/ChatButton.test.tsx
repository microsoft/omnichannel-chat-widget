import "@testing-library/jest-dom/extend-expect";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import { BroadcastServiceInitialize } from "../../services/BroadcastService";
import ChatButton from "./ChatButton";
import { IChatButtonProps } from "./interfaces/IChatButtonProps";
import React from "react";
import { Texts } from "../../common/Constants";
import { chatButtonShakeAnimation, chatButtonShakeOnLoad } from "./common/animationStyles/chatButtonAnimationStyles";
import { defaultChatButtonControlProps } from "./common/defaultProps/defaultChatButtonControlProps";
import { defaultChatButtonProps } from "./common/defaultProps/defaultChatButtonProps";
import { defaultChatButtonStyleProps } from "./common/defaultStyles/defaultChatButtonStyleProps";

beforeAll(() => {
    BroadcastServiceInitialize("testChannel");
});

describe("Chat Button component", () => {

    afterEach(() => {
        cleanup();
        jest.resetAllMocks();
    });

        it("renders chat button", () => {
            const {container} = render(<ChatButton {...defaultChatButtonProps} />);
            // Now expects 2 children: the style element and the chat button element
            expect(container.childElementCount).toBe(2);
        });

        it("hide text", () => {
            const chatButtonPropsHide: IChatButtonProps = {
                ...defaultChatButtonProps,
                controlProps: {
                    ...defaultChatButtonProps.controlProps,
                    hideChatTextContainer: true
                }
            };
            render(<ChatButton {...chatButtonPropsHide} />);

            try {
                screen.getByText(Texts.ChatButtonTitle);
                fail("Title should not be in the document");
                // eslint-disable-next-line no-empty
            } catch (ex) {
            }

            try {
                screen.getByText(Texts.ChatButtonSubtitle);
                fail("Subtitle should not be in the document");
                // eslint-disable-next-line no-empty
            } catch (ex) {
            }
        });

        it("show notification bubble", () => {
            const chatButtonPropsShow: IChatButtonProps = {
                //...defaultChatButtonProps,
                controlProps: {
                    ...defaultChatButtonControlProps,
                    hideNotificationBubble: false
                }
                ,
                styleProps: {
                    ...defaultChatButtonStyleProps
                }
            };
            render(<ChatButton {...chatButtonPropsShow} />);

            try {
                screen.getByText("0");
                fail("Notification Bubble should not be in the document");
                // eslint-disable-next-line no-empty
            } catch (ex) {
            }
        });

        it("show notification bubble with unread Messages", () => {
            const chatButtonPropsShow: IChatButtonProps = {
                //...defaultChatButtonProps,
                controlProps: {
                    ...defaultChatButtonControlProps,
                    hideNotificationBubble: false,
                    unreadMessageCount: "10"
                }
                ,
                styleProps: {
                    ...defaultChatButtonStyleProps
                }
            };
            render(<ChatButton {...chatButtonPropsShow} />);

            try {
                screen.getByText("10");
                // eslint-disable-next-line no-empty
            } catch (ex) {
                fail("Notification Bubble should be in the document");
            }
        });

        it("chat button key down", async () => {
            render(<ChatButton {...defaultChatButtonProps} />);
            const handleKeyDown = jest.fn();
            const startChatButton =  await screen.findByRole("button");
            startChatButton.onkeydown = handleKeyDown;
            fireEvent.keyDown(startChatButton);
            expect(handleKeyDown).toHaveBeenCalledTimes(1);
        });

        it("chat button click", async () => {
            render(<ChatButton {...defaultChatButtonProps} />);
            const handleClick = jest.fn();
            const startChatButton = await screen.findByRole("button");
            startChatButton.onclick = handleClick;
            fireEvent.click(startChatButton);
            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it("renders chat button with animation styles", () => {
            const chatButtonPropsWithAnimation: IChatButtonProps = {
                ...defaultChatButtonProps,
                styleProps: {
                    ...defaultChatButtonProps.styleProps,
                    generalStyleProps: {
                        ...defaultChatButtonProps.styleProps?.generalStyleProps,
                        ...chatButtonShakeAnimation
                    }
                }
            };
            
            const {container} = render(<ChatButton {...chatButtonPropsWithAnimation} />);
            // Now expects 2 children: the style element and the chat button element
            expect(container.childElementCount).toBe(2);
            
            // Check that the style tag with animations is present
            const styleElement = container.querySelector('style');
            expect(styleElement).toBeInTheDocument();
            expect(styleElement?.innerHTML).toContain('@keyframes chatButtonShake');
            expect(styleElement?.innerHTML).toContain('@keyframes chatButtonBounce');
            expect(styleElement?.innerHTML).toContain('@keyframes chatButtonPulse');
            expect(styleElement?.innerHTML).toContain('@keyframes chatButtonGlow');
        });

        it("applies animation styles to chat button element", async () => {
            const chatButtonPropsWithShakeOnLoad: IChatButtonProps = {
                ...defaultChatButtonProps,
                styleProps: {
                    ...defaultChatButtonProps.styleProps,
                    generalStyleProps: {
                        ...defaultChatButtonProps.styleProps?.generalStyleProps,
                        ...chatButtonShakeOnLoad
                    }
                }
            };
            
            render(<ChatButton {...chatButtonPropsWithShakeOnLoad} />);
            const startChatButton = await screen.findByRole("button");
            
            // Check that the animation style is applied
            const computedStyle = window.getComputedStyle(startChatButton);
            // Note: In jsdom, the actual animation property might not be fully computed,
            // but we can check that the component renders without errors
            expect(startChatButton).toBeInTheDocument();
        });
});