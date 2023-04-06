import { IHeaderControlProps } from "../../interfaces/IHeaderControlProps";
import { LegacyChatIconBase64 } from "../../../../assets/Icons";
import { ButtonTypes, Ids, Texts } from "../../../../common/Constants";

export const azureHeaderControlProps: IHeaderControlProps = {
    id: Ids.DefaultHeaderId,
    hideIcon: false,
    hideTitle: true,
    hideCloseButton: false,
    hideMinimizeButton: true,
    onMinimizeClick: function () { console.log("minimize clicked"); },
    onCloseClick: function () { console.log("close clicked"); },
    middleGroup: { children: [] },
    leftGroup: { children: [] },
    rightGroup: { children: [] },
    minimizeButtonProps: {
        id: "oc-lcw-header-minimizebutton",
        type: ButtonTypes.Icon
    },
    closeButtonProps: {
        id: "oc-lcw-header-closebutton",
        type: ButtonTypes.Text,
        text: "End Chat"
    },
    headerIconProps: {
        id: Ids.HeaderIconId,
        src: LegacyChatIconBase64,
        alt: Texts.HeaderIcon
    },
    headerTitleProps: {
        id: Ids.HeaderTitleId,
        text: "Azure Chat Support"
    }
};