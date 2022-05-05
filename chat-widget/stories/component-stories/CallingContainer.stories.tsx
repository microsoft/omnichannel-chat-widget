import React from "react";
import { Meta } from "@storybook/react/types-6-0";
import { Story } from "@storybook/react";
import { CallingContainer } from "@microsoft/omnichannel-chat-components";
import { ICallingContainerProps } from "@microsoft/omnichannel-chat-components/lib/types/components/callingcontainer/interfaces/ICallingContainerProps";

export default {
    title: "Stateless Components/Calling Container/Default",
    component: CallingContainer
} as Meta;

const Template: Story<ICallingContainerProps> = (args) => <CallingContainer {...args}></CallingContainer>;

const defaultCallingContainerProps: ICallingContainerProps = {
    controlProps: {
        id: "oc-lcw-callingcontainer",
        dir: "ltr",
        isIncomingCall: false,
        hideCallingContainer: false
    },
    styleProps: {
        generalStyleProps: {
            background: "#000",
            width: "100%",
            zIndex: 100,
            boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.16), 0px 4px 8px rgba(0, 0, 0, 0.12)"
        }        
    }
};

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