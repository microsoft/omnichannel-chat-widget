import { IReconnectChatPaneProps } from "./interfaces/IReconnectChatPaneProps";
import { Meta } from "@storybook/react/types-6-0";
import React from "react";
import ReconnectChatPane from "./ReconnectChatPane";
import { Story } from "@storybook/react";
import { defaultReconnectChatPaneProps } from "./common/default/defaultProps/defaultReconnectChatPaneProps";
import { encodeComponentString } from "../../common/encodeComponentString";
import { presetThreeReconnectChatPaneProps } from "./common/presetThree/presetThreeProps/presetThreeReconnectChatPaneProps";

export default {
    title: "Stateless Components/Reconnect Chat Pane",
    component: ReconnectChatPane,
} as Meta;

const ReconnectChatPaneTemplate: Story<IReconnectChatPaneProps> = (args) => <ReconnectChatPane {...args}></ReconnectChatPane>;

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
    Reconnect Chat Pane Pane Preset 1: Horizontal layout for the buttons
*/

const preset1Props = {
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

export const Preset1 = ReconnectChatPaneTemplate.bind({});
Preset1.args = preset1Props;

/*
    Reconnect Chat Pane Pane Preset 2: custom element that overrides the icon
*/

const customReactNode = (
    <h1 style={{color: "blue", backgroundColor: "yellow"}}>
            This is a custom element that overrides the icon
    </h1>
);

const preset2Props = {
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

export const Preset2 = ReconnectChatPaneTemplate.bind({});
Preset2.args = preset2Props;

/*
    Reconnect Chat Pane Pane Preset 3: round border
*/

export const Preset3 = ReconnectChatPaneTemplate.bind({});
Preset3.args = presetThreeReconnectChatPaneProps;

/*
    Reconnect Chat Pane Pane Preset 4: smaller width for container
*/

const preset4Props = {
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

export const Preset4 = ReconnectChatPaneTemplate.bind({});
Preset4.args = preset4Props;

/*
    Reconnect Chat Pane Pane Preset 5: custom element that overrides the continue button
*/

const customReactNode1 = encodeComponentString(
    <input type="text" placeholder="Input text"/>
);

const preset5Props = {
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

export const Preset5 = ReconnectChatPaneTemplate.bind({});
Preset5.args = preset5Props;