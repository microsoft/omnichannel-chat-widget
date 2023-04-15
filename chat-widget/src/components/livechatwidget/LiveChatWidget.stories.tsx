import React, { useState } from "react";

import { BroadcastServiceInitialize } from "@microsoft/omnichannel-chat-components";
import ChatConfig from "@microsoft/omnichannel-chat-sdk/lib/core/ChatConfig";
import { ILiveChatWidgetProps } from "./interfaces/ILiveChatWidgetProps";
import { IconButton } from "@fluentui/react/lib/Button";
import LiveChatWidget from "./LiveChatWidget";
import { Meta } from "@storybook/react/types-6-0";
import { MockChatSDK } from "../webchatcontainerstateful/common/mockchatsdk";
import { Story } from "@storybook/react";
import { hooks } from "botframework-webchat";
import { ParticipantType } from "../../common/Constants";

export default {
    title: "Stateful Components/Live Chat Widget",
    component: LiveChatWidget,
} as Meta;

BroadcastServiceInitialize("testChannel");

const dummyTelemetryConfig = {
    chatComponentVersion: "1.0.0",
    chatWidgetVersion: "1.0.0",
    OCChatSDKVersion: "1.0.1"
};

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
    },
    telemetryConfig: dummyTelemetryConfig
};

LiveChatWidgetFixedSize.args = liveChatWidgetFixedSizeProps;

/*
    Live Chat Widget Custom 1
*/

