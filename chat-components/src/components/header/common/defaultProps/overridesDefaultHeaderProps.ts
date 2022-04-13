import { IHeaderProps } from "../../interfaces/IHeaderProps";
import { defaultHeaderStyleProps } from "../defaultStyles/defaultHeaderStyleProps";
import { defaultHeaderComponentOverrides } from "./defaultHeaderComponentOverrides";
import { defaultHeaderControlProps } from "./defaultHeaderControlProps";

export const overridesDefaultHeaderProps: IHeaderProps = {
    componentOverrides: defaultHeaderComponentOverrides,
    controlProps: defaultHeaderControlProps,
    styleProps: defaultHeaderStyleProps
};