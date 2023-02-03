import { IStyle } from "@fluentui/react";
import {useMediaQuery} from "../../../../../common/utils";

const isSmallHeight = useMediaQuery("(min-width: 375px)");

export const defaultLoadingPaneIconStyles: IStyle = {
    display: isSmallHeight ? "flex" : "none",
    borderRadius: "50%",
    backgroundColor: "#34b732",
    boxShadow: "0px 0px 0.5px 7px rgba(196, 196, 196, 0.15)",
    width: "86px",
    height: "86px",
    margin: "0px 0px 20px 0px",
    order: 1,
    alignSelf: "auto"
};