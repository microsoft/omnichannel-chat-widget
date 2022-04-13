import { IHeaderStyleProps } from "../../interfaces/IHeaderStyleProps";

export const advancedHeaderStyleProps: IHeaderStyleProps = {
    generalStyleProps: {
        background: "linear-gradient(0deg, rgba(34,193,195,1) 0%, rgba(253,187,45,1) 100%)",
        border: "1px solid green",
        borderRadius: "5px 5px 0 0",
        padding: "5px",
        resize: "vertical",
        overflowY: "hidden",
        maxHeight: "200px",
        MozBoxShadow: "0px 3px 4px #de1dde",
        WebkitBoxShadow: "0px 3px 4px #de1dde",
        boxShadow: "0px 3px 4px #de1dde",
        minHeight: "60px",
        width: "100%",
        minWidth: "250px"
    },
    iconStyleProps: {
        height: "50px",
        width: "50px"
    },
    titleStyleProps: {
        fontSize: 18,
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontWeight: 600,
        color: "white"
    },
    minimizeButtonStyleProps: {
        color: "white"
    },
    closeButtonStyleProps: {
        color: "white"
    },
    headerItemFocusStyleProps: {
        border: "2px dotted #000"
    }
};