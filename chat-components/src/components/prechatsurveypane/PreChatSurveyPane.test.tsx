import "@testing-library/jest-dom/extend-expect";

import { cleanup, render } from "@testing-library/react";

import { IPreChatSurveyPaneProps } from "./interfaces/IPreChatSurveyPaneProps";
import PreChatSurveyPane from "./PreChatSurveyPane";
import React from "react";
import { defaultPreChatSurveyPaneProps } from "./common/defaultProps/defaultPreChatSurveyPaneProps";

describe("PreChatSurvey Pane component", () => {

    afterEach(() => {
        cleanup();
        jest.resetAllMocks();
    });

        it("renders prechatsurvey pane", () => {
            const {container} = render(
                <PreChatSurveyPane {...defaultPreChatSurveyPaneProps} />);
            expect(container.childElementCount).toBe(2);
        });

        it("hide prechatsurvey pane", () => {
            const preChatSurveyPanePropsHide: IPreChatSurveyPaneProps = {
                ...defaultPreChatSurveyPaneProps,
                controlProps: {
                    ...defaultPreChatSurveyPaneProps.controlProps,
                    hidePreChatSurveyPane: true
                }
            };
            const {container} = render(
                <PreChatSurveyPane {...preChatSurveyPanePropsHide} />);

            expect(container.childElementCount).toBe(1);
    });
});