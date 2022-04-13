import { IStyle } from "@fluentui/react";
import closeImage from "../../../../../assets/imgs/closeChatButton.svg";

export const defaultProactiveChatPaneCloseButtonStyles: IStyle = {
    backgroundImage: "url(" + closeImage + ")",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat", 
    color: "#605e5c",
    cursor: "pointer",
    height: "14px",
    lineHeight: "14px",
    textAlign: "center",
    width: "14px",
    zIndex: "inherit"
};