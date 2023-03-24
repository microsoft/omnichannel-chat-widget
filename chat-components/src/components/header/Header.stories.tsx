import React from "react";
import { Meta } from "@storybook/react/types-6-0";
import { Story } from "@storybook/react";
import Header from "./Header";
import { IHeaderProps } from "./interfaces/IHeaderProps";
import { defaultHeaderProps } from "./common/defaultProps/defaultHeaderProps";
import { azureHeaderProps } from "./common/defaultProps/azureHeaderProps";
import { advancedHeaderStyleProps } from "./common/defaultStyles/advancedHeaderStyleProps";
import { customHeaderControlProps } from "./common/defaultProps/customHeaderControlProps";
import { FontIcon, IStackStyles, Label, mergeStyles, Stack } from "@fluentui/react";
import { ILabelControlProps } from "../common/interfaces/ILabelControlProps";
import { ICommandButtonProps } from "../common/interfaces/ICommandButtonProps";
import CommandButton from "../common/commandbutton/CommandButton";
import { ButtonTypes, Ids } from "../../common/Constants";

export default {
    title: "Stateless Components/Header",
    component: Header
} as Meta;

const customHeaderProps: IHeaderProps = {
    controlProps: customHeaderControlProps,
    styleProps: defaultHeaderProps.styleProps
};
const Template: Story<IHeaderProps> = (args) => <Header {...args}></Header>;

/* Default Header */
export const Default = Template.bind({});
Default.args = defaultHeaderProps;

/* Azure Header - Add a new header title to center, 
* replace the chat icon with component overrides 
*/
const labelProps: ILabelControlProps = {
    id: Ids.HeaderTitleId,
    text: "Azure Chat Support"
};

const labelStyles = { root: { color: "white", fontSize: 15 } };
const azureLabel = <Label {...labelProps} key="azureLabel" styles={labelStyles}>{labelProps.text}</Label>;

const azureCustomHeaderProps: IHeaderProps = {
    componentOverrides: {
        ...azureHeaderProps.componentOverrides
    },
    controlProps: {
        ...azureHeaderProps.controlProps,
        hideTitle: true,
        middleGroup: { children: [azureLabel] }
    },
    styleProps: {
        ...azureHeaderProps.styleProps,
        generalStyleProps: {
            background: "#0078d4",
            border: "1px solid blue",
            height: "50px",
            padding: "4px"
        },
        closeButtonStyleProps: {
            color: "#0078d4",
            margin: "5px 5px"
        },
        closeButtonHoverStyleProps: {
            color: "blue"
        }
    }
};

export const AzureHeader = Template.bind({});
AzureHeader.args = azureCustomHeaderProps;

/* Advanced Header - Add a new header title to center, 
* replace the chat icon with component overrides 
*/
const customIconClass = mergeStyles({
    fontSize: 40,
    margin: "0 0px",
    color: "yellow",
});

const stackStyles: IStackStyles = {
    root: mergeStyles({
        background: "blue",
        border: "1px solid blue",
        borderRadius: "50%",
        padding: "10px",
        margin: "10px",
        textAlign: "center",
        height: "60px",
        width: "60px"
    })
};

const customIcon = <Stack styles={stackStyles} key="customIcon">
    <FontIcon aria-label="ChatBot" iconName="ChatBot" className={customIconClass} id={Ids.HeaderIconId} /></Stack>;

const maximizeHeaderButtonProps: ICommandButtonProps = {
    id: "lcw-header-maximize-button",
    type: ButtonTypes.Icon,
    iconName: "FullScreen",
    ariaLabel: "Maximize",
    styles: { color: "White" },
    onClick: function () { console.log("maximize clicked"); }
};

const maximizeButton = <CommandButton {...maximizeHeaderButtonProps} key="maximizeButton" />;

const advancedHeaderProps: IHeaderProps = {
    controlProps: {
        ...defaultHeaderProps.controlProps,
        hideIcon: true,
        leftGroup: { children: [customIcon] },
        rightGroup: { children: [maximizeButton] },
        headerTitleProps: {
            id: "oc-lcw-headertitle",
            text: "hi, there!"
        }
    },
    styleProps: {
        ...advancedHeaderStyleProps
    }
};

export const CustomizedHeader = Template.bind({});
CustomizedHeader.args = advancedHeaderProps;

/* Advanced Header - RTL Version 
*/
const customHeaderRtl: IHeaderProps = {
    controlProps: {
        ...customHeaderProps.controlProps,
        dir: "rtl"
    },
    styleProps: {
        ...customHeaderProps.styleProps
    }
};
export const CustomizedHeaderRtl = Template.bind({});
CustomizedHeaderRtl.args = customHeaderRtl;