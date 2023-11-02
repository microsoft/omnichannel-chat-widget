import { Meta } from "@storybook/react/types-6-0";
import React from "react";
import { Story } from "@storybook/react";
import { InputValidationPane, encodeComponentString } from "@microsoft/omnichannel-chat-components";
import { IInputValidationPaneProps } from "@microsoft/omnichannel-chat-components/lib/types/components/inputvalidationpane/interfaces/IInputValidationPaneProps";
import { Regex } from "../../src/common/Constants";

export default {
    title: "Stateless Components/Input Validation Pane",
    component: InputValidationPane,
} as Meta;

const InputValidationPaneTemplate: Story<IInputValidationPaneProps> = (args) => <InputValidationPane {...args}></InputValidationPane>;
const defaultInputValidationPaneProps: IInputValidationPaneProps = {
    controlProps: {
        id: "oclcw-emailTranscriptDialogContainer",
        dir: "ltr",
        hideInputValidationPane: false,
        inputValidationPaneAriaLabel: "Email Chat Transcript Pane",
    
        hideTitle: false,
        titleText: "Please provide e-mail address to send transcript",
    
        hideSubtitle: false,
        subtitleText: "The transcript will be sent after the chat ends.",
    
        inputId: "oclcw-emailTranscriptDialogTextField",
        inputInitialText: "",
        hideInput: false,
        inputAriaLabel: "Please provide e-mail address to send transcript. The transcript will be sent after the chat ends. Email address text area",
        inputWithErrorMessageBorderColor: "rgb(164, 38, 44)",
    
        invalidInputErrorMessageText: "Enter a valid email address.",
    
        isButtonGroupHorizontal: true,
    
        hideSendButton: false,
        enableSendButton: false,
        sendButtonText: "Send",
        sendButtonAriaLabel: "Send",
    
        hideCancelButton: false,
        cancelButtonText: "Cancel",
        cancelButtonAriaLabel: "Cancel",
    
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onSend: function (input: string) {
            alert("on send");
        },
    
        onCancel: function () {
            alert("on cancel");
        },
    
        checkInput: function (input: string) {
            return (new RegExp(Regex.EmailRegex)).test(input);
        }        
    },
    styleProps: {
        generalStyleProps: {
            backgroundColor: "#fff",
            borderBottomLeftRadius: "4px",
            borderBottomRightRadius: "4px",
            borderColor: "rgba(138, 141, 145, .24)",
            borderTop: "solid",
            borderTopWidth: "1px",
            bottom: "0",
            left: "0",
            minHeight: "180px",
            padding: "10px",
            position: "absolute",
            width: "100%",
            zIndex: "9999"
        },
        headerGroupStyleProps: {
            marginBottom: "15px"
        },
        titleStyleProps: {
            color: "#323130",
            fontFamily: "'Segoe UI', Arial, sans-serif",
            fontSize: "18px",
            fontWeight: "500",
            marginBottom: "5px"            
        },
        subtitleStyleProps: {
            color: "#262626",
            fontFamily: "'Segoe UI', Arial, sans-serif",
            fontSize: "14px",
            lineHeight: "16px",
            marginBottom: "10px"            
        },
        inputStyleProps: {
            boxSizing: "border-box",
            fontFamily: "'Segoe UI', Arial, sans-serif",
            fontSize: "16px",
            fontWeight: "400",
            textIndent: "10px",
            width: "100%"            
        },
        invalidInputErrorMessageStyleProps: {
            color: "#a4262c",
            fontFamily: "'Segoe UI', Arial, sans-serif",
            fontSize: "12px",
            height: "16px,",
            lineHeight: "16px",
            marginTop: "4px"            
        },
        buttonGroupStyleProps: {
            gap: "10px"            
        },
        sendButtonStyleProps: {
            color: "rgb(255, 255, 255)",
            cursor: "pointer",
            fontFamily: "'Segoe UI', Arial, sans-serif",
            fontSize: "14px",
            fontWeight: "500",
            lineHeight: "19px",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"            
        },
        cancelButtonStyleProps: {
            border: "solid",
            borderColor: "#e0e3e6",
            borderWidth: "2px",
            boxSizing: "border-box",
            color: "#000",
            cursor: "pointer",
            fontFamily: "'Segoe UI', Arial, sans-serif",
            fontSize: "14px",
            fontWeight: "500",
            lineHeight: "19px",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
        }
    }
};
const customReactNode = (
    <button style={{color: "rgb(255, 255, 255)",
        backgroundColor: "green",
        borderRadius: "30px",
        borderColor: "green",
        borderStyle: "solid",
        float: "left",
        height: "100px",
        margin: "10px",
        padding: "10px",
        width: "100px"}}>
            This is a custom button
    </button>
);
const sampleTwoInputValidationPaneProps: IInputValidationPaneProps = {
    controlProps: {
        ...defaultInputValidationPaneProps.controlProps
    },
    styleProps: {
        headerGroupStyleProps: {
            marginBottom: "0"
        },
        titleStyleProps: {
            backgroundColor: "yellow",
            borderRadius: "30px",
            height: "100px",
            margin: "10px",
            padding: "10px",
            width: "100px"            
        },
        inputStyleProps: {
            margin: "10px",
            width: "300px"            
        },
        sendButtonStyleProps: {
            backgroundColor: "purple",
            borderRadius: "30px",
            height: "100px",
            marginLeft: "10px",
            padding: "10px",
            width: "100px"            
        },
        cancelButtonStyleProps: {
            backgroundColor: "red",
            borderRadius: "30px",
            height: "100px",
            marginLeft: "10px",
            padding: "10px",
            width: "100px"            
        }
    },
    componentOverrides: {
        subtitle: customReactNode
    }
};

