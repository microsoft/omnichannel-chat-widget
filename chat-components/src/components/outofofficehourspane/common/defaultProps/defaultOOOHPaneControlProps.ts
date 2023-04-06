import { Ids, Texts } from "../../../../common/Constants";
import { IOOOHPaneControlProps } from "../../interfaces/IOOOHPaneControlProps";

export const defaultOOOHPaneControlProps: IOOOHPaneControlProps = {
    id: Ids.DefaultOOOHPaneId,
    dir: "auto",
    hideOOOHPane: false,
    hideTitle: false,
    role: "alert",
    titleText: Texts.OOOHPaneTitleText,
    openLinkInNewTab: false
};