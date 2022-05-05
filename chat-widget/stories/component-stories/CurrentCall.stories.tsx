import React, { ReactNode } from "react";
import { Meta } from "@storybook/react/types-6-0";
import { Story } from "@storybook/react";
import { CurrentCall } from "@microsoft/omnichannel-chat-components";
import { ICurrentCallProps } from "@microsoft/omnichannel-chat-components/lib/types/components/callingcontainer/subcomponents/CurrentCall/interfaces/ICurrentCallProps";
import callrejectbutton from "@microsoft/omnichannel-chat-components/lib/cjs/assets/imgs/callrejectbutton.svg";
import videoon from "@microsoft/omnichannel-chat-components/lib/cjs/assets/imgs/videoon.svg";
import videooff from "@microsoft/omnichannel-chat-components/lib/cjs/assets/imgs/videooff.svg";
import voiceoff from "@microsoft/omnichannel-chat-components/lib/cjs/assets/imgs/voiceoff.svg";
import voiceon from "@microsoft/omnichannel-chat-components/lib/cjs/assets/imgs/voiceon.svg";
import { ICurrentCallStyleProps } from "@microsoft/omnichannel-chat-components/lib/types/components/callingcontainer/subcomponents/CurrentCall/interfaces/ICurrentCallStyleProps";
import CommandButton from "./common/commandbutton/CommandButton";


export default {
    title: "Stateless Components/Calling Container/Current Call",
    component: CurrentCall
} as Meta;

const Template: Story<ICurrentCallProps> = (args) => <CurrentCall {...args}></CurrentCall>;
const defaultCurrentCallProps: ICurrentCallProps = {
    controlProps: {
        id: "currentCall-container",
        nonActionIds: {
            currentCallActionGroupId: "currentCall-actionicons",
            currentCallFooterId: "currentCall-footer",
            remoteVideoTileId: "remoteVideo",
            selfVideoTileId: "selfVideo",
            videoTileGroupId: "currentCall-body"
        },
        hideMicButton: false,
        hideVideoButton: false,
        hideEndCallButton: false,
        hideCurrentCallTitle: false,
        videoCallDisabled: false,
        hideCallTimer: false,
        onEndCallClick: function () { console.log("end call clicked"); },
        onMicCallClick: function () { console.log("mute clicked"); },
        onVideoOffClick: function () { console.log("video off clicked"); },
        middleGroup: { gap: 1, children: [] },
        leftGroup: { gap: 1, children: [] },
        rightGroup: { gap: 1, children: [] },
        endCallButtonProps: {
            id: "callRejectButton",
            type: "icon",
            ariaLabel: "End Call",
            iconName: "DeclineCall",
            iconSize: 18
        },
        micButtonProps: {
            id: "toggleAudio",
            type: "icon",
            ariaLabel: "Mute",
            toggleAriaLabel: "Unmute",
            iconName: "Microphone",
            toggleIconName: "MicOff2",
            iconSize: 18
        },
        videoButtonProps: {
            id: "toggleVideo",
            type: "icon",
            ariaLabel: "Turn on camera",
            toggleAriaLabel: "Turn off camera",
            iconName: "Video",
            toggleIconName: "VideoOff",
            iconSize: 18
        },
        callTimerProps: {
            id: "oc-lcw-CurrentCall-timer",
            showHours: false,
            timerStyles: {
                color: "white",
                textAlign: "center",
                backgroundColor: "#3d3c3c",
                height: "45px",
                width: "50px",
                lineHeight: "40px",
                borderRadius: "2px",
                margin: "1px"
            }
        }
    },
    styleProps: {
        generalStyleProps: {
            background: "#292828",
            minHeight: "55px",
            width: "100%",
            borderRadius: "0 0 3px 3px"
        },
        micButtonStyleProps: {
            borderRadius: "2px",
            color: "#FFFFFF",
            backgroundColor: "#3d3c3c",
            height: "45px",
            width: "50px",
            margin: "1px"
        },
        micButtonHoverStyleProps: {
            filter: "brightness(0.8)"
        },
        videoOffButtonStyleProps: {
            borderRadius: "2px",
            color: "#FFFFFF",
            backgroundColor: "#3d3c3c",
            height: "45px",
            width: "50px",
            margin: "1px"
        },
        videoOffButtonHoverStyleProps: {
            filter: "brightness(0.8)"
        },
        endCallButtonHoverStyleProps: {
            filter: "brightness(0.8)"
        },
        endCallButtonStyleProps: {
            borderRadius: "2px",
            color: "#FFFFFF",
            backgroundColor: "#DC0000",
            lineHeight: "50px",
            height: "45px",
            width: "50px",
            fontSize: "18px"
        },
        currentCallTimerStyleProps: {
            borderRadius: "2px",
            margin: "1px",
            color: "#FFFFFF",
            paddingTop: "18px",
            fontSize: 12,
            fontFamily: "Segoe UI, Arial, sans-serif",
            backgroundColor: "darkgrey",
            height: "45px",
            width: "50px",
            textAlign: "center"
        },
        videoTileStyleProps: {
            width: "100%",
            marginLeft: "auto",
            marginRight: "auto",
            position: "relative"
        },
        videoTileStyleWithVideoProps: {
            minHeight: "180px",
            width: "100%",
            marginLeft: "auto",
            marginRight: "auto",
            position: "relative"
        },
        remoteVideoStyleProps: {
            height: "100%",
            width: "100%",
            overflow: "hidden"
        },
        selfVideoStyleProps: {
            position: "absolute",
            right: "8px",
            bottom: "8px",
            width: "80px",
            minHeight: "50px",
            overflow: "hidden",
            borderRadius: "2px"
        },
        selfVideoMaximizeStyleProps: {
            position: "relative",
            width: "100%",
            minHeight: "50px",
            overflow: "hidden",
            borderRadius: "2px",
        },
        itemFocusStyleProps: {
            outline: "2px solid #fff"
        }      
    }
};

