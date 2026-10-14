import "@testing-library/jest-dom/extend-expect";

import { cleanup, render } from "@testing-library/react";

import { ChoiceSetInput } from "adaptivecards";
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

        it("keeps the first compact choice valid after removing the iOS placeholder", () => {
            const userAgentDescriptor = Object.getOwnPropertyDescriptor(window.navigator, "userAgent");
            Object.defineProperty(window.navigator, "userAgent", {
                configurable: true,
                value: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)"
            });

            const props: IPreChatSurveyPaneProps = {
                ...defaultPreChatSurveyPaneProps,
                controlProps: {
                    ...defaultPreChatSurveyPaneProps.controlProps,
                    payload: JSON.stringify({
                        type: "AdaptiveCard",
                        version: "1.5",
                        body: [{
                            type: "Input.ChoiceSet",
                            id: "choice",
                            style: "compact",
                            isRequired: true,
                            choices: [
                                { title: "One", value: "1" },
                                { title: "Two", value: "2" }
                            ]
                        }]
                    })
                }
            };

            const { container } = render(<PreChatSurveyPane {...props} />);
            const select = container.querySelector<HTMLSelectElement>("select.ac-choiceSetInput-compact");

            expect(select).not.toBeNull();
            expect(Array.from(select?.options ?? []).map((option) => option.value)).toEqual(["1", "2"]);
            expect(select?.value).toBe("1");

            const input = new ChoiceSetInput();
            input.isMultiSelect = false;
            (input as unknown as { _selectElement: HTMLSelectElement | null })._selectElement = select;
            expect(input.value).toBe("1");

            if (userAgentDescriptor) {
                Object.defineProperty(window.navigator, "userAgent", userAgentDescriptor);
            }
        });
});