export const LiveChatWidgetCustom1 = LiveChatWidgetTemplate.bind({});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sampleActivityMiddleware = () => (next: any) => (card: any) => {
    if (card.activity) {
        card.activity.text = `This is a mock directLine adapter. To mock received message, please add ":" (colon) in front your message.
            \n This message sent from (${card.activity?.from?.role}) has been altered by the activity middleware.`;
    }
    return next(card);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
const sampleAvatarMiddleware = () => (_next: any) => (args: any) => {
    const color = args.fromUser ? "grey" : "#315FA2";
    const output =
        () => (
            <div style={{ fontSize: "10px", width: 0, height: 0, borderLeft: "20px solid transparent", borderRight: "20px solid transparent", borderTop: `40px solid ${color}` }} />
        );

    return output;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react/display-name
const sampleActivityStatusMiddleware = () => (_next: any) => (args: any) => {
    const {
        activity: {
            from: {
                name,
                role
            },
            timestamp
        },
        sendState
    } = args;

    const output =
        <div style={{ fontSize: "10px" }} >
            This message from {role}: {name ?? "you"} is {sendState} at {timestamp}
        </div>;

    return output;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any, react/display-name
const sampleAttachmentMiddleware = () => (next: any) => (card: any) => {
    const output = (
        <div>
            <div style={{ fontSize: "12px", borderRadius: "50%", background: "grey" }}>
                {next(card)}
            </div>
        </div>
    );
    return output;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react/display-name
const sampleTypingIndicatorMiddleware = () => (_next: any) => (args: any) => {
    const foundKey = Object.keys(args.activeTyping).find((key) => (args.activeTyping[key].role === "bot"));
    const output = (
        <div style={{ marginLeft: "10px", marginBottom: "5px" }}>
            {args.visible && foundKey
                && `${args.activeTyping[foundKey].name} is currently typing...`}
        </div>
    );
    return output;
};

const liveChatWidgetCustom1Props: ILiveChatWidgetProps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chatSDK: new MockChatSDK() as any,
    telemetryConfig: dummyTelemetryConfig,
    styleProps: {
        generalStyles: {
            width: "400px",
            height: "620px",
            borderRadius: "0px",
            fontFamily: "Helvetica"
        }
    },
    chatButtonProps: {
        controlProps: {
            ariaLabel: "chat button",
            titleText: "Let's Chat!",
            subtitleText: "We're online.",
            hideNotificationBubble: true,
            hideChatTextContainer: true
        },
        styleProps: {
            generalStyleProps: {
                height: "100px",
                width: "100px",
                position: "relative",
                backgroundColor: "",
                borderWidth: "1px",
                margin: "3px 3px 3px 3px",
                cursor: "pointer",
                bottom: "0px",
                right: "0px",
                hoverBackgroundColor: "lightgrey"
            },
            iconStyleProps: {
                cursor: "pointer",
                borderStyle: "solid",
                borderColor: "transparent",
                borderWidth: "1px",
                borderRadius: "0px",
                align: "center",
                width: "100px",
                height: "100px",
                justifyContent: "center",
                backgroundImage: "url(https://purepng.com/public/uploads/large/purepng.com-microsoft-logo-iconlogobrand-logoiconslogos-251519939091wmudn.png)",
                backgroundSize: "100% 100%",
                backgroundColor: "#B22222",
                "&:hover": {
                    filter: "brightness(0.8)"
                }
            }
        }
    },
    headerProps: {
        controlProps: {
            hideIcon: true,
            headerTitleProps: {
                id: "oc-lcw-header-title",
                text: "Microsoft Help Desk"
            }
        },
        styleProps: {
            generalStyleProps: {
                borderRadius: "0px",
                backgroundColor: "#B22222",
                height: "40px"
            },
            titleStyleProps: {
                fontSize: "20px",
                fontFamily: "Helvetica",
                margin: "0 0 0 10px",
                color: "White"
            }
        }
    },
    loadingPaneProps: {
        controlProps: {
            titleText: "Microsoft Help Desk",
            spinnerText: "We will be with you shortly",
            spinnerSize: 3,
            hideSubtitle: true
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
                backgroundColor: "white",
                alignItems: "center",

            },
            iconImageProps: {
                src: "",
            },
            titleStyleProps: {
                color: "black",
                margin: "0 0 50px 0",
                fontSize: "24px",
                width: "auto",
                fontFamily: "Helvetica",
                order: 1
            },
            iconStyleProps: {
                backgroundImage: "url(https://purepng.com/public/uploads/large/purepng.com-microsoft-logo-iconlogobrand-logoiconslogos-251519939091wmudn.png)",
                backgroundSize: "80% 80%",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                boxShadow: "",
                borderRadius: "0px",
                width: "70px",
                height: "70px",
                order: 2,
                backgroundColor: "white"
            },
            spinnerTextStyleProps: {
                color: "black",
                fontSize: "14px",
                width: "auto",
                fontFamily: "Helvetica",
                marginTop: "10px"
            }
        }
    },
    webChatContainerProps: {
        containerStyles: {
            borderBottomColor: "black",
            borderBottomWidth: "1px"
        },
        webChatProps: {
            activityMiddleware: sampleActivityMiddleware,
            activityStatusMiddleware: sampleActivityStatusMiddleware,
            attachmentMiddleware: sampleAttachmentMiddleware,
            avatarMiddleware: sampleAvatarMiddleware,
            typingIndicatorMiddleware: sampleTypingIndicatorMiddleware
        },
        webChatStyles: {
            backgroundColor: "white",
            botAvatarBackgroundColor: "#B22222",
            botAvatarInitials: "",
            botAvatarImage: "https://pbs.twimg.com/profile_images/833180315153608704/g_LAHGXB_400x400.jpg",
            bubbleBackground: "#B22222",
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
            bubbleTextColor: "White",
            hideSendBox: false,
            hideUploadButton: true,
            primaryFont: "Helvetica",
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
            avatarStyleProps: {
                backgroundColor: "#B22222"
            }
        }
    },
    footerProps: {
        controlProps: {
            hideAudioNotificationButton: true,
            hideDownloadTranscriptButton: false,
            hideEmailTranscriptButton: true,
            rightGroup: {
                children: [
                    <div key={1} style={{
                        fontSize: "11px",
                        fontFamily: "Helvetica",
                        margin: "10px",
                        padding: "2px"
                    }}
                    >© Microsoft 2022</div>,
                ]
            }
        },
        styleProps: {
            generalStyleProps: {
                backgroundColor: "white"
            },
            downloadTranscriptButtonStyleProps: {
                margin: "6px",

            }
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
                boxSizing: undefined,
                fontFamily: "Segoe UI, Arial, sans-serif",
                fontSize: "14px",
                height: "100%",
                left: undefined,
                maxHeight: undefined,
                minHeight: undefined,
                padding: "10px 20px",
                right: undefined,
                width: "100%"
            },
            titleStyleProps: {
                fontFamily: "Helvetica",
                marginBottom: "15px"
            },
            buttonGroupStyleProps: {
                boxSizing: undefined,
                height: undefined,
                marginBottom: undefined,
                width: undefined
            },
            confirmButtonStyleProps: {
                fontFamily: "Helvetica",
                backgroundColor: "#B22222",
                borderWidth: "0",
                borderRadius: "0"
            },
            confirmButtonHoveredStyleProps: {
                fontFamily: "Helvetica",
                backgroundColor: "#b24122",
                borderWidth: "0",
                borderRadius: "0"
            },
            cancelButtonStyleProps: {
                fontFamily: "Helvetica",
                backgroundColor: "#dcdce6",
                borderWidth: "0",
                borderRadius: "0"
            },
            cancelButtonHoveredStyleProps: {
                fontFamily: "Helvetica",
                backgroundColor: "#d5d5de",
                borderWidth: "0",
                borderRadius: "0"
            }
        }
    }
};

LiveChatWidgetCustom1.args = liveChatWidgetCustom1Props;

/*
    Live Chat Widget Custom 2
*/

export const LiveChatWidgetCustom2 = LiveChatWidgetTemplate.bind({});

const liveChatWidgetCustom2Props: ILiveChatWidgetProps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chatSDK: new MockChatSDK() as any,
    telemetryConfig: dummyTelemetryConfig,
    styleProps: {
        generalStyles: {
            width: "585px",
            height: "100%",
            borderRadius: "0px",
            fontFamily: "Segoe UI",
            right: "0px"
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
                cursor: "pointer",
                hoverBackgroundColor: "lightgrey",
                borderStyle: "",
                borderRadius: 0,
                borderWidth: "0",
                boxShadow: "",
                right: "0px",
                top: "0px"
            },
            iconStyleProps: {
                cursor: "pointer",
                align: "center",
                width: "100%",
                height: "100%",
                justifyContent: "center",
                backgroundImage: "url(https://charlwanconvcontroldev.blob.core.windows.net/botframework/abcd.png)",
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
                text: "Chat + support"
            }
        },
        styleProps: {
            generalStyleProps: {
                borderRadius: "0px",
                backgroundColor: "white",
                height: "40px"
            },
            closeButtonStyleProps: {
                color: "black"
            },
            minimizeButtonStyleProps: {
                color: "black"
            },
            titleStyleProps: {
                fontSize: "20px",
                fontFamily: "Segoe UI",
                margin: "0 0 0 10px",
                color: "black",
                fontWeight: "600"
            }
        }
    },
    loadingPaneProps: {
        controlProps: {
            titleText: "Chat + support",
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
                backgroundColor: "white",
                alignItems: "center"
            },
            titleStyleProps: {
                color: "black",
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
            backgroundColor: "white",
            botAvatarInitials: "",
            botAvatarImage: "https://visualstudiomagazine.com/articles/2021/05/18/~/media/ECG/visualstudiomagazine/Images/2021/05/new_azure_a.ashx",
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
            sendBoxBackground: "White",
            bubbleFromUserNubOffset: "bottom",
            bubbleNubOffset: "bottom",
            bubbleFromUserNubSize: 8,
            bubbleNubSize: 8,
            avatarBorderRadius: 0,
            timestampFormat: "absolute"
        },
        renderingMiddlewareProps: {
            disableActivityMiddleware: true,
            disableActivityStatusMiddleware: true,
            disableAvatarMiddleware: true,
            disableTypingIndicatorMiddleware: true
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
                width: "100%"
            },
            titleStyleProps: {
                fontFamily: "Segoe UI",
                marginBottom: "15px"
            },
            confirmButtonStyleProps: {
                borderRadius: "0"
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
    footerProps: {
        controlProps: {
            hideAudioNotificationButton: true,
            hideDownloadTranscriptButton: true,
            hideEmailTranscriptButton: true,
            leftGroup: {
                children: [
                    "{\"$$typeof\":\"$$Symbol:react.element\",\"type\":\"button\",\"key\":\"1\",\"ref\":null,\"props\":{\"role\":\"button\",\"style\":{\"fontSize\":\"12px\",\"margin\":\"10px\",\"padding\":\"5px\",\"fontFamily\":\"Segoe UI\",\"cursor\":\"pointer\",\"backgroundColor\":\"#0078D4\",\"borderRadius\":0,\"borderStyle\":\"none\",\"color\":\"white\",\"fontWeight\":400},\"children\":\"Upload Attachment\"},\"_owner\":null,\"_store\":{}}",
                ]
            },
            rightGroup: {
                children: [
                    "{\"$$typeof\":\"$$Symbol:react.element\",\"type\":\"div\",\"key\":\"1\",\"ref\":null,\"props\":{\"style\":{\"fontSize\":\"11px\",\"fontFamily\":\"Segoe UI\",\"margin\":\"10px\",\"padding\":\"2px\"},\"children\":\"© Microsoft 2022\"},\"_owner\":null,\"_store\":{}}",
                ]
            }
        },
        styleProps: {
            generalStyleProps: {
                backgroundColor: "white"
            }
        }
    }
};

LiveChatWidgetCustom2.args = liveChatWidgetCustom2Props;

/*
    Live Chat Widget Custom 3
*/

export const LiveChatWidgetCustom3 = LiveChatWidgetTemplate.bind({});

const DemoSendBox = () => {
    const { useSendMessage } = hooks;
    const sendMessage = useSendMessage();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSubmit = (event: any) => {
        event.preventDefault();
        sendMessage(text);
        setText("");
    };
    const [text, setText] = useState("");
    const onTextChange = (event) => {
        setText(event.target.value);
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "row", marginLeft: "20px", padding: "5px", borderRadius: "15px", height: "50px", justifyContent: "center", alignItems: "center", background: "white", width: "500px", borderLeft: "" }}>
            <textarea value={text} onChange={onTextChange} style={{ flexGrow: 2, border: "none", borderRadius: "inherit", width: "308px", height: "inherit", resize: "none", outline: "none", fontSize: "14px", fontFamily: "Tahoma" }} placeholder="Type your message here" />
            <input type="submit" value="Send" style={{ height: "30px", marginRight: "15px", background: "rgb(4, 142, 209)", color: "white", borderRadius: "5px", border: "none", fontFamily: "Tahoma", width: "60px", fontSize: "14px" }} />
        </form>
    );
};

