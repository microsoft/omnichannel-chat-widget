import { IFooterProps } from "../../interfaces/IFooterProps";
import { defaultFooterStyleProps } from "../defaultStyles/defaultFooterStyleProps";
import { defaultFooterComponentOverrides } from "./defaultFooterComponentOverrides";
import { defaultFooterControlProps } from "./defaultFooterControlProps";

export const defaultFooterOverridesProps: IFooterProps = {
    componentOverrides: defaultFooterComponentOverrides,
    controlProps: defaultFooterControlProps,
    styleProps: defaultFooterStyleProps
};