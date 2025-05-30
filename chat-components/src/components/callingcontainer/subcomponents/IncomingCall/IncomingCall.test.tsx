import "@testing-library/jest-dom";

import { cleanup, render } from "@testing-library/react";

import { IIncomingCallControlProps } from "./interfaces/IIncomingCallControlProps";
import IncomingCall from "./IncomingCall";
import React from "react";
import { defaultIncomingCallProps } from "./common/defaultProps/defaultIncomingCallProps";

const incomingCallStyleProps = defaultIncomingCallProps.styleProps;

const incomingCallControlProps: IIncomingCallControlProps = {
    ...defaultIncomingCallProps.controlProps
};

const incomingCallControlPropsRtl: IIncomingCallControlProps = {
    ...defaultIncomingCallProps.controlProps,
    dir: "rtl"
};

describe("Current Call component", () => {

    afterEach(() => {
        cleanup();
        jest.resetAllMocks();
    });

    it("Renders IncomingCall control", () => {
        const { container } = render(
            <IncomingCall controlProps={incomingCallControlProps} styleProps={incomingCallStyleProps} />);
        expect(container.childElementCount).toBe(1);
    });

    it("Renders IncomingCall control with rtl", () => {
        const { container } = render(
            <IncomingCall controlProps={incomingCallControlPropsRtl} styleProps={incomingCallStyleProps} />);
        expect(container.childElementCount).toBe(1);
    });
});