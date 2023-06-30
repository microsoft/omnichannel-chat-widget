import React from "react";

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

export const Default = LiveChatWidgetTemplate.bind({});

const telemetryConfigGlobal = {
    appId: "00000000-0000-0000-0000-000000000000",
    orgId: "00000000-0000-0000-0000-000000000000",
    orgUrl: "https://contoso.crm.dynamics.com",
    telemetryDisabled: true,
    chatComponentVersion: "111111",
    OCChatSDKVersion: "222222",
    chatWidgetVersion: "333333",
};

const liveChatWidgetDefaultProps: ILiveChatWidgetProps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chatSDK: new MockChatSDK() as any,
    styleProps: {
        generalStyles: {
            width: "360px",
            height: "560px",
            top: "20px",
            left: "20px"
        }
    },
    telemetryConfig: telemetryConfigGlobal
};

Default.args = liveChatWidgetDefaultProps;

/*
    Live Chat Widget Pre + Post Chat
*/

class MockChatSDKSurveyEnabled extends MockChatSDK {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public getPreChatSurvey(parseToJson: boolean) {
        return "{\"type\":\"AdaptiveCard\",\"version\":\"1.1\",\"body\":[{\"type\":\"TextBlock\",\"weight\":\"bolder\",\"text\":\"Please answer below questions.\"},{\"type\":\"TextBlock\",\"text\":\"*Please Enter Name\",\"wrap\":true},{\"type\":\"Input.Text\",\"id\":\"{\\\"Id\\\":\\\"33828761-9e8b-ec11-93b0-00224824654f\\\",\\\"Name\\\":\\\"Name\\\",\\\"IsOption\\\":false,\\\"Order\\\":1,\\\"IsRequired\\\":true,\\\"QuestionText\\\":\\\"Please Enter Name\\\"}\",\"maxLength\":100},{\"type\":\"TextBlock\",\"text\":\"Comments\",\"wrap\":true},{\"type\":\"Input.Text\",\"id\":\"{\\\"Id\\\":\\\"5624f385-9e8b-ec11-93b0-00224824654f\\\",\\\"Name\\\":\\\"Comments\\\",\\\"IsOption\\\":false,\\\"Order\\\":2,\\\"IsRequired\\\":false,\\\"QuestionText\\\":\\\"Comments\\\"}\",\"isMultiline\":true,\"maxLength\":250},{\"type\":\"TextBlock\",\"text\":\"Options\",\"wrap\":true},{\"type\":\"Input.ChoiceSet\",\"id\":\"{\\\"Id\\\":\\\"0b5d9408-10b1-ec11-983f-0022481e6d27\\\",\\\"Name\\\":\\\"Options\\\",\\\"IsOption\\\":true,\\\"Order\\\":3,\\\"IsRequired\\\":false,\\\"QuestionText\\\":\\\"Options\\\"}\",\"value\":\"{\\\"Id\\\":\\\"135d9408-10b1-ec11-983f-0022481e6d27\\\",\\\"Value\\\":\\\"Option2\\\"}\",\"style\":\"compact\",\"isMultiSelect\":false,\"choices\":[{\"title\":\"Option2\",\"value\":\"{\\\"Id\\\":\\\"135d9408-10b1-ec11-983f-0022481e6d27\\\",\\\"Value\\\":\\\"Option2\\\"}\"},{\"title\":\"Option3\",\"value\":\"{\\\"Id\\\":\\\"145d9408-10b1-ec11-983f-0022481e6d27\\\",\\\"Value\\\":\\\"Option3\\\"}\"},{\"title\":\"Option1\",\"value\":\"{\\\"Id\\\":\\\"125d9408-10b1-ec11-983f-0022481e6d27\\\",\\\"Value\\\":\\\"Option1\\\"}\"}]},{\"type\":\"Input.Toggle\",\"id\":\"{\\\"Id\\\":\\\"63a42fb5-9e8b-ec11-93b0-00224824654f\\\",\\\"Name\\\":\\\"Consent\\\",\\\"IsOption\\\":false,\\\"Order\\\":4,\\\"IsRequired\\\":true,\\\"QuestionText\\\":\\\"Agree to Terms and Conditions\\\"}\",\"title\":\"*Agree to Terms and Conditions\",\"valueOn\":\"True\",\"valueOff\":\"False\",\"value\":\"false\"},{\"type\":\"TextBlock\",\"isSubtle\":true,\"text\":\"Fields marked with * are mandatory.\",\"wrap\":true}],\"actions\":[{\"type\":\"Action.Submit\",\"data\":{\"Type\":\"InputSubmit\"},\"title\":\"Submit\"}]}";
    }

