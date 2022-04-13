import { IProactiveChatPaneComponentOverrides } from "../../../interfaces/IProactiveChatPaneComponentOverrides";
import React from "react";
import { encodeComponentString } from "../../../../..";

const customReactNode1 = encodeComponentString(
    <div style={{color: "rgb(255, 255, 255)",
        float: "right", 
        backgroundColor: "green",
        borderRadius: "50px",
        fontSize: "10px",
        height: "20px",
        margin: "10px 10px 0 0",
        padding: "10px",
        width: "20px"}}>
            End Chat
    </div>
);

const customReactNode2 = (
    <button style={{color: "rgb(255, 255, 255)",
        backgroundColor: "green",
        borderRadius: "30px",
        borderColor: "green",
        borderStyle: "solid",
        height: "80px",
        margin: "30px 15px 0 0",
        padding: "10px",
        width: "160px"}}>
            This is a custom button
    </button>
);

export const presetTwoProactiveChatPaneComponentOverrides: IProactiveChatPaneComponentOverrides = {
    closeButton: customReactNode1,
    bodyTitle: customReactNode2
};