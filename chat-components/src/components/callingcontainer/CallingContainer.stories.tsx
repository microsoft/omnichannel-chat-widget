import React from "react";
import { Meta } from "@storybook/react/types-6-0";
import { Story } from "@storybook/react";
import CallingContainer from "./CallingContainer";
import { ICallingContainerProps } from "./interfaces/ICallingContainerProps";
import { defaultCallingContainerProps } from "./common/defaultProps/defaultCallingContainerProps";

export default {
    title: "Stateless Components/Calling Container/Default",
    component: CallingContainer
} as Meta;

const Template: Story<ICallingContainerProps> = (args) => <CallingContainer {...args}></CallingContainer>;

/* Calling container - Incoming Call Mode */
export const currentCallMode = Template.bind({});
currentCallMode.args = defaultCallingContainerProps;

/* Calling container - Incoming Call Mode */
const incomingCallProps = {
    controlProps: {
        ...defaultCallingContainerProps.controlProps,
        isIncomingCall: true
    },
    styleProps: {
        ...defaultCallingContainerProps.styleProps
    }
};
export const incomingCall = Template.bind({});
incomingCall.args = incomingCallProps;