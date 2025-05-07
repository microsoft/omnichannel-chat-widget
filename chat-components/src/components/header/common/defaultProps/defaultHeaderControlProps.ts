import { IHeaderControlProps } from "../../interfaces/IHeaderControlProps";
import { ModernChatIconBase64 } from "../../../../assets/Icons";
import { ButtonTypes, IconNames, Ids, Texts } from "../../../../common/Constants";

export const defaultHeaderControlProps: IHeaderControlProps = {
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
        id: Ids.MinimizeButtonId,
        type: ButtonTypes.Icon,
        iconName: IconNames.ChromeMinimize,
    },
    closeButtonProps: {
        id: Ids.CloseButtonId,
        type: ButtonTypes.Icon,
        iconName: IconNames.ChromeClose,
    },
    headerIconProps: {
        id: Ids.HeaderIconId,
        src: ModernChatIconBase64,
        alt: Texts.HeaderIcon
    },
    headerTitleProps: {
        id: Ids.HeaderTitleId,
        text: Texts.HeaderTitle
    }
};