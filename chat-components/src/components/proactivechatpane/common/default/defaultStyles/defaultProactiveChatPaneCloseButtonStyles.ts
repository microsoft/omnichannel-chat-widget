import { CloseChatButtonIconBase64 } from "../../../../../assets/Icons";
import { IStyle } from "@fluentui/react";

export const defaultProactiveChatPaneCloseButtonStyles: IStyle = {
    backgroundImage: `url(${CloseChatButtonIconBase64})`,
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