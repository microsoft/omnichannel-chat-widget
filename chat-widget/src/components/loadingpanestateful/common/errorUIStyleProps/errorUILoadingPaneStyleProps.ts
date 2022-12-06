import { ImageFit } from "@fluentui/react";
import { ILoadingPaneStyleProps } from "@microsoft/omnichannel-chat-components/lib/types/components/loadingpane/interfaces/ILoadingPaneStyleProps";
import { AlertIcon } from "../../../../assets/Icons";

export const errorUILoadingPaneStyleProps: ILoadingPaneStyleProps = {
    generalStyleProps: {
        position: "initial",
        width: "100%",
        height: "100%",
        left: "0%",
        top: "0%",
        borderRadius: "0 0 4px 4px",
        borderWidth: "0px",
        backgroundColor: "#FFFFFF"
    },
    titleStyleProps: {
        fontFamily: "'Segoe UI',Arial,sans-serif",
        fontWeight: "normal",
        fontSize: "18px",
        color: "#36454F",
        textAlign: "center",
        display: "flex",
        order: 2,
        alignSelf: "auto"
    },
    subtitleStyleProps:{
        fontFamily: "'Segoe UI',Arial,sans-serif",
        fontWeight: "normal",
        fontSize: "18px",
        color: "#36454F",
        textAlign: "center",
        display: "flex",
        order: 3,
        alignSelf: "auto"
    },
    iconStyleProps: {
        display: "flex",
        order: 1,
        alignSelf: "auto",
        backgroundColor: "#FFFFFF",
        boxShadow: "#FFFFFF 0px 0px 0px 0px",
        margin: "0px 0px 0px 0px"
    },
    iconImageProps: {
        src: AlertIcon,
        imageFit: ImageFit.center,
        width: "86px",
        height: "86px",
        shouldFadeIn: false,
        shouldStartVisible: true
    }
};