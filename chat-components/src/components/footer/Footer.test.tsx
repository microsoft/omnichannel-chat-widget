import "@testing-library/jest-dom/extend-expect";

import * as ReactDOM from "react-dom";

import { act, cleanup } from "@testing-library/react";

import Footer from "./Footer";
import { IFooterControlProps } from "./interfaces/IFooterControlProps";
import React from "react";
import { defaultFooterProps } from "./common/defaultProps/defaultFooterProps";

const footerStyles = defaultFooterProps.styleProps;

const footerControlPropsRtl: IFooterControlProps = {
    ...defaultFooterProps.controlProps,
    dir: "rtl"
};

describe("Footer component", () => {

    afterEach(() => {
        cleanup;
        jest.resetAllMocks();
    });

    act(() => {
        it("renders footer", () => {
            const container = document.createElement("div");
            ReactDOM.render(
                <Footer controlProps={defaultFooterProps.controlProps} styleProps={footerStyles}>
                </Footer>, container);
        });
    });

    act(() => {
        it("renders rtl footer", () => {
            const container = document.createElement("div");
            ReactDOM.render(
                <Footer controlProps={footerControlPropsRtl} styleProps={footerStyles}>
                </Footer>, container);
            expect(container.childElementCount).toBe(1);
        });
    });

    act(() => {
        it("default footer has more one child element", () => {
            const container = document.createElement("div");
            ReactDOM.render(
                <Footer controlProps={defaultFooterProps.controlProps} styleProps={footerStyles}>
                </Footer>, container);
            expect(container.firstElementChild?.childElementCount).toBeGreaterThan(1);
        });
    });
});