import { IStyle } from "@fluentui/react";
import downloadChatButtonImage from "../../../../assets/imgs/chat.svg";

export const defaultChatButtonIconContainerStyles: IStyle = {
    align: "center",
    backgroundColor:"#315FA2",
    backgroundImage: `url(${downloadChatButtonImage})`,
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "65% 65%",
    borderColor: "transparent",
    borderRadius: "50%",
    borderStyle: "solid",
    borderWidth: "1px",
    display: "flex",
    height: "60px",
    justifyContent: "center",
    margin: "-2px -2px -2px -3px",
    width: "62px"
};
