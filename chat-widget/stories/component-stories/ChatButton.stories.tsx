import { ChatButton, CustomChatIconBase64, encodeComponentString } from "@microsoft/omnichannel-chat-components";

import { IChatButtonProps } from "@microsoft/omnichannel-chat-components/lib/types/components/chatbutton/interfaces/IChatButtonProps";
import { Meta } from "@storybook/react/types-6-0";
import React from "react";
import { Story } from "@storybook/react";

export default {
    title: "Stateless Components/ChatButton",
    component: ChatButton,
} as Meta;

const Template: Story<IChatButtonProps> = (args) => <ChatButton {...args}></ChatButton>;

const defaultChatButtonProps: IChatButtonProps = {
    controlProps: {
        id: "lcw-components-chat-button",
        dir: "ltr",
        role: "button",
        ariaLabel: "live chat button",
        unreadMessageCount: "0",
        titleText: "Let's Chat!",
        subtitleText: "We're online.",
        onClick: function () {
            alert("initiate chat"); 
        },
        hideChatButton: false,
        hideChatIcon:false, 
        hideChatTextContainer: false,
        hideChatSubtitle: false,
        hideChatTitle: false,
        hideNotificationBubble: true       
    },
    styleProps: {
        generalStyleProps: {    
            backgroundColor: "#fff",
            borderColor: "#fff",
            borderRadius: "100px 100px 100px 99px",
            borderStyle: "solid",
            borderWidth: "1px",
            bottom: "0px",
            boxShadow: "0 0 4px rgb(102 102 102 / 50%)",
            cursor: "pointer",
            display: "flex",
            height: "60px",
            margin: "3px 3px 3px 3px",
            padding: "0px",
            position: "absolute",
            right: "0px",
            selectors: {
                ":hover" : {
                    backgroundColor: "lightgrey"
                },
                ":focus" : {
                    outline: "dotted 2px #000"
                }
            },
            width: "180px"
        },
        iconStyleProps: {
            align: "center",
            backgroundColor:"#315FA2",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "65% 65%",
            borderColor: "transparent",
            borderRadius: "50%",
            borderStyle: "solid",
            borderWidth: "1px",
            display: "flex",
            height: "60px",
            justifyContent: "center",
            margin: "-2px -2px -2px -3px",
            width: "62px"
        },
        notificationBubbleStyleProps: {
            backgroundColor: "#cc4a31",
            borderRadius: "50%",
            color: "#fff",
            fontFamily: "Segoe UI,Arial,sans-serif",
            fontSize: "14px",
            fontStyle: "normal",
            fontWeight: "bold",
            lineHeight: "22px",
            padding: "1px",
            position: "absolute",
            textAlign: "center",
            top: "-5px",
            minHeight: "24px",
            minWidth: "24px"
        },
        textContainerStyleProps: {
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"    
        },
        titleStyleProps: {
            color: "#262626",
            cursor: "pointer",
            display: "block",
            fontFamily:"'Segoe UI',Arial,sans-serif",
            fontSize:"16px",
            fontWeight:"bold",
            lineHeight: "19px",
            height: "22px",
            margin: "0px 14px 0px 14px",
            overflow: "hidden",
            textOverflow: "ellipsis !important",
            whiteSpace: "nowrap",
            width: "90px"
        },
        subtitleStyleProps: {
            alignItems: "center",
            color: "#666",
            cursor: "pointer",
            display: "block",
            fontFamily:"'Segoe UI',Arial,sans-serif",
            fontSize:"12px",
            fontWeight:"200",
            margin: "0px 14px 0px 14px",
            overflow: "hidden",
            textOverflow: "ellipsis !important",
            width: "max-content"
        }
    }
};

/*
    Default ChatButton
*/

export const ChatButtonDefault = Template.bind({});
ChatButtonDefault.args = defaultChatButtonProps;

/*
    ChatButton RTL
*/

const chatButtonRTLProps: IChatButtonProps = {
    controlProps:{
        ...defaultChatButtonProps.controlProps,
        dir: "rtl",
        unreadMessageCount: "10",
        hideNotificationBubble: false,
        titleText: "لنتحدث!",
        subtitleText: "We're online."
    },
    
    styleProps:{
        ...defaultChatButtonProps.styleProps,
        notificationBubbleStyleProps: Object.assign({}, defaultChatButtonProps.styleProps.notificationBubbleStyleProps,{
            backgroundColor: "#d53434"
        })
    }
};

