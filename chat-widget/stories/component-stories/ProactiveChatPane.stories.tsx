import { CloseChatButtonIconBase64, ProactiveChatBannerBase64 } from "@microsoft/omnichannel-chat-components";
import { ProactiveChatPane, encodeComponentString } from "@microsoft/omnichannel-chat-components";

import { IProactiveChatPaneProps } from "@microsoft/omnichannel-chat-components/lib/types/components/proactivechatpane/interfaces/IProactiveChatPaneProps";
import { Meta } from "@storybook/react/types-6-0";
import React from "react";
import { Story } from "@storybook/react";

export default {
    title: "Stateless Components/Proactive Chat Pane",
    component: ProactiveChatPane,
} as Meta;

const ProactiveChatPaneTemplate: Story<IProactiveChatPaneProps> = (args) => <ProactiveChatPane {...args}></ProactiveChatPane>;
const defaultProactiveChatPaneProps: IProactiveChatPaneProps = {
    controlProps: {
        id: "oc-lcw-proactivechat",
        dir: "ltr",
        hideProactiveChatPane: false,
        proactiveChatPaneAriaLabel: "Proactive Chat Pane",
    
        hideTitle: false,
        titleText: "Welcome to",
    
        hideSubtitle: false,
        subtitleText: "Live chat support!",
    
        hideCloseButton: false,
        closeButtonAriaLabel: "Close Button",
    
        isBodyContainerHorizantal: false,
    
        hideBodyTitle: false,
        bodyTitleText: "Hi! Have any questions? I am here to help.",
    
        hideStartButton: false,
        startButtonText: "Chat Now",
        startButtonAriaLabel: "Chat Now",
    
        onClose: function () {
            alert("on close");
        },
    
        onStart: function () {
            alert("on start");
        }
    },
    styleProps: {
        generalStyleProps: {
            backgroundColor: "rgb(255, 255, 255)",
            borderRadius: "8px",
            boxShadow: "0 0 4px rgb(102 102 102 / 50%)",
            bottom: "0",
            height: "auto",
            margin: "3px",
            minHeight: "133px",
            position: "absolute", 
            right: "0",
            width: "245px",
            zIndex: "9999"
        },
        headerContainerStyleProps: {
            backgroundColor: "rgb(49, 95, 162)",
            backgroundImage: `url(${ProactiveChatBannerBase64})`,
            backgroundPosition: "initial",
            backgroundRepeat: "no-repeat", 
            borderTopLeftRadius: "inherit",
            borderTopRightRadius: "inherit",
            height: "90px",
            padding: "10px 16px 10px 16px"
        },
        textContainerStyleProps: {
            color: "rgb(255, 255, 255)",
            fontFamily: "'Segoe UI', Arial, sans-serif",
            fontSize: "14px",
            fontStyle: "normal",
            fontWeight: "400",
            lineHeight: "19px",
            width: "95%"
        },
        titleStyleProps: {
            color: "rgb(255, 255, 255)",
            fontFamily: "'Segoe UI', Arial, sans-serif"
        },
        subtitleStyleProps: {
            color: "rgb(255, 255, 255)",
            fontFamily: "'Segoe UI', Arial, sans-serif",
            fontSize: "18px",
            fontWeight: "600"
        },
        closeButtonStyleProps: {
            backgroundImage: `url(${CloseChatButtonIconBase64})`,
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat", 
            color: "#605e5c",
            cursor: "pointer",
            height: "14px",
            lineHeight: "14px",
            textAlign: "center",
            width: "14px",
            zIndex: "inherit"
        },
        bodyTitleStyleProps: {
            color: "rgb(0, 0, 0)",
            display: "inline-block",
            fontFamily: "'Segoe UI', Arial, sans-serif",
            fontSize: "14px",
            lineHeight: "19px",
            padding: "16px",
            overflow: "hidden",
            wordBreak: "break-word"
        },
        startButtonStyleProps: {
            backgroundColor: "rgb(49, 95, 162)",
            borderRadius: "40px",
            color: "rgb(255, 255, 255)",
            cursor: "pointer",
            fontFamily: "'Segoe UI', Arial, sans-serif",
            margin: "20px 16px 20px 16px",
            padding: "6px 23px 6px 23px",
            width: "50%",
            zIndex: "inherit"
        }       
    }
};
const sampleOneProactiveChatPaneProps: IProactiveChatPaneProps = {
    controlProps: {
        ...defaultProactiveChatPaneProps.controlProps
    },
    styleProps: {
        closeButtonStyleProps: {
            height: "20px",
            width: "20px"
        },
        closeButtonHoveredStyleProps: {
            backgroundColor: "rgb(129, 133, 137)"
        },
        bodyTitleStyleProps: {
            alignItems: "center",
            display: "flex",
            textAlign: "center"
        },
        startButtonStyleProps: {
            borderRadius: "10px",
            height: "100px",
            width: "100px"
        },
        startButtonHoveredStyleProps: {
            backgroundColor: "rgb(169, 169, 169)",
            color: "rgb(0, 0, 0)"
        }        
    }
};