    public async getPostChatSurveyContext() {
        await this.sleep(1000);
        return {
            surveyInviteLink: "https://customervoice.microsoft.com/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbRzBkKrakuj1CvYYDsfs8hTBUMUE4WUJHMEZEMjVPRTBTVUYzSzREN1Q1Ry4u&vt=72f988bf-86f1-41af-91ab-2d7cd011db47_33743ab6-750a-4598-b3d1-902bef8e51fd_637847096240000000_MSIT_Hash_j1mV7GqRPNf7lNpsWeFBAL46SoaB0vDccn8TMRuYnZ0%3d&lang=en-us&showmultilingual=false"
        };
    }

    // Keeping agent Accepted on true to simulate agent joining conversation and triggering post chat survey
    public getConversationDetails() {
        return {
            conversationId: "3ef7f16f-7d34-46f4-b5d3-fa7ce1b95def",
            canRenderPostChat: "True"
        };
    }
}

const MockChatConfig: ChatConfig = {
    ChatWidgetLanguage: {
        "msdyn_localeid": "1033",
        "msdyn_languagename": "English - United States"
    },
    DataMaskingInfo: {},
    LiveChatConfigAuthSettings: {},
    LiveChatVersion: 2,
    LiveWSAndLiveChatEngJoin: {
        "msdyn_postconversationsurveyenable": "true",
        "msdyn_postconversationsurveymode": "192350000"
    },
    allowedFileExtensions: "",
    maxUploadFileSize: ""
};

export const DefaultWithSurvey = LiveChatWidgetTemplate.bind({});

const liveChatWidgetDefaultWithSurveyProps: ILiveChatWidgetProps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chatSDK: new MockChatSDKSurveyEnabled() as any,
    chatConfig: MockChatConfig,
    styleProps: {
        generalStyles: {
            width: "360px",
            height: "560px",
            top: "20px",
            left: "20px"
        }
    },
    chatButtonProps: {
        styleProps: {
            generalStyleProps: {
                position: "absolute"
            }
        }
    },
    postChatSurveyPaneProps: {
        styleProps: {
            generalStyleProps: {
                position: "initial",
                height: "560px",
                width: "360px",
                borderRadius: "0 0 4px 4px",
                overflow: "auto"
            }
        }
    },
    telemetryConfig: telemetryConfigGlobal
};

DefaultWithSurvey.args = liveChatWidgetDefaultWithSurveyProps;

// Sample Customized Widget

export const Custom = LiveChatWidgetTemplate.bind({});