const liveChatWidgetCustom3Props: ILiveChatWidgetProps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chatSDK: new MockChatSDK() as any,
    telemetryConfig: dummyTelemetryConfig,
    styleProps: {
        generalStyles: {
            width: "700px",
            height: "800px",
            bottom: "20px",
            right: "20px",
            borderRadius: "0px",
        }
    },
    headerProps: {
        controlProps: {
            hideMinimizeButton: true,
            headerTitleProps: {
                text: "Customer Support Chat"
            },
            headerIconProps: {
                src: "https://charlwanconvcontroldev.blob.core.windows.net/botframework/hp.png"
            }
        },
        styleProps: {
            generalStyleProps: {
                height: "140px",
                borderRadius: 0,
                backgroundColor: "#048ed1"
            },
            iconStyleProps: {
                width: "80px",
                height: "80px"
            },
            titleStyleProps: {
                fontFamily: "Tahoma,Arial,sans-serif",
                fontWeight: 400,
                fontSize: 32,
                color: "white",
                margin: "0 0 0 20px"
            },
            closeButtonStyleProps: {
                borderRadius: "0",
                color: "white"
            }
        }
    },
    webChatContainerProps: {
        webChatStyles: {
            backgroundColor: "white",
            bubbleBackground: "#e2ebf6",
            bubbleBorderRadius: 14,
            bubbleBorderWidth: 0,
            bubbleFromUserBackground: "#f4f3f4",
            bubbleFromUserBorderRadius: 14,
            bubbleFromUserBorderWidth: 0,
            bubbleFromUserTextColor: "black",
            bubbleImageHeight: 300,
            bubbleMaxWidth: 600,
            bubbleMinHeight: 46,
            bubbleMinWidth: 78,
            bubbleTextColor: "black",
            hideSendBox: true,
            primaryFont: "Tahoma",
            rootHeight: "100%",
            rootWidth: "100%",
            sendBoxTextWrap: true,
            sendBoxHeight: 70,
            sendBoxMaxHeight: 120,
            sendBoxBackground: "White",
            avatarSize: 0,
            groupTimestamp: false,
            timestampFormat: "absolute",
            paddingRegular: 15
        },
        renderingMiddlewareProps: {
            disableTypingIndicatorMiddleware: true,
            disableAvatarMiddleware: true,
            disableActivityMiddleware: true,
            disableActivityStatusMiddleware: true
        }
    },
    footerProps: {
        controlProps: {
            hideDownloadTranscriptButton: true,
            hideEmailTranscriptButton: true,
            hideAudioNotificationButton: true,
            leftGroup: {
                children: [
                    <DemoSendBox key={0} />
                ]
            },
            rightGroup: {
                children: [
                    <IconButton key={0} iconProps={{ iconName: "Save" }} style={{ marginTop: "30px", color: "white" }} styles={{ root: { color: "white" }, rootHovered: { color: "#048ed1" } }} />,
                    <IconButton key={1} iconProps={{ iconName: "Attach" }} style={{ marginTop: "30px", color: "white" }} styles={{ root: { color: "white" }, rootHovered: { color: "#048ed1" } }} />,
                    <IconButton key={2} iconProps={{ iconName: "Print" }} style={{ marginTop: "30px", marginRight: "30px", color: "white" }} styles={{ root: { color: "white" }, rootHovered: { color: "#048ed1" } }} />
                ]
            }
        },
        styleProps: {
            generalStyleProps: {
                height: "120px",
                backgroundColor: "#048ed1",
                borderRadius: 0
            }
        }
    }
};

