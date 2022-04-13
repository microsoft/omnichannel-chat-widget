import "@testing-library/jest-dom/extend-expect";

import * as ReactDOM from "react-dom";

import { act, cleanup } from "@testing-library/react";

import OOOHPane from "./OOOHPane";
import { IOOOHPaneProps } from "./interfaces/IOOOHPaneProps";
import React from "react";
import { defaultOOOHPaneProps } from "./common/defaultProps/defaultOOOHPaneProps";

describe("OOOH Pane component", () => {

    afterEach(() => {
        cleanup;
        jest.resetAllMocks();
    });

    act(() => {
        it("renders oooh pane", () => {
            const container = document.createElement("div");
            ReactDOM.render(
                <OOOHPane {...defaultOOOHPaneProps} />, container);
            expect(container.childElementCount).toBe(1);
        });
    });

    act(() => {
        it("hide oooh pane", () => {
            const ooohPanePropsHide: IOOOHPaneProps = {
                ...defaultOOOHPaneProps,
                controlProps: {
                    ...defaultOOOHPaneProps.controlProps,
                    hideOOOHPane: true
                }
            };
            const container = document.createElement("div");
            ReactDOM.render(
                <OOOHPane {...ooohPanePropsHide} />, container);
            expect(container.childElementCount).toBe(0);
        });
    });
});