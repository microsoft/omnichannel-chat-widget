import { ErrorIconBase64 } from "../../../../../assets/Icons";
import { IStyle } from "@fluentui/react";

export const presetTwoOOOHPaneGeneralStyles: IStyle = {
    borderStyle: "dotted solid double dashed",
    borderRadius: "40%",
    borderWidth: "5px",
    backgroundColor: "#FFFFFF",
    backgroundSize: "200px",
    backgroundImage: `url(${ErrorIconBase64})`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    borderColor: "#F2FFF1",
    boxShadow: "0px 0px 2px 3px #DDDDD7",
    width: "450px",
    height: "350px",
    position: "absolute",
    left: "20%",
    top: "20%",
    justifyContent: "center",
    alignItems: "stretch",
    flexFlow: "column wrap"
};