import { IStyle } from "@fluentui/react";

export const defaultGeneralPreChatSurveyPaneStyleProps: IStyle = {
    borderStyle: "solid",
    borderRadius: "inherit",
    borderWidth: "0px",
    backgroundColor: "#FFFFFF",
    borderColor: "#F1F1F1",
    overflowY: "auto",
    // Bug 6525143 / Bug 6423684: the focus-capture wrapper is a flex column sized to
    // the space remaining below the header (flex: 1 1 auto). Fill that space via flex
    // (flexGrow: 1 / flexBasis: 0 / minHeight: 0) instead of height: 100%, which
    // resolved against the whole centered #oc-lcw container and pushed the header out
    // (the clip). minHeight: 0 keeps the pane shrinkable so its overflowY scroll
    // engages for tall surveys rather than growing the column and clipping the header.
    // Note: the shared PreChatSurveyPane default (chat-components) still merges
    // height: "inherit" underneath these props; under this flex parent that resolves
    // to auto and is overridden by the flex main-size, so the pane still fills via flex.
    flexGrow: 1,
    flexBasis: 0,
    minHeight: 0,
    width: "inherit"
};