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

const liveChatWidgetdefaultProps: ILiveChatWidgetProps = {
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
    telemetryConfig: undefined
};

Default.args = liveChatWidgetdefaultProps;

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
    telemetryConfig: undefined
};

DefaultWithSurvey.args = liveChatWidgetDefaultWithSurveyProps;