export const ChatButtonRTL = Template.bind({});
ChatButtonRTL.args = chatButtonRTLProps;

/*
    ChatButton Sample 1
*/

const chatButtonSample1Props: IChatButtonProps = {
    controlProps:{
        ...defaultChatButtonProps.controlProps,
        dir: "rtl",
        unreadMessageCount: "1000",
        hideNotificationBubble: false,
        hideChatIcon: false,
        hideChatSubtitle: true,
        titleText: "CHAT NOW !!!"
    },
    
    styleProps:{
        generalStyleProps: Object.assign({}, defaultChatButtonProps.styleProps.generalStyleProps, {
            borderRadius: "0px 0px 0px 0px",
            width: "360px",
            backgroundColor: "#b9f73a",
            selectors: {
                ":hover" : {
                    backgroundColor: "black"
                }
            } 
        }), 
        iconStyleProps:Object.assign({}, defaultChatButtonProps.styleProps.iconStyleProps,{
            backgroundImage: `url(${CustomChatIconBase64})`,
            borderRadius: "unset",
            backgroundColor: "#b9f73a"
        }),        
        notificationBubbleStyleProps: Object.assign({}, defaultChatButtonProps.styleProps.notificationBubbleStyleProps, {
            backgroundColor: "#d53434"
        }),
        textContainerStyleProps:  Object.assign({}, defaultChatButtonProps.styleProps.textContainerStyleProps),
        titleStyleProps: Object.assign({}, defaultChatButtonProps.styleProps.titleStyleProps , {
            width: "280px",
            fontSize: "40px",
            color: "#ff0000",
            height: "32px",
            lineHeight: "14px"
        })
    }
};

export const ChatButtonSample1 = Template.bind({});
ChatButtonSample1.args = chatButtonSample1Props;

/*
    ChatButton Sample 2
*/

const chatButtonSample2Props: IChatButtonProps = {
    controlProps:{
        ...defaultChatButtonProps.controlProps,
        hideChatTextContainer: true,
        hideNotificationBubble: false,
        unreadMessageCount: "1000"
    },
    
    styleProps:{
        generalStyleProps: Object.assign({}, defaultChatButtonProps.styleProps.generalStyleProps, {
            borderStyle: "",
            boxShadow: "",
            width: "100px",
            height: "100px",
            backgroundColor: ""
        }), 
        iconStyleProps:Object.assign({}, defaultChatButtonProps.styleProps.iconStyleProps,{
            backgroundImage: `url(${CustomChatIconBase64})`,
            left: "",
            borderRadius: "unset",
            backgroundColor: "",
            backgroundSize: "100% 100%",
            width: "100px",
            height: "100px"
        }),
        
        notificationBubbleStyleProps: Object.assign({}, defaultChatButtonProps.styleProps.notificationBubbleStyleProps, {
            left: "60px",
            backgroundColor: "#d53434"
        }),
    }
};

export const ChatButtonSample2 = Template.bind({});
ChatButtonSample2.args = chatButtonSample2Props;

/*
    ChatButton Sample 3 
*/

const customTitle = (
    <h2 style={{color: "#8A2E2E", 
        fontSize:"12px",
        fontWeight:"bold", 
        margin: "0px 5px 0px 5px"}} 
    dir="ltr" >
    
        Initiate new Chat.
    </h2>
);
const customSubTitle = encodeComponentString(
    <h2 style={{color: "black", 
        fontSize:"8px" , 
        margin: "0px 5px 0px 5px"}} 
    dir="ltr">
        Click Here!
    </h2>
);

const customIcon = (
    <></>
);

const chatButtonSample3Props: IChatButtonProps = {
    componentOverrides: {
        title: customTitle,
        subtitle: customSubTitle,
        iconContainer: customIcon
    },
    styleProps:{
        generalStyleProps: Object.assign({}, defaultChatButtonProps.styleProps.generalStyleProps, {
            borderStyle: "",
            boxShadow: "",
            width: "100px",
            height: "100px",
            backgroundColor: ""
        }), 
    }    
};

export const ChatButtonSample3 = Template.bind({});
ChatButtonSample3.args = chatButtonSample3Props;