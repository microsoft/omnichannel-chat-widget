import "@testing-library/jest-dom/extend-expect";

import * as ReactDOM from "react-dom";

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";

import ReconnectChatPane from "./ReconnectChatPane";
import { IReconnectChatPaneProps } from "./interfaces/IReconnectChatPaneProps";
import React from "react";
import { defaultReconnectChatPaneProps } from "./common/default/defaultProps/defaultReconnectChatPaneProps";
import { BroadcastServiceInitialize } from "../../services/BroadcastService";
import { Texts } from "../../common/Constants";

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
                screen.getByText(Texts.ReconnectChatPaneTitleText);
                fail("Title should not be in the document");
            // eslint-disable-next-line no-empty
            } catch (ex) {
            }

            try {
                screen.getByText(Texts.ReconnectChatPaneSubtitleText);
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
                screen.getByText(Texts.ReconnectChatPaneSubtitleText);
                fail("Subitle should not be in the document");
            // eslint-disable-next-line no-empty
            } catch (ex) {
            }

            try {
                screen.getByText(Texts.ReconnectChatPaneTitleText);
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
                screen.getByText(Texts.ReconnectChatPaneContinueChatButtonText);
                fail("Continue chat button should not be in the document");
            // eslint-disable-next-line no-empty
            } catch (ex) {
            }

            try {
                screen.getByText(Texts.ReconnectChatPaneStartNewChatButtonText);
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
                screen.getByText(Texts.ReconnectChatPaneStartNewChatButtonText);
                fail("Start new chat button should be in the document");
            // eslint-disable-next-line no-empty
            } catch (ex) {
            }

            try {
                screen.getByText(Texts.ReconnectChatPaneContinueChatButtonText);
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

            const continueChatButton = screen.getByText(Texts.ReconnectChatPaneContinueChatButtonText);
            fireEvent.click(continueChatButton);
            expect(handleContinueChatClick).toHaveBeenCalledTimes(1);

            const startNewChatButton = screen.getByText(Texts.ReconnectChatPaneStartNewChatButtonText);
            fireEvent.click(startNewChatButton);
            expect(handleStartNewChatClick).toHaveBeenCalledTimes(1);
        });
    });
});