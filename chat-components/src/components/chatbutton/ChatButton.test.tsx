import "@testing-library/jest-dom/extend-expect";
import * as ReactDOM from "react-dom";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";

import ChatButton from "./ChatButton";
import { defaultChatButtonProps }  from "./common/defaultProps/defaultChatButtonProps";
import React from "react";
import { IChatButtonProps } from "./interfaces/IChatButtonProps";
import { defaultChatButtonControlProps } from "./common/defaultProps/defaultChatButtonControlProps";
import { defaultChatButtonStyleProps } from "./common/defaultStyles/defaultChatButtonStyleProps";

describe("Chat Button component", () => {

    afterEach(() => {
        cleanup;
        jest.resetAllMocks();
    });
    
    act(() => {
        it("renders chat button", () => {
            const container = document.createElement("div");
            ReactDOM.render(
                <ChatButton {...defaultChatButtonProps}/>, container);
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
            render(<ChatButton {...chatButtonPropsHide}/>);

            try {
                screen.getByText("Let's Chat!");
                fail("Title should not be in the document");
            // eslint-disable-next-line no-empty
            } catch (ex) {
            }

            try {
                screen.getByText("We're online.");
                fail("Title should not be in the document");
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
            render(<ChatButton {...chatButtonPropsShow}/>);

            try {
                screen.getByText("0");
            // eslint-disable-next-line no-empty
            } catch (ex) {
                fail("Notification Bubble should not be in the document");
            }
        });
    });
    act(() => {
        it("chat button key down", () => {
            render(<ChatButton {...defaultChatButtonProps}/>);
            const handleKeyDown = jest.fn();        
            const startChatButton = screen.getByText("Let's Chat!");
            startChatButton.onkeydown = handleKeyDown;
            fireEvent.keyDown(startChatButton);
            expect(handleKeyDown).toHaveBeenCalledTimes(1);
        });
    });
    act(() => {
        it("chat button click", () => {
            render(<ChatButton {...defaultChatButtonProps}/>);
            const handleClick = jest.fn();        
            const startChatButton = screen.getByText("Let's Chat!");
            startChatButton.onclick = handleClick;
            fireEvent.click(startChatButton);
            expect(handleClick).toHaveBeenCalledTimes(1);
        });
    });
});