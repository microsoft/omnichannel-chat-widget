import React, { ReactNode } from "react";
import { Meta } from "@storybook/react/types-6-0";
import { Story } from "@storybook/react";
import CurrentCall from "./CurrentCall";
import { ICurrentCallProps } from "./interfaces/ICurrentCallProps";
import { defaultCurrentCallProps } from "./common/defaultProps/defaultCurrentCallProps";
import { defaultCurrentCallControlPropsRtl } from "./common/defaultProps/defaultCurrentCallControlPropsRtl";
import { customizedCurrentCallStyleProps } from "./common/defaultStyles/customizedCurrentCallStyleProps";
import CommandButton from "../../../common/commandbutton/CommandButton";
import { IconNames, ButtonTypes } from "../../../../common/Constants";

export default {
    title: "Stateless Components/Calling Container/Current Call",
    component: CurrentCall
} as Meta;

const Template: Story<ICurrentCallProps> = (args) => <CurrentCall {...args}></CurrentCall>;

/* Current Call - Default Video Call */
export const DefaultVideoCall = Template.bind({});
DefaultVideoCall.args = defaultCurrentCallProps;

/* Current Call - Default Video Call */
const defaultAudioCallProps: ICurrentCallProps = {
    controlProps: {
        ...defaultCurrentCallProps.controlProps,
        videoCallDisabled: true
    },
    styleProps: {
        ...defaultCurrentCallProps.styleProps
    }
};
export const DefaultAudioCall = Template.bind({});
DefaultAudioCall.args = defaultAudioCallProps;

/* Current Call - Rtl */
const defaultRtl: ICurrentCallProps = {
    controlProps: defaultCurrentCallControlPropsRtl,
    styleProps: {
        ...defaultCurrentCallProps.styleProps
    }
};
export const Rtl = Template.bind({});
Rtl.args = defaultRtl;

/* Current Call - Component Overrides */
const currentCallSpeakerButton: ReactNode = <CommandButton
    iconName={IconNames.Volume3}
    type={ButtonTypes.Icon}
    styles={customizedCurrentCallStyleProps.micButtonStyleProps}
/>;

const componentOverridesProps: ICurrentCallProps = {
    controlProps: {
        ...defaultCurrentCallProps.controlProps,
        hideCallTimer: true,
        hideVideoButton: true,
        hideMicButton: true,
        selfVideoDisabled: false
    },
    styleProps: {
        ...defaultCurrentCallProps.styleProps,
        generalStyleProps: {
            background: "#C8C8C8",
            minHeight: "60px",
            width: "100%",
            borderRadius: "4px 4px 4px 4px"
        },
        selfVideoStyleProps: {
            position: "absolute",
            right: "8px",
            bottom: "8px",
            width: "80px",
            minHeight: "50px",
            overflow: "hidden",
            borderRadius: "2px",
            backgroundColor: "blue"
        }
    }
};
export const componentOverrides = Template.bind({});
componentOverrides.args = componentOverridesProps;

/* Current Call - Customized */
const customCallTimerProps = {
    ...defaultCurrentCallProps.controlProps.callTimerProps,
    showHours: false
};

const customizedMiddleGroup = {
    ...defaultCurrentCallProps.controlProps.middleGroup,
    gap: 30,
    children: [currentCallSpeakerButton]
};

const customizedProps: ICurrentCallProps = {
    controlProps: {
        ...defaultCurrentCallProps.controlProps,
        hideCallTimer: true,
        callTimerProps: customCallTimerProps,
        middleGroup: customizedMiddleGroup
    },
    styleProps: Object.assign({}, defaultCurrentCallProps.styleProps)
};
customizedProps.styleProps = customizedCurrentCallStyleProps;
customizedProps.controlProps.callTimerProps.timerStyles = {
    color: "blue",
    textAlign: "center",
    backgroundColor: "transparent",
    height: "50px",
    width: "55px",
    lineHeight: "40px",
    borderRadius: "2px",
};
export const CustomizedCurrentCall = Template.bind({});
CustomizedCurrentCall.args = customizedProps;