import React, { useState } from "react";

import ChatConfig from "@microsoft/omnichannel-chat-sdk/lib/core/ChatConfig";
import { Meta } from "@storybook/react/types-6-0";
import { Story } from "@storybook/react";
import { LiveChatWidget } from "../src";
import { ILiveChatWidgetProps } from "../src/components/livechatwidget/interfaces/ILiveChatWidgetProps";
import { MockChatSDK } from "../src/components/webchatcontainerstateful/common/mockchatsdk";

export default {
    title: "Stateful Components/Live Chat Widget",
    component: LiveChatWidget,
} as Meta;

const LiveChatWidgetTemplate: Story<ILiveChatWidgetProps> = (args) => <LiveChatWidget {...args}></LiveChatWidget>;

/*
    Live Chat Widget Default
*/

export const LiveChatWidgetFixedSize = LiveChatWidgetTemplate.bind({});

const liveChatWidgetFixedSizeProps: ILiveChatWidgetProps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chatSDK: new MockChatSDK() as any,
    styleProps: {
        generalStyles: {
            width: "360px",
            height: "560px",
            top: "20px",
            left: "20px"
        }
    }
};

LiveChatWidgetFixedSize.args = liveChatWidgetFixedSizeProps;