const customizedCurrentCallStyleProps: ICurrentCallStyleProps = {
    generalStyleProps: {
        background: "lightgrey",
        minHeight: "80px",
        borderRadius: "0 0 3px 3px"
    },
    micButtonStyleProps: {
        borderRadius: "50%",
        borderWidth: "1px",
        borderStyle: "double",
        borderColor: "blue",
        color: "blue",
        backgroundColor: "white",
        lineHeight: "50px",
        height: "50px",
        width: "50px",
        margin: "1px"
    },
    micButtonHoverStyleProps: {
        filter: "brightness(0.8)"
    },
    videoOffButtonStyleProps: {
        borderRadius: "50%",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "blue",
        color: "blue",
        backgroundColor: "white",
        height: "50px",
        width: "50px",
        margin: "1px"
    },
    videoOffButtonHoverStyleProps: {
        filter: "brightness(0.8)"
    },
    endCallButtonHoverStyleProps: {
        filter: "brightness(0.8)"
    },
    endCallButtonStyleProps: {
        borderRadius: "50%",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "red",
        color: "white",
        backgroundColor: "red",
        height: "50px",
        width: "50px",
        margin: "1px"
    },
    currentCallTimerStyleProps: {
        borderRadius: "2px",
        margin: "1px",
        color: "white",
        paddingTop: "18px",
        fontSize: 12,
        fontFamily: "Segoe UI, Arial, sans-serif",
        backgroundColor: "transparent",
        height: "50px",
        width: "55px",
        textAlign: "center"
    },
    videoTileStyleProps: {
        minHeight: "180px",
        height: "300px",
        backgroundColor: "transparent",
        width: "100%",
        maxWidth: "100%",
        marginLeft: "auto",
        marginRight: "auto",
        position: "relative"
    },
    remoteVideoStyleProps: {
        height: "100%",
        width: "100%",
        overflow: "hidden",
        backgroundColor: "#8ab2f2"
    },
    selfVideoStyleProps: {
        position: "absolute",
        left: "8px",
        bottom: "8px",
        width: "80px",
        height: "60px",
        overflow: "hidden",
        borderRadius: "2px",
        backgroundColor: "aliceblue"
    },
    itemFocusStyleProps: {
        border: "2px dotted blue"
    }
};

/* Current Call - Default Video Call */
export const DefaultVideoCall = Template.bind({});
DefaultVideoCall.args = defaultCurrentCallProps;

/* Current Call - Default Video Call */
const defaultAudioCallProps: ICurrentCallProps = {
    controlProps: {
        ...defaultCurrentCallProps.controlProps,
        videoCallDisabled: true
    },
    styleProps: {
        ...defaultCurrentCallProps.styleProps
    }
};
export const DefaultAudioCall = Template.bind({});
DefaultAudioCall.args = defaultAudioCallProps;