LiveChatWidgetCustom3.args = liveChatWidgetCustom3Props;

/*
    Live Chat Widget With Calling toast
*/

export const LiveChatWidgetAzureWithIncomingCall = LiveChatWidgetTemplate.bind({});
const liveChatWidgetIncomingCallProps: ILiveChatWidgetProps = {
    ...liveChatWidgetFixedSizeProps,
    callingContainerProps: {
        controlProps: {
            isIncomingCall: true
        }
    }
};
LiveChatWidgetAzureWithIncomingCall.args = liveChatWidgetIncomingCallProps;

/*
    Live Chat Widget With Calling toast
*/

export const LiveChatWidgetAzureWithCurrentCall = LiveChatWidgetTemplate.bind({});
const liveChatWidgetCurrentCallProps: ILiveChatWidgetProps = {
    ...liveChatWidgetFixedSizeProps,
    callingContainerProps: {
        controlProps: {
            isIncomingCall: false
        }
    }
};
LiveChatWidgetAzureWithCurrentCall.args = liveChatWidgetCurrentCallProps;

/*
    Live Chat Widget Popout Style
*/

export const LiveChatWidgetPopoutStyle = LiveChatWidgetTemplate.bind({});

const liveChatWidgetPopoutStyleProps: ILiveChatWidgetProps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chatSDK: new MockChatSDK() as any,
    telemetryConfig: dummyTelemetryConfig,
    controlProps: {
        hideStartChatButton: true,
        hideHeader: true
    },
    styleProps: {
        generalStyles: {
            height: "calc(100vh - 3px)",
            maxWidth: "1000px",
            minWidth: "300px",
            margin: "0 auto 0 auto"
        }
    },
    webChatContainerProps: {
        webChatStyles: {
            bubbleMaxWidth: 75
        }
    }
};

