import React from "react";
import * as ReactDOM from "react-dom";
import "@testing-library/jest-dom/extend-expect";
import { act, cleanup } from "@testing-library/react";

import Header from "./Header";
import { defaultHeaderProps } from "./common/defaultProps/defaultHeaderProps";

const headerProps = defaultHeaderProps;
const rtlHeaderProps = defaultHeaderProps;
rtlHeaderProps.controlProps.dir = "rtl";

describe("Header component", () => {

    afterEach(() => {
        cleanup;
        jest.resetAllMocks();
    });
    
    act(() => {
        it("renders header without rtl", () => {
            const container = document.createElement("div");
            ReactDOM.render(
                <Header {...headerProps}>
                    <div/>
                </Header>, container);
            expect(container.childElementCount).toBe(1);
        });
    });

    act(() => {
        it("renders header with rtl", () => {
            const container = document.createElement("div");
            ReactDOM.render(
                <Header {...rtlHeaderProps}>
                    <div/>
                </Header>, container);
            expect(container.childElementCount).toBe(1);
        });
    });
});