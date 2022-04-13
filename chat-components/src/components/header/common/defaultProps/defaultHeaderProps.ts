import { IHeaderProps } from "../../interfaces/IHeaderProps";
import { defaultHeaderStyleProps } from "../defaultStyles/defaultHeaderStyleProps";
import { defaultHeaderControlProps } from "./defaultHeaderControlProps";

export const defaultHeaderProps: IHeaderProps = {
    controlProps: defaultHeaderControlProps,
    styleProps: defaultHeaderStyleProps
};