import "@testing-library/jest-dom/extend-expect";

import * as ReactDOM from "react-dom";

import { act, cleanup } from "@testing-library/react";

import LoadingPane from "./LoadingPane";
import { ILoadingPaneProps } from "./interfaces/ILoadingPaneProps";
import React from "react";
import { defaultLoadingPaneProps } from "./common/defaultProps/defaultLoadingPaneProps";

describe("Loading Pane component", () => {

    afterEach(() => {
        cleanup;
        jest.resetAllMocks();
    });

    act(() => {
        it("renders loading pane", () => {
            const container = document.createElement("div");
            ReactDOM.render(
                <LoadingPane {...defaultLoadingPaneProps} />, container);
            expect(container.childElementCount).toBe(1);
        });
    });

    act(() => {
        it("hide loading pane", () => {
            const loadingPanePropsHide: ILoadingPaneProps = {
                ...defaultLoadingPaneProps,
                controlProps: {
                    ...defaultLoadingPaneProps.controlProps,
                    hideLoadingPane: true
                }
            };
            const container = document.createElement("div");
            ReactDOM.render(
                <LoadingPane {...loadingPanePropsHide} />, container);
            expect(container.childElementCount).toBe(0);
        });
    });
});