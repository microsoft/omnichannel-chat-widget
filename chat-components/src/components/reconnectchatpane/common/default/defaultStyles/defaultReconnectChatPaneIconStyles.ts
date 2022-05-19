import { ChatReconnectIconBase64 } from "../../../../../assets/Icons";
import { IStyle } from "@fluentui/react";

export const defaultReconnectChatPaneIconStyles: IStyle = {
    backgroundImage: `url(${ChatReconnectIconBase64})`,
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "200px",
    height: "130px",
    margin: "0 auto",
    width: "130px"
};