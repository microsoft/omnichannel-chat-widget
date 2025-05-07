import { CloseChatButtonIconBase64, LegacyChatIconBase64, MinimizeChatButtonIconBase64 } from "../../../../assets/Icons";
import { ButtonTypes, Ids, Texts } from "../../../../common/Constants";

import { IHeaderControlProps } from "../../interfaces/IHeaderControlProps";

export const customHeaderControlProps: IHeaderControlProps = {
    id: Ids.DefaultHeaderId,
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
        type: ButtonTypes.Icon,
        imageIconProps: {
            src: MinimizeChatButtonIconBase64,
            styles: { image: { height: "16px", width: "16px" } }
        },

    },
    closeButtonProps: {
        id: "oc-lcw-header-closebutton",
        type: ButtonTypes.Icon,
        imageIconProps: {
            src: CloseChatButtonIconBase64,
            styles: { image: { height: "16px", width: "16px" } }
        },
    },
    headerIconProps: {
        id: Ids.HeaderIconId,
        src: LegacyChatIconBase64,
        alt: Texts.HeaderIcon
    },
    headerTitleProps: {
        id: Ids.HeaderTitleId,
        text: Texts.HeaderTitle
    }
};