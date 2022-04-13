import { IHeaderControlProps } from "../../interfaces/IHeaderControlProps";
import chatIcon from "../../../../assets/imgs/chat.svg";

export const defaultHeaderControlProps: IHeaderControlProps = {
    id: "oc-lcw-header",
    hideIcon: false,
    hideTitle: false,
    hideCloseButton: false,
    hideMinimizeButton: false,
    onMinimizeClick: function () { console.log("minimize clicked"); },
    onCloseClick: function () { console.log("close clicked"); },
    middleGroup: { children: [] },
    leftGroup: { children: [] },
    rightGroup: { children: [] },
    minimizeButtonProps: {
        id: "oc-lcw-header-minimize-button",
        type: "icon",
        iconName:"ChromeMinimize"
    },
    closeButtonProps: {
        id: "oc-lcw-header-close-button",
        type: "icon",
        iconName:"ChromeClose"
    },
    headerIconProps: {
        id: "oc-lcw-header-icon",
        src: chatIcon,
        alt: "Chat Icon"
    },
    headerTitleProps: {
        id: "oc-lcw-header-title",
        text: "Let's Chat"
    }
};