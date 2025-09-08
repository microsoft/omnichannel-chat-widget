import { Slot } from "@fluentui/react-components";
import { ISuggestionsStyleProps } from "./ISuggestionsStyleProps";
import { ISuggestionsControlProps } from "./ISuggestionsControlProps";

export interface ISuggestionsProps {
    componentOverrides?: { action?: Slot<"span">; icon?: Slot<"span"> };
    controlProps?: ISuggestionsControlProps;
    styleProps?: ISuggestionsStyleProps;
}