LiveChatWidgetPopoutStyle.args = liveChatWidgetPopoutStyleProps;

export const LiveChatWidgetReconnectChatPane = LiveChatWidgetTemplate.bind({});

const liveChatWidgetReconnectChatPaneProps: ILiveChatWidgetProps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chatSDK: new MockChatSDK() as any,
    telemetryConfig: dummyTelemetryConfig,
    chatConfig: {
        LiveChatConfigAuthSettings: {
            msdyn_javascriptclientfunction: "testAuth"
        },
        LiveWSAndLiveChatEngJoin: {
            msdyn_enablechatreconnect: "true"
        }
    },
    styleProps: {
        generalStyles: {
            width: "360px",
            height: "560px",
            top: "20px",
            left: "20px"
        }
    }
};

LiveChatWidgetReconnectChatPane.args = liveChatWidgetReconnectChatPaneProps;

/*
    Live Chat Widget Pre + Post Chat
*/

class MockChatSDKSurveyEnabled extends MockChatSDK {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public getPreChatSurvey(parseToJson: boolean) {
        return "{\"type\":\"AdaptiveCard\",\"version\":\"1.1\",\"body\":[{\"type\":\"TextBlock\",\"weight\":\"bolder\",\"text\":\"Please answer below questions.\"},{\"type\":\"TextBlock\",\"text\":\"* Please Enter Name\",\"wrap\":true},{\"type\":\"Input.Text\",\"id\":\"{\\\"Id\\\":\\\"33828761-9e8b-ec11-93b0-00224824654f\\\",\\\"Name\\\":\\\"Name\\\",\\\"IsOption\\\":false,\\\"Order\\\":1,\\\"IsRequired\\\":true,\\\"QuestionText\\\":\\\"Please Enter Name\\\"}\",\"maxLength\":100},{\"type\":\"TextBlock\",\"text\":\"Comments\",\"wrap\":true},{\"type\":\"Input.Text\",\"id\":\"{\\\"Id\\\":\\\"5624f385-9e8b-ec11-93b0-00224824654f\\\",\\\"Name\\\":\\\"Comments\\\",\\\"IsOption\\\":false,\\\"Order\\\":2,\\\"IsRequired\\\":false,\\\"QuestionText\\\":\\\"Comments\\\"}\",\"isMultiline\":true,\"maxLength\":250},{\"type\":\"TextBlock\",\"text\":\"Options\",\"wrap\":true},{\"type\":\"Input.ChoiceSet\",\"id\":\"{\\\"Id\\\":\\\"0b5d9408-10b1-ec11-983f-0022481e6d27\\\",\\\"Name\\\":\\\"Options\\\",\\\"IsOption\\\":true,\\\"Order\\\":3,\\\"IsRequired\\\":false,\\\"QuestionText\\\":\\\"Options\\\"}\",\"value\":\"{\\\"Id\\\":\\\"135d9408-10b1-ec11-983f-0022481e6d27\\\",\\\"Value\\\":\\\"Option2\\\"}\",\"style\":\"compact\",\"isMultiSelect\":false,\"choices\":[{\"title\":\"Option2\",\"value\":\"{\\\"Id\\\":\\\"135d9408-10b1-ec11-983f-0022481e6d27\\\",\\\"Value\\\":\\\"Option2\\\"}\"},{\"title\":\"Option3\",\"value\":\"{\\\"Id\\\":\\\"145d9408-10b1-ec11-983f-0022481e6d27\\\",\\\"Value\\\":\\\"Option3\\\"}\"},{\"title\":\"Option1\",\"value\":\"{\\\"Id\\\":\\\"125d9408-10b1-ec11-983f-0022481e6d27\\\",\\\"Value\\\":\\\"Option1\\\"}\"}]},{\"type\":\"Input.Toggle\",\"id\":\"{\\\"Id\\\":\\\"63a42fb5-9e8b-ec11-93b0-00224824654f\\\",\\\"Name\\\":\\\"Consent\\\",\\\"IsOption\\\":false,\\\"Order\\\":4,\\\"IsRequired\\\":true,\\\"QuestionText\\\":\\\"Agree to Terms and Conditions\\\"}\",\"title\":\"*Agree to Terms and Conditions\",\"valueOn\":\"True\",\"valueOff\":\"False\",\"value\":\"false\"},{\"type\":\"TextBlock\",\"isSubtle\":true,\"text\":\"Fields marked with * are mandatory.\",\"wrap\":true}],\"actions\":[{\"type\":\"Action.Submit\",\"data\":{\"Type\":\"InputSubmit\"},\"title\":\"Submit\"}]}";
    }

