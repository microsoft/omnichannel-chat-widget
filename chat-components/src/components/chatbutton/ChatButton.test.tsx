import "@testing-library/jest-dom/extend-expect";
import * as ReactDOM from "react-dom";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";

import ChatButton from "./ChatButton";
import { defaultChatButtonProps } from "./common/defaultProps/defaultChatButtonProps";
import React from "react";
import { IChatButtonProps } from "./interfaces/IChatButtonProps";
import { defaultChatButtonControlProps } from "./common/defaultProps/defaultChatButtonControlProps";
import { defaultChatButtonStyleProps } from "./common/defaultStyles/defaultChatButtonStyleProps";
import { BroadcastServiceInitialize } from "../../services/BroadcastService";
import { Texts } from "../../common/Constants";

beforeAll(() => {
    BroadcastServiceInitialize("testChannel");
});

describe("Chat Button component", () => {

    afterEach(() => {
        cleanup;
        jest.resetAllMocks();
    });

    act(() => {
        it("renders chat button", () => {
            const container = document.createElement("div");
            ReactDOM.render(
                <ChatButton {...defaultChatButtonProps} />, container);
            expect(container.childElementCount).toBe(1);
        });
    });

    act(() => {
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
    });

    act(() => {
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
    });

    act(() => {
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
    });
    act(() => {
        it("chat button key down", async () => {
            render(<ChatButton {...defaultChatButtonProps} />);
            const handleKeyDown = jest.fn();
            const startChatButton =  await screen.findByRole("button");
            startChatButton.onkeydown = handleKeyDown;
            fireEvent.keyDown(startChatButton);
            expect(handleKeyDown).toHaveBeenCalledTimes(1);
        });
    });
    act(() => {
        it("chat button click", async () => {
            render(<ChatButton {...defaultChatButtonProps} />);
            const handleClick = jest.fn();
            const startChatButton = await screen.findByRole("button");
            startChatButton.onclick = handleClick;
            fireEvent.click(startChatButton);
            expect(handleClick).toHaveBeenCalledTimes(1);
        });
    });
});