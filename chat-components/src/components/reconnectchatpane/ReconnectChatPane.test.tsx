import "@testing-library/jest-dom/extend-expect";

import * as ReactDOM from "react-dom";

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";

import ReconnectChatPane from "./ReconnectChatPane";
import { IReconnectChatPaneProps } from "./interfaces/IReconnectChatPaneProps";
import React from "react";
import { defaultReconnectChatPaneProps } from "./common/default/defaultProps/defaultReconnectChatPaneProps";
import { BroadcastServiceInitialize } from "../../services/BroadcastService";

beforeAll(() => {
    BroadcastServiceInitialize("testChannel");
});

describe("Reconnect Chat Pane component", () => {

    afterEach(() => {
        cleanup;
        jest.resetAllMocks();
    });
    
    act(() => {
        it("renders reconnect chat pane", () => {
            const container = document.createElement("div");
            ReactDOM.render(
                <ReconnectChatPane {...defaultReconnectChatPaneProps}/>, container);
            expect(container.childElementCount).toBe(1);
        });
    });

    act(() => {
        it("hide reconnect chat pane", () => {
            const reconnectChatPanePropsHide: IReconnectChatPaneProps = {
                ...defaultReconnectChatPaneProps,
                controlProps: {
                    ...defaultReconnectChatPaneProps.controlProps,
                    hideReconnectChatPane: true
                }
            };
            const container = document.createElement("div");
            ReactDOM.render(
                <ReconnectChatPane {...reconnectChatPanePropsHide}/>, container);
            expect(container.childElementCount).toBe(0);
        });
    });

    act(() => {
        it("hide title", () => {
            const reconnectChatPanePropsHide: IReconnectChatPaneProps = {
                ...defaultReconnectChatPaneProps,
                controlProps: {
                    ...defaultReconnectChatPaneProps.controlProps,
                    hideTitle: true
                }
            };
            render(<ReconnectChatPane {...reconnectChatPanePropsHide}/>);

            try {
                screen.getByText("Previous session detected");
                fail("Title should not be in the document");
            // eslint-disable-next-line no-empty
            } catch (ex) {
            }

            try {
                screen.getByText("We have detected a previous chat session. Would you like to continue with your previous session?");
            } catch (ex) {
                fail("Subtitle should be in the document");
            }
        });
    });

    act(() => {
        it("hide subtitle", () => {
            const reconnectChatPanePropsHide: IReconnectChatPaneProps = {
                ...defaultReconnectChatPaneProps,
                controlProps: {
                    ...defaultReconnectChatPaneProps.controlProps,
                    hideSubtitle: true
                }
            };
            render(<ReconnectChatPane {...reconnectChatPanePropsHide}/>);

            try {
                screen.getByText("We have detected a previous chat session. Would you like to continue with your previous session?");
                fail("Subitle should not be in the document");
            // eslint-disable-next-line no-empty
            } catch (ex) {
            }

            try {
                screen.getByText("Previous session detected");
            } catch (ex) {
                fail("Title should be in the document");
            }
        });
    });

    act(() => {
        it("hide icon", () => {
            const reconnectChatPanePropsHide: IReconnectChatPaneProps = {
                ...defaultReconnectChatPaneProps,
                controlProps: {
                    ...defaultReconnectChatPaneProps.controlProps,
                    hideIcon: true
                }
            };
            render(<ReconnectChatPane {...reconnectChatPanePropsHide}/>);
            try {
                screen.getByRole("img");
                fail("Icon should not be in the document");
            // eslint-disable-next-line no-empty
            } catch (ex) {
            }
        });
    });

    act(() => {
        it("hide continue chat button", () => {
            const reconnectChatPanePropsHide: IReconnectChatPaneProps = {
                ...defaultReconnectChatPaneProps,
                controlProps: {
                    ...defaultReconnectChatPaneProps.controlProps,
                    hideContinueChatButton: true
                }
            };
            render(<ReconnectChatPane {...reconnectChatPanePropsHide}/>);

            try {
                screen.getByText("Continue conversation");
                fail("Continue chat button should not be in the document");
            // eslint-disable-next-line no-empty
            } catch (ex) {
            }

            try {
                screen.getByText("Start new conversation");
            } catch (ex) {
                fail("Start new chat button should be in the document");
            }
        });
    });

    act(() => {
        it("hide start new chat button", () => {
            const reconnectChatPanePropsHide: IReconnectChatPaneProps = {
                ...defaultReconnectChatPaneProps,
                controlProps: {
                    ...defaultReconnectChatPaneProps.controlProps,
                    hideStartNewChatButton: true
                }
            };
            render(<ReconnectChatPane {...reconnectChatPanePropsHide}/>);

            try {
                screen.getByText("Start new conversation");
                fail("Start new chat button should be in the document");
            // eslint-disable-next-line no-empty
            } catch (ex) {
            }

            try {
                screen.getByText("Continue conversation");
            } catch (ex) {
                fail("Continue chat button should not be in the document");
            }
        });
    });

    act(() => {
        it("reconnect chat pane button clicked", () => {
            const handleContinueChatClick = jest.fn();
            const handleStartNewChatClick = jest.fn();

            const reconnectChatPaneProps: IReconnectChatPaneProps = {
                ...defaultReconnectChatPaneProps,
                controlProps: {
                    ...defaultReconnectChatPaneProps.controlProps,
                    onContinueChat: handleContinueChatClick,
                    onStartNewChat: handleStartNewChatClick
                }
            };

            render(<ReconnectChatPane {...reconnectChatPaneProps}/>);

            const continueChatButton = screen.getByText("Continue conversation");
            fireEvent.click(continueChatButton);
            expect(handleContinueChatClick).toHaveBeenCalledTimes(1);

            const startNewChatButton = screen.getByText("Start new conversation");
            fireEvent.click(startNewChatButton);
            expect(handleStartNewChatClick).toHaveBeenCalledTimes(1);
        });
    });
});