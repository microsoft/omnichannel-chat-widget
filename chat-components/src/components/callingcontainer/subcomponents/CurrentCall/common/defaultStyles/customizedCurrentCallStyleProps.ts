import { ICurrentCallStyleProps } from "../../interfaces/ICurrentCallStyleProps";

export const customizedCurrentCallStyleProps: ICurrentCallStyleProps = {
    generalStyleProps: {
        background: "lightgrey",
        minHeight: "80px",
        borderRadius: "0 0 3px 3px"
    },
    micButtonStyleProps: {
        borderRadius: "50%",
        borderWidth: "1px",
        borderStyle: "double",
        borderColor: "blue",
        color: "blue",
        backgroundColor: "white",
        lineHeight: "50px",
        height: "50px",
        width: "50px",
        margin: "1px"
    },
    micButtonHoverStyleProps: {
        filter: "brightness(0.8)"
    },
    videoOffButtonStyleProps: {
        borderRadius: "50%",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "blue",
        color: "blue",
        backgroundColor: "white",
        height: "50px",
        width: "50px",
        margin: "1px"
    },
    videoOffButtonHoverStyleProps: {
        filter: "brightness(0.8)"
    },
    endCallButtonHoverStyleProps: {
        filter: "brightness(0.8)"
    },
    endCallButtonStyleProps: {
        borderRadius: "50%",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "red",
        color: "white",
        backgroundColor: "red",
        height: "50px",
        width: "50px",
        margin: "1px"
    },
    videoTileStyleProps: {
        minHeight: "180px",
        height: "300px",
        backgroundColor: "transparent",
        width: "100%",
        maxWidth: "100%",
        marginLeft: "auto",
        marginRight: "auto",
        position: "relative"
    },
    remoteVideoStyleProps: {
        height: "100%",
        width: "100%",
        overflow: "hidden",
        backgroundColor: "#8ab2f2"
    },
    selfVideoStyleProps: {
        position: "absolute",
        left: "8px",
        bottom: "8px",
        width: "80px",
        height: "60px",
        overflow: "hidden",
        borderRadius: "2px",
        backgroundColor: "aliceblue"
    },
    itemFocusStyleProps: {
        border: "2px dotted blue"
    }
};