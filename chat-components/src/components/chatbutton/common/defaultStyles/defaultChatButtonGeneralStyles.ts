import { IStyle } from "@fluentui/react";

export const defaultChatButtonGeneralStyles: IStyle = {
    backgroundColor: "#fff",
    borderColor: "#fff",
    borderRadius: "100px 100px 100px 99px",
    borderStyle: "solid",
    borderWidth: "1px",
    bottom: "0px",
    boxShadow: "0 0 4px rgb(102 102 102 / 50%)",
    cursor: "pointer",
    display: "flex",
    height: "60px",
    margin: "3px 3px 3px 3px",
    padding: "0px",
    position: "absolute",
    right: "0px",
    selectors: {
        ":hover" : {
            backgroundColor: "lightgrey"
        },
        ":focus" : {
            outline: "dotted 2px #000"
        }
    },
    minWidth: "180px"
};