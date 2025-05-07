import { IIncomingCallProps } from "../../interfaces/IIncomingCallProps";
import { defaultIncomingCallControlProps } from "./defaultIncomingCallControlProps";
import { componentOverrideProps } from "./componentOverrideProps";
import { componentOverridesStyleProps } from "../defaultStyles/componentOverridesStyleProps";

export const componentOverridesControlProps: IIncomingCallProps = {
    componentOverrides: componentOverrideProps,
    controlProps: defaultIncomingCallControlProps,
    styleProps: componentOverridesStyleProps
};