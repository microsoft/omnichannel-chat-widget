/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-explicit-any */

import { ChatReconnectIconBase64, CloseChatButtonIconBase64, ModernChatIconBase64, ProactiveChatBannerBase64 } from "@microsoft/omnichannel-chat-components";

import { ILiveChatWidgetProps } from "@microsoft/omnichannel-chat-widget/lib/types/components/livechatwidget/interfaces/ILiveChatWidgetProps";//
import { ITelemetryConfig } from "@microsoft/omnichannel-chat-widget/lib/types/common/telemetry/interfaces/ITelemetryConfig";
import { NewMessageNotificationSoundBase64 } from "../../../../src/assets/Audios";
import { OmnichannelChatSDK } from "@microsoft/omnichannel-chat-sdk";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const defaultProps: ILiveChatWidgetProps = {
    audioNotificationProps: {
        audioSrc: NewMessageNotificationSoundBase64
    },
    callingContainerProps: {
        controlProps: {
            id: "oc-lcw-callingcontainer",
            isIncomingCall: false,
            dir: "ltr",
            incomingCallControlProps: {
                id: "oc-lcw-incomingcall",
                dir: "ltr",
                ariaLabel: "Incoming call area",
                hideAudioCall: false,
                hideVideoCall: false,
                hideDeclineCall: false,
                hideIncomingCallTitle: false,
                // onDeclineCallClick: () => { }, // Detailed implementation omitted
                // onAudioCallClick: () => { }, // Detailed implementation omitted
                // onVideoCallClick: () => { }, // Detailed implementation omitted
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
            currentCallControlProps: {
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
                // onEndCallClick: () => { }, // Detailed implementation omitted
                // onMicCallClick: () => { }, // Detailed implementation omitted
                // onVideoOffClick: () => { }, // Detailed implementation omitted
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
                        color: "#FFFFFF",
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
            hideCallingContainer: false
        },
        styleProps: {
            generalStyleProps: {
                generalStyleProps: {
                    background: "#000",
                    width: "100%",
                    zIndex: 100,
                    boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.16), 0px 4px 8px rgba(0, 0, 0, 0.12)"
                }
            },
            className: undefined,
            incomingCallStyleProps: {
                generalStyleProps: {
                    background: "#000",
                    padding: "5px",
                    height: "60px"
                },
                audioCallButtonStyleProps: {
                    borderRadius: "50%",
                    backgroundColor: "#008000",
                    lineHeight: "40px",
                    height: "40px",
                    width: "40px",
                    icon: {
                        fontSize: 18,
                        color: "#FFFFFF"
                    }
                },
                audioCallButtonHoverStyleProps: {
                    filter: "brightness(0.8)"
                },
                videoCallButtonStyleProps: {
                    borderRadius: "50%",
                    backgroundColor: "#008000",
                    lineHeight: "40px",
                    height: "40px",
                    width: "40px",
                    icon: {
                        fontSize: 18,
                        color: "#FFFFFF"
                    }
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
                    backgroundColor: "#DC0000",
                    lineHeight: "40px",
                    height: "40px",
                    width: "40px",
                    marginLeft: "5px",
                    icon: {
                        fontSize: 18,
                        color: "#FFFFFF"
                    },
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
            },
            currentCallStyleProps: {
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
        }
    },
    chatButtonProps: {
        componentOverrides: {
            title: undefined,
            subtitle: undefined,
            notificationBubble: undefined,
            iconContainer: undefined,
            textContainer: undefined
        },
        controlProps: {
            id: "oc-lcw-chat-button",
            dir: "ltr",
            role: "button",
            ariaLabel: "live chat button",
            titleText: "Let's Chat!",
            subtitleText: "We're online.",
            unreadMessageCount: "0",
            // onClick: () => { }, // Detailed implementation omitted
            hideChatButton: false,
            hideChatIcon: false,
            hideChatTextContainer: false,
            hideChatSubtitle: false,
            hideChatTitle: false,
            hideNotificationBubble: true,
            unreadMessageString: "new messages",
            largeUnreadMessageString: "99+",
            ariaLabelUnreadMessageString: "you have new messages"
        },
        styleProps: {
            generalStyleProps: {
                height: "60px",
                width: "180px",
                borderRadius: "100px 100px 100px 99px",
                position: "absolute",
                backgroundColor: "#fff",
                borderColor: "#fff",
                borderStyle: "solid",
                borderWidth: "1px",
                boxShadow: "0 0 4px rgb(102 102 102 / 50%)",
                margin: "3px 3px 3px 3px",
                cursor: "pointer",
                bottom: "0px",
                display: "flex",
                right: "0px",
                padding: "0px",
                selectors: {
                    ":hover": {
                        backgroundColor: "lightgrey"
                    },
                    ":focus": {
                        outline: "dotted 2px #000"
                    }
                }
            },
            // BUG: NOT IMPLEMENTED chatButtonHoveredStyleProps: IStyle;
            iconStyleProps: {
                backgroundColor: "#315FA2",
                borderStyle: "solid",
                borderRadius: "50%",
                borderColor: "transparent",
                borderWidth: "1px",
                align: "center",
                width: "62px",
                height: "60px",
                margin: "-2px -2px -2px -3px",
                justifyContent: "center",
                backgroundSize: "65% 65%",
                backgroundImage: `url(${ModernChatIconBase64})`,
                display: "flex",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center"
            },
            notificationBubbleStyleProps: {
                backgroundColor: "#cc4a31",
                borderRadius: "50%",
                color: "#fff",
                padding: "1px",
                fontWeight: "bold",
                lineHeight: "22px",
                fontStyle: "normal",
                top: "-5px",
                textAlign: "center",
                position: "absolute",
                fontSize: "14px",
                fontFamily: "Segoe UI,Arial,sans-serif",
                minHeight: "24px",
                minWidth: "24px"
            },
            textContainerStyleProps: {
                flexDirection: "column",
                justifyContent: "center",
                display: "flex"
            },
            titleStyleProps: {
                fontWeight: "bold",
                fontSize: "16px",
                height: "22px",
                color: "#262626",
                textOverflow: "ellipsis !important",
                lineHeight: "19px",
                fontFamily: "'Segoe UI',Arial,sans-serif",
                display: "block",
                margin: "0px 14px 0px 14px",
                width: "90px",
                cursor: "pointer",
                overflow: "hidden",
                padding: "0px",
                whiteSpace: "nowrap"
            },
            subtitleStyleProps: {
                fontSize: "12px",
                fontWeight: "200",
                color: "#666",
                overflow: "hidden",
                padding: "0px",
                fontFamily: "'Segoe UI',Arial,sans-serif",
                display: "block",
                alignItems: "center",
                margin: "0px 14px 0px 14px",
                textOverflow: "ellipsis !important",
                width: "90px",
                whiteSpace: "nowrap",
                cursor: "pointer"
            },
            classNames: {
                titleClassName: undefined,
                subtitleClassName: undefined,
                textContainerClassName: undefined,
                notificationBubbleClassName: undefined,
                iconContainerClassName: undefined
            }
        }
    },
    chatConfig: undefined,
    chatSDK: undefined as unknown as OmnichannelChatSDK, // Mandatory
    componentOverrides: {
        chatButton: undefined,
        confirmationPane: undefined,
        footer: undefined,
        emailTranscriptPane: undefined,
        header: undefined,
        loadingPane: undefined,
        outOfOfficeHoursPane: undefined,
        postChatLoadingPane: undefined,
        proactiveChatPane: undefined,
        reconnectChatPane: undefined,
        webChatContainer: undefined,
    },
    confirmationPaneProps: {
        componentOverrides: {
            title: undefined,
            subtitle: undefined,
            confirmButton: undefined,
            cancelButton: undefined
        },
        controlProps: {
            id: "oc-lcw-confirmation-pane",
            dir: "ltr",
            hideConfirmationPane: false,
            hideTitle: false,
            titleText: "Close chat",
            hideSubtitle: false,
            subtitleText: "Do you really want to close this chat?",
            hideConfirmButton: false,
            confirmButtonText: "Close",
            confirmButtonAriaLabel: "Close Chat",
            hideCancelButton: false,
            cancelButtonText: "Cancel",
            cancelButtonAriaLabel: "Cancel. Return to Chat",
            brightnessValueOnDim: "0.2",
            // onConfirm: () => { }, // Detailed implementation omitted
            // onCancel: () => { } // Detailed implementation omitted
        },
        styleProps: {
            generalStyleProps: {
                display: "flex",
                minHeight: "160px",
                maxHeight: "300px",
                boxSizing: "border-box",
                backgroundColor: "#FFFFFF",
                borderRadius: "2px",
                color: "black",
                fontFamily: "Segoe UI, Arial, sans-serif",
                fontSize: "14px",
                padding: "10px 20px",
                position: "absolute",
                justifyContent: "center",
                alignItems: "center",
                flexFlow: "column",
                zIndex: "9999",
                left: "26px",
                right: "26px"
            },
            titleStyleProps: {
                color: "#323130",
                fontFamily: "Segoe UI, Arial, sans-serif",
                fontSize: "16px",
                fontWeight: "500",
                margin: "10px 0 0 0",
                width: "100%",
                textAlign: "center"
            },
            subtitleStyleProps: {
                color: "#605e5c",
                fontFamily: "Segoe UI, Arial, sans-serif",
                fontSize: "14px",
                fontWeight: "400",
                margin: "14px 0px",
                width: "100%",
                textAlign: "center"
            },
            buttonGroupStyleProps: {
                display: "flex",
                width: "auto",
                height: "auto",
                boxSizing: "border-box",
                flexFlow: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
                marginBottom: "10px"
            },
            confirmButtonStyleProps: {
                backgroundColor: "rgba(9,72,159,1)",
                color: "#FFFFFF",
                fontFamily: "Segoe UI, Arial, sans-serif",
                fontSize: "14px",
                fontWeight: "500",
                height: "32px",
                width: "80px"
            },
            confirmButtonHoveredStyleProps: {
                backgroundColor: "rgba(9,72,159,0.8)"
            },
            confirmButtonFocusedStyleProps: {
                border: "2px dotted #000"
            },
            cancelButtonStyleProps: {
                backgroundColor: "#FFFFFF",
                fontFamily: "Segoe UI, Arial, sans-serif",
                fontSize: "14px",
                fontWeight: "500",
                height: "32px",
                width: "80px"
            },
            cancelButtonHoveredStyleProps: {
                backgroundColor: "#EFEFEF"
            },
            cancelButtonFocusedStyleProps: {
                border: "2px dotted #000"
            },
            classNames: {
                titleClassName: undefined,
                subtitleClassName: undefined,
                buttonGroupClassName: undefined,
                confirmButtonClassName: undefined,
                cancelButtonClassName: undefined
            }
        },
        confirmationPaneLocalizedTexts: {
            CLOSE_CONFIRMATION_DIALOG_TITLE_FOR_EMAIL_AND_DOWNLOAD_TRANSCRIPT_ENABLED: "Want a copy of this chat?",
            CLOSE_CONFIRMATION_DIALOG_DESCRIPTION_FOR_EMAIL_AND_DOWNLOAD_TRANSCRIPT_ENABLED: "Select Cancel and then select the download or email icon",
            CLOSE_CONFIRMATION_DIALOG_TITLE_FOR_EMAIL_TRANSCRIPT_ENABLED: "Want a copy of this chat?",
            CLOSE_CONFIRMATION_DIALOG_DESCRIPTION_FOR_EMAIL_TRANSCRIPT_ENABLED: "Select Cancel and then select the email icon.",
            CLOSE_CONFIRMATION_DIALOG_TITLE_FOR_DOWNLOAD_TRANSCRIPT_ENABLED: "Want a copy of this chat?",
            CLOSE_CONFIRMATION_DIALOG_DESCRIPTION_FOR_DOWNLOAD_TRANSCRIPT_ENABLED: "Select Cancel and then select the download icon.",
            CLOSE_CONFIRMATION_DIALOG_TITLE_DEFAULT: "Close Chat",
            CLOSE_CONFIRMATION_DIALOG_DESCRIPTION_DEFAULT: "Do you really want to close this chat?"
        }
    },
    controlProps: {
        id: "oc-lcw",
        hideCallingContainer: false,
        hideChatButton: false,
        hideConfirmationPane: false,
        hideErrorUIPane: false,
        hideFooter: false,
        hideHeader: false,
        hideLoadingPane: false,
        hideOutOfOfficeHoursPane: false,
        hidePostChatLoadingPane: false,
        hidePreChatSurveyPane: false,
        hideProactiveChatPane: false,
        hideReconnectChatPane: false,
        hideWebChatContainer: false,
        hideStartChatButton: false
    },
    downloadTranscriptProps: {
        bannerMessageOnError: "Download transcript failed.",
        renderMarkDown: undefined,
        attachmentMessage: "The following attachment was uploaded during the conversation:"
    },
    emailTranscriptPane: {
        componentOverrides: {
            title: undefined,
            subtitle: undefined,
            input: undefined,
            invalidInputErrorMessage: undefined,
            sendButton: undefined,
            cancelButton: undefined
        },
        controlProps: {
            id: "oclcw-emailTranscriptDialogContainer",
            dir: "ltr",
            hideInputValidationPane: false,
            inputValidationPaneAriaLabel: "Email Chat Transcript Pane",
            hideTitle: false,
            titleText: "Please provide e-mail address to send transcript.",
            hideSubtitle: false,
            subtitleText: "The transcript will be sent after the chat ends.",
            inputId: "oclcw-emailTranscriptDialogTextField",
            inputInitialText: "",
            hideInput: false,
            inputAriaLabel: "Please provide e-mail address to send transcript. The transcript will be sent after the chat ends.",
            inputWithErrorMessageBorderColor: "rgb(164, 38, 44)",
            invalidInputErrorMessageText: "Enter a valid email address.",
            isButtonGroupHorizontal: true,
            hideSendButton: false,
            enableSendButton: undefined,
            sendButtonText: "Send",
            sendButtonAriaLabel: "Send",
            hideCancelButton: false,
            cancelButtonText: "Cancel",
            cancelButtonAriaLabel: "Cancel",
            brightnessValueOnDim: "0.2",
            onSend: undefined,
            onCancel: undefined,
            checkInput: undefined,
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
            sendButtonHoveredStyleProps: {},
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
            },
            cancelButtonHoveredStyleProps: {},
            classNames: {
                containerClassName: undefined,
                headerGroupClassName: undefined,
                titleClassName: undefined,
                subtitleClassName: undefined,
                inputClassName: undefined,
                invalidInputErrorMessageClassName: undefined,
                buttonGroupClassName: undefined,
                sendButtonClassName: undefined,
                cancelButtonClassName: undefined
            }
        },
        bannerMessageOnError: "Email transcript to <email> failed.",
        attachmentMessage: "The following attachment was uploaded during the conversation:"
    },
    footerProps: {
        componentOverrides: {
            DownloadTranscriptButton: undefined,
            EmailTranscriptButton: undefined,
            AudioNotificationButton: undefined
        },
        controlProps: { // BUG
            id: "oc-lcw-footer",
            leftGroup: { children: [] },
            middleGroup: { children: [] },
            rightGroup: { children: [] },
            hideDownloadTranscriptButton: false,
            hideEmailTranscriptButton: false,
            hideAudioNotificationButton: false,
            // onDownloadTranscriptClick: () => { }, // Detailed implementation omitted
            // onEmailTranscriptClick: () => { }, // Detailed implementation omitted
            // onAudioNotificationClick: () => { }, // Detailed implementation omitted
            downloadTranscriptButtonProps: {
                id: "oc-lcw-footer-downloadtranscript-button",
                type: "icon",
                iconName: "Download",
                ariaLabel: "Download chat transcript",
                isAudioMuted: undefined,
                iconSize: undefined,
                imageIconProps: undefined,
                toggleIconName: undefined,
                imageToggleIconProps: undefined,
                toggleAriaLabel: undefined,
                text: "Download chat transcript",
                onClick: undefined,
                className: undefined,
                disabled: undefined
            },
            emailTranscriptButtonProps: {
                id: "oc-lcw-footer-emailtranscript-button",
                type: "icon",
                iconName: "Mail",
                ariaLabel: "Email Transcript",
                isAudioMuted: undefined,
                iconSize: undefined,
                imageIconProps: undefined,
                toggleIconName: undefined,
                imageToggleIconProps: undefined,
                toggleAriaLabel: undefined,
                text: "Email Transcript",
                onClick: undefined,
                className: undefined,
                disabled: undefined
            },
            audioNotificationButtonProps: {
                id: "oc-lcw-footer-audionotification-button",
                type: "icon",
                ariaLabel: "Turn sound off",
                toggleAriaLabel: "Turn sound on",
                iconName: "Volume3",
                toggleIconName: "Volume0",
                isAudioMuted: undefined,
                iconSize: undefined,
                imageIconProps: undefined,
                imageToggleIconProps: undefined,
                text: "Audio Notification off",
                onClick: undefined,
                className: undefined,
                disabled: undefined
            },
            dir: "ltr"
        },
        styleProps: {
            generalStyleProps: {
                background: "#fff",
                borderRadius: "0 0 4px 4px",
                minHeight: "25px",
                width: "100%",
                minWidth: "250px",
                padding: "5px"
            },
            downloadTranscriptButtonStyleProps: {
                icon: {
                    color: "blue",
                    fontSize: 16,
                },
                height: "25px",
                lineHeight: "25px",
                width: "25px"
            },
            downloadTranscriptButtonHoverStyleProps: {
                filter: "brightness(0.8)",
                backgroundColor: "#C8C8C8"
            },
            emailTranscriptButtonStyleProps: {
                cicon: {
                    color: "blue",
                    fontSize: 16,
                },
                height: "25px",
                lineHeight: "25px",
                width: "25px"
            },
            emailTranscriptButtonHoverStyleProps: {
                filter: "brightness(0.8)",
                backgroundColor: "#C8C8C8"
            },
            audioNotificationButtonStyleProps: {
                icon: {
                    color: "blue",
                    fontSize: 16,
                },
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
    },
    headerProps: {
        componentOverrides: {
            headerIcon: undefined,
            headerTitle: undefined,
            headerMinimizeButton: undefined,
            headerCloseButton: undefined
        },
        controlProps: {
            id: "oc-lcw-header",
            leftGroup: { children: [] },
            middleGroup: { children: [] },
            rightGroup: { children: [] },
            hideIcon: false,
            hideTitle: false,
            hideMinimizeButton: false,
            hideCloseButton: false,
            // onMinimizeClick: () => { }, // Detailed implementation omitted
            // onCloseClick: () => { }, // Detailed implementation omitted
            minimizeButtonProps: {
                id: "oc-lcw-header-minimize-button",
                type: "icon",
                iconName: "ChromeMinimize",
                ariaLabel: "Minimize",
                imageIconProps: undefined,
                text: "Minimize",
                onClick: undefined,
                className: undefined
            },
            closeButtonProps: {
                id: "oc-lcw-header-close-button",
                type: "icon",
                iconName: "ChromeClose",
                ariaLabel: "Close",
                imageIconProps: undefined,
                text: "Close",
                onClick: undefined,
                className: undefined
            },
            headerIconProps: {
                id: "oc-lcw-header-icon",
                src: ModernChatIconBase64,
                alt: "Chat Icon",
                className: undefined
            },
            headerTitleProps: {
                id: "oc-lcw-header-title",
                text: "Let's Chat",
                className: undefined
            },
            dir: "ltr"
        },
        styleProps: {
            generalStyleProps: {
                background: "#315fa2",
                borderRadius: "4px 4px 0 0",
                padding: "5px",
                minHeight: "50px",
                width: "100%",
                minWidth: "250px"
            },
            iconStyleProps: {
                height: "30px",
                width: "30px",
                margin: "5px 10px"
            },
            titleStyleProps: {
                fontSize: 16,
                fontFamily: "Segoe UI, Arial, sans-serif",
                fontWeight: "450",
                color: "#FFFFFF",
                padding: "3px 0"
            },
            minimizeButtonStyleProps: {
                color: "#FFFFFF",
                margin: "5px 0",
                fontSize: "12px"
            },
            closeButtonStyleProps: {
                color: "#FFFFFF",
                margin: "5px 0",
                fontSize: "12px"
            },
            closeButtonHoverStyleProps: {
                filter: "brightness(0.8)"
            },
            minimizeButtonHoverStyleProps: {
                filter: "brightness(0.8)"
            },
            headerItemFocusStyleProps: {
                border: "2px dotted #000"
            }
        }
    },
    loadingPaneProps: {
        componentOverrides: {
            icon: undefined,
            title: undefined,
            subtitle: undefined,
            spinner: undefined,
            spinnerText: undefined
        },
        controlProps: {
            id: "oc-lcw-loading-pane",
            role: undefined,
            dir: "auto",
            hideLoadingPane: false,
            hideIcon: false,
            hideTitle: false,
            titleText: "Welcome to",
            hideSubtitle: false,
            subtitleText: "live chat support ...",
            hideSpinner: false,
            spinnerSize: undefined,
            hideSpinnerText: false,
            spinnerText: "Loading ..."
        },
        styleProps: {
            generalStyleProps: {
                width: "100%",
                height: "100%",
                borderStyle: "solid",
                backgroundColor: "#315fa2",
                borderColor: "#F1F1F1",
                justifyContent: "center",
                alignItems: "center",
                position: "initial",
                left: "0%",
                top: "0%",
                borderRadius: "0 0 4px 4px",
                borderWidth: "0px",
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
                alignSelf: "auto",
                overflow: "visible"
            },
            iconImageProps: {
                src: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxnIGZpbHRlcj0idXJsKCNmaWx0ZXIwX2lpKSI+DQo8cGF0aCBkPSJNMTUuMTk3MSAxNi4yNzI1VjI1Ljg1MjRDMTUuMTk3MSAyNy4zODExIDE1Ljg0MDEgMjcuNTIwMSAxNi45ODMyIDI3LjUyMDFMMjYuNzA4NCAyNy41NjQ5TDMxLjAwMzkgMzIuMzEyM1YyNy41NjQ5SDMxLjg5N0MzMi4xNzQzIDI3LjU2MzcgMzIuNDQ4NyAyNy41MDc3IDMyLjcwNDUgMjcuNDAwMUMzMi45NjAzIDI3LjI5MjQgMzMuMTkyNSAyNy4xMzUzIDMzLjM4NzggMjYuOTM3NUMzMy41ODMxIDI2LjczOTggMzMuNzM3NyAyNi41MDU0IDMzLjg0MjcgMjYuMjQ3N0MzMy45NDc4IDI1Ljk5IDM0LjAwMTMgMjUuNzE0IDM0LjAwMDEgMjUuNDM1NVYxNi4zMDM4QzM0LjAwMTMgMTYuMDI1NCAzMy45NDc4IDE1Ljc0OTQgMzMuODQyNyAxNS40OTE3QzMzLjczNzcgMTUuMjM0IDMzLjU4MzEgMTQuOTk5NiAzMy4zODc4IDE0LjgwMThDMzMuMTkyNSAxNC42MDQxIDMyLjk2MDMgMTQuNDQ2OSAzMi43MDQ1IDE0LjMzOTNDMzIuNDQ4NyAxNC4yMzE2IDMyLjE3NDMgMTQuMTc1NiAzMS44OTcgMTQuMTc0NEwxNy4zMDQ3IDE0LjE0MzFDMTcuMDI2OSAxNC4xNDM3IDE2Ljc1MiAxNC4xOTkyIDE2LjQ5NTcgMTQuMzA2NkMxNi4yMzk0IDE0LjQxNCAxNi4wMDY3IDE0LjU3MTEgMTUuODEwOSAxNC43Njg5QzE1LjYxNTIgMTQuOTY2NyAxNS40NjAyIDE1LjIwMTMgMTUuMzU0OCAxNS40NTkzQzE1LjI0OTUgMTUuNzE3MyAxNS4xOTU5IDE1Ljk5MzYgMTUuMTk3MSAxNi4yNzI1WiIgZmlsbD0iI0Q2RDZENiIvPg0KPC9nPg0KPGcgZmlsdGVyPSJ1cmwoI2ZpbHRlcjFfZGlpKSI+DQo8cGF0aCBkPSJNMjcuODczNSA2LjY5ODg3VjE4Ljg0MDlDMjcuODczNSAyMC43Nzg1IDI3LjA1NzIgMjAuOTU0NiAyNS42MDU4IDIwLjk1NDZMMTMuMjU4IDIxLjAxMTRMNy44MDQxNCAyNy4wMjg1VjIxLjAxMTRINi42NzAyN0M2LjMxODEyIDIxLjAwOTkgNS45Njk3MSAyMC45Mzg5IDUuNjQ0OTMgMjAuODAyNUM1LjMyMDE2IDIwLjY2NjEgNS4wMjUzOCAyMC40NjY4IDQuNzc3NDIgMjAuMjE2MkM0LjUyOTQ2IDE5Ljk2NTYgNC4zMzMxOSAxOS42Njg1IDQuMTk5OCAxOS4zNDE5QzQuMDY2NDIgMTkuMDE1MiAzLjk5ODUzIDE4LjY2NTUgNC4wMDAwMiAxOC4zMTI1VjYuNzM4NjRDMy45OTg1MyA2LjM4NTcxIDQuMDY2NDIgNi4wMzU5NSA0LjE5OTggNS43MDkzMUM0LjMzMzE5IDUuMzgyNjcgNC41Mjk0NiA1LjA4NTU3IDQuNzc3NDIgNC44MzQ5NUM1LjAyNTM4IDQuNTg0MzQgNS4zMjAxNiA0LjM4NTEzIDUuNjQ0OTMgNC4yNDg2OUM1Ljk2OTcxIDQuMTEyMjUgNi4zMTgxMiA0LjA0MTI2IDYuNjcwMjcgNC4wMzk3N0wyNS4xOTc2IDRDMjUuNTUwMiA0LjAwMDc0IDI1Ljg5OTMgNC4wNzExOCAyNi4yMjQ3IDQuMjA3MjlDMjYuNTUwMSA0LjM0MzM5IDI2Ljg0NTYgNC41NDI0OSAyNy4wOTQxIDQuNzkzMThDMjcuMzQyNyA1LjA0Mzg2IDI3LjUzOTUgNS4zNDEyMiAyNy42NzMyIDUuNjY4MjNDMjcuODA3IDUuOTk1MjMgMjcuODc1IDYuMzQ1NDYgMjcuODczNSA2LjY5ODg3WiIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyKSIvPg0KPC9nPg0KPGRlZnM+DQo8ZmlsdGVyIGlkPSJmaWx0ZXIwX2lpIiB4PSIxNS4xOTcxIiB5PSIxNC4xNDMxIiB3aWR0aD0iMTguODAzMSIgaGVpZ2h0PSIxOC4xNjkzIiBmaWx0ZXJVbml0cz0idXNlclNwYWNlT25Vc2UiIGNvbG9yLWludGVycG9sYXRpb24tZmlsdGVycz0ic1JHQiI+DQo8ZmVGbG9vZCBmbG9vZC1vcGFjaXR5PSIwIiByZXN1bHQ9IkJhY2tncm91bmRJbWFnZUZpeCIvPg0KPGZlQmxlbmQgbW9kZT0ibm9ybWFsIiBpbj0iU291cmNlR3JhcGhpYyIgaW4yPSJCYWNrZ3JvdW5kSW1hZ2VGaXgiIHJlc3VsdD0ic2hhcGUiLz4NCjxmZUNvbG9yTWF0cml4IGluPSJTb3VyY2VBbHBoYSIgdHlwZT0ibWF0cml4IiB2YWx1ZXM9IjAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDEyNyAwIiByZXN1bHQ9ImhhcmRBbHBoYSIvPg0KPGZlT2Zmc2V0IGR4PSItMC4yIiBkeT0iLTAuMiIvPg0KPGZlQ29tcG9zaXRlIGluMj0iaGFyZEFscGhhIiBvcGVyYXRvcj0iYXJpdGhtZXRpYyIgazI9Ii0xIiBrMz0iMSIvPg0KPGZlQ29sb3JNYXRyaXggdHlwZT0ibWF0cml4IiB2YWx1ZXM9IjAgMCAwIDAgMSAwIDAgMCAwIDEgMCAwIDAgMCAxIDAgMCAwIDAuMTcgMCIvPg0KPGZlQmxlbmQgbW9kZT0ibm9ybWFsIiBpbjI9InNoYXBlIiByZXN1bHQ9ImVmZmVjdDFfaW5uZXJTaGFkb3ciLz4NCjxmZUNvbG9yTWF0cml4IGluPSJTb3VyY2VBbHBoYSIgdHlwZT0ibWF0cml4IiB2YWx1ZXM9IjAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDEyNyAwIiByZXN1bHQ9ImhhcmRBbHBoYSIvPg0KPGZlT2Zmc2V0IGR4PSItMC41IiBkeT0iLTAuNSIvPg0KPGZlQ29tcG9zaXRlIGluMj0iaGFyZEFscGhhIiBvcGVyYXRvcj0iYXJpdGhtZXRpYyIgazI9Ii0xIiBrMz0iMSIvPg0KPGZlQ29sb3JNYXRyaXggdHlwZT0ibWF0cml4IiB2YWx1ZXM9IjAgMCAwIDAgMSAwIDAgMCAwIDEgMCAwIDAgMCAxIDAgMCAwIDAuMTYgMCIvPg0KPGZlQmxlbmQgbW9kZT0ibm9ybWFsIiBpbjI9ImVmZmVjdDFfaW5uZXJTaGFkb3ciIHJlc3VsdD0iZWZmZWN0Ml9pbm5lclNoYWRvdyIvPg0KPC9maWx0ZXI+DQo8ZmlsdGVyIGlkPSJmaWx0ZXIxX2RpaSIgeD0iMCIgeT0iMCIgd2lkdGg9IjM5Ljg3MzYiIGhlaWdodD0iMzkuMDI4NSIgZmlsdGVyVW5pdHM9InVzZXJTcGFjZU9uVXNlIiBjb2xvci1pbnRlcnBvbGF0aW9uLWZpbHRlcnM9InNSR0IiPg0KPGZlRmxvb2QgZmxvb2Qtb3BhY2l0eT0iMCIgcmVzdWx0PSJCYWNrZ3JvdW5kSW1hZ2VGaXgiLz4NCjxmZUNvbG9yTWF0cml4IGluPSJTb3VyY2VBbHBoYSIgdHlwZT0ibWF0cml4IiB2YWx1ZXM9IjAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDEyNyAwIi8+DQo8ZmVPZmZzZXQgZHg9IjQiIGR5PSI0Ii8+DQo8ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSI0Ii8+DQo8ZmVDb2xvck1hdHJpeCB0eXBlPSJtYXRyaXgiIHZhbHVlcz0iMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMC4yNSAwIi8+DQo8ZmVCbGVuZCBtb2RlPSJub3JtYWwiIGluMj0iQmFja2dyb3VuZEltYWdlRml4IiByZXN1bHQ9ImVmZmVjdDFfZHJvcFNoYWRvdyIvPg0KPGZlQmxlbmQgbW9kZT0ibm9ybWFsIiBpbj0iU291cmNlR3JhcGhpYyIgaW4yPSJlZmZlY3QxX2Ryb3BTaGFkb3ciIHJlc3VsdD0ic2hhcGUiLz4NCjxmZUNvbG9yTWF0cml4IGluPSJTb3VyY2VBbHBoYSIgdHlwZT0ibWF0cml4IiB2YWx1ZXM9IjAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDEyNyAwIiByZXN1bHQ9ImhhcmRBbHBoYSIvPg0KPGZlT2Zmc2V0IGR4PSItMiIgZHk9Ii0yIi8+DQo8ZmVDb21wb3NpdGUgaW4yPSJoYXJkQWxwaGEiIG9wZXJhdG9yPSJhcml0aG1ldGljIiBrMj0iLTEiIGszPSIxIi8+DQo8ZmVDb2xvck1hdHJpeCB0eXBlPSJtYXRyaXgiIHZhbHVlcz0iMCAwIDAgMCAxIDAgMCAwIDAgMSAwIDAgMCAwIDEgMCAwIDAgMC4xNyAwIi8+DQo8ZmVCbGVuZCBtb2RlPSJub3JtYWwiIGluMj0ic2hhcGUiIHJlc3VsdD0iZWZmZWN0Ml9pbm5lclNoYWRvdyIvPg0KPGZlQ29sb3JNYXRyaXggaW49IlNvdXJjZUFscGhhIiB0eXBlPSJtYXRyaXgiIHZhbHVlcz0iMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMTI3IDAiIHJlc3VsdD0iaGFyZEFscGhhIi8+DQo8ZmVPZmZzZXQgZHg9Ii0xIiBkeT0iLTEiLz4NCjxmZUNvbXBvc2l0ZSBpbjI9ImhhcmRBbHBoYSIgb3BlcmF0b3I9ImFyaXRobWV0aWMiIGsyPSItMSIgazM9IjEiLz4NCjxmZUNvbG9yTWF0cml4IHR5cGU9Im1hdHJpeCIgdmFsdWVzPSIwIDAgMCAwIDEgMCAwIDAgMCAxIDAgMCAwIDAgMSAwIDAgMCAwLjE2IDAiLz4NCjxmZUJsZW5kIG1vZGU9Im5vcm1hbCIgaW4yPSJlZmZlY3QyX2lubmVyU2hhZG93IiByZXN1bHQ9ImVmZmVjdDNfaW5uZXJTaGFkb3ciLz4NCjwvZmlsdGVyPg0KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDBfbGluZWFyIiB4MT0iLTAuMzk1MDAxIiB5MT0iMjMuMTI4MiIgeDI9IjIwLjEwNTgiIHkyPSIzNy44NDc0IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+DQo8c3RvcCBzdG9wLWNvbG9yPSIjRUZFRkVGIi8+DQo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IndoaXRlIi8+DQo8L2xpbmVhckdyYWRpZW50Pg0KPC9kZWZzPg0KPC9zdmc+DQo=",
                imageFit: 0,
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
            },
            classNames: {
                iconClassName: undefined,
                titleClassName: undefined,
                subtitleClassName: undefined,
                spinnerClassName: undefined,
                spinnerTextClassName: undefined
            }
        }
    },
    outOfOfficeChatButtonProps: { // Same interface as chatButtonProps, thus omitting undefined attributes here
        componentOverrides: undefined,
        controlProps: {
            // ...[Existing chat button control props]
            id: "oc-lcw-chat-button",
            titleText: "We're Offline",
            subtitleText: "No agents available",
            // onClick: () => { } // Detailed implementation omitted
        },
        styleProps: {
            // ...[Existing chat button style props]
            iconStyleProps: {
                backgroundColor: "#000000"
            }
        }
    },
    outOfOfficeHeaderProps: { // Same interface as headerProps, thus omitting undefined attributes here
        componentOverrides: undefined,
        controlProps: {
            // ...[Existing chat button control props]
            id: "oc-lcw-header",
            headerTitleProps: {
                text: "We're Offline"
            },
            // onMinimizeClick: () => { } // Detailed implementation omitted
        },
        styleProps: {
            // ...[Existing chat button style props]
            generalStyleProps: {
                // ...[Existing chat button general style props]
                borderRadius: "0px",
                backgroundColor: "#000000",
                height: "40px"
            },
            titleStyleProps: {
                // ...[Existing chat button title style props]
                margin: "0 0 0 10px",
                color: "#FFFFFF"
            }
        }
    },
    outOfOfficeHoursPaneProps: {
        componentOverrides: {
            title: undefined
        },
        controlProps: {
            id: "oc-lcw-outofofficehours-pane",
            role: undefined,
            dir: "auto",
            hideOOOHPane: false,
            hideTitle: false,
            titleText: "Thanks for contacting us. You have reached us outside of our operating hours. An agent will respond when we open. Please see link https://microsoft.com",
            openLinkInNewTab: true
        },
        styleProps: {
            generalStyleProps: {
                borderStyle: "solid",
                width: "100%",
                height: "100%",
                borderRadius: "0px 0px 4px 4px",
                borderWidth: "3px",
                backgroundColor: "#FFFFFF",
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
            },
            classNames: {
                containerClassName: undefined,
                titleClassName: undefined
            }
        }
    },
    postChatLoadingPaneProps: { // Same interface as loadingPaneProps, thus omitting undefined attributes here
        componentOverrides: undefined,
        controlProps: {
            // ...[Existing loading pane control props]
            id: "oc-lcw-postchatloading-pane",
            hideIcon: true,
            hideTitle: true,
            hideSpinner: true,
            hideSpinnerText: true,
            subtitleText: "Please take a moment to give us feedback about your chat experience. We are loading the survey for you now."
        },
        styleProps: {
            // ...[Existing loading pane style props]
            generalStyleProps: {
                position: "initial",
                width: "100%",
                height: "100%",
                left: "0%",
                top: "0%",
                borderRadius: "0 0 4px 4px",
                borderWidth: "0px",
                backgroundColor: "#315FA2"
            }
        }
    },
    postChatSurveyPaneProps: {
        controlProps: {
            id: "oc-lcw-postchatsurvey-pane",
            role: undefined,
            title: "Post chat survey pane",
            surveyURL: ""
        },
        styleProps: {
            generalStyleProps: {
                borderStyle: "solid",
                borderRadius: "0 0 4px 4px",
                borderWidth: "3px",
                backgroundColor: "#FFFFFF",
                borderColor: "#F1F1F1",
                position: "initial",
                height: "100%",
                width: "100%",
                left: "0%",
                top: "0%",
                display: "contents"
            }
        },
        isCustomerVoiceSurveyCompact: undefined
    },
    preChatSurveyPaneProps: {
        controlProps: {
            id: "oc-lcw-prechatsurveypane-default",
            dir: "auto",
            hidePreChatSurveyPane: false,
            adaptiveCardHostConfig: "{\"fontFamily\":\"Segoe UI, Helvetica Neue, sans-serif\",\"containerStyles\":{\"default\":{\"foregroundColors\":{\"default\":{\"default\":\"#000000\"}},\"backgroundColor\":\"#FFFFFF\"}},\"actions\":{\"actionsOrientation\":\"Vertical\",\"actionAlignment\":\"stretch\"}}",
            payload: "{\"$schema\":\"http://adaptivecards.io/schemas/adaptive-card.json\",\"type\":\"AdaptiveCard\",\"version\":\"1.1\",\"body\":[{\"type\":\"TextBlock\",\"weight\":\"bolder\",\"text\":\"Please answer below questions.\"},{\"type\":\"Input.Text\",\"id\":\"1e5e4e7a-8f0b-ec11-b6e6-000d3a305d38\",\"label\":\"name pls?\",\"maxLength\":100,\"isRequired\":true,\"errorMessage\":\"Name is required\"},{\"type\":\"Input.Text\",\"id\":\"7f8f5d6d-995e-ec11-8f8f-000d3a31376e\",\"label\":\"multi\\nmulti\\nmulti\",\"style\":\"text\",\"isMultiline\":true,\"maxLength\":250},{\"type\":\"Input.ChoiceSet\",\"id\":\"e4bdf7cb-995e-ec11-8f8f-000d3a31376e\",\"label\":\"options\",\"isMultiSelect\":false,\"value\":\"1\",\"style\":\"compact\",\"choices\":[{\"title\":\"one\",\"value\":\"1\"},{\"title\":\"two\",\"value\":\"2\"},{\"title\":\"three\",\"value\":\"3\"}]},{\"type\":\"Input.Toggle\",\"id\":\"b26011d2-995e-ec11-8f8f-000d3a31376e\",\"title\":\"consent\",\"valueOn\":\"True\",\"valueOff\":\"False\",\"value\":\"false\"},{\"type\":\"TextBlock\",\"isSubtle\":true,\"text\":\"Fields marked with * are mandatory.\",\"wrap\":true}],\"actions\":[{\"type\":\"Action.Submit\",\"title\":\"Submit\",\"data\":{\"Type\":\"InputSubmit\"}}]}",
            // onSubmit: function () {} // Detailed implementation omitted
        },
        styleProps: {
            generalStyleProps: {
                borderStyle: "solid",
                borderRadius: "4px",
                borderWidth: "0px",
                backgroundColor: "#FFFFFF",
                borderColor: "#F1F1F1",
                overflowY: "auto",
                height: "inherit",
                width: "inherit"
            },
            customButtonStyleProps: {
                backgroundColor: "rgb(49, 95, 162)",
                color: "#FFFFFF",
                fontFamily: "Segoe UI, Arial, sans-serif",
                fontSize: "15px",
                height: "48px"
            },
            adaptiveCardContainerStyleProps: {
                border: "1px solid #ECECEC",
                borderRadius: "4px",
                margin: "3%"
            },
            customTextInputStyleProps: {
                height: "20px"
            },
            customMultilineTextInputStyleProps: {
                height: "52px"
            }
        }
    },
    proactiveChatPaneProps: {
        componentOverrides: {
            title: undefined,
            subtitle: undefined,
            closeButton: undefined,
            bodyTitle: undefined,
            startButton: undefined
        },
        controlProps: {
            id: "oc-lcw-proactivechat",
            dir: "ltr",
            hideProactiveChatPane: false,
            proactiveChatPaneAriaLabel: "Proactive Chat Pane",
            hideTitle: false,
            titleText: "Welcome to",
            hideSubtitle: false,
            subtitleText: "Live chat support!",
            hideCloseButton: false,
            closeButtonProps: {
                id: "oc-lcw-proactivechat-closebutton",
                type: "icon",
                iconName: "ChromeClose",
                ariaLabel: "Close",
                imageIconProps: undefined,
                text: "Close",
                onClick: undefined,
                className: undefined,
                hideButtonTitle: true
            },
            isBodyContainerHorizantal: false,
            hideBodyTitle: false,
            bodyTitleText: "Hi! Have any questions? I am here to help.",
            hideStartButton: false,
            startButtonText: "Chat Now",
            startButtonAriaLabel: "Chat Now",
            // onClose: () => { }, // Detailed implementation omitted
            // onStart: () => { } // Detailed implementation omitted
        },
        styleProps: {
            generalStyleProps: {
                backgroundColor: "rgb(255, 255, 255)",
                borderRadius: "8px",
                boxShadow: "0 0 4px rgb(102 102 102 / 50%)",
                bottom: "0",
                height: "auto",
                margin: "3px",
                minHeight: "133px",
                position: "absolute",
                right: "0",
                width: "245px",
                zIndex: "9999"
            },
            headerContainerStyleProps: {
                backgroundColor: "rgb(49, 95, 162)",
                backgroundImage: `url(${ProactiveChatBannerBase64})`,
                backgroundPosition: "initial",
                backgroundRepeat: "no-repeat",
                borderTopLeftRadius: "inherit",
                borderTopRightRadius: "inherit",
                height: "90px",
                padding: "10px 16px 10px 16px"
            },
            textContainerStyleProps: {
                color: "rgb(255, 255, 255)",
                fontFamily: "'Segoe UI', Arial, sans-serif",
                fontSize: "14px",
                fontStyle: "normal",
                fontWeight: "400",
                lineHeight: "19px",
                width: "95%"
            },
            titleStyleProps: {
                color: "rgb(255, 255, 255)",
                fontFamily: "'Segoe UI', Arial, sans-serif",
            },
            subtitleStyleProps: {
                color: "rgb(255, 255, 255)",
                fontFamily: "'Segoe UI', Arial, sans-serif",
                fontSize: "18px",
                fontWeight: "600"
            },
            closeButtonStyleProps: {
                backgroundImage: `url(${CloseChatButtonIconBase64})`,
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                color: "#605e5c",
                cursor: "pointer",
                height: "14px",
                lineHeight: "14px",
                textAlign: "center",
                width: "14px",
                zIndex: "inherit"
            },
            closeButtonHoveredStyleProps: {
                backgroundColor: "",
                color: ""
            },
            bodyContainerStyleProps: {},
            bodyTitleStyleProps: {
                color: "rgb(0, 0, 0)",
                display: "inline-block",
                fontFamily: "'Segoe UI', Arial, sans-serif",
                fontSize: "14px",
                lineHeight: "19px",
                padding: "16px",
                overflow: "hidden",
                wordBreak: "break-word"
            },
            startButtonStyleProps: {
                backgroundColor: "rgb(49, 95, 162)",
                borderRadius: "40px",
                color: "rgb(255, 255, 255)",
                cursor: "pointer",
                fontFamily: "'Segoe UI', Arial, sans-serif",
                margin: "20px 16px 20px 16px",
                padding: "6px 23px 6px 23px",
                width: "50%",
                zIndex: "inherit"
            },
            startButtonHoveredStyleProps: {
                backgroundColor: "",
                color: ""
            },
            classNames: {
                containerClassName: undefined,
                headerContainerClassName: undefined,
                textContainerClassName: undefined,
                titleClassName: undefined,
                subtitleClassName: undefined,
                closeButtonClassName: undefined,
                bodyContainerClassName: undefined,
                bodyTitleClassName: undefined,
                startButtonClassName: undefined
            }
        },
        ProactiveChatInviteTimeoutInMs: 60000
    },
    reconnectChatPaneProps: {
        componentOverrides: {
            title: undefined,
            subtitle: undefined,
            icon: undefined,
            continueChatButton: undefined,
            startNewChatButton: undefined
        },
        controlProps: {
            id: "oc-lcw-reconnectchat-pane",
            dir: "ltr",
            hideReconnectChatPane: false,
            reconnectChatPaneAriaLabel: "Reconnect Chat Pane",
            hideTitle: false,
            titleText: "Previous session detected",
            hideSubtitle: false,
            subtitleText: "We have detected a previous chat session. Would you like to continue with your previous session?",
            hideIcon: false,
            iconAriaLabel: "Reconnect Chat Pane Icon",
            isButtonGroupHorizontal: false,
            hideContinueChatButton: false,
            continueChatButtonText: "Continue conversation",
            continueChatButtonAriaLabel: "Continue conversation",
            hideStartNewChatButton: false,
            startNewChatButtonText: "Start new conversation",
            startNewChatButtonAriaLabel: "Start new conversation",
            // onContinueChat: () => { }, // Detailed implementation omitted
            // onStartNewChat: () => { }, // Detailed implementation omitted
            // onMinimize: () => { } // Detailed implementation omitted
        },
        styleProps: {
            generalStyleProps: {
                backgroundColor: "rgb(255, 255, 255)",
                borderColor: "#E6E6E6",
                borderRadius: "4px",
                borderStyle: "solid",
                borderWidth: "3px",
                padding: "15px",
                height: "100%",
                width: "100%"
            },
            wrapperStyleProps: {
                backgroundColor: "rgb(255, 255, 255)",
                borderColor: "#E6E6E6",
                borderRadius: "0 8px 8px 8px",
                borderStyle: "solid",
                borderWidth: "1px",
                padding: "20px",
                width: "100%"
            },
            titleStyleProps: {
                color: "rgb(0, 0, 0)",
                fontFamily: "'Segoe UI', Arial, sans-serif",
                fontSize: "16px",
                fontWeight: "600",
                lineHeight: "19px"
            },
            subtitleStyleProps: {
                color: "rgb(0, 0, 0)",
                fontFamily: "'Segoe UI', Arial, sans-serif",
                fontSize: "16px",
                fontWeight: "400",
                lineHeight: "19px"
            },
            iconStyleProps: {
                backgroundImage: `url(${ChatReconnectIconBase64})`,
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "200px",
                height: "130px",
                margin: "0 auto",
                width: "130px"
            },
            buttonGroupStyleProps: {
                alignItems: "stretch"
            },
            continueChatButtonStyleProps: {
                backgroundColor: "rgb(49, 95, 162)",
                color: "rgb(255, 255, 255)",
                cursor: "pointer",
                fontFamily: "'Segoe UI', Arial, sans-serif",
                fontSize: "16px",
                fontWeight: "600",
                height: "60px",
                marginBottom: "5px",
                padding: "4px 10px 5px 10px"
            },
            continueChatButtonHoveredStyleProps: {
                filter: "brightness(0.8)"
            },
            startNewChatButtonStyleProps: {
                backgroundColor: "rgb(0, 0, 0)",
                color: "rgb(255, 255, 255)",
                cursor: "pointer",
                fontFamily: "'Segoe UI', Arial, sans-serif",
                fontSize: "16px",
                fontWeight: "600",
                height: "60px",
                padding: "4px 10px 5px 10px"
            },
            startNewChatButtonHoveredStyleProps: {
                backgroundColor: "rgb(132, 132, 130)"
            },
            classNames: {
                containerClassName: undefined,
                wrapperClassName: undefined,
                titleClassName: undefined,
                subtitleClassName: undefined,
                iconClassName: undefined,
                buttonGroupClassName: undefined,
                continueChatButtonClassName: undefined,
                startNewChatButtonClassName: undefined
            }
        },
        reconnectId: undefined,
        redirectInSameWindow: undefined
    },
    startChatErrorPaneProps: {
        controlProps: {
            titleText: "We are unable to load chat at this time.",
            subtitleText: "Please try again later."
        }
    },
    styleProps: {
        generalStyles: {
            position: "absolute",
            justifyContent: "center",
            alignItems: "center",
            // Below general style is for chat button only
            boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.16), 0px 4px 8px rgba(0, 0, 0, 0.12)",
            MozBoxShadow: "0px 0px 2px rgba(0, 0, 0, 0.16), 0px 4px 8px rgba(0, 0, 0, 0.12)",
            WebkitBoxShadow: "0px 0px 2px rgba(0, 0, 0, 0.16), 0px 4px 8px rgba(0, 0, 0, 0.12)",
            borderRadius: "4px",
            padding: "0.5"
        },
        className: undefined
    },
    webChatContainerProps: {
        containerStyles: {
            height: "100%",
            width: "100%",
            overflowY: "hidden"
        },
        webChatStyles: {
            // For the full list of WebChat StyleOptions, see https://github.com/microsoft/BotFramework-WebChat/blob/main/packages/api/src/StyleOptions.ts
            avatarSize: 32,
            backgroundColor: "#F7F7F9",
            botAvatarBackgroundColor: "#315FA2",
            botAvatarInitials: "WC",
            bubbleBackground: "#315FA2",
            bubbleBorderRadius: 4,
            bubbleBorderWidth: 0,
            bubbleFromUserBackground: "#FFFFFF",
            bubbleFromUserBorderRadius: 4,
            bubbleFromUserBorderWidth: 1,
            bubbleFromUserTextColor: "Black",
            bubbleImageHeight: 240,
            bubbleMaxWidth: 250,
            bubbleMinHeight: 34,
            bubbleMinWidth: 20,
            bubbleTextColor: "#FFFFFF",
            hideSendBox: false,
            hideUploadButton: true,
            primaryFont: "Segoe UI, Arial, sans-serif",
            rootHeight: "100%",
            rootWidth: "100%",
            sendBoxTextWrap: true,
            sendBoxHeight: 60,
            sendBoxMaxHeight: 96,
            sendBoxBackground: "#FFFFFF",
            showAvatarInGroup: true,
            suggestedActionsStackedHeight: 125,
            suggestedActionsStackedOverflow: "scroll" as any, // eslint-disable-line @typescript-eslint/no-explicit-any
            typingAnimationDuration: 3500
        },
        storeMiddlewares: undefined, // Additional store middlewares
        renderingMiddlewareProps: {
            timestampDir: "ltr",
            disableActivityMiddleware: false,
            disableAttachmentMiddleware: false,
            disableActivityStatusMiddleware: false,
            disableAvatarMiddleware: false,
            disableGroupActivitiesMiddleware: false,
            disableTypingIndicatorMiddleware: false,
            hideSendboxOnConversationEnd: true,
            userMessageStyleProps: {
                fontSize: "14px"
            },
            systemMessageStyleProps: {
                maxWidth: "100%",
                color: "#605E5C",
                background: "transparent",
                fontSize: "12px",
                borderRadius: 0,
                minHeight: "auto",
                fontFamily: "Segoe UI",
                lineHeight: "16px",
                padding: "0px 10px 0 10px"
            },
            userMessageBoxStyles: {
                maxWidth: "90%"
            },
            systemMessageBoxStyles: {
                maxWidth: "90%"
            },
            typingIndicatorStyleProps: {
                marginLeft: "10px",
                marginBottom: "5px",
                display: "flex",
                transition: "all .5s ease",
                alignItems: "center"
            },
            typingIndicatorBubbleStyleProps: {
                height: "6px",
                width: "6px",
                borderRadius: "6px",
                background: "#315FA2",
                animationDuration: "2s",
                animationName: "bounce",
                animationTimingFunction: "ease",
                animationIterationCount: "infinite",
                marginRight: "2px"
            },
            typingIndicatorMessageStyleProps: {
                fontFamily: "\"Segoe UI\", Arial, sans-serif",
                background: "transparent",
                fontSize: "12px",
                lineHeight: "15px",
                color: "#605e5c",
                marginLeft: "6px"
            },
            avatarStyleProps: {
                width: "32px",
                height: "32px",
                borderRadius: "16px",
                textAlign: "center",
                backgroundColor: "#315FA2"
            },
            avatarTextStyleProps: {
                margin: "0",
                fontFamily: "\"Segoe UI\", Arial, sans-serif",
                fontWeight: 600,
                fontSize: "13px",
                lineHeight: "18px",
                color: "#FFFFFF",
                paddingTop: "7px",
                WebkitUserSelect: "none",
                MozUserSelect: "none",
                userSelect: "none"
            },
            timestampContentStyleProps: {
                color: "#565452",
                fontFamily: "\"Segoe UI\", Arial, sans-serif",
                background: "transparent",
                fontSize: "11px",
                lineHeight: "15px",
                paddingTop: 0
            },
            timestampFailedTextStyleProps: {
                fontFamily: "\"Segoe UI\", Arial, sans-serif",
                background: "transparent",
                fontSize: "11px",
                lineHeight: "15px",
                paddingTop: 0,
                color: "#A80000"
            },
            timestampRetryTextStyleProps: {
                fontFamily: "\"Segoe UI\", Arial, sans-serif",
                background: "transparent",
                fontSize: "11px",
                lineHeight: "15px",
                paddingTop: 0,
                color: "#0063B1",
                cursor: "pointer"
            },
            attachmentProps: {
                webChatAttachmentId: "oc-lcw-webchat-attachment",
                adaptiveCardAttachmentId: "ms_lcw_webchat_adaptive_card",
                enableInlinePlaying: true
            },
            attachmentDividerStyles: {
                margin: "0",
                height: "1px",
                border: "0px",
                backgroundColor: "#E8EAEC"
            },
            attachmentStyles: {
                display: "flex",
                alignItems: "center",
                background: "transparent",
                fontSize: "12px",
                lineHeight: "16px",
                boxSizing: "border-box",
                borderRadius: "2px",
                wordBreak: "break-all"
            },
            attachmentIconStyles: {
                direction: "rtl",
                padding: "0 0 0 8px",
                lineHeight: 0
            },
            attachmentAdaptiveCardStyles: {
                borderStyle: "solid",
                borderColor: "rgb(230, 230, 230)",
                borderWidth: "1px"
            },
            attachmentFileNameStyles: {
                minHeight: "15px",
                marginLeft: "5px",
                marginRight: "5px",
                color: "#000000 !important"
            },
            attachmentDownloadIconStyles: {
                height: "12px",
                width: "12px",
                marginLeft: "auto !important",
                padding: "2px !important",
                fill: "#000000 !important"
            },
            attachmentContentStyles: {
                width: "200px"
            },
            attachmentSizeStyles: {
                display: "none"
            },
            receivedMessageAnchorStyles: {
                color: "white"
            }
        },
        localizedTexts: {
            /*
            MIDDLEWARE_BANNER_FILE parameters:
            {0} = File limit size
            {1} = File extension
            {2} = File name
            */
            MIDDLEWARE_BANNER_FILE_NULL_ERROR: "There was an error uploading the file, please try again.",
            MIDDLEWARE_BANNER_FILE_SIZE_WITHOUT_EXTENSION_ERROR: "File {2} exceeds the allowed limit of {0} MB and please upload the file with an appropriate file extension.",
            MIDDLEWARE_BANNER_FILE_SIZE_EXTENSION_ERROR: "File {2} exceeds the allowed limit of {0} MB and {1} files are not supported.",
            MIDDLEWARE_BANNER_FILE_WITHOUT_EXTENSION: "File upload error. Please upload the file {2} with an appropriate file extension.",
            MIDDLEWARE_BANNER_FILE_EXTENSION_ERROR: "{1} files are not supported.",
            MIDDLEWARE_BANNER_FILE_SIZE_ERROR: "File {2} exceeds the allowed limit of {0} MB.",
            MIDDLEWARE_BANNER_FILE_IS_EMPTY_ERROR: "This file {2} can't be attached because it's empty. Please try again with a different file.",
            MIDDLEWARE_BANNER_ERROR_MESSAGE: "Upload failed, please try again.",
            MIDDLEWARE_BANNER_INTERNET_BACK_ONLINE: "You're back online.",
            MIDDLEWARE_BANNER_NO_INTERNET_CONNECTION: "Unable to connect—please check your internet connection.",
            MIDDLEWARE_MAX_CHARACTER_COUNT_EXCEEDED: "This message is too long. Please shorten your message to avoid sending failure.",
            MIDDLEWARE_TYPING_INDICATOR_ONE: "{0} is typing ...",
            MIDDLEWARE_TYPING_INDICATOR_TWO: "{0} and {1} are typing ...",
            MIDDLEWARE_TYPING_INDICATOR_MULTIPLE: "{0} agents are typing ...",
            MIDDLEWARE_MESSAGE_SENDING: "Sending ...",
            MIDDLEWARE_MESSAGE_DELIVERED: "Sent",
            MIDDLEWARE_MESSAGE_NOT_DELIVERED: "Not Delivered",
            MIDDLEWARE_MESSAGE_RETRY: "Retry",
            PRECHAT_REQUIRED_FIELD_MISSING_MESSAGE: "{0} field is required",
            MARKDOWN_EXTERNAL_LINK_ALT: "Opens in a new window; external.",
            MIDDLEWARE_BANNER_CHAT_DISCONNECT: "Your conversation has been disconnected. For additional assistance, please start a new chat."
        },
        botMagicCode: {
            disabled: false,
            fwdUrl: ""
        },
        adaptiveCardStyles: {
            background: "white",
            color: "black"
        },
        hyperlinkTextOverride: false
    },
    telemetryConfig: undefined as unknown as ITelemetryConfig,
    getAuthToken: undefined,
    initialCustomContext: undefined
};