const customReactNode1 = encodeComponentString(
    <div style={{color: "rgb(255, 255, 255)",
        float: "right", 
        backgroundColor: "green",
        borderRadius: "50px",
        fontSize: "10px",
        height: "20px",
        margin: "10px 10px 0 0",
        padding: "10px",
        width: "20px"}}>
            End Chat
    </div>
);

const customReactNode2 = (
    <button style={{color: "rgb(255, 255, 255)",
        backgroundColor: "green",
        borderRadius: "30px",
        borderColor: "green",
        borderStyle: "solid",
        height: "80px",
        margin: "30px 15px 0 0",
        padding: "10px",
        width: "160px"}}>
            This is a custom button
    </button>
);

const sampleTwoProactiveChatPaneProps: IProactiveChatPaneProps = {
    controlProps:{
        id: "oclcw-incomingproactivechat",
        dir: "ltr",
        hideProactiveChatPane: false,
        proactiveChatPaneAriaLabel: "Proactive Chat Pane",
    
        hideTitle: true,
        titleText: "Welcome to",
    
        hideSubtitle: false,
        subtitleText: "Live chat support!",
    
        hideCloseButton: false,
    
        isBodyContainerHorizantal: true,
    
        hideBodyTitle: false,
        
        hideStartButton: false,
        startButtonText: "Chat Now",
        startButtonAriaLabel: "Chat Now",
    
        onStart: function () {
            alert("on start");
        }        
    },
    componentOverrides: {
        closeButton: customReactNode1,
        bodyTitle: customReactNode2
    },
    styleProps: {
        generalStyleProps: {
            borderColor: "black",
            borderRadius: "50px",
            borderStyle: "solid",
            borderWidth: "1px"            
        },
        headerContainerStyleProps: {
            backgroundColor: "blue",
            borderRadius: "50px"
        },
        textContainerStyleProps: {
            borderRadius: "50px",
            margin: "10px 0 10px 10px"
        },
        bodyContainerStyleProps: {
            borderRadius: "50px",
            overflow: "auto",
            padding: "10px"
        },
        startButtonStyleProps: {
            backgroundColor: "black",
            borderRadius: "50px",
            height: "100px",
            width: "100px"
        },
        startButtonHoveredStyleProps: {
            backgroundColor: "rgb(169, 169, 169)",
            color: "rgb(0, 0, 0)"
        }        
    }
};
const sampleThreeProactiveChatPaneProps: IProactiveChatPaneProps = {
    controlProps: {
        ...defaultProactiveChatPaneProps.controlProps
    },
    styleProps: {
        generalStyleProps: {
            backgroundColor: "purple",
            boxShadow: "20px 20px 4px rgb(102 102 102 / 50%)",
            float: "right",
            height: "400px",
            position: "relative"
        },
        headerContainerStyleProps: {
            backgroundColor: "rgb(0, 0, 0)"
        },
        closeButtonStyleProps: {
            height: "20px",
            width: "20px"
        },
        closeButtonHoveredStyleProps: {
            backgroundColor: "rgb(129, 133, 137)"
        },
        bodyContainerStyleProps: {
            backgroundColor: "yellow",
            bottom: "20px",
            left: "20px",
            padding: "10px",
            position: "absolute",
            right: "20px"
        },
        startButtonStyleProps: {
            backgroundColor: "black",
            height: "30px",
            padding: "5px",
            width: "100px"
        },
        startButtonHoveredStyleProps: {
            backgroundColor: "rgb(169, 169, 169)",
            color: "rgb(0, 0, 0)"
        }
    }
};

/*
    Default Proactive Chat Pane
*/

export const Default = ProactiveChatPaneTemplate.bind({});
Default.args = defaultProactiveChatPaneProps;

/*
    Default Rtl Proactive Chat Pane
*/

const defaultRtlProps = {
    controlProps: {
        ...defaultProactiveChatPaneProps.controlProps,
        dir: "rtl"
    },
    styleProps: {
        ...defaultProactiveChatPaneProps.styleProps
    }
};

export const DefaultRtl = ProactiveChatPaneTemplate.bind({});
DefaultRtl.args = defaultRtlProps;

/*
    Proactive Chat Pane Pane Sample 1: Horizontal layout for the buttons
*/

export const Sample1 = ProactiveChatPaneTemplate.bind({});
Sample1.args = sampleOneProactiveChatPaneProps;

/*
    Proactive Chat Pane Pane Sample 2: custom element that overrides the icon
*/

export const Sample2 = ProactiveChatPaneTemplate.bind({});
Sample2.args = sampleTwoProactiveChatPaneProps;

/*
    Proactive Chat Pane Pane Sample 3: round border
*/

export const Sample3 = ProactiveChatPaneTemplate.bind({});
Sample3.args = sampleThreeProactiveChatPaneProps;