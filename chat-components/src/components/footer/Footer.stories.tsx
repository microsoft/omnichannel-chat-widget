import React from "react";
import { Meta } from "@storybook/react/types-6-0";
import { Story } from "@storybook/react";
import Footer from "./Footer";
import { IFooterProps } from "./interfaces/IFooterProps";
import { defaultFooterProps } from "./common/defaultProps/defaultFooterProps";
import { defaultFooterOverridesProps } from "./common/defaultProps/defaultFooterOverridesProps";
import { IButtonStyles, IconButton, IIconProps } from "@fluentui/react";
import { customFooterControlProps } from "./common/defaultProps/customFooterControlProps";

export default {
    title: "Stateless Components/Footer",
    component: Footer
} as Meta;

const Template: Story<IFooterProps> = (args) => <Footer {...args}></Footer>;

/* Default Footer */
export const Default = Template.bind({});
Default.args = defaultFooterProps;

/* Default Footer - Rtl */
const defaultRtl: IFooterProps = {
    controlProps: {
        ...defaultFooterProps.controlProps,
        dir: "rtl",
        hideDownloadTranscriptButton: true
    },
    styleProps: {
        ...defaultFooterProps.styleProps
    }
};
export const Rtl = Template.bind({});
Rtl.args = defaultRtl;

/* Default Footer - Component Overrides */
export const WithComponentOverrides = Template.bind({});
WithComponentOverrides.args = defaultFooterOverridesProps;

/* Default Footer - Adding more components */
const buttonStyleProps: IButtonStyles = {
    root: {
        color: "blue",
        height: 25,
        width: 25,
    }
};

const calendarIcon: IIconProps = { iconName: "Calendar" };
const calendarIconButton = <IconButton
    key="calendarIconButton"
    iconProps={calendarIcon}
    styles={buttonStyleProps}
    title="Calendar">
</IconButton>;

const emojiIcon: IIconProps = { iconName: "Emoji2" };
const emojiIconButton = <IconButton
    key="emojiIconButton"
    iconProps={emojiIcon}
    styles={buttonStyleProps}
    title="Sentiment">
</IconButton>;

const uploadIcon: IIconProps = { iconName: "Upload" };
const uploadIconButton = <IconButton
    key="uploadIconButton"
    iconProps={uploadIcon}
    styles={buttonStyleProps}
    title="Upload">
</IconButton>;

const customizedFooterProp: IFooterProps = {
    controlProps: {
        ...customFooterControlProps,
        leftGroup: { children: [uploadIconButton] },
        middleGroup: { children: [calendarIconButton] },
        rightGroup: { children: [emojiIconButton] }
    },
    styleProps: {
        ...defaultFooterProps.styleProps
    }
};
export const Customized = Template.bind({});
Customized.args = customizedFooterProp;
