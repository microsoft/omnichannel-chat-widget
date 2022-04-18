import { IHeaderControlProps } from "../../interfaces/IHeaderControlProps";
import chatIcon from "../../../../assets/imgs/chatIcon.svg";
import closeChatButton from "../../../../assets/imgs/closeChatButton.svg";
import minimizeChatButton from "../../../../assets/imgs/minimizeChatButton.svg";

export const customHeaderControlProps: IHeaderControlProps = {
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
        id: "oc-lcw-header-minimizebutton",
        type: "icon",
        imageIconProps: {
            src: minimizeChatButton,
            styles: { image: { height: "16px", width: "16px" } }
        }

    },
    closeButtonProps: {
        id: "oc-lcw-header-closebutton",
        type: "icon",
        imageIconProps: {
            src: closeChatButton,
            styles: { image: { height: "16px", width: "16px" } }
        }
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