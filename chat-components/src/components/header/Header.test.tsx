import "@testing-library/jest-dom";

import Header from "./Header";
import React from "react";
import { cleanup } from "@testing-library/react";
import { defaultHeaderProps } from "./common/defaultProps/defaultHeaderProps";
import { render } from "@testing-library/react";

const headerProps = defaultHeaderProps;
const rtlHeaderProps = { ...defaultHeaderProps };
if (rtlHeaderProps?.controlProps) {
    rtlHeaderProps.controlProps.dir = "rtl";
}

describe("Header component", () => {

    afterEach(() => {
        cleanup();
        jest.resetAllMocks();
    });
    
        it("renders header without rtl", () => {
        const {container} = render(<Header {...headerProps} />);
        expect(container.childElementCount).toBe(1);
        });

        it("renders header with rtl", () => {
            const {container} = render(<Header {...rtlHeaderProps} />);
            expect(container.childElementCount).toBe(1);
        });
});