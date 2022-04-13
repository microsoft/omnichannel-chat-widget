import React from "react";
import * as ReactDOM from "react-dom";
import { act, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import { defaultCurrentCallProps } from "./common/defaultProps/defaultCurrentCallProps";
import CurrentCall from "./CurrentCall";
import { ICurrentCallControlProps } from "./interfaces/ICurrentCallControlProps";

const currentCallStyleProps = defaultCurrentCallProps.styleProps;

const currentCallControlProps: ICurrentCallControlProps = {
    ...defaultCurrentCallProps.controlProps
};

const currentCallControlPropsRtl: ICurrentCallControlProps = {
    ...defaultCurrentCallProps.controlProps,
    dir: "rtl"
};

describe("Current Call component", () => {

    afterEach(() => {
        cleanup;
        jest.resetAllMocks();
    });

    act(() => {
        it("Renders CurrentCall control", () => {
            const container = document.createElement("div");
            ReactDOM.render(
                <CurrentCall controlProps={currentCallControlProps} styleProps={currentCallStyleProps} />,
                container);
            expect(container.childElementCount).toBe(1);
        });
    });

    act(() => {
        it("Renders CurrentCall control with rtl", () => {
            const container = document.createElement("div");
            ReactDOM.render(
                <CurrentCall controlProps={currentCallControlPropsRtl} styleProps={currentCallStyleProps} />,
                container);
            expect(container.childElementCount).toBe(1);
        });
    });
});