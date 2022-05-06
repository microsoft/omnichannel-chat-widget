import { Meta } from "@storybook/react/types-6-0";
import React from "react";
import { Story } from "@storybook/react";
import { ImageFit, SpinnerSize } from "@fluentui/react";
import chatImg from "@microsoft/omnichannel-chat-components/lib/cjs/assets/imgs/chat.svg";
import chatIcon from "@microsoft/omnichannel-chat-components/lib/cjs/assets/imgs/chatIcon.svg";
import spinner from "@microsoft/omnichannel-chat-components/lib/cjs/assets/imgs/loading.gif";
import { LoadingPane, encodeComponentString } from "@microsoft/omnichannel-chat-components";
import { ILoadingPaneProps } from "@microsoft/omnichannel-chat-components/lib/types/components/loadingpane/interfaces/ILoadingPaneProps";


export default {
    title: "Stateless Components/Loading Pane",
    component: LoadingPane,
} as Meta;

const LoadingPaneTemplate: Story<ILoadingPaneProps> = (args) => <LoadingPane {...args}></LoadingPane>;
const defaultLoadingPaneProps: ILoadingPaneProps = {
    controlProps: {
        id: "oc-lcw-loadingpane",
        dir: "auto",
        hideLoadingPane: false,
        hideIcon: false,
        hideTitle: false,
        titleText: "Welcome to",
        hideSubtitle: false,
        subtitleText: "live chat support ...",
        hideSpinner: false,
        hideSpinnerText: false,
        spinnerText: "Loading ..."
    },
    styleProps: {
        generalStyleProps: {
            width: "360px",
            height: "560px",
            borderWidth: "3px",
            borderStyle: "solid",
            backgroundColor: "#315fa2",
            borderColor: "#F1F1F1",
            position: "absolute",
            justifyContent: "center",
            alignItems: "center"
        },
        titleStyleProps: {
            fontFamily: "'Segoe UI',Arial,sans-serif",
            fontWeight: "normal",
            fontSize: "14px",
            color: "#F1F1F1",
            margin: "0px 0px 0px 0px",
            textAlign: "center",
            display: "flex",
            order: 2,
            alignSelf: "auto"            
        },
        subtitleStyleProps: {
            fontFamily: "'Segoe UI',Arial,sans-serif",
            fontWeight: "bold",
            fontSize: "18px",
            color: "#F1F1F1",
            margin: "0px 0px 50px 10px",
            textAlign: "center",
            display: "flex",
            order: 3,
            alignSelf: "auto"
        },
        iconStyleProps: {
            borderRadius: "50%",
            backgroundColor: "#F1F1F1",
            boxShadow: "0px 0px 0.5px 7px #3F75AB",
            width: "86px",
            height: "86px",
            margin: "0px 0px 20px 0px",
            display: "flex",
            order: 1,
            alignSelf: "auto"
        },
        iconImageProps: {
            src: chatImg,
            imageFit: ImageFit.center,
            width: "86px",
            height: "86px",
            shouldFadeIn: false,
            shouldStartVisible: true
        },
        spinnerStyleProps: {
            width: "42px",
            height: "42px",
            margin: "0px 0px 0px 0px",
            display: "flex",
            order: 4,
            alignSelf: "auto"
        },
        spinnerTextStyleProps: {
            fontFamily: "'Segoe UI',Arial,sans-serif",
            fontWeight: "normal",
            fontSize: "9px",
            color: "#F1F1F1",
            margin: "0px 0px 0px 5px",
            textAlign: "center",
            order: 5,
            alignSelf: "auto"            
        }
    }
};
const presetOneLoadingPaneProps: ILoadingPaneProps = {
    controlProps: {
        ...defaultLoadingPaneProps.controlProps,
        id: "oc-lcw-loadingpane-preset1",
        dir: "rtl"
    },
    styleProps: {
        ...defaultLoadingPaneProps.styleProps
    }
};
const presetTwoLoadingPaneProps: ILoadingPaneProps = {
    controlProps: {
        ...defaultLoadingPaneProps.controlProps,
        id: "oc-lcw-loadingpane-preset2",
        hideIcon: true,
        hideTitle: true,
        hideSubtitle: true,
        hideSpinnerText: true,
        spinnerSize: SpinnerSize.large
    },
    styleProps: {
        ...defaultLoadingPaneProps.styleProps,
        generalStyleProps: {
            borderStyle: "dotted",
            borderRadius: "50%",
            borderWidth: "5px",
            backgroundColor: "#767676",
            backgroundSize: "250px",
            backgroundImage: `url(${chatImg})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            borderColor: "",
            boxShadow: "0px 0px 10px 5px #B2B2B2",
            width: "380px",
            height: "380px",
            position: "absolute",
            left: "1%",
            top: "2%",
            justifyContent: "center",
            alignItems: "left",
            flexFlow: "row wrap"
        },
        spinnerStyleProps: {
            backgroundColor: "black",
            borderRadius: "40%",
            backgroundSize: "50px",
            width: "50px",
            height: "50px",
            margin: "250px 0px 0px 0px",
            order: 1,
            alignSelf: "center"
        }
    }
};
const presetThreeLoadingPaneProps: ILoadingPaneProps = {
    controlProps: {
        ...defaultLoadingPaneProps.controlProps,
        id: "oc-lcw-loadingpane-preset3",
        hideIcon: true,
        titleText: "Please Wait ...",
        subtitleText: "Loading Content",
        spinnerText: "Processing ...",
        spinnerSize: SpinnerSize.large
    },
    styleProps: {
        generalStyleProps: {
            borderStyle: "solid",
            borderRadius: "50%",
            borderWidth: "5px",
            backgroundColor: "#336669",
            backgroundSize: "",
            borderColor: "",
            boxShadow: "0px 0px 10px 3px #B2B2B2",
            width: "300px",
            height: "400px",
            position: "absolute",
            left: "15%",
            top: "20%",
            justifyContent: "center",
            alignItems: "left",
            flexFlow: "column wrap"
        },
        titleStyleProps: {
            fontFamily: "'Brush Script MT', cursive",
            fontWeight: "normal",
            fontSize: "17px",
            color: "#F1F1F1",
            width: "100px",
            height: "10px",
            margin: "0px 0px 30px 50px",
            textAlign: "center",
            order: 1,
            alignSelf: "auto"
        },
        subtitleStyleProps: {
            fontFamily: "'Courier New', monospace",
            fontWeight: "bold",
            fontSize: "22px",
            color: "#F1F1F1",
            width: "200px",
            height: "10px",
            margin: "0px 0px 50px 0px",
            textAlign: "center",
            order: 2,
            alignSelf: "center"
        },
        spinnerStyleProps: {
            borderRadius: "50%",
            backgroundSize: "80px",
            width: "80px",
            height: "80px",
            margin: "0px 0px 0px 0px",
            order: 4,
            alignSelf: "center"
        },
        spinnerTextStyleProps: {
            fontFamily: "'Segoe UI',Arial,sans-serif",
            fontWeight: "normal",
            fontSize: "9px",
            color: "#F1F1F1",
            width: "100px",
            height: "10px",
            margin: "0px 0px 0px 4px",
            textAlign: "center",
            order: 5,
            alignSelf: "center"
        }
    }
};

/*
    Default Loading Pane
*/
export const LoadingPaneDefault = LoadingPaneTemplate.bind({});
LoadingPaneDefault.args = defaultLoadingPaneProps;

/*
    Loading Pane Preset 1
*/

export const LoadingPaneRTL = LoadingPaneTemplate.bind({});
LoadingPaneRTL.args = presetOneLoadingPaneProps;

/*
    Loading Pane Preset 2
*/

export const LoadingPanePreset2 = LoadingPaneTemplate.bind({});
LoadingPanePreset2.args = presetTwoLoadingPaneProps;

/*
    Loading Pane Preset 3
*/

export const LoadingPanePreset3 = LoadingPaneTemplate.bind({});
LoadingPanePreset3.args = presetThreeLoadingPaneProps;

/*
    Loading Pane Preset 4
*/
const customIcon = (
    <img src={chatIcon} />
);

const customTitle = (
    <h2>
        Custom Title
    </h2>
);

const customSubtitle = encodeComponentString(
    <p style={{ marginBottom: "10px" }}>
        Custom Subtitle
    </p>
);

const customSpinner = (
    <img src={spinner} />
);

const customSpinnerText = (
    <p style={{ marginTop: "10px" }}>
        Custom Spinner Text
    </p>
);

const loadingPanePreset4Props: ILoadingPaneProps = {
    componentOverrides: {
        icon: customIcon,
        title: customTitle,
        subtitle: customSubtitle,
        spinner: customSpinner,
        spinnerText: customSpinnerText
    }
};

export const LoadingPanePreset4 = LoadingPaneTemplate.bind({});
LoadingPanePreset4.args = loadingPanePreset4Props;