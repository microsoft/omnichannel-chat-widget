import { IFooterProps } from "../../interfaces/IFooterProps";
import { defaultFooterStyleProps } from "../defaultStyles/defaultFooterStyleProps";
import { defaultFooterControlProps } from "./defaultFooterControlProps";

export const defaultFooterProps: IFooterProps = {
    controlProps: defaultFooterControlProps,
    styleProps: defaultFooterStyleProps
};