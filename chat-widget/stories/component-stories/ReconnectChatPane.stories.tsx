import { ReconnectChatPane, encodeComponentString } from "@microsoft/omnichannel-chat-components";

import { ChatReconnectIconBase64 } from "@microsoft/omnichannel-chat-components";
import { IReconnectChatPaneProps } from "@microsoft/omnichannel-chat-components/lib/types/components/reconnectchatpane/interfaces/IReconnectChatPaneProps";
import { Meta } from "@storybook/react/types-6-0";
import React from "react";
import { Story } from "@storybook/react";

export default {
    title: "Stateless Components/Reconnect Chat Pane",
    component: ReconnectChatPane,
} as Meta;

const ReconnectChatPaneTemplate: Story<IReconnectChatPaneProps> = (args) => <ReconnectChatPane {...args}></ReconnectChatPane>;
const defaultReconnectChatPaneProps: IReconnectChatPaneProps = {
    controlProps: {
        id: "oc-lcw-reconnectchat-pane",
        dir: "ltr",
        hideReconnectChatPane: false,
        reconnectChatPaneAriaLabel: "Reconnect Chat Pane",
    
        hideTitle: false,
        titleText: "Previous session detected",
    
        hideSubtitle: false,
        subtitleText: "We have detected a previous chat session. Would you like to continue with your previous session?",
    
        hideIcon: false,
        iconAriaLabel: "Reconnect Chat Pane Icon",
    
        isButtonGroupHorizontal: false,
    
        hideContinueChatButton: false,
        continueChatButtonText: "Continue conversation",
        continueChatButtonAriaLabel: "Continue conversation",
    
        hideStartNewChatButton: false,
        startNewChatButtonText: "Start new conversation",
        startNewChatButtonAriaLabel: "Start new conversation",
    
        onContinueChat: function () {
            alert("on continue conversation");
        },
    
        onStartNewChat: function () {
            alert("on start new conversation");
        },
    
        onMinimize: function () {
            alert("on minimize");
        }
    },
    styleProps: {
        generalStyleProps: {
            backgroundColor: "rgb(255, 255, 255)",
            borderColor: "#E6E6E6",
            borderRadius: "4px",
            borderStyle: "solid",
            borderWidth: "3px",
            padding: "15px",
            height: "100%",
            width: "100%"
        },
        wrapperStyleProps: {
            backgroundColor: "rgb(255, 255, 255)",
            borderColor: "#E6E6E6",
            borderRadius: "0 8px 8px 8px",
            borderStyle: "solid",
            borderWidth: "1px",
            padding: "20px",
            width: "100%"
        },
        titleStyleProps: {
            color: "rgb(0, 0, 0)",
            fontFamily: "'Segoe UI', Arial, sans-serif",
            fontSize: "16px",
            fontWeight: "600",
            lineHeight: "19px",
            marginBottom: "10px"
        },
        subtitleStyleProps: {
            color: "rgb(0, 0, 0)",
            fontFamily: "'Segoe UI', Arial, sans-serif",
            fontSize: "16px",
            fontWeight: "400",
            lineHeight: "19px"
        },
        iconStyleProps: {
            backgroundImage: `url(${ChatReconnectIconBase64})`,
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "200px",
            height: "130px",
            margin: "0 auto",
            width: "130px"
        },
        buttonGroupStyleProps: {
            alignItems: "stretch"
        },
        continueChatButtonStyleProps: {
            backgroundColor: "rgb(49, 95, 162)",
            color: "rgb(255, 255, 255)",
            cursor: "pointer",
            fontFamily: "'Segoe UI', Arial, sans-serif",
            fontSize: "16px",
            fontWeight: "600",
            height: "60px",
            marginBottom: "5px",
            padding: "4px 10px 5px 10px"
        },
        continueChatButtonHoveredStyleProps: {
            filter: "brightness(0.8)"
        },
        startNewChatButtonStyleProps: {
            backgroundColor: "rgb(0, 0, 0)",
            color: "rgb(255, 255, 255)",
            cursor: "pointer",
            fontFamily: "'Segoe UI', Arial, sans-serif",
            fontSize: "16px",
            fontWeight: "600",
            height: "60px",
            padding: "4px 10px 5px 10px"
        },
        startNewChatButtonHoveredStyleProps: {
            backgroundColor: "rgb(132, 132, 130)"
        }
    }
};
const sampleThreeReconnectChatPaneProps: IReconnectChatPaneProps = {
    controlProps: {
        id: "lcw-components-reconnect-chat-pane",
        dir: "ltr",
        hideReconnectChatPane: false,
        reconnectChatPaneAriaLabel: "Reconnect Chat Pane",
    
        hideTitle: false,
        titleText: "Previous session detected",
    
        hideSubtitle: true,
        subtitleText: "We have detected a previous chat session. Would you like to continue with your previous session?",
    
        hideIcon: false,
        iconAriaLabel: "Reconnect Chat Pane Icon",
    
        isButtonGroupHorizontal: false,
    
        hideContinueChatButton: false,
        continueChatButtonText: "Continue conversation",
        continueChatButtonAriaLabel: "Continue conversation",
    
        hideStartNewChatButton: true,
        startNewChatButtonText: "Start new conversation",
        startNewChatButtonAriaLabel: "Start new conversation",
    
        onContinueChat: function () {
            alert("on continue conversation");
        },
    
        onStartNewChat: function () {
            alert("on start new conversation");
        }        
    },
    styleProps: {
        generalStyleProps: {
            backgroundColor: "red",
            borderColor: "black",
            borderRadius: "20%",
            width: "600px"
        },
        wrapperStyleProps: {
            backgroundColor: "green",
            borderRadius: "20%"
        },
        titleStyleProps: {
            color: "white",
            fontSize: "20px",
            textAlign: "center"
        },
        buttonGroupStyleProps: {
            alignItems: "center"
        },
        continueChatButtonStyleProps: {
            fontSize: "20px",
            height: "200px",
            width: "200px"
        }        
    }
};

