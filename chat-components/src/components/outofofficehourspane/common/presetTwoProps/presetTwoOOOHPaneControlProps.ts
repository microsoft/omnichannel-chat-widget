import { IOOOHPaneControlProps } from "../../interfaces/IOOOHPaneControlProps";
import { defaultOOOHPaneControlProps } from "../defaultProps/defaultOOOHPaneControlProps";

export const presetTwoOOOHPaneControlProps: IOOOHPaneControlProps = {
    ...defaultOOOHPaneControlProps,
    id: "lcw-out-of-office-hours-pane-preset2",
    titleText: "Sorry but we are not operating during these hours!!"
};