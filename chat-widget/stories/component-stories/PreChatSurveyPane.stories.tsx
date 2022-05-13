import { Meta } from "@storybook/react/types-6-0";
import React from "react";
import { Story } from "@storybook/react";
import { PreChatSurveyPane } from "@microsoft/omnichannel-chat-components";
import { IPreChatSurveyPaneProps } from "@microsoft/omnichannel-chat-components/lib/types/components/prechatsurveypane/interfaces/IPreChatSurveyPaneProps";

export default {
    title: "Stateless Components/PreChatSurvey Pane",
    component: PreChatSurveyPane,
} as Meta;

const PreChatSurveyPaneTemplate: Story<IPreChatSurveyPaneProps> = (args) => <PreChatSurveyPane {...args}></PreChatSurveyPane>;
const defaultPreChatSurveyPaneProps: IPreChatSurveyPaneProps = {
    controlProps: {
        id: "oc-lcw-prechatsurveypane-default",
        dir: "auto",
        hidePreChatSurveyPane: false,
        adaptiveCardHostConfig: "{\"fontFamily\":\"Segoe UI, Helvetica Neue, sans-serif\",\"containerStyles\":{\"default\":{\"foregroundColors\":{\"default\":{\"default\":\"#000000\"}},\"backgroundColor\":\"#FFFFFF\"}},\"actions\":{\"actionsOrientation\":\"Vertical\",\"actionAlignment\":\"stretch\"}}",
        payload: "{\"$schema\":\"http://adaptivecards.io/schemas/adaptive-card.json\",\"type\":\"AdaptiveCard\",\"version\":\"1.1\",\"body\":[{\"type\":\"TextBlock\",\"weight\":\"bolder\",\"text\":\"Please answer below questions.\"},{\"type\":\"Input.Text\",\"id\":\"1e5e4e7a-8f0b-ec11-b6e6-000d3a305d38\",\"label\":\"name pls?\",\"maxLength\":100,\"isRequired\":true,\"errorMessage\":\"Name is required\"},{\"type\":\"Input.Text\",\"id\":\"7f8f5d6d-995e-ec11-8f8f-000d3a31376e\",\"label\":\"multi\\nmulti\\nmulti\",\"style\":\"text\",\"isMultiline\":true,\"maxLength\":250},{\"type\":\"Input.ChoiceSet\",\"id\":\"e4bdf7cb-995e-ec11-8f8f-000d3a31376e\",\"label\":\"options\",\"isMultiSelect\":false,\"value\":\"1\",\"style\":\"compact\",\"choices\":[{\"title\":\"one\",\"value\":\"1\"},{\"title\":\"two\",\"value\":\"2\"},{\"title\":\"three\",\"value\":\"3\"}]},{\"type\":\"Input.Toggle\",\"id\":\"b26011d2-995e-ec11-8f8f-000d3a31376e\",\"title\":\"consent\",\"valueOn\":\"True\",\"valueOff\":\"False\",\"value\":\"false\"},{\"type\":\"TextBlock\",\"isSubtle\":true,\"text\":\"Fields marked with * are mandatory.\",\"wrap\":true}],\"actions\":[{\"type\":\"Action.Submit\",\"title\":\"Submit\",\"data\":{\"Type\":\"InputSubmit\"}}]}",
        onSubmit: function (values) {
            alert("Submitted" + values);
        }
    },
    styleProps: {
        generalStyleProps: {
            width: "360px",
            height: "560px",
            borderStyle: "solid",
            borderRadius: "4px",
            borderWidth: "3px",
            backgroundColor: "#FFFFFF",
            borderColor: "#F1F1F1",
            overflowY: "auto"
        },
        customButtonStyleProps: {
            backgroundColor: "rgb(49, 95, 162)",
            color: "#FFFFFF"
        },
        adaptiveCardContainerStyleProps: {
            border: "1px solid #ECECEC",
            borderRadius: "4px",
            margin: "3%"            
        }
    }
};
const sampleOnePreChatSurveyPaneProps: IPreChatSurveyPaneProps = {
    controlProps: {
        ...defaultPreChatSurveyPaneProps.controlProps,
        dir: "rtl",        
    },
    styleProps: {
        ...defaultPreChatSurveyPaneProps.styleProps
    }
};
const sampleTwoPreChatSurveyPaneProps: IPreChatSurveyPaneProps = {
    controlProps: {
        id: "oc-lcw-prechatsurveypane-sample2",
        dir: "auto",
        hidePreChatSurveyPane: false,
        adaptiveCardHostConfig: "{\"fontFamily\":\"Segoe UI, Helvetica Neue, sans-serif\",\"containerStyles\":{\"default\":{\"foregroundColors\":{\"default\":{\"default\":\"#000000\"}},\"backgroundColor\":\"#FFFFFF\"}},\"actions\":{\"actionsOrientation\":\"Vertical\",\"actionAlignment\":\"stretch\"}}",
        payload: "{\"$schema\":\"http://adaptivecards.io/schemas/adaptive-card.json\",\"type\":\"AdaptiveCard\",\"version\":\"1.1\",\"body\":[{\"type\":\"TextBlock\",\"weight\":\"bolder\",\"text\":\"Please answer below questions.\"},{\"type\":\"TextBlock\",\"text\":\"Fields marked with * are mandatory.\",\"wrap\":true,\"color\":\"attention\"},{\"type\":\"Input.Text\",\"id\":\"1e5e4e7a-8f0b-ec11-b6e6-000d3a305d38\",\"label\":\"Name\",\"maxLength\":100,\"isRequired\":true,\"errorMessage\":\"Name is required\"},{\"type\":\"Input.Text\",\"id\":\"7f8f5d6d-995e-ec11-8f8f-000d3a31376e\",\"label\":\"multi\\nmulti\\nmulti\",\"style\":\"text\",\"isMultiline\":true,\"maxLength\":250},{\"type\":\"Input.ChoiceSet\",\"id\":\"e4bdf7cb-995e-ec11-8f8f-000d3a31376e\",\"label\":\"options\",\"isMultiSelect\":false,\"value\":\"1\",\"style\":\"compact\",\"choices\":[{\"title\":\"one\",\"value\":\"1\"},{\"title\":\"two\",\"value\":\"2\"},{\"title\":\"three\",\"value\":\"3\"}]},{\"type\":\"Input.ChoiceSet\",\"id\":\"965cc6dc-c6bf-4496-9006-38d686de965a\",\"label\":\"What option do you want?\",\"style\":\"expanded\",\"isMultiSelect\":false,\"value\":\"1\",\"choices\":[{\"title\":\"One\",\"value\":\"1\"},{\"title\":\"Two\",\"value\":\"2\"},{\"title\":\"Three\",\"value\":\"3\"}]},{\"type\":\"Input.Toggle\",\"id\":\"b26011d2-995e-ec11-8f8f-000d3a31376e\",\"title\":\"consent\",\"valueOn\":\"True\",\"valueOff\":\"False\",\"value\":\"false\"}],\"actions\":[{\"type\":\"Action.Submit\",\"title\":\"Submit\",\"data\":{\"Type\":\"InputSubmit\"}}]}",
        onSubmit: function (values) {
            alert("Submitted" + values);
        }
    },
    styleProps: {
        ...defaultPreChatSurveyPaneProps.styleProps
    }
};
const sampleThreePreChatSurveyPaneProps: IPreChatSurveyPaneProps = {
    controlProps: {
        id: "oc-lcw-prechatsurveypane-sample3",
        dir: "auto",
        hidePreChatSurveyPane: false,
        adaptiveCardHostConfig: "{\"fontFamily\":\"Segoe UI, Helvetica Neue, sans-serif\",\"containerStyles\":{\"default\":{\"foregroundColors\":{\"default\":{\"default\":\"#C3F60F\"}},\"backgroundColor\":\"#6A1E7A\"}},\"actions\":{\"actionsOrientation\":\"Vertical\",\"actionAlignment\":\"stretch\"}}",
        payload: "{\"$schema\":\"http://adaptivecards.io/schemas/adaptive-card.json\",\"type\":\"AdaptiveCard\",\"version\":\"1.5\",\"body\":[{\"type\":\"TextBlock\",\"weight\":\"bolder\",\"text\":\"Please answer below questions.\"},{\"type\":\"Input.Text\",\"id\":\"1e5e4e7a-8f0b-ec11-b6e6-000d3a305d38\",\"label\":\"Name\",\"maxLength\":100,\"isRequired\":true,\"errorMessage\":\"Name is required\"},{\"type\":\"Input.Text\",\"id\":\"c7ed0164-e6a9-4cf6-ab03-819f60d0289f\",\"label\":\"Company Name\",\"style\":\"text\",\"maxLength\":100,\"isRequired\":true,\"errorMessage\":\"Company Name is required\"},{\"type\":\"Input.Text\",\"id\":\"7f8f5d6d-995e-ec11-8f8f-000d3a31376e\",\"label\":\"How are you feeling today?\",\"style\":\"text\",\"isMultiline\":true,\"maxLength\":250},{\"type\":\"Input.Text\",\"id\":\"03d7114a-5e87-4718-b60d-0e6802176875\",\"label\":\"Comments\",\"style\":\"text\",\"isMultiline\":true,\"maxLength\":250,\"isRequired\":true,\"errorMessage\":\"Comments are required\"},{\"type\":\"Input.ChoiceSet\",\"id\":\"e4bdf7cb-995e-ec11-8f8f-000d3a31376e\",\"label\":\"Please Select One of the following\",\"isMultiSelect\":false,\"isRequired\":true,\"errorMessage\":\"A choice is required\",\"style\":\"compact\",\"choices\":[{\"title\":\"one\",\"value\":\"1\"},{\"title\":\"two\",\"value\":\"2\"},{\"title\":\"three\",\"value\":\"3\"}]},{\"type\":\"Input.Toggle\",\"id\":\"b26011d2-995e-ec11-8f8f-000d3a31376e\",\"title\":\"consent\",\"valueOn\":\"True\",\"valueOff\":\"False\",\"value\":\"false\"},{\"type\":\"TextBlock\",\"text\":\"Fields marked with * are mandatory.\",\"wrap\":true}],\"actions\":[{\"type\":\"Action.Submit\",\"title\":\"Submit\",\"data\":{\"Type\":\"InputSubmit\"}}]}",
        onSubmit: function (values) {
            alert("Submitted" + values);
        }
    },
    styleProps: {
        generalStyleProps: {
            borderStyle: "solid",
            borderWidth: "4px",
            backgroundColor: "#6A1E7A",
            maxWidth: "280px",
            maxHeight: "420px",
            position: "absolute",
            left: "15%",
            top: "20%",
            overflowY: "auto"
        },
        customButtonStyleProps: {
            backgroundColor: "#C3F60F",
            color: "#800080"
        },
        adaptiveCardContainerStyleProps: {
            border: "1px solid #C3F60F",
            borderRadius: "4px",
            margin: "10px 10px 0px 10px"
        }
    }
};

/*
    Default PreChatSurvey Pane
*/
export const PreChatSurveyPaneDefault = PreChatSurveyPaneTemplate.bind({});
PreChatSurveyPaneDefault.args = defaultPreChatSurveyPaneProps;

/*
    Sample One PreChatSurvey Pane (RTL)
*/
export const PreChatSurveyPaneSample1 = PreChatSurveyPaneTemplate.bind({});
PreChatSurveyPaneSample1.args = sampleOnePreChatSurveyPaneProps;

/*
    Sample Two PreChatSurvey Pane (UX Friendly Adaptive Card)
*/
export const PreChatSurveyPaneSample2 = PreChatSurveyPaneTemplate.bind({});
PreChatSurveyPaneSample2.args = sampleTwoPreChatSurveyPaneProps;

/*
    Sample Three PreChatSurvey Pane
*/
export const PreChatSurveyPaneSample3 = PreChatSurveyPaneTemplate.bind({});
PreChatSurveyPaneSample3.args = sampleThreePreChatSurveyPaneProps;