/* Current Call - Rtl */
const defaultRtl: ICurrentCallProps = {
    controlProps: {
        id: "currentCall-container",
        nonActionIds: {
            currentCallActionGroupId: "currentCall-actionicons",
            currentCallFooterId: "currentCall-footer",
            remoteVideoTileId: "remoteVideo",
            selfVideoTileId: "selfVideo",
            videoTileGroupId: "currentCall-body"
        },
        hideMicButton: false,
        hideVideoButton: false,
        hideEndCallButton: false,
        hideCurrentCallTitle: false,
        videoCallDisabled: false,
        hideCallTimer: false,
        onEndCallClick: function () { console.log("end call clicked"); },
        onMicCallClick: function () { console.log("mute clicked"); },
        onVideoOffClick: function () { console.log("video off clicked"); },
        middleGroup: { gap: 1, children: [] },
        leftGroup: { gap: 1, children: [] },
        rightGroup: { gap: 1, children: [] },
        dir: "rtl",
        endCallButtonProps: {
            id: "callRejectButton",
            type: "icon",
            ariaLabel: "End Call",
            imageIconProps: {
                src: callrejectbutton,
                styles: { image: { height: "18px", width: "18px" } }
            }
        },
        micButtonProps: {
            id: "toggleAudio",
            type: "icon",
            ariaLabel: "Mute",
            toggleAriaLabel: "Unmute",
            imageIconProps: {
                src: voiceon,
                styles: { image: { height: "16px", width: "16px" } }
            },
            imageToggleIconProps: {
                src: voiceoff,
                styles: { image: { height: "16px", width: "16px" } }
            },
            iconSize: 18
        },
        videoButtonProps: {
            id: "toggleVideo",
            type: "icon",
            ariaLabel: "Turn camera on",
            toggleAriaLabel: "Turn camera off",
            imageIconProps: {
                src: videoon,
                styles: { image: { height: "16px", width: "16px" } }
            },
            imageToggleIconProps: {
                src: videooff,
                styles: { image: { height: "16px", width: "16px" } }
            },
            iconSize: 18
        },
        callTimerProps: {
            id: "oc-lcw-CurrentCall-timer"
        }
    },
    styleProps: {
        ...defaultCurrentCallProps.styleProps
    }
};
export const Rtl = Template.bind({});
Rtl.args = defaultRtl;

/* Current Call - Component Overrides */
const currentCallSpeakerButton: ReactNode = <CommandButton
    iconName="volume3"
    type="icon"
    styles={customizedCurrentCallStyleProps.micButtonStyleProps}
/>;

const componentOverridesProps: ICurrentCallProps = {
    controlProps: {
        ...defaultCurrentCallProps.controlProps,
        hideCallTimer: true,
        hideVideoButton: true,
        hideMicButton: true,
        selfVideoDisabled: false
    },
    styleProps: {
        ...defaultCurrentCallProps.styleProps,
        generalStyleProps: {
            background: "#C8C8C8",
            minHeight: "60px",
            width: "100%",
            borderRadius: "4px 4px 4px 4px"
        },
        selfVideoStyleProps: {
            position: "absolute",
            right: "8px",
            bottom: "8px",
            width: "80px",
            minHeight: "50px",
            overflow: "hidden",
            borderRadius: "2px",
            backgroundColor: "blue"
        }
    }
};
export const componentOverrides = Template.bind({});
componentOverrides.args = componentOverridesProps;

/* Current Call - Customized */
const customCallTimerProps = {
    ...defaultCurrentCallProps.controlProps.callTimerProps,
    showHours: false
};

const customizedMiddleGroup = {
    ...defaultCurrentCallProps.controlProps.middleGroup,
    gap: 30,
    children: [currentCallSpeakerButton]
};

const customizedProps: ICurrentCallProps = {
    controlProps: {
        ...defaultCurrentCallProps.controlProps,
        hideCallTimer: true,
        callTimerProps: customCallTimerProps,
        middleGroup: customizedMiddleGroup
    },
    styleProps: Object.assign({}, defaultCurrentCallProps.styleProps)
};
customizedProps.styleProps = customizedCurrentCallStyleProps;
customizedProps.controlProps.callTimerProps.timerStyles = {
    color: "blue",
    textAlign: "center",
    backgroundColor: "transparent",
    height: "50px",
    width: "55px",
    lineHeight: "40px",
    borderRadius: "2px",
};
export const CustomizedCurrentCall = Template.bind({});
CustomizedCurrentCall.args = customizedProps;