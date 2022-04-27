import { IIncomingCallStyleProps } from "../../interfaces/IIncomingCallStyleProps";

export const defaultIncomingCallStyleProps: IIncomingCallStyleProps = {
    generalStyleProps: {
        background: "#000",
        padding: "5px",
        height: "60px"
    },
    audioCallButtonStyleProps: {
        borderRadius: "50%",
        color: "#FFFFFF",
        backgroundColor: "#008000",
        lineHeight: "40px",
        height: "40px",
        width: "40px",
        fontSize: 18
    },
    audioCallButtonHoverStyleProps: {
        filter: "brightness(0.8)"
    },
    videoCallButtonStyleProps: {
        borderRadius: "50%",
        color: "#FFFFFF",
        backgroundColor: "#008000",
        lineHeight: "40px",
        height: "40px",
        width: "40px",
        fontSize: 18
    },
    videoCallButtonHoverStyleProps: {
        filter: "brightness(0.8)"
    },
    declineCallButtonHoverStyleProps: {
        filter: "brightness(0.8)",
        border: "1px solid #000"
    },
    declineCallButtonStyleProps: {
        borderRadius: "50%",
        color: "#FFFFFF",
        backgroundColor: "#DC0000",
        lineHeight: "40px",
        height: "40px",
        width: "40px",
        fontSize: 18,
        marginLeft: "5px"
    },
    incomingCallTitleStyleProps: {
        margin: "0 5px",
        color: "#FFFFFF",
        fontSize: 12,
        fontFamily: "Segoe UI, Arial, sans-serif"
    },
    itemFocusStyleProps: {
        outline: "2px solid #FFFFFF",
    }
};