import "@testing-library/jest-dom/extend-expect";

import * as ReactDOM from "react-dom";

import { act, cleanup } from "@testing-library/react";

import PreChatSurveyPane from "./PreChatSurveyPane";
import { IPreChatSurveyPaneProps } from "./interfaces/IPreChatSurveyPaneProps";
import React from "react";
import { defaultPreChatSurveyPaneProps } from "./common/defaultProps/defaultPreChatSurveyPaneProps";

describe("PreChatSurvey Pane component", () => {

    afterEach(() => {
        cleanup;
        jest.resetAllMocks();
    });

    act(() => {
        it("renders prechatsurvey pane", () => {
            const container = document.createElement("div");
            ReactDOM.render(
                <PreChatSurveyPane {...defaultPreChatSurveyPaneProps} />, container);
            expect(container.childElementCount).toBe(2);
        });
    });

    act(() => {
        it("hide prechatsurvey pane", () => {
            const preChatSurveyPanePropsHide: IPreChatSurveyPaneProps = {
                ...defaultPreChatSurveyPaneProps,
                controlProps: {
                    ...defaultPreChatSurveyPaneProps.controlProps,
                    hidePreChatSurveyPane: true
                }
            };
            const container = document.createElement("div");
            ReactDOM.render(
                <PreChatSurveyPane {...preChatSurveyPanePropsHide} />, container);
            expect(container.childElementCount).toBe(1);
        });
    });
});