/*
    Default Reconnect Chat Pane
*/

export const Default = ReconnectChatPaneTemplate.bind({});
Default.args = defaultReconnectChatPaneProps;

/*
    Default Rtl Reconnect Chat Pane
*/

const defaultRtlProps = {
    controlProps: {
        ...defaultReconnectChatPaneProps.controlProps,
        dir: "rtl"
    },
    styleProps: {
        ...defaultReconnectChatPaneProps.styleProps
    }
};

export const DefaultRtl = ReconnectChatPaneTemplate.bind({});
DefaultRtl.args = defaultRtlProps;

/*
    Reconnect Chat Pane Pane Sample 1: Horizontal layout for the buttons
*/

const sample1Props = {
    controlProps: {
        ...defaultReconnectChatPaneProps.controlProps,
        isButtonGroupHorizontal: true,
    },
    styleProps: {
        ...defaultReconnectChatPaneProps.styleProps,
        iconStyleProps: {
            margin: "10px"
        },
        continueChatButtonStyleProps: {
            marginRight: "10px",
            width: "100%"
        },
        startNewChatButtonStyleProps: {
            width: "100%"
        },
    }
};

export const Sample1 = ReconnectChatPaneTemplate.bind({});
Sample1.args = sample1Props;

/*
    Reconnect Chat Pane Pane Sample 2: custom element that overrides the icon
*/

const customReactNode = (
    <h1 style={{color: "blue", backgroundColor: "yellow"}}>
            This is a custom element that overrides the icon
    </h1>
);

const sample2Props = {
    controlProps: {
        ...defaultReconnectChatPaneProps.controlProps
    },
    styleProps: {
        ...defaultReconnectChatPaneProps.styleProps
    },
    componentOverrides: {
        ...defaultReconnectChatPaneProps.componentOverrides,
        icon: customReactNode
    }
};

export const Sample2 = ReconnectChatPaneTemplate.bind({});
Sample2.args = sample2Props;

/*
    Reconnect Chat Pane Pane Sample 3: round border
*/

export const Sample3 = ReconnectChatPaneTemplate.bind({});
Sample3.args = sampleThreeReconnectChatPaneProps;

/*
    Reconnect Chat Pane Pane Sample 4: smaller width for container
*/

const sample4Props = {
    controlProps: {
        ...defaultReconnectChatPaneProps.controlProps
    },
    styleProps: {
        ...defaultReconnectChatPaneProps.styleProps,
        generalStyleProps: {
            width: "350px"
        }
    }
};

export const Sample4 = ReconnectChatPaneTemplate.bind({});
Sample4.args = sample4Props;

/*
    Reconnect Chat Pane Pane Sample 5: custom element that overrides the continue button
*/

const customReactNode1 = encodeComponentString(
    <input type="text" placeholder="Input text"/>
);

const sample5Props = {
    controlProps: {
        ...defaultReconnectChatPaneProps.controlProps,
        isIncomingCall: true
    },
    styleProps: {
        ...defaultReconnectChatPaneProps.styleProps,
        generalStyleProps: {
            width: "350px"
        }
    },
    componentOverrides: {
        ...defaultReconnectChatPaneProps.componentOverrides,
        continueChatButton: customReactNode1
    }
};

export const Sample5 = ReconnectChatPaneTemplate.bind({});
Sample5.args = sample5Props;