const liveChatWidgetCustom: ILiveChatWidgetProps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chatSDK: new MockChatSDKSurveyEnabled() as any,
    chatConfig: MockChatConfig,
    styleProps: {
        generalStyles: {
            width: "423px",
            height: "600px",
            bottom: "20px",
            right: "20px",
            borderRadius: "10px",
        }
    },
    chatButtonProps: {
        controlProps: {
            hideNotificationBubble: true,
            hideChatTextContainer: true
        },
        styleProps: {
            generalStyleProps: {
                height: "50px",
                width: "50px",
                position: "absolute",
                cursor: "pointer",
                hoverBackgroundColor: "lightgrey",
                borderStyle: "",
                borderRadius: 0,
                borderWidth: "0",
                boxShadow: ""
            },
            iconStyleProps: {
                cursor: "pointer",
                align: "center",
                width: "100%",
                height: "100%",
                justifyContent: "center",
                backgroundImage: "url(https://www.freeiconspng.com/uploads/live-chat-icon-20.png)",
                backgroundSize: "100% 100%",
                borderStyle: "",
                borderRadius: 0,
                borderWidth: "0",
                boxShadow: "",
                "&:hover": {
                    filter: "brightness(0.8)"
                },
                margin: 0
            }
        }
    },
    headerProps: {
        controlProps: {
            hideIcon: true,
            headerTitleProps: {
                id: "oc-lcw-header-title",
                text: "Support Chat"
            }
        },
        styleProps: {
            generalStyleProps: {
                borderRadius: "0px",
                backgroundColor: "#1b1a19",
                height: "40px"
            },
            closeButtonStyleProps: {
                color: "#2266E3"
            },
            minimizeButtonStyleProps: {
                color: "#2266E3"
            },
            titleStyleProps: {
                fontSize: "20px",
                fontFamily: "Segoe UI",
                margin: "0 0 0 10px",
                color: "white",
                fontWeight: "600"
            }
        }
    },
    loadingPaneProps: {
        controlProps: {
            titleText: "Support Chat",
            spinnerText: "We will be with you shortly",
            spinnerSize: 3,
            hideSubtitle: true,
            hideIcon: true,
            hideSpinnerText: true
        },
        styleProps: {
            generalStyleProps: {
                position: "initial",
                width: "100%",
                height: "100%",
                left: "0%",
                top: "0%",
                borderRadius: "0px",
                borderWidth: "0px",
                backgroundColor: "#1b1a19",
                alignItems: "center"
            },
            titleStyleProps: {
                color: "white",
                margin: "0 0 50px 0",
                fontSize: "24px",
                width: "auto",
                fontFamily: "Segoe UI",
                order: 1,
                fontWeight: 600
            }
        }
    },
    webChatContainerProps: {
        webChatStyles: {
            backgroundColor: "#1b1a19",
            botAvatarInitials: "",
            botAvatarImage: "https://www.freeiconspng.com/uploads/female-call-center-agent-vector-icon--people-icons--icons-download-14.png",
            bubbleBackground: "#0078d4",
            bubbleBorderRadius: 0,
            bubbleBorderWidth: 0,
            bubbleFromUserBackground: "#F7F7F9",
            bubbleFromUserBorderRadius: 0,
            bubbleFromUserBorderWidth: 0,
            bubbleFromUserTextColor: "black",
            bubbleImageHeight: 300,
            bubbleMaxWidth: 250,
            bubbleMinHeight: 40,
            bubbleMinWidth: 40,
            bubbleTextColor: "white",
            hideSendBox: false,
            hideUploadButton: true,
            primaryFont: "Segoe UI",
            rootHeight: "100%",
            rootWidth: "100%",
            sendBoxTextWrap: true,
            sendBoxHeight: 70,
            sendBoxMaxHeight: 120,
            sendBoxBackground: "#F7F7F9",
            bubbleFromUserNubOffset: "bottom",
            bubbleNubOffset: "bottom",
            bubbleFromUserNubSize: 8,
            bubbleNubSize: 8,
            avatarBorderRadius: 0,
            timestampFormat: "absolute"
        },
        renderingMiddlewareProps: {
            disableTypingIndicatorMiddleware: true,
            disableAvatarMiddleware: true,
            disableActivityMiddleware: true
        }
    },
    confirmationPaneProps: {
        controlProps: {
            hideSubtitle: true,
            titleText: "Are you sure you want to leave the conversation?",
            confirmButtonText: "Yes",
            cancelButtonText: "No"
        },
        styleProps: {
            generalStyleProps: {
                borderRadius: "0px",
                fontFamily: "Segoe UI, Arial, sans-serif",
                fontSize: "14px",
                height: "100%",
                padding: "10px 20px",
                width: "100%",
                backgroundColor: "#1b1a19"
            },
            titleStyleProps: {
                fontFamily: "Segoe UI",
                marginBottom: "15px",
                color: "white"
            },
            confirmButtonStyleProps: {
                borderRadius: "0",
                backgroundColor: "#2266E3"
            },
            confirmButtonHoveredStyleProps: {
                borderRadius: "0"
            },
            cancelButtonStyleProps: {
                borderRadius: "0"
            },
            cancelButtonHoveredStyleProps: {
                borderRadius: "0"
            }
        }
    },
    preChatSurveyPaneProps: {
        controlProps: {
            adaptiveCardHostConfig: "{\"fontFamily\":\"Segoe UI, Helvetica Neue, sans-serif\",\"containerStyles\":{\"default\":{\"foregroundColors\":{\"default\":{\"default\":\"#FFFFFF\",\"subtle\":\"#FFFFFF\"}},\"backgroundColor\":\"rgb(27, 26, 25)\"}},\"actions\":{\"actionsOrientation\":\"Vertical\",\"actionAlignment\":\"stretch\"}}",
        },
        styleProps: {
            generalStyleProps: {
                backgroundColor: "#1b1a19",
                borderWidth: "1px"
            },
            adaptiveCardContainerStyleProps: {
                backgroundColor: "#1b1a19",
                borderStyle: "none"
            },
            customButtonStyleProps: {
                backgroundColor: "#2266E3",
                color: "#1b1a19"
            }
        }
    },
    footerProps: {
        controlProps: {
            hideAudioNotificationButton: true,
            hideDownloadTranscriptButton: true,
            hideEmailTranscriptButton: true,
            leftGroup: {
                children: [
                    // eslint-disable-next-line quotes
                    '{"$$typeof":"$$Symbol:react.element","type":"button","key":"1","ref":null,"props":{"role":"button","style":{"fontSize":"12px","margin":"10px","padding":"5px","fontFamily":"Segoe UI","cursor":"pointer","backgroundColor":"#0078D4","borderRadius":0,"borderStyle":"none","color":"white","fontWeight":400},"children":"Upload Attachment"},"_owner":null,"_store":{}}',
                ]
            },
            rightGroup: {
                children: [
                    // eslint-disable-next-line quotes
                    '{"$$typeof":"$$Symbol:react.element","type":"div","key":"1","ref":null,"props":{"style":{"fontSize":"11px","fontFamily":"Segoe UI","margin":"10px","padding":"2px"},"children":"© Microsoft 2022"},"_owner":null,"_store":{}}',
                ]
            }
        },
        styleProps: {
            generalStyleProps: {
                backgroundColor: "#1b1a19"
            }
        }
    },
    telemetryConfig: telemetryConfigGlobal
};

Custom.args = liveChatWidgetCustom;