    public async getPostChatSurveyContext() {
        await this.sleep(500);
        return {
            participantJoined: true,
            participantType: ParticipantType.User,
            surveyInviteLink: "https://customervoice.microsoft.com/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbRzBkKrakuj1CvYYDsfs8hTBUMUE4WUJHMEZEMjVPRTBTVUYzSzREN1Q1Ry4u&vt=72f988bf-86f1-41af-91ab-2d7cd011db47_33743ab6-750a-4598-b3d1-902bef8e51fd_637847096240000000_MSIT_Hash_j1mV7GqRPNf7lNpsWeFBAL46SoaB0vDccn8TMRuYnZ0%3d&lang=en-us&showmultilingual=false",
            formsProLocale: "en-us"
        };
    }

    // Keeping agent Accepted on true to simulate agent joining conversation and triggering post chat survey
    public getConversationDetails() {
        return {
            State: "Active",
            conversationId: "3ef7f16f-7d34-46f4-b5d3-fa7ce1b95def",
            canRenderPostChat: "True",
            participantType: ParticipantType.User
        };
    }
}

const MockChatConfig: ChatConfig = {
    ChatWidgetLanguage: {
        msdyn_localeid: "1033",
        msdyn_languagename: "English - United States"
    },
    DataMaskingInfo: {},
    LiveChatConfigAuthSettings: {},
    LiveChatVersion: 2,
    LiveWSAndLiveChatEngJoin: {
        msdyn_postconversationsurveyenable: "true",
        msdyn_postconversationsurveymode: "192350000"
    },
    allowedFileExtensions: "",
    maxUploadFileSize: ""
};

export const LiveChatWidgetFixedSizeSurveyEnabled = LiveChatWidgetTemplate.bind({});
// Using Storybook loader for states to be loaded correctly
LiveChatWidgetFixedSizeSurveyEnabled.loaders = [() => {
    window.localStorage.setItem(
        "postChatContext", "{participantJoined:True,canRenderPostchat:True,participantType:Bot,surveyInviteLink:\"https://customervoice.microsoft.com/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbRzBkKrakuj1CvYYDsfs8hTBUMUE4WUJHMEZEMjVPRTBTVUYzSzREN1Q1Ry4u&vt=72f988bf-86f1-41af-91ab-2d7cd011db47_33743ab6-750a-4598-b3d1-902bef8e51fd_637847096240000000_MSIT_Hash_j1mV7GqRPNf7lNpsWeFBAL46SoaB0vDccn8TMRuYnZ0%3d&lang=en-us&showmultilingual=false\",formsProLocale:\"en-us\"" +
    "botSurveyInviteLink:\"https://customervoice.microsoft.com/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbRzBkKrakuj1CvYYDsfs8hTBUMUE4WUJHMEZEMjVPRTBTVUYzSzREN1Q1Ry4u&vt=72f988bf-86f1-41af-91ab-2d7cd011db47_33743ab6-750a-4598-b3d1-902bef8e51fd_637847096240000000_MSIT_Hash_j1mV7GqRPNf7lNpsWeFBAL46SoaB0vDccn8TMRuYnZ0%3d&lang=en-us&showmultilingual=false\",botFormsProLocale:\"en-us\"}"
    );
}];