/*
    Default Input Validation Pane
*/

export const DefaultEmailTranscript = InputValidationPaneTemplate.bind({});
DefaultEmailTranscript.args = defaultInputValidationPaneProps;

/*
    Default Rtl Input Validation Pane
*/

const defaultRtlProps = {
    controlProps: {
        ...defaultInputValidationPaneProps.controlProps,
        dir: "rtl"
    },
    styleProps: {
        ...defaultInputValidationPaneProps.styleProps
    }
};

export const DefaultRtlEmailTranscript = InputValidationPaneTemplate.bind({});
DefaultRtlEmailTranscript.args = defaultRtlProps;

/*
    Input Validation Pane Pane Sample 1
*/

const sample1Props = {
    controlProps: {
        ...defaultInputValidationPaneProps.controlProps,
        isButtonGroupHorizontal: false,
        enableSendButton: true
    },
    styleProps: {
        ...defaultInputValidationPaneProps.styleProps
    }
};

export const Sample1 = InputValidationPaneTemplate.bind({});
Sample1.args = sample1Props;

/*
    Input Validation Pane Pane Sample 2
*/

export const Sample2 = InputValidationPaneTemplate.bind({});
Sample2.args = sampleTwoInputValidationPaneProps;

/*
    Input Validation Pane Pane Sample 3
*/

const customReactNode1 = encodeComponentString(
    <div style={{backgroundColor: "purple", 
        color: "white", 
        fontSize: "18px", 
        marginBottom: "10px"}}>
        This is a custom div
    </div>
);

const customReactNode2 = (
    <div />  
);

const sample3Props = {
    controlProps: {
        ...defaultInputValidationPaneProps.controlProps,
        enableSendButton: true
    },
    styleProps: {
        ...defaultInputValidationPaneProps.styleProps
    },
    componentOverrides: {
        ...defaultInputValidationPaneProps.componentOverrides,
        input: customReactNode1,
        invalidInputErrorMessage: customReactNode2
    }
};

export const Sample3 = InputValidationPaneTemplate.bind({});
Sample3.args = sample3Props;