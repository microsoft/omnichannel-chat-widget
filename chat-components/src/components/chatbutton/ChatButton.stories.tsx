import ChatButton from "./ChatButton";
import { CustomChatIconBase64 } from "../../assets/Icons";
import type { IChatButtonProps } from "./interfaces/IChatButtonProps";
import { Meta } from "@storybook/react/types-6-0";
import React from "react";
import { Story } from "@storybook/react";
import { defaultChatButtonControlProps } from "./common/defaultProps/defaultChatButtonControlProps";
import { defaultChatButtonGeneralStyles } from "./common/defaultStyles/defaultChatButtonGeneralStyles";
import { defaultChatButtonIconContainerStyles } from "./common/defaultStyles/defaultChatButtonIconContainerStyles";
import { defaultChatButtonNotificationBubbleStyles } from "./common/defaultStyles/defaultChatButtonNotificationBubbleStyles";
import { defaultChatButtonProps } from "./common/defaultProps/defaultChatButtonProps";
import { defaultChatButtonStyleProps } from "./common/defaultStyles/defaultChatButtonStyleProps";
import { defaultChatButtonTextContainerStyles } from "./common/defaultStyles/defaultChatButtonTextContainerStyles";
import { defaultChatButtonTitleStyles } from "./common/defaultStyles/defaultChatButtonTitleStyles";
import { encodeComponentString } from "../../common/encodeComponentString";
import { Texts } from "../../common/Constants";

export default {
    title: "Stateless Components/ChatButton",
    component: ChatButton,
} as Meta;

const Template: Story<IChatButtonProps> = (args) => <ChatButton {...args}></ChatButton>;

/*
    Default ChatButton
*/

export const ChatButtonDefault = Template.bind({});
ChatButtonDefault.args = defaultChatButtonProps;

/*
    ChatButton Preset 1
*/

const chatButtonPreset1Props: IChatButtonProps = {
    controlProps:{
        ...defaultChatButtonControlProps,
        dir: "rtl",
        unreadMessageCount: "1000",
        hideNotificationBubble: false,
        hideChatIcon: false,
        hideChatSubtitle: true,
        titleText: "CHAT NOW !!!"
    },
    
    styleProps:{
        generalStyleProps: Object.assign({}, defaultChatButtonGeneralStyles, {
            borderRadius: "0px 0px 0px 0px",
            width: "360px",
            backgroundColor: "#b9f73a",
            selectors: {
                ":hover" : {
                    backgroundColor: "black"
                }
            } 
        }), 
        iconStyleProps:Object.assign({}, defaultChatButtonIconContainerStyles,{
            backgroundImage: `url(${CustomChatIconBase64})`,
            borderRadius: "unset",
            backgroundColor: "#b9f73a"
        }),        
        notificationBubbleStyleProps: Object.assign({}, defaultChatButtonNotificationBubbleStyles, {
            backgroundColor: "#d53434"
        }),
        textContainerStyleProps:  Object.assign({}, defaultChatButtonTextContainerStyles),
        titleStyleProps: Object.assign({}, defaultChatButtonTitleStyles , {
            width: "280px",
            fontSize: "40px",
            color: "#ff0000",
            height: "32px",
            lineHeight: "14px"
        })
    }
};

export const ChatButtonPreset1 = Template.bind({});
ChatButtonPreset1.args = chatButtonPreset1Props;

/*
    ChatButton Preset 2
*/

const chatButtonPreset2Props: IChatButtonProps = {
    controlProps:{
        ...defaultChatButtonControlProps,
        hideChatTextContainer: true,
        hideNotificationBubble: false,
        unreadMessageCount: "1000"
    },
    
    styleProps:{
        generalStyleProps: Object.assign({}, defaultChatButtonGeneralStyles, {
            borderStyle: "",
            boxShadow: "",
            width: "100px",
            height: "100px",
            backgroundColor: ""
        }), 
        iconStyleProps:Object.assign({}, defaultChatButtonIconContainerStyles,{
            backgroundImage: `url(${CustomChatIconBase64})`,
            left: "",
            borderRadius: "unset",
            backgroundColor: "",
            backgroundSize: "100% 100%",
            width: "100px",
            height: "100px"
        }),
        
        notificationBubbleStyleProps: Object.assign({}, defaultChatButtonNotificationBubbleStyles, {
            left: "60px",
            backgroundColor: "#d53434"
        }),
    }
};

export const ChatButtonPreset2 = Template.bind({});
ChatButtonPreset2.args = chatButtonPreset2Props;

/*
    ChatButton Preset 3 
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

const chatButtonPreset3Props: IChatButtonProps = {
    componentOverrides: {
        title: customTitle,
        subtitle: customSubTitle,
        iconContainer: customIcon
    },
    styleProps:{
        generalStyleProps: Object.assign({}, defaultChatButtonGeneralStyles, {
            borderStyle: "",
            boxShadow: "",
            width: "100px",
            height: "100px",
            backgroundColor: ""
        }), 
    }    
};

export const ChatButtonPreset3 = Template.bind({});
ChatButtonPreset3.args = chatButtonPreset3Props;


/*
    ChatButton Preset 4
*/

const chatButtonPreset4Props: IChatButtonProps = {
    controlProps:{
        ...defaultChatButtonControlProps,
        dir: "rtl",
        unreadMessageCount: "10",
        hideNotificationBubble: false,
        titleText: "لنتحدث!",
        subtitleText: Texts.ChatButtonSubtitle
    },
    
    styleProps:{
        ...defaultChatButtonStyleProps,
        notificationBubbleStyleProps: Object.assign({}, defaultChatButtonNotificationBubbleStyles,{
            backgroundColor: "#d53434"
        })
    }
};

export const ChatButtonPreset4 = Template.bind({});
ChatButtonPreset4.args = chatButtonPreset4Props;