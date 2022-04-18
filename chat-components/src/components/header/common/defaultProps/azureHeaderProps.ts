import { IHeaderProps } from "../../interfaces/IHeaderProps";
import { defaultHeaderStyleProps } from "../defaultStyles/defaultHeaderStyleProps";
import { azureHeaderControlProps } from "./azureHeaderControlProps";
import { defaultHeaderComponentOverrides } from "./defaultHeaderComponentOverrides";

export const azureHeaderProps: IHeaderProps = {
    componentOverrides: defaultHeaderComponentOverrides,
    controlProps: azureHeaderControlProps,
    styleProps: defaultHeaderStyleProps
};