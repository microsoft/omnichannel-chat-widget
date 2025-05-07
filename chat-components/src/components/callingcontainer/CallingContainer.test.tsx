import React from "react";
import * as ReactDOM from "react-dom";
import { act, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import { defaultCallingContainerProps } from "./common/defaultProps/defaultCallingContainerProps";
import CallingContainer from "./CallingContainer";
import { ICallingContainerControlProps } from "./interfaces/ICallingContainerControlProps";

const callingConainerStyleProps = defaultCallingContainerProps.styleProps;

const incomingCallCallingContainerControlProps: ICallingContainerControlProps = {
    ...defaultCallingContainerProps.controlProps,
    isIncomingCall: true
};

const currentCallCallingContainerControlProps: ICallingContainerControlProps = {
    ...defaultCallingContainerProps.controlProps,
    isIncomingCall: false
};

describe("Calling Container component", () => {

    afterEach(() => {
        cleanup;
        jest.resetAllMocks();
    });

    act(() => {
        it("renders incoming call toast", () => {
            const container = document.createElement("div");
            ReactDOM.render(
                <CallingContainer controlProps={incomingCallCallingContainerControlProps} styleProps={callingConainerStyleProps} />,
                container);
            expect(container.childElementCount).toBe(1);
        });
    });

    act(() => {
        it("renders current call control", () => {
            const container = document.createElement("div");
            ReactDOM.render(
                <CallingContainer controlProps={currentCallCallingContainerControlProps} styleProps={callingConainerStyleProps} />,
                container);
            expect(container.childElementCount).toBe(1);
        });
    });
});