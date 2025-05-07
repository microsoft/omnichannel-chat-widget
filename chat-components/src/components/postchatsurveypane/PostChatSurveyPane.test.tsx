import "@testing-library/jest-dom/extend-expect";

import * as ReactDOM from "react-dom";

import { act, cleanup } from "@testing-library/react";

import PostChatSurveyPane from "./PostChatSurveyPane";
import React from "react";
import { defaultPostChatSurveyPaneProps } from "./common/defaultProps/defaultPostChatSurveyPaneProps";

describe("PostChatSurvey Pane component", () => {

    afterEach(() => {
        cleanup;
        jest.resetAllMocks();
    });

    act(() => {
        it("renders Postchatsurvey pane", () => {
            const container = document.createElement("div");
            ReactDOM.render(
                <PostChatSurveyPane {...defaultPostChatSurveyPaneProps} />, container);
            expect(container.childElementCount).toBe(1);
        });
    });
});