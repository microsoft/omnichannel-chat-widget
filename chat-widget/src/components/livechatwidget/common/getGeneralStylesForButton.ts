import { shouldShowChatButton, shouldShowProactiveChatPane } from "../../../controller/componentController";

import { ILiveChatWidgetContext } from "../../../contexts/common/ILiveChatWidgetContext";
import { IStyle } from "@fluentui/react";
import { defaultLiveChatWidgetGeneralStyles } from "./defaultStyles/defaultLiveChatWidgetGeneralStyles";

export const getGeneralStylesForButton = (state: ILiveChatWidgetContext) => {
    let generalStylesForButton: IStyle = defaultLiveChatWidgetGeneralStyles;
    if (!shouldShowChatButton(state) && !shouldShowProactiveChatPane(state)) {
        generalStylesForButton = Object.assign(
            {},
            defaultLiveChatWidgetGeneralStyles,
            {
                boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.16), 0px 4px 8px rgba(0, 0, 0, 0.12)",
                MozBoxShadow: "0px 0px 2px rgba(0, 0, 0, 0.16), 0px 4px 8px rgba(0, 0, 0, 0.12)",
                WebkitBoxShadow: "0px 0px 2px rgba(0, 0, 0, 0.16), 0px 4px 8px rgba(0, 0, 0, 0.12)",
                borderRadius: "4px",
                padding: "0.5"
            });
    }
    return generalStylesForButton;
};