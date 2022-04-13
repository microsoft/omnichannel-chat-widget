import { IIncomingCallProps } from "../../interfaces/IIncomingCallProps";
import { defaultIncomingCallStyleProps } from "../defaultStyles/defaultIncomingCallStyleProps";
import { defaultIncomingCallControlProps } from "./defaultIncomingCallControlProps";

export const defaultIncomingCallProps: IIncomingCallProps = {
    controlProps: defaultIncomingCallControlProps,
    styleProps: defaultIncomingCallStyleProps
};