import { IHeaderStyleProps } from "../../interfaces/IHeaderStyleProps";

export const defaultHeaderStyleProps: IHeaderStyleProps = {
    generalStyleProps: {
        background: "#315fa2",
        borderRadius: "4px 4px 0 0",
        padding: "5px",
        minHeight: "50px",
        width: "100%",
        minWidth: "250px"
    },
    iconStyleProps: {
        height: "30px",
        width: "30px",
        margin: "5px 10px"
    },
    titleStyleProps: {
        fontSize: 16,
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontWeight: "450",
        color: "white",
        padding: "3px 0"
    },
    minimizeButtonStyleProps: {
        color: "white",
        margin: "5px 0",
        fontSize: "12px"
    },
    closeButtonStyleProps: {
        color: "white",
        margin: "5px 0",
        fontSize: "12px"
    },
    closeButtonHoverStyleProps: {
        filter: "brightness(0.8)"
    },
    minimizeButtonHoverStyleProps: {
        filter: "brightness(0.8)"
    },
    headerItemFocusStyleProps: {
        border: "2px dotted #000"
    }
};