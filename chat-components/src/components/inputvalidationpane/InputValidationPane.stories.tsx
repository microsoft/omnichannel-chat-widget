import { IInputValidationPaneProps } from "./interfaces/IInputValidationPaneProps";
import InputValidationPane from "./InputValidationPane";
import { Meta } from "@storybook/react/types-6-0";
import React from "react";
import { Story } from "@storybook/react";
import { defaultInputValidationPaneProps } from "./common/default/defaultProps/defaultInputValidationPaneProps";
import { encodeComponentString } from "../../common/encodeComponentString";
import { presetTwoInputValidationPaneProps } from "./common/presetTwo/presetTwoProps/presetTwoInputValidationPaneProps";

export default {
    title: "Stateless Components/Input Validation Pane",
    component: InputValidationPane,
} as Meta;

const InputValidationPaneTemplate: Story<IInputValidationPaneProps> = (args) => <InputValidationPane {...args}></InputValidationPane>;

/*
    Default Input Validation Pane
*/

export const DefaultEmailTranscript = InputValidationPaneTemplate.bind({});
DefaultEmailTranscript.args = defaultInputValidationPaneProps;

/*
    Default Rtl Input Validation Pane
*/

const defaultRtlProps = {
    controlProps: {
        ...defaultInputValidationPaneProps.controlProps,
        dir: "rtl"
    },
    styleProps: {
        ...defaultInputValidationPaneProps.styleProps
    }
};

export const DefaultRtlEmailTranscript = InputValidationPaneTemplate.bind({});
DefaultRtlEmailTranscript.args = defaultRtlProps;

/*
    Input Validation Pane Pane Preset 1
*/

const preset1Props = {
    controlProps: {
        ...defaultInputValidationPaneProps.controlProps,
        isButtonGroupHorizontal: false,
        enableSendButton: true
    },
    styleProps: {
        ...defaultInputValidationPaneProps.styleProps
    }
};

export const Preset1 = InputValidationPaneTemplate.bind({});
Preset1.args = preset1Props;

/*
    Input Validation Pane Pane Preset 2
*/

export const Preset2 = InputValidationPaneTemplate.bind({});
Preset2.args = presetTwoInputValidationPaneProps;

/*
    Input Validation Pane Pane Preset 3
*/

const customReactNode1 = encodeComponentString(
    <div style={{backgroundColor: "purple", 
        color: "white", 
        fontSize: "18px", 
        marginBottom: "10px"}}>
        This is a custom div
    </div>
);

const customReactNode2 = (
    <div />  
);

const preset3Props = {
    controlProps: {
        ...defaultInputValidationPaneProps.controlProps,
        enableSendButton: true
    },
    styleProps: {
        ...defaultInputValidationPaneProps.styleProps
    },
    componentOverrides: {
        ...defaultInputValidationPaneProps.componentOverrides,
        input: customReactNode1,
        invalidInputErrorMessage: customReactNode2
    }
};

export const Preset3 = InputValidationPaneTemplate.bind({});
Preset3.args = preset3Props;