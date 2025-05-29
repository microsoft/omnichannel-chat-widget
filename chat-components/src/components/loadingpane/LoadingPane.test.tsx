import "@testing-library/jest-dom";

import { cleanup, render } from "@testing-library/react";

import { ILoadingPaneProps } from "./interfaces/ILoadingPaneProps";
import LoadingPane from "./LoadingPane";
import React from "react";
import { defaultLoadingPaneProps } from "./common/defaultProps/defaultLoadingPaneProps";

describe("Loading Pane component", () => {

    afterEach(() => {
        cleanup();
        jest.resetAllMocks();
    });

        it("renders loading pane", () => {
            const {container } = render(<LoadingPane {...defaultLoadingPaneProps} />);
            expect(container.childElementCount).toBe(1);
        });

        it("hide loading pane", () => {
            const loadingPanePropsHide: ILoadingPaneProps = {
                ...defaultLoadingPaneProps,
                controlProps: {
                    ...defaultLoadingPaneProps.controlProps,
                    hideLoadingPane: true
                }
            };
            const {container} = render(<LoadingPane {...loadingPanePropsHide} />);
            expect(container.childElementCount).toBe(0);
        });
});