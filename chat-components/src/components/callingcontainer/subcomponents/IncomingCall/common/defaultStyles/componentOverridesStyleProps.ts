import { IIncomingCallStyleProps } from "../../interfaces/IIncomingCallStyleProps";

export const componentOverridesStyleProps: IIncomingCallStyleProps = {
    generalStyleProps: {
        background: "#BFB5B5",
        padding: "5px",
        minHeight: "60px",
        borderRadius: "4px 4px 4px 4px",
        width: "50%"
    },
    audioCallButtonStyleProps: {
        borderRadius: "50%",
        color: "white",
        backgroundColor: "green"
    },
    audioCallButtonHoverStyleProps: {
        filter: "brightness(0.8)"
    },
    videoCallButtonStyleProps: {
        borderRadius: "50%",
        color: "white",
        backgroundColor: "green"
    },
    videoCallButtonHoverStyleProps: {
        filter: "brightness(0.8)"
    },
    declineCallButtonHoverStyleProps: {
        filter: "brightness(0.8)"
    },
    declineCallButtonStyleProps: {
        borderRadius: "50%",
        color: "white",
        backgroundColor: "red",
        marginLeft: "5px"
    },
    incomingCallTitleStyleProps: {
        margin: "0 5px",
        color: "white",
        fontSize: 12,
        fontFamily: "Segoe UI, Arial, sans-serif"
    },
    itemFocusStyleProps: {
        outline: "2px solid #fff"
    }
};