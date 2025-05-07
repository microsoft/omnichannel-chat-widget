import { IFooterStyleProps } from "../../interfaces/IFooterStyleProps";

export const defaultFooterStyleProps: IFooterStyleProps = {
    generalStyleProps: {
        background: "#fff",
        borderRadius: "0 0 4px 4px",
        minHeight: "25px",
        width: "100%",
        minWidth: "250px",
        padding: "5px"
    },
    downloadTranscriptButtonStyleProps: {
        icon: {
            color: "blue",
            fontSize: 16,
        },
        height: "25px",
        lineHeight: "25px",
        width: "25px"
    },
    downloadTranscriptButtonHoverStyleProps: {
        filter: "brightness(0.8)",
        backgroundColor: "#C8C8C8"
    },
    emailTranscriptButtonStyleProps: {
        icon: {
            color: "blue",
            fontSize: 16,
        },
        height: "25px",
        lineHeight: "25px",
        width: "25px"
    },
    emailTranscriptButtonHoverStyleProps: {
        filter: "brightness(0.8)",
        backgroundColor: "#C8C8C8"
    },
    audioNotificationButtonStyleProps: {
        icon: {
            color: "blue",
            fontSize: 16,
        },
        height: "25px",
        lineHeight: "25px",
        width: "25px"
    },
    audioNotificationButtonHoverStyleProps: {
        filter: "brightness(0.8)",
        backgroundColor: "#C8C8C8"
    },
    footerItemFocusStyleProps: {
        border: "2px dotted #000"
    }
};