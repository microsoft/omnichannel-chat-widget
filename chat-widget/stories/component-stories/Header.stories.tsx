import { CloseChatButtonIconBase64, MinimizeChatButtonIconBase64, ModernChatIconBase64 } from "@microsoft/omnichannel-chat-components";
import { FontIcon, IStackStyles, Stack, mergeStyles } from "@fluentui/react";

import CommandButton from "./common/commandbutton/CommandButton";
import { Header } from "@microsoft/omnichannel-chat-components";
import { ICommandButtonProps } from "./common/interfaces/ICommandButtonProps";
import { IHeaderProps } from "@microsoft/omnichannel-chat-components/lib/types/components/header/interfaces/IHeaderProps";
import { Meta } from "@storybook/react/types-6-0";
import React from "react";
import { Story } from "@storybook/react";

export default {
    title: "Stateless Components/Header",
    component: Header
} as Meta;

const defaultHeaderProps: IHeaderProps = {
    controlProps: {
        id: "oc-lcw-header",
        hideIcon: false,
        hideTitle: false,
        hideCloseButton: false,
        hideMinimizeButton: false,
        onMinimizeClick: function () { alert("minimize clicked"); },
        onCloseClick: function () { alert("close clicked"); },
        middleGroup: { children: [] },
        leftGroup: { children: [] },
        rightGroup: { children: [] },
        minimizeButtonProps: {
            id: "oc-lcw-header-minimize-button",
            type: "icon",
            iconName:"ChromeMinimize"
        },
        closeButtonProps: {
            id: "oc-lcw-header-close-button",
            type: "icon",
            iconName:"ChromeClose"
        },
        headerIconProps: {
            id: "oc-lcw-header-icon",
            src: ModernChatIconBase64,
            alt: "Chat Icon"
        },
        headerTitleProps: {
            id: "oc-lcw-header-title",
            text: "Let's Chat"
        }
    },
    styleProps: {
        generalStyleProps: {
            background: "#315fa2",
            borderRadius: "4px 4px 0 0",
            padding: "5px",
            minHeight: "50px",
            width: "100%",
            minWidth: "250px"
        },
        iconStyleProps: {
            height: "30px",
            width: "30px",
            margin: "5px 10px"
        },
        titleStyleProps: {
            fontSize: 16,
            fontFamily: "Segoe UI, Arial, sans-serif",
            fontWeight: "450",
            color: "white",
            padding: "3px 0"
        },
        minimizeButtonStyleProps: {
            color: "white",
            margin: "5px 0",
            fontSize: "12px"
        },
        closeButtonStyleProps: {
            color: "white",
            margin: "5px 0",
            fontSize: "12px"
        },
        closeButtonHoverStyleProps: {
            filter: "brightness(0.8)"
        },
        minimizeButtonHoverStyleProps: {
            filter: "brightness(0.8)"
        },
        headerItemFocusStyleProps: {
            border: "2px dotted #000"
        }       
    }
};
const customHeaderProps: IHeaderProps = {
    controlProps: {
        id: "oc-lcw-header",
        hideIcon: false,
        hideTitle: false,
        hideCloseButton: false,
        hideMinimizeButton: false,
        onMinimizeClick: function () { alert("minimize clicked"); },
        onCloseClick: function () { alert("close clicked"); },
        middleGroup: { children: [] },
        leftGroup: { children: [] },
        rightGroup: { children: [] },
        minimizeButtonProps: {
            id: "oc-lcw-header-minimizebutton",
            type: "icon",
            imageIconProps: {
                src: MinimizeChatButtonIconBase64,
                styles: { image: { height: "16px", width: "16px" } }
            }
    
        },
        closeButtonProps: {
            id: "oc-lcw-header-closebutton",
            type: "icon",
            imageIconProps: {
                src: CloseChatButtonIconBase64,
                styles: { image: { height: "16px", width: "16px" } }
            }
        },
        headerIconProps: {
            id: "oc-lcw-header-icon",
            src: ModernChatIconBase64,
            alt: "Chat Icon"
        },
        headerTitleProps: {
            id: "oc-lcw-header-title",
            text: "Let's Chat"
        }        
    },
    styleProps: defaultHeaderProps.styleProps
};

const Template: Story<IHeaderProps> = (args) => <Header {...args}></Header>;

/* Default Header */
export const Default = Template.bind({});
Default.args = defaultHeaderProps;

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
    <FontIcon aria-label="ChatBot" iconName="ChatBot" className={customIconClass} id="oc-lcw-header-icon" /></Stack>;

const maximizeHeaderButtonProps: ICommandButtonProps = {
    id: "oc-lcw-header-maximizebutton",
    type: "icon",
    iconName: "FullScreen",
    ariaLabel: "Maximize",
    styles: { color: "White" },
    onClick: function () { alert("maximize clicked"); }
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
        generalStyleProps: {
            background: "linear-gradient(0deg, rgba(34,193,195,1) 0%, rgba(253,187,45,1) 100%)",
            border: "1px solid green",
            borderRadius: "5px 5px 0 0",
            padding: "5px",
            resize: "vertical",
            overflowY: "hidden",
            maxHeight: "200px",
            MozBoxShadow: "0px 3px 4px #de1dde",
            WebkitBoxShadow: "0px 3px 4px #de1dde",
            boxShadow: "0px 3px 4px #de1dde",
            minHeight: "60px",
            width: "100%",
            minWidth: "250px"
        },
        iconStyleProps: {
            height: "50px",
            width: "50px"
        },
        titleStyleProps: {
            fontSize: 18,
            fontFamily: "Segoe UI, Arial, sans-serif",
            fontWeight: 600,
            color: "white"
        },
        minimizeButtonStyleProps: {
            color: "white"
        },
        closeButtonStyleProps: {
            color: "white"
        },
        headerItemFocusStyleProps: {
            border: "2px dotted #000"
        }
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