const liveChatWidgetFixedSizeSurveyEnabledProps: ILiveChatWidgetProps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chatSDK: new MockChatSDKSurveyEnabled() as any,
    telemetryConfig: dummyTelemetryConfig,
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
    }
};

LiveChatWidgetFixedSizeSurveyEnabled.args = liveChatWidgetFixedSizeSurveyEnabledProps;

/*
    Live Chat Widget Customized Pre + Post Chat
*/

export const LiveChatWidgetCustomizedSurveyEnabled = LiveChatWidgetTemplate.bind({});
// Using Storybook loader for states to be loaded correctly
LiveChatWidgetCustomizedSurveyEnabled.loaders = [() => {
    window.localStorage.setItem(
        "postChatContext", "{participantJoined:True,canRenderPostchat:True,participantType:Bot,surveyInviteLink:\"https://customervoice.microsoft.com/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbRzBkKrakuj1CvYYDsfs8hTBUMUE4WUJHMEZEMjVPRTBTVUYzSzREN1Q1Ry4u&vt=72f988bf-86f1-41af-91ab-2d7cd011db47_33743ab6-750a-4598-b3d1-902bef8e51fd_637847096240000000_MSIT_Hash_j1mV7GqRPNf7lNpsWeFBAL46SoaB0vDccn8TMRuYnZ0%3d&lang=en-us&showmultilingual=false\",formsProLocale:\"en-us\"" +
    "botSurveyInviteLink:\"https://customervoice.microsoft.com/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbRzBkKrakuj1CvYYDsfs8hTBUMUE4WUJHMEZEMjVPRTBTVUYzSzREN1Q1Ry4u&vt=72f988bf-86f1-41af-91ab-2d7cd011db47_33743ab6-750a-4598-b3d1-902bef8e51fd_637847096240000000_MSIT_Hash_j1mV7GqRPNf7lNpsWeFBAL46SoaB0vDccn8TMRuYnZ0%3d&lang=en-us&showmultilingual=false\",botFormsProLocale:\"en-us\"}"
    );
}];

const liveChatWidgetCustomizedSurveyEnabledProps: ILiveChatWidgetProps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chatSDK: new MockChatSDKSurveyEnabled() as any,
    telemetryConfig: dummyTelemetryConfig,
    chatConfig: MockChatConfig,
    styleProps: {
        generalStyles: {
            width: "400px",
            height: "620px",
            borderRadius: "0px",
            fontFamily: "Helvetica",
            top: "20px",
            left: "20px",
            position: "absolute"
        }
    },
    headerProps: {
        controlProps: {
            hideIcon: true,
            headerTitleProps: {
                id: "oc-lcw-header-title",
                text: "Microsoft Help Desk"
            }
        },
        styleProps: {
            generalStyleProps: {
                borderRadius: "0px",
                backgroundColor: "#B22222",
                height: "40px"
            },
            titleStyleProps: {
                fontSize: "20px",
                fontFamily: "Helvetica",
                margin: "0 0 0 10px",
                color: "White"
            }
        }
    },
    preChatSurveyPaneProps: {
        controlProps: {
            adaptiveCardHostConfig: "{\"fontFamily\":\"Segoe UI, Helvetica Neue, sans-serif\",\"containerStyles\":{\"default\":{\"foregroundColors\":{\"default\":{\"default\":\"#000000\"}},\"backgroundColor\":\"#FFFFFF\"}},\"actions\":{\"actionsOrientation\":\"Vertical\",\"actionAlignment\":\"right\"}}"
        },
        styleProps: {
            customButtonStyleProps: {
                backgroundColor: "#B22222",
                color: "#FFFFFF"
            }
        }
    },
    webChatContainerProps: {
        webChatStyles: {
            backgroundColor: "white",
            botAvatarBackgroundColor: "#B22222",
            botAvatarInitials: "",
            botAvatarImage: "https://pbs.twimg.com/profile_images/833180315153608704/g_LAHGXB_400x400.jpg",
            bubbleBackground: "#B22222",
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
            bubbleTextColor: "White",
            hideSendBox: false,
            hideUploadButton: true,
            primaryFont: "Helvetica",
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
    chatButtonProps: {
        controlProps: {
            ariaLabel: "chat button",
            titleText: "Let's Chat!",
            subtitleText: "We're online.",
            hideNotificationBubble: true,
            hideChatTextContainer: true
        },
        styleProps: {
            generalStyleProps: {
                height: "100px",
                width: "100px",
                position: "relative",
                backgroundColor: "",
                borderWidth: "1px",
                margin: "3px 3px 3px 3px",
                cursor: "pointer",
                bottom: "0px",
                right: "0px",
                hoverBackgroundColor: "lightgrey"
            },
            iconStyleProps: {
                cursor: "pointer",
                borderStyle: "solid",
                borderColor: "transparent",
                borderWidth: "1px",
                borderRadius: "0px",
                align: "center",
                width: "100px",
                height: "100px",
                justifyContent: "center",
                backgroundImage: "url(https://purepng.com/public/uploads/large/purepng.com-microsoft-logo-iconlogobrand-logoiconslogos-251519939091wmudn.png)",
                backgroundSize: "100% 100%",
                backgroundColor: "#B22222",
                "&:hover": {
                    filter: "brightness(0.8)"
                }
            }
        }
    },
    loadingPaneProps: {
        controlProps: {
            titleText: "Microsoft Help Desk",
            spinnerText: "We will be with you shortly",
            spinnerSize: 3,
            hideSubtitle: true
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
                backgroundColor: "white",
                alignItems: "center"
            },
            iconImageProps: {
                src: "",
            },
            titleStyleProps: {
                color: "black",
                margin: "0 0 50px 0",
                fontSize: "24px",
                width: "auto",
                fontFamily: "Helvetica",
                order: 1
            },
            iconStyleProps: {
                backgroundImage: "url(https://purepng.com/public/uploads/large/purepng.com-microsoft-logo-iconlogobrand-logoiconslogos-251519939091wmudn.png)",
                backgroundSize: "80% 80%",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                boxShadow: "",
                borderRadius: "0px",
                width: "70px",
                height: "70px",
                order: 2,
                backgroundColor: "white"
            },
            spinnerTextStyleProps: {
                color: "black",
                fontSize: "14px",
                width: "auto",
                fontFamily: "Helvetica",
                marginTop: "10px"
            }
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
                width: "100%"
            },
            titleStyleProps: {
                fontFamily: "Helvetica",
                marginBottom: "15px"
            },
            confirmButtonStyleProps: {
                fontFamily: "Helvetica",
                backgroundColor: "#B22222",
                borderWidth: "0",
                borderRadius: "0"
            },
            confirmButtonHoveredStyleProps: {
                fontFamily: "Helvetica",
                backgroundColor: "#b24122",
                borderWidth: "0",
                borderRadius: "0"
            },
            cancelButtonStyleProps: {
                fontFamily: "Helvetica",
                backgroundColor: "#dcdce6",
                borderWidth: "0",
                borderRadius: "0"
            },
            cancelButtonHoveredStyleProps: {
                fontFamily: "Helvetica",
                backgroundColor: "#d5d5de",
                borderWidth: "0",
                borderRadius: "0"
            }
        }
    },
    footerProps: {
        controlProps: {
            hideAudioNotificationButton: true,
            hideDownloadTranscriptButton: false,
            hideEmailTranscriptButton: true,
            rightGroup: {
                children: [
                    // eslint-disable-next-line quotes
                    `{"$$typeof":"$$Symbol:react.element","type":"div","key":"1","ref":null,"props":{"style":{"fontSize":"11px","fontFamily":"Segoe UI","margin":"10px","padding":"2px"},"children":"© Microsoft 2022"},"_owner":null,"_store":{}}`,
                ]
            }
        },
        styleProps: {
            generalStyleProps: {
                backgroundColor: "white"
            },
            downloadTranscriptButtonStyleProps: {
                margin: "6px"
            }
        }
    },
    postChatLoadingPaneProps: {
        controlProps: {
            subtitleText: "Please take a moment to give us feedback about your chat experience. We are loading the survey for you now.",
            spinnerSize: 3,
            hideTitle: true,
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
                backgroundColor: "white",
                alignItems: "center",

            },
            iconImageProps: {
                src: "",
            },
            iconStyleProps: {
                backgroundImage: "url(https://purepng.com/public/uploads/large/purepng.com-microsoft-logo-iconlogobrand-logoiconslogos-251519939091wmudn.png)",
                backgroundSize: "80% 80%",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                boxShadow: "",
                borderRadius: "0px",
                width: "70px",
                height: "70px",
                order: 2,
                backgroundColor: "white"
            },
            subtitleStyleProps: {
                color: "black",
                fontSize: "14px",
                width: "auto",
                fontFamily: "Helvetica",
                marginTop: "10px"
            }
        }
    }
};

LiveChatWidgetCustomizedSurveyEnabled.args = liveChatWidgetCustomizedSurveyEnabledProps;