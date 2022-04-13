import { ICurrentCallStyleProps } from "../../interfaces/ICurrentCallStyleProps";
import { defaultCurrentCallStyleProps } from "./defaultCurrentCallStyleProps";

const componentOverrideStyles = Object.assign({}, defaultCurrentCallStyleProps);
export const componentOverridesStyleProps: ICurrentCallStyleProps = {
    ...componentOverrideStyles,
    generalStyleProps: {
        background: "#C8C8C8",
        padding: "5px",
        minHeight: "50px",
        borderRadius: "4px 4px 4px 4px",
        width: "80%"
    }
};