import { Ids, Texts } from "../../../../common/Constants";
import { ILoadingPaneControlProps } from "../../interfaces/ILoadingPaneControlProps";

export const defaultLoadingPaneControlProps: ILoadingPaneControlProps = {
    id: Ids.DefaultLoadingPaneId,
    dir: "auto",
    hideLoadingPane: false,
    hideIcon: false,
    hideTitle: false,
    titleText: Texts.LoadingPaneTitleText,
    hideSubtitle: false,
    subtitleText: Texts.LoadingPaneSubtitleText,
    hideSpinner: false,
    hideSpinnerText: false,
    spinnerText: Texts.LoadingPaneSpinnerText
};