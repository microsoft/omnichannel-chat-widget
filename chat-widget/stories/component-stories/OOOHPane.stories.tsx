import { Meta } from "@storybook/react/types-6-0";
import React from "react";
import { Story } from "@storybook/react";
import { encodeComponentString, OutOfOfficeHoursPane } from "@microsoft/omnichannel-chat-components";
import { IOOOHPaneProps } from "@microsoft/omnichannel-chat-components/lib/types/components/outofofficehourspane/interfaces/IOOOHPaneProps";
import errorImg from "@microsoft/omnichannel-chat-components/lib/cjs/assets/imgs/error.svg";

export default {
    title: "Stateless Components/OutOfOfficeHours Pane",
    component: OutOfOfficeHoursPane,
} as Meta;

const OOOHPaneTemplate: Story<IOOOHPaneProps> = (args) => <OutOfOfficeHoursPane {...args}></OutOfOfficeHoursPane>;

const defaultOOOHPaneProps: IOOOHPaneProps = {
    controlProps: {
        id: "oc-lcw-outofofficehours-pane",
        dir: "auto",
        hideOOOHPane: false,
        hideTitle: false,
        titleText: "Thanks for contacting us. You have reached us outside of our operating hours. An agent will respond when we open."
    },
    styleProps: {
        generalStyleProps: {
            borderStyle: "solid",
            width: "360px",
            height: "560px",
            borderRadius: 0,
            borderWidth: "3px",
            backgroundColor: "#FFFFFF",
            backgroundSize: "",
            backgroundImage: "",
            borderColor: "#F1F1F1",
            position: "absolute",
            justifyContent: "center",
            alignItems: "stretch",
            flexFlow: "column wrap"
        },
        titleStyleProps: {
            fontFamily: "'Segoe UI',Arial,sans-serif",
            fontWeight: "normal",
            fontSize: "14px",
            color: "#000000",
            textAlign: "center",
            alignSelf: "auto"            
        }
    }
};
const sampleOneOOOHPaneProps: IOOOHPaneProps = {
    controlProps: {
        ...defaultOOOHPaneProps.controlProps,
        id: "oc-lcw-outofofficehourspane-sample1",
        dir: "rtl"
    },
    styleProps: {
        ...defaultOOOHPaneProps.styleProps
    }
};
const sampleTwoOOOHPaneProps: IOOOHPaneProps = {
    controlProps: {
        ...defaultOOOHPaneProps.controlProps,
        id: "oc-lcw-outofofficehourspane-sample2",
        titleText: "Sorry but we are not operating during these hours!!",
    },
    styleProps: {
        generalStyleProps: {
            borderStyle: "dotted solid double dashed",
            borderRadius: "40%",
            borderWidth: "5px",
            backgroundColor: "#FFFFFF",
            backgroundSize: "200px",
            backgroundImage: `url(${errorImg})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            borderColor: "#F2FFF1",
            boxShadow: "0px 0px 2px 3px #DDDDD7",
            width: "450px",
            height: "350px",
            position: "absolute",
            left: "20%",
            top: "20%",
            justifyContent: "center",
            alignItems: "stretch",
            flexFlow: "column wrap"
        },
        titleStyleProps: {
            fontFamily: "'Segoe UI',Arial,sans-serif",
            fontWeight: "normal",
            fontSize: "15px",
            color: "#000000",
            width: "400px",
            height: "300px",
            margin: "275px 0px 0px 20px",
            textAlign: "center",
            alignSelf: "auto"
        }
    }
};

/*
    Default OOOH Pane
*/
export const OOOHPaneDefault = OOOHPaneTemplate.bind({});
OOOHPaneDefault.args = defaultOOOHPaneProps;

/*
    OOOH Pane Sample 1
*/

export const OOOHPaneSample1 = OOOHPaneTemplate.bind({});
OOOHPaneSample1.args = sampleOneOOOHPaneProps;

/*
    OOOH Pane Sample 2
*/

export const OOOHPaneSample2 = OOOHPaneTemplate.bind({});
OOOHPaneSample2.args = sampleTwoOOOHPaneProps;

/*
    OOOH Pane Sample 3
*/

const customTitle = encodeComponentString(
    <h2 style={{textAlign: "center"}}>
        Custom Message
    </h2>
);


const loadingPaneSample3Props: IOOOHPaneProps = {
    componentOverrides: {
        title: customTitle
    }
};

export const OOOHPaneSample3 = OOOHPaneTemplate.bind({});
OOOHPaneSample3.args = loadingPaneSample3Props;