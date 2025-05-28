import "@testing-library/jest-dom";

import * as ReactDOM from "react-dom";

import { cleanup, render } from "@testing-library/react";

import { IOOOHPaneProps } from "./interfaces/IOOOHPaneProps";
import OOOHPane from "./OOOHPane";
import React from "react";
import { defaultOOOHPaneProps } from "./common/defaultProps/defaultOOOHPaneProps";

describe("OOOH Pane component", () => {

    afterEach(() => {
        cleanup();
        jest.resetAllMocks();
    });

    it("renders oooh pane", () => {
        const { container } = render(
            <OOOHPane {...defaultOOOHPaneProps} />);

        expect(container.childElementCount).toBe(1);
    });


    it("hide oooh pane", () => {
        const ooohPanePropsHide: IOOOHPaneProps = {
            ...defaultOOOHPaneProps,
            controlProps: {
                ...defaultOOOHPaneProps.controlProps,
                hideOOOHPane: true
            }
        };
        const { container } = render(
            <OOOHPane {...ooohPanePropsHide} />);
        expect(container.childElementCount).toBe(0);
    });

});