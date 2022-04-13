import React from "react";
import * as ReactDOM from "react-dom";
import { act, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import { defaultIncomingCallProps } from "./common/defaultProps/defaultIncomingCallProps";
import IncomingCall from "./IncomingCall";
import { IIncomingCallControlProps } from "./interfaces/IIncomingCallControlProps";

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
        cleanup;
        jest.resetAllMocks();
    });

    act(() => {
        it("Renders IncomingCall control", () => {
            const container = document.createElement("div");
            ReactDOM.render(
                <IncomingCall controlProps={incomingCallControlProps} styleProps={incomingCallStyleProps} />,
                container);
            expect(container.childElementCount).toBe(1);
        });
    });

    act(() => {
        it("Renders IncomingCall control with rtl", () => {
            const container = document.createElement("div");
            ReactDOM.render(
                <IncomingCall controlProps={incomingCallControlPropsRtl} styleProps={incomingCallStyleProps} />,
                container);
            expect(container.childElementCount).toBe(1);
        });
    });
});