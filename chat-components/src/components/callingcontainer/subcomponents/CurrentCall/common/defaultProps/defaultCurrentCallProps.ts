import { ICurrentCallProps } from "../../interfaces/ICurrentCallProps";
import { defaultCurrentCallStyleProps } from "../defaultStyles/defaultCurrentCallStyleProps";
import { defaultCurrentCallControlProps } from "./defaultCurrentCallControlProps";

export const defaultCurrentCallProps: ICurrentCallProps = {
    controlProps: defaultCurrentCallControlProps,
    styleProps: defaultCurrentCallStyleProps
};