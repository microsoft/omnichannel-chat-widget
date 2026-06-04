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

        // Regression guard: the placeholder <option> (index 0) on a required
        // compact ChoiceSet must be preserved. Adaptive Cards' value getter only
        // returns a value when selectedIndex > 0 (index 0 == placeholder), so
        // deleting the placeholder shifts the first real choice to index 0 and
        // breaks isRequired validation for that choice.
        it("preserves the placeholder option on a required compact ChoiceSet", () => {
            const payload = JSON.stringify({
                $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
                type: "AdaptiveCard",
                version: "1.1",
                body: [{
                    type: "Input.ChoiceSet",
                    id: "q1",
                    label: "options",
                    isMultiSelect: false,
                    isRequired: true,
                    errorMessage: "Required",
                    style: "compact",
                    choices: [
                        { title: "one", value: "1" },
                        { title: "two", value: "2" },
                        { title: "three", value: "3" }
                    ]
                }],
                actions: [{ type: "Action.Submit", title: "Submit" }]
            });

            const props: IPreChatSurveyPaneProps = {
                ...defaultPreChatSurveyPaneProps,
                controlProps: {
                    ...defaultPreChatSurveyPaneProps.controlProps,
                    payload
                }
            };

            const { container } = render(<PreChatSurveyPane {...props} />);
            const select = container.querySelector<HTMLSelectElement>("select.ac-choiceSetInput-compact");

            expect(select).not.toBeNull();
            // placeholder (index 0) + 3 real choices
            expect(select?.options.length).toBe(4);
            // index 0 must remain the disabled, empty-value placeholder
            expect(select?.options[0].value).toBe("");
            expect(select?.options[0].disabled).toBe(true);
            // first real choice stays at index 1 (selectedIndex > 0 => valid)
            expect(select?.options[1].value).toBe("1");
    });
});