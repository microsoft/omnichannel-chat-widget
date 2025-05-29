import "@testing-library/jest-dom";

import { cleanup, render } from "@testing-library/react";

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
        cleanup();
        jest.resetAllMocks();
    });

        it("renders footer", () => {
            const {container} = render(<Footer controlProps={defaultFooterProps.controlProps} styleProps={footerStyles}>
                </Footer>);
            expect(container.childElementCount).toBe(1);    
        });

        it("renders rtl footer", () => {
            const {container} = render(<Footer controlProps={footerControlPropsRtl} styleProps={footerStyles}>
                </Footer>);
            
            expect(container.childElementCount).toBe(1);
        });

        it("default footer has more one child element", () => {

            const {container} = render(
                <Footer controlProps={defaultFooterProps.controlProps} styleProps={footerStyles}>
                </Footer>);
            expect(container.firstElementChild?.childElementCount).toBeGreaterThan(1);
        });
});