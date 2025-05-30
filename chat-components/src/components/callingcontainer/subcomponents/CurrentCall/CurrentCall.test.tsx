import "@testing-library/jest-dom";

import { cleanup, render } from "@testing-library/react";

import CurrentCall from "./CurrentCall";
import { ICurrentCallControlProps } from "./interfaces/ICurrentCallControlProps";
import React from "react";
import { defaultCurrentCallProps } from "./common/defaultProps/defaultCurrentCallProps";

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
        cleanup();
        jest.resetAllMocks();
    });

    it("Renders CurrentCall control", () => {
        const { container } = render(
            <CurrentCall controlProps={currentCallControlProps} styleProps={currentCallStyleProps} />);

        expect(container.childElementCount).toBe(1);
    });

    it("Renders CurrentCall control with rtl", () => {
        const { container } = render(
            <CurrentCall controlProps={currentCallControlPropsRtl} styleProps={currentCallStyleProps} />);
        expect(container.childElementCount).toBe(1);
    });
});