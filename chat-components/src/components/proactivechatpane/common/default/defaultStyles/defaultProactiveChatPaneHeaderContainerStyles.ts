import { IStyle } from "@fluentui/react";
import { ProactiveChatBannerBase64 } from "../../../../../assets/Icons";

export const defaultProactiveChatPaneHeaderContainerStyles: IStyle = {
    backgroundColor: "rgb(49, 95, 162)",
    backgroundImage: `url(${ProactiveChatBannerBase64})`,
    backgroundPosition: "initial",
    backgroundRepeat: "no-repeat", 
    borderTopLeftRadius: "inherit",
    borderTopRightRadius: "inherit",
    height: "90px",
    padding: "10px 16px 10px 16px"
};