import React from "react";
import { IInputValidationPaneComponentOverrides } from "../../../interfaces/IInputValidationPaneComponentOverrides";

const customReactNode = (
    <button style={{color: "rgb(255, 255, 255)",
        backgroundColor: "green",
        borderRadius: "30px",
        borderColor: "green",
        borderStyle: "solid",
        float: "left",
        height: "100px",
        margin: "10px",
        padding: "10px",
        width: "100px"}}>
            This is a custom button
    </button>
);

export const presetTwoInputValidationPaneComponentOverrides: IInputValidationPaneComponentOverrides = {
    subtitle: customReactNode
};