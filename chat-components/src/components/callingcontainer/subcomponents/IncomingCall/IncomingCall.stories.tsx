import React from "react";
import { Meta } from "@storybook/react/types-6-0";
import { Story } from "@storybook/react";
import IncomingCall from "./IncomingCall";
import { IIncomingCallProps } from "./interfaces/IIncomingCallProps";
import { defaultIncomingCallProps } from "./common/defaultProps/defaultIncomingCallProps";
import { defaultIncomingCallControlPropsRtl } from "./common/defaultProps/defaultIncomingCallControlPropsRtl";
import { componentOverridesControlProps } from "./common/defaultProps/componentOverridesControlProps";

export default {
    title: "Stateless Components/Calling Container/Incoming Call",
    component: IncomingCall
} as Meta;

const Template: Story<IIncomingCallProps> = (args) => <IncomingCall {...args}></IncomingCall>;

/* Incoming Call - Default */
export const Default = Template.bind({});
Default.args = defaultIncomingCallProps;

/* Incoming Call - Rtl */
const defaultRtl: IIncomingCallProps = {
    controlProps: defaultIncomingCallControlPropsRtl,
    styleProps: {
        ...defaultIncomingCallProps.styleProps
    }
};
export const Rtl = Template.bind({});
Rtl.args = defaultRtl;

/* Incoming Call - Component Overrides */
const componentOverridesProps: IIncomingCallProps = {
    componentOverrides: {
        ...componentOverridesControlProps.componentOverrides
    },
    controlProps: {
        ...defaultIncomingCallProps.controlProps,
        hideVideoCall: true
    },
    styleProps: {
        ...defaultIncomingCallProps.styleProps,
        generalStyleProps: {
            background: "#C8C8C8",
            padding: "5px",
            minHeight: "60px",
            width: "50%",
            borderRadius: "4px 4px 4px 4px"
        }
    }
};
export const ComponentOverrides = Template.bind({});
ComponentOverrides.args = componentOverridesProps;