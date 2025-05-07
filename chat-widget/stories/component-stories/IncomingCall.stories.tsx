import { AgentIconBase64, CallAcceptButtonBase64, CallRejectButtonBase64, VideoCallAcceptButtonIconBase64 } from "@microsoft/omnichannel-chat-components";
import { IImageStyles, ILabelStyles, IStackStyles, Image, Label, Stack } from "@fluentui/react";

import { IIncomingCallComponentOverrides } from "@microsoft/omnichannel-chat-components/lib/types/components/callingcontainer/subcomponents/IncomingCall/interfaces/IIncomingCallComponentOverrides";
import { IIncomingCallProps } from "@microsoft/omnichannel-chat-components/lib/types/components/callingcontainer/subcomponents/IncomingCall/interfaces/IIncomingCallProps";
import { IncomingCall } from "@microsoft/omnichannel-chat-components";
import { Meta } from "@storybook/react/types-6-0";
import React from "react";
import { Story } from "@storybook/react";

export default {
    title: "Stateless Components/Calling Container/Incoming Call",
    component: IncomingCall
} as Meta;

const Template: Story<IIncomingCallProps> = (args) => <IncomingCall {...args}></IncomingCall>;
const defaultIncomingCallProps: IIncomingCallProps = {
    controlProps: {
        id: "oc-lcw-incomingcall",
        dir: "ltr",
        ariaLabel: "Incoming call area",
        hideAudioCall: false,
        hideVideoCall: false,
        hideDeclineCall: false,
        hideIncomingCallTitle: false,
        onDeclineCallClick: function () { alert("download transcript clicked"); },
        onAudioCallClick: function () { alert("email transcript clicked"); },
        onVideoCallClick: function () { alert("audio notification clicked"); },
        middleGroup: { gap: 5, children: [] },
        leftGroup: { gap: 5, children: [] },
        rightGroup: { gap: 5, children: [] },
        declineCallButtonProps: {
            id: "callRejectButton",
            type: "icon",
            ariaLabel: "Reject call",
            iconName: "DeclineCall",
            iconSize: 20
        },
        audioCallButtonProps: {
            id: "callAcceptButton",
            type: "icon",
            ariaLabel: "Accept voice call",
            iconName: "IncomingCall",
            iconSize: 20
        },
        videoCallButtonProps: {
            id: "videoCallAcceptButton",
            type: "icon",
            ariaLabel: "Accept video Call",
            iconName: "Video",
            iconSize: 20
        },
        incomingCallTitle: {
            id: "incomingCallMessage",
            text: "Incoming Call"
        }
    },
    styleProps: {
        generalStyleProps: {
            background: "#000",
            padding: "5px",
            height: "60px"
        },
        audioCallButtonStyleProps: {
            borderRadius: "50%",
            color: "#FFFFFF",
            backgroundColor: "#008000",
            lineHeight: "40px",
            height: "40px",
            width: "40px",
            fontSize: 18
        },
        audioCallButtonHoverStyleProps: {
            filter: "brightness(0.8)"
        },
        videoCallButtonStyleProps: {
            borderRadius: "50%",
            color: "#FFFFFF",
            backgroundColor: "#008000",
            lineHeight: "40px",
            height: "40px",
            width: "40px",
            fontSize: 18
        },
        videoCallButtonHoverStyleProps: {
            filter: "brightness(0.8)"
        },
        declineCallButtonHoverStyleProps: {
            filter: "brightness(0.8)",
            border: "1px solid #000"
        },
        declineCallButtonStyleProps: {
            borderRadius: "50%",
            color: "#FFFFFF",
            backgroundColor: "#DC0000",
            lineHeight: "40px",
            height: "40px",
            width: "40px",
            fontSize: 18,
            marginLeft: "5px"
        },
        incomingCallTitleStyleProps: {
            margin: "0 5px",
            color: "#FFFFFF",
            fontSize: 12,
            fontFamily: "Segoe UI, Arial, sans-serif"
        },
        itemFocusStyleProps: {
            outline: "2px solid #FFFFFF",
        }
    }
};

/* Incoming Call - Default */
export const Default = Template.bind({});
Default.args = defaultIncomingCallProps;

/* Incoming Call - Rtl */
const defaultRtl: IIncomingCallProps = {
    controlProps: {
        id: "incomingCallPopup",
        ariaLabel: "Incoming call area",
        hideAudioCall: false,
        hideVideoCall: false,
        hideDeclineCall: false,
        hideIncomingCallTitle: false,
        onDeclineCallClick: function () { alert("download transcript clicked"); },
        onAudioCallClick: function () { alert("email transcript clicked"); },
        onVideoCallClick: function () { alert("audio notification clicked"); },
        middleGroup: { gap: 5, children: [] },
        leftGroup: { gap: 5, children: [] },
        rightGroup: { gap: 5, children: [] },
        dir: "rtl",
        declineCallButtonProps: {
            id: "callRejectButton",
            type: "icon",
            ariaLabel: "Decline Call",
            imageIconProps: {
                src: CallRejectButtonBase64,
                styles: { image: { height: "18px", width: "18px" } }
            },
            iconSize: 20
        },
        audioCallButtonProps: {
            id: "callAcceptButton",
            type: "icon",
            ariaLabel: "Audio Call",
            imageIconProps: {
                src: CallAcceptButtonBase64,
                styles: { image: { height: "18px", width: "18px" } }
            },
            iconSize: 20
        },
        videoCallButtonProps: {
            id: "videoCallAcceptButton",
            type: "icon",
            ariaLabel: "Video Call",
            imageIconProps: {
                src: VideoCallAcceptButtonIconBase64,
                styles: { image: { height: "18px", width: "18px" } }
            },
            iconSize: 20
        },
        incomingCallTitle: {
            id: "incomingCallMessage",
            text: "Incoming Call"
        }
    },
    styleProps: {
        ...defaultIncomingCallProps.styleProps
    }
};
export const Rtl = Template.bind({});
Rtl.args = defaultRtl;

/* Incoming Call - Component Overrides */
const agentImageStyles: IImageStyles = {
    root: { height: "50px", width: "50px" },
    image: { height: "50px", width: "50px" }
};

const label1Styles: ILabelStyles = {
    root: { color: "white", fontSize: 13, fontWeight: "bold", padding: 0 }
};

const label2Styles: ILabelStyles = {
    root: { color: "white", fontSize: 11, padding: 0 }
};

const stackStyles: Partial<IStackStyles> = {
    root: { paddingLeft: "10px" }
};

const componentOverrideProps: IIncomingCallComponentOverrides = {
    incomingCallTitle: <Stack horizontal>
        <Image src={AgentIconBase64} styles={agentImageStyles} />
        <Stack verticalAlign="center" horizontalAlign="baseline" styles={stackStyles}>
            <Label styles={label1Styles}>Omnichannel Agent 007</Label>
            <Label styles={label2Styles}>Incoming call</Label>
        </Stack>
    </Stack>
};
const componentOverridesProps: IIncomingCallProps = {
    componentOverrides: {
        ...componentOverrideProps
    },
    controlProps: {
        ...defaultIncomingCallProps.controlProps,
        hideVideoCall: true
    },
    styleProps: {
        ...defaultIncomingCallProps.styleProps,
        generalStyleProps: {
            background: "#C8C8C8",
            padding: "5px",
            minHeight: "60px",
            width: "50%",
            borderRadius: "4px 4px 4px 4px"
        }
    }
};
export const ComponentOverrides = Template.bind({});
ComponentOverrides.args = componentOverridesProps;