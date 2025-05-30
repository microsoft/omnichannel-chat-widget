import "@testing-library/jest-dom";

import { cleanup, render } from "@testing-library/react";

import PostChatSurveyPane from "./PostChatSurveyPane";
import React from "react";
import { defaultPostChatSurveyPaneProps } from "./common/defaultProps/defaultPostChatSurveyPaneProps";

describe("PostChatSurvey Pane component", () => {

    afterEach(() => {
        cleanup();
        jest.resetAllMocks();
    });

        it("renders Postchatsurvey pane", () => {
            const {container} = render(<PostChatSurveyPane {...defaultPostChatSurveyPaneProps} />);
            expect(container.childElementCount).toBe(1);
        });
});