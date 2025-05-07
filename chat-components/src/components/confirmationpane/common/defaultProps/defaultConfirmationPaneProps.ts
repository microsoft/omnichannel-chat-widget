import { IConfirmationPaneProps } from "../../interfaces/IConfirmationPaneProps";
import { defaultConfirmationPaneControlProps } from "./defaultConfirmationPaneControlProps";
import { defaultConfirmationPaneStyles } from "../defaultStyles/defaultConfirmationPaneStyles";

export const defaultConfirmationPaneProps: IConfirmationPaneProps = {
    controlProps: defaultConfirmationPaneControlProps,
    styleProps: defaultConfirmationPaneStyles
};
