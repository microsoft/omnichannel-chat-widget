import { CloseChatButtonIconBase64, LegacyChatIconBase64, MinimizeChatButtonIconBase64 } from "../../../../assets/Icons";

import { IHeaderControlProps } from "../../interfaces/IHeaderControlProps";

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
            src: MinimizeChatButtonIconBase64,
            styles: { image: { height: "16px", width: "16px" } }
        }

    },
    closeButtonProps: {
        id: "oc-lcw-header-closebutton",
        type: "icon",
        imageIconProps: {
            src: CloseChatButtonIconBase64,
            styles: { image: { height: "16px", width: "16px" } }
        }
    },
    headerIconProps: {
        id: "oc-lcw-header-icon",
        src: LegacyChatIconBase64,
        alt: "Chat Icon",
        ariaLabel: "Header Icon"
    },
    headerTitleProps: {
        id: "oc-lcw-header-title",
        text: "Let's Chat",
        ariaLabel: "Header Title"
    }
};