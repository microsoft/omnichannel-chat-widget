import { defaultSystemMessageStyles } from "./defaultSystemMessageStyles";

export const defaultInlineBannerStyle = {
    ...defaultSystemMessageStyles,
    visibility: "visible",
    height: "20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "5px 10px",
    cursor: "pointer"
};