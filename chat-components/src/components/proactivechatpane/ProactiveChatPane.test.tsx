import "@testing-library/jest-dom/extend-expect";

import * as ReactDOM from "react-dom";

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";

import ProactiveChatPane from "./ProactiveChatPane";
import { IProactiveChatPaneProps } from "./interfaces/IProactiveChatPaneProps";
import React from "react";
import { defaultProactiveChatPaneProps } from "./common/default/defaultProps/defaultProactiveChatPaneProps";
import { BroadcastServiceInitialize } from "../../services/BroadcastService";
import { Texts } from "../../common/Constants";

beforeAll(() => {
    BroadcastServiceInitialize("testChannel");
});

describe("Proactive Chat Pane component", () => {

    afterEach(() => {
        cleanup;
        jest.resetAllMocks();
    });
    
    act(() => {
        it("renders proactive chat pane", () => {
            const container = document.createElement("div");
            ReactDOM.render(
                <ProactiveChatPane {...defaultProactiveChatPaneProps}/>, container);
            expect(container.childElementCount).toBe(1);
        });
    });

    act(() => {
        it("hide proactive chat pane", () => {
            const proactiveChatPanePropsHide: IProactiveChatPaneProps = {
                ...defaultProactiveChatPaneProps,
                controlProps: {
                    ...defaultProactiveChatPaneProps.controlProps,
                    hideProactiveChatPane: true
                }
            };
            const container = document.createElement("div");
            ReactDOM.render(
                <ProactiveChatPane {...proactiveChatPanePropsHide}/>, container);
            expect(container.childElementCount).toBe(0);
        });
    });

    act(() => {
        it("hide title", () => {
            const proactiveChatPanePropsHide: IProactiveChatPaneProps = {
                ...defaultProactiveChatPaneProps,
                controlProps: {
                    ...defaultProactiveChatPaneProps.controlProps,
                    hideTitle: true
                }
            };
            render(<ProactiveChatPane {...proactiveChatPanePropsHide}/>);

            try {
                screen.getByText(Texts.ProactiveChatPaneTitleText);
                fail("Title should not be in the document");
            // eslint-disable-next-line no-empty
            } catch (ex) {
            }

            try {
                screen.getByText(Texts.ProactiveChatPaneSubtitleText);
            } catch (ex) {
                fail("Subtitle should be in the document");
            }
        });
    });

    act(() => {
        it("hide subtitle", () => {
            const proactiveChatPanePropsHide: IProactiveChatPaneProps = {
                ...defaultProactiveChatPaneProps,
                controlProps: {
                    ...defaultProactiveChatPaneProps.controlProps,
                    hideSubtitle: true
                }
            };
            render(<ProactiveChatPane {...proactiveChatPanePropsHide}/>);

            try {
                screen.getByText(Texts.ProactiveChatPaneSubtitleText);
                fail("Subitle should not be in the document");
            // eslint-disable-next-line no-empty
            } catch (ex) {
            }

            try {
                screen.getByText(Texts.ProactiveChatPaneTitleText);
            } catch (ex) {
                fail("Title should be in the document");
            }
        });
    });

    act(() => {
        it("hide close button", () => {
            const proactiveChatPanePropsHide: IProactiveChatPaneProps = {
                ...defaultProactiveChatPaneProps,
                controlProps: {
                    ...defaultProactiveChatPaneProps.controlProps,
                    hideCloseButton: true,
                    hideStartButton: true
                }
            };
            render(<ProactiveChatPane {...proactiveChatPanePropsHide}/>);
            try {
                screen.getByRole("button");
                fail("Close button and start button should not be in the document");
            // eslint-disable-next-line no-empty
            } catch (ex) {
            }
        });
    });

    act(() => {
        it("hide body title", () => {
            const proactiveChatPanePropsHide: IProactiveChatPaneProps = {
                ...defaultProactiveChatPaneProps,
                controlProps: {
                    ...defaultProactiveChatPaneProps.controlProps,
                    hideBodyTitle: true
                }
            };
            render(<ProactiveChatPane {...proactiveChatPanePropsHide}/>);

            try {
                screen.getByText(Texts.ProactiveChatPaneBodyTitleText);
                fail("Body title should not be in the document");
            // eslint-disable-next-line no-empty
            } catch (ex) {
            }

            try {
                screen.getByText(Texts.ProactiveChatPaneTitleText);
            } catch (ex) {
                fail("Title should be in the document");
            }
        });
    });

    act(() => {
        it("hide start button", () => {
            const proactiveChatPanePropsHide: IProactiveChatPaneProps = {
                ...defaultProactiveChatPaneProps,
                controlProps: {
                    ...defaultProactiveChatPaneProps.controlProps,
                    hideStartButton: true
                }
            };
            render(<ProactiveChatPane {...proactiveChatPanePropsHide}/>);

            try {
                screen.getByText(Texts.ProactiveChatPaneStartButtonText);
                fail("Start button should be in the document");
            // eslint-disable-next-line no-empty
            } catch (ex) {
            }
        });
    });

    act(() => {
        it("proactive chat pane close button clicked", () => {
            const handleCloseClick = jest.fn();

            const proactiveChatPaneProps: IProactiveChatPaneProps = {
                ...defaultProactiveChatPaneProps,
                controlProps: {
                    ...defaultProactiveChatPaneProps.controlProps,
                    hideStartButton: true,
                    onClose: handleCloseClick,
                }
            };

            render(<ProactiveChatPane {...proactiveChatPaneProps}/>);

            const buttons = screen.getAllByRole("button");
            const closeButton = buttons[0];
            fireEvent.click(closeButton);
            expect(handleCloseClick).toHaveBeenCalledTimes(1);
        });
    });

    act(() => {
        it("proactive chat pane start button clicked", () => {
            const handleStartClick = jest.fn();

            const proactiveChatPaneProps: IProactiveChatPaneProps = {
                ...defaultProactiveChatPaneProps,
                controlProps: {
                    ...defaultProactiveChatPaneProps.controlProps,
                    onStart: handleStartClick
                }
            };

            render(<ProactiveChatPane {...proactiveChatPaneProps}/>);

            const startButton = screen.getByText(Texts.ProactiveChatPaneStartButtonText);
            fireEvent.click(startButton);
            expect(handleStartClick).toHaveBeenCalledTimes(1);
        });
    });
});