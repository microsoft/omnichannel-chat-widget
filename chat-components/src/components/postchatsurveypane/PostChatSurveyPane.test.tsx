import "@testing-library/jest-dom/extend-expect";

import PostChatSurveyPane from "./PostChatSurveyPane";
import React from "react";
import { cleanup } from "@testing-library/react";
import { defaultPostChatSurveyPaneProps } from "./common/defaultProps/defaultPostChatSurveyPaneProps";
import { render } from "@testing-library/react";

describe("PostChatSurvey Pane component", () => {

    afterEach(() => {
        cleanup();
        jest.resetAllMocks();
    });
    it("renders Postchatsurvey pane", () => {
        const { container } = render(<PostChatSurveyPane {...defaultPostChatSurveyPaneProps} />);
        expect(container.childElementCount).toBe(1);
    });
});