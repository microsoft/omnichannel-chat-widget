import { IStyle } from "@fluentui/react";
import chatImg from "../../../../../assets/imgs/chat.svg";

export const presetTwoLoadingPaneGeneralStyles: IStyle = {
    borderStyle: "dotted",
    borderRadius: "50%",
    borderWidth: "5px",
    backgroundColor: "#767676",
    backgroundSize: "250px",
    backgroundImage: `url(${chatImg})`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    borderColor: "",
    boxShadow: "0px 0px 10px 5px #B2B2B2",
    width: "380px",
    height: "380px",
    position: "absolute",
    left: "1%",
    top: "2%",
    justifyContent: "center",
    alignItems: "left",
    flexFlow: "row wrap"
};