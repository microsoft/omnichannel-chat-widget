import React from "react";
import { Meta } from "@storybook/react/types-6-0";
import { Story } from "@storybook/react";
import { IButtonStyles, IconButton, IIconProps, DefaultButton, PrimaryButton } from "@fluentui/react";
import { Footer } from "@microsoft/omnichannel-chat-components";
import { IFooterProps } from "@microsoft/omnichannel-chat-components/lib/types/components/footer/interfaces/IFooterProps";
import lcwAudioOff from "@microsoft/omnichannel-chat-components/lib/cjs/assets/imgs/lcwAudioOff.svg";
import lcwAudioOn from "@microsoft/omnichannel-chat-components/lib/cjs/assets/imgs/lcwAudioOn.svg";
import transcriptDownloadIcon from "@microsoft/omnichannel-chat-components/lib/cjs/assets/imgs/transcriptDownloadIcon.svg";
import transcriptEmailIcon from "@microsoft/omnichannel-chat-components/lib/cjs/assets/imgs/transcriptEmailIcon.svg";

export default {
    title: "Stateless Components/Footer",
    component: Footer
} as Meta;

const Template: Story<IFooterProps> = (args) => <Footer {...args}></Footer>;

const defaultFooterProps: IFooterProps = {
    controlProps: {
        id: "lcw-components-footer",
        hideDownloadTranscriptButton: false,
        hideEmailTranscriptButton: false,
        hideAudioNotificationButton: false,
        onDownloadTranscriptClick: function () { console.log("download transcript clicked"); },
        onEmailTranscriptClick: function () { console.log("email transcript clicked"); },
        onAudioNotificationClick: function () { console.log("audio notification clicked"); },
        middleGroup: { children: [] },
        leftGroup: { children: [] },
        rightGroup: { children: [] },
        downloadTranscriptButtonProps: {
            id: "oc-lcw-footer-downloadtranscript-button",
            type: "icon",
            iconName: "Download",
            ariaLabel: "Download chat transcript",
        },
        emailTranscriptButtonProps: {
            id: "oc-lcw-footer-emailtranscript-button",
            type: "icon",
            iconName: "Mail",
            ariaLabel: "Email Transcript",
        },
        audioNotificationButtonProps: {
            id: "oc-lcw-footer-audionotification-button",
            ariaLabel: "Turn sound off",
            toggleAriaLabel: "Turn sound on",
            iconName: "Volume3",
            toggleIconName: "Volume0"
        }
    },
    styleProps: {
        generalStyleProps: {
            background: "#fff",
            borderRadius: "0 0 4px 4px",
            minHeight: "25px",
            width: "100%",
            minWidth: "250px",
            padding:"0 10px 5px 10px"
        },
        downloadTranscriptButtonStyleProps: {
            color: "blue",
            fontSize: 16,
            height: "25px",
            lineHeight: "25px",
            width: "25px"
        },
        downloadTranscriptButtonHoverStyleProps: {
            filter: "brightness(0.8)",
            backgroundColor: "#C8C8C8"
        },
        emailTranscriptButtonStyleProps: {
            color: "blue",
            fontSize: 16,
            height: "25px",
            lineHeight: "25px",
            width: "25px"
        },
        emailTranscriptButtonHoverStyleProps: {
            filter: "brightness(0.8)",
            backgroundColor: "#C8C8C8"
        },
        audioNotificationButtonStyleProps: {
            color: "blue",
            fontSize: 16,
            height: "25px",
            lineHeight: "25px",
            width: "25px"
        },
        audioNotificationButtonHoverStyleProps: {
            filter: "brightness(0.8)",
            backgroundColor: "#C8C8C8"
        },
        footerItemFocusStyleProps: {
            border: "2px dotted #000"
        }
    }
};

const iconButtonStyles: IButtonStyles = {
    root: { margin: 0 }
};

function _downloadClicked(): void {
    console.log("download clicked");
}

function _emailClicked(): void {
    console.log("email clicked");
}

const defaultFooterOverridesProps: IFooterProps = {
    ...defaultFooterProps,
    componentOverrides: {
        DownloadTranscriptButton: <PrimaryButton text="Download" onClick={_downloadClicked} allowDisabledFocus styles={iconButtonStyles} />,
        EmailTranscriptButton: <DefaultButton text="Email" onClick={_emailClicked} allowDisabledFocus styles={iconButtonStyles} />        
    }
};

/* Default Footer */
export const Default = Template.bind({});
Default.args = defaultFooterProps;

/* Default Footer - Rtl */
const defaultRtl: IFooterProps = {
    controlProps: {
        ...defaultFooterProps.controlProps,
        dir: "rtl",
        hideDownloadTranscriptButton: true
    },
    styleProps: {
        ...defaultFooterProps.styleProps
    }
};
export const Rtl = Template.bind({});
Rtl.args = defaultRtl;

/* Default Footer - Component Overrides */
export const WithComponentOverrides = Template.bind({});
WithComponentOverrides.args = defaultFooterOverridesProps;

/* Default Footer - Adding more components */
const buttonStyleProps: IButtonStyles = {
    root: {
        color: "blue",
        height: 25,
        width: 25,
    }
};

const calendarIcon: IIconProps = { iconName: "Calendar" };
const calendarIconButton = <IconButton
    key="calendarIconButton"
    iconProps={calendarIcon}
    styles={buttonStyleProps}
    title="Calendar">
</IconButton>;

const emojiIcon: IIconProps = { iconName: "Emoji2" };
const emojiIconButton = <IconButton
    key="emojiIconButton"
    iconProps={emojiIcon}
    styles={buttonStyleProps}
    title="Sentiment">
</IconButton>;

const uploadIcon: IIconProps = { iconName: "Upload" };
const uploadIconButton = <IconButton
    key="uploadIconButton"
    iconProps={uploadIcon}
    styles={buttonStyleProps}
    title="Upload">
</IconButton>;

const customizedFooterProp: IFooterProps = {
    controlProps: {
        id: "oc-lcw-footer",
        hideDownloadTranscriptButton: false,
        hideEmailTranscriptButton: false,
        hideAudioNotificationButton: false,
        onDownloadTranscriptClick: function () { console.log("download transcript clicked"); },
        onEmailTranscriptClick: function () { console.log("email transcript clicked"); },
        onAudioNotificationClick: function () { console.log("audio notification clicked"); },
        leftGroup: { children: [uploadIconButton] },
        middleGroup: { children: [calendarIconButton] },
        rightGroup: { children: [emojiIconButton] },
        downloadTranscriptButtonProps: {
            id: "oc-lcw-footer-downloadtranscript-button",
            type: "icon",
            imageIconProps: { src: transcriptDownloadIcon },
            ariaLabel: "Download chat transcript",
        },
        emailTranscriptButtonProps: {
            id: "oc-lcw-footer-emailtranscript-button",
            type: "icon",
            imageIconProps: { src: transcriptEmailIcon },
            ariaLabel: "Email Transcript",
        },
        audioNotificationButtonProps: {
            id: "oc-lcw-footer-audionotification-button",
            ariaLabel: "Turn sound off",
            toggleAriaLabel: "Turn sound on",
            imageIconProps: { src: lcwAudioOn },
            imageToggleIconProps: { src: lcwAudioOff }
        }
    },
    styleProps: {
        ...defaultFooterProps.styleProps
    }
};
export const Customized = Template.bind({});
Customized.args = customizedFooterProp;
