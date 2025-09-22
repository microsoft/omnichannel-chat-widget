import { defaultSystemMessageStyles } from "./defaultSystemMessageStyles";
import { IStyle } from "@fluentui/react"; // Adjust the import path if necessary

export const defaultInlineBannerStyle : IStyle = {
    ...defaultSystemMessageStyles,
    visibility: "visible",
    height: "20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "5px 10px",
    cursor: "pointer"
};