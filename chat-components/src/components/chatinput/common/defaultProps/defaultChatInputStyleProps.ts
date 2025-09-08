import { IChatInputStyleProps } from "../../interfaces/IChatInputStyleProps";

export const defaultChatInputStyleProps: IChatInputStyleProps = {
    containerStyleProps: {
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        borderRadius: "15px",
        backgroundColor: "#F7F7F9",
        position: "relative",
        padding: "0px"
    },

    inputContainerStyleProps: {
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        borderRadius: "15px"
    },

    inputWrapperStyleProps: {
        borderRadius: "15px"
    },

    inputFieldStyleProps: {
        borderRadius: "0px"
    },

    dragDropOverlayStyleProps: {
        backgroundColor: "rgba(0, 123, 255, 0.1)",
        border: "2px dashed #007bff",
        borderRadius: "15px",
        color: "#007bff",
        fontSize: "14px",
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    }
};
