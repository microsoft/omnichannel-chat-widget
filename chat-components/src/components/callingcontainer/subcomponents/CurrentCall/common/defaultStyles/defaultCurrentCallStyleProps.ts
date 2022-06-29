import { ICurrentCallStyleProps } from "../../interfaces/ICurrentCallStyleProps";

export const defaultCurrentCallStyleProps: ICurrentCallStyleProps = {
    generalStyleProps: {
        background: "#292828",
        minHeight: "55px",
        width: "100%",
        borderRadius: "0 0 3px 3px"
    },
    micButtonStyleProps: {
        borderRadius: "2px",
        color: "#FFFFFF",
        backgroundColor: "#3d3c3c",
        height: "45px",
        width: "50px",
        margin: "1px"
    },
    micButtonHoverStyleProps: {
        filter: "brightness(0.8)"
    },
    videoOffButtonStyleProps: {
        borderRadius: "2px",
        color: "#FFFFFF",
        backgroundColor: "#3d3c3c",
        height: "45px",
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
        borderRadius: "2px",
        color: "#FFFFFF",
        backgroundColor: "#DC0000",
        lineHeight: "50px",
        height: "45px",
        width: "50px",
        fontSize: "18px"
    },
    videoTileStyleProps: {
        width: "100%",
        marginLeft: "auto",
        marginRight: "auto",
        position: "relative"
    },
    videoTileStyleWithVideoProps: {
        minHeight: "180px",
        width: "100%",
        marginLeft: "auto",
        marginRight: "auto",
        position: "relative"
    },
    remoteVideoStyleProps: {
        height: "100%",
        width: "100%",
        overflow: "hidden"
    },
    selfVideoStyleProps: {
        position: "absolute",
        right: "8px",
        bottom: "8px",
        width: "80px",
        minHeight: "50px",
        overflow: "hidden",
        borderRadius: "2px"
    },
    selfVideoMaximizeStyleProps: {
        position: "relative",
        width: "100%",
        minHeight: "50px",
        overflow: "hidden",
        borderRadius: "2px",
    },
    itemFocusStyleProps: {
        outline: "2px solid #fff"
    }
};