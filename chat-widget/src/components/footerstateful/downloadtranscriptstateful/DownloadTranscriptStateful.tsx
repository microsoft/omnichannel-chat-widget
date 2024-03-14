import { Constants, TranscriptConstants } from "../../../common/Constants";
import { NotificationScenarios } from "../../webchatcontainerstateful/webchatcontroller/enums/NotificationScenarios";
import { NotificationHandler } from "../../webchatcontainerstateful/webchatcontroller/notification/NotificationHandler";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";
import { ILiveChatWidgetContext } from "../../../contexts/common/ILiveChatWidgetContext";
import createChatTranscript from "../../../plugins/createChatTranscript";
import DOMPurify from "dompurify";
import { createFileAndDownload, isNullOrUndefined } from "../../../common/utils";
import { IDownloadTranscriptProps } from "./interfaces/IDownloadTranscriptProps";
import { executeReducer } from "../../../contexts/createReducer";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";

const processDisplayName = (displayName: string): string => {
    // if displayname matches "teamsvisitor:<some alphanumeric string>", we replace it with "Customer"
    const displayNameRegex = ".+:.+";
    const matchedTeamsDisplayName = displayName.match(displayNameRegex);
    if (displayName.indexOf("teamsvisitor") >= 0 && matchedTeamsDisplayName && matchedTeamsDisplayName.length > 0) {
        displayName = "Customer";
    }
    return displayName;
};

const constructIconName = (displayName: string): string => {
    if (!displayName) {
        return "";
    }
    let iconName = "C";
    const displayNameSplit = displayName.split(" ");
    if (displayNameSplit.length > 1) {
        // get the first letter of name and surname
        iconName = displayNameSplit[0][0] + displayNameSplit[1][0];
    } else if (displayNameSplit.length == 1) {
        // get the first letter of name
        iconName = displayNameSplit[0][0];
    }
    return iconName;
};

const processCreatedDateTime = (createdDateTime: string, chatCount: number): string => {
    const formattedDate = new Date(createdDateTime);
    // TODO: Localization:
    const formattedTimeString = formattedDate.toLocaleTimeString("en-us" /* Bootstrapper.LiveChatConfiguration.chatWidgetLocale */, { hour: "2-digit", minute: "2-digit" });
    const formattedSplitTimeString = formattedTimeString.split(" ");
    let finalizedTimeString = "";

    if (formattedSplitTimeString && formattedSplitTimeString.length > 1) {
        finalizedTimeString = formattedSplitTimeString[0] + " " + formattedSplitTimeString[1];
    }
    if (chatCount == 0) {
        return formattedDate.toLocaleDateString("en-us") + " " + finalizedTimeString;
    }
    return finalizedTimeString;
};

const processContent = (transcriptContent: string, isAgentChat: boolean, renderMarkDown?: (transcriptContent: string) => string): string => {
    if (transcriptContent.toString().toLowerCase().indexOf(TranscriptConstants.TranscriptMessageEmojiMessageType) >= 0) {
        // eslint-disable-next-line no-useless-escape
        const emojiRegex = "<img src=\"http.*:\/\/.+\/objects\/.+\/views.+\">";
        const matchedEmojiImgTag = transcriptContent.match(emojiRegex);
        if (matchedEmojiImgTag && matchedEmojiImgTag.length > 0 && transcriptContent.toString().toLowerCase().indexOf(matchedEmojiImgTag[0]) >= 0) {
            transcriptContent = transcriptContent.replace(matchedEmojiImgTag[0], "");
        }
    }
    if (!isAgentChat && transcriptContent.toString().toLowerCase().indexOf("a href") >= 0 && transcriptContent.toString().toLowerCase().indexOf("target") >= 0) {
        transcriptContent = transcriptContent.slice(0, transcriptContent.toString().indexOf("target")) + " style='color:white' " + transcriptContent.slice(transcriptContent.toString().indexOf("target"));
    }
    if (renderMarkDown) {
        transcriptContent = renderMarkDown(transcriptContent);
    } else {
        transcriptContent = DOMPurify.sanitize(transcriptContent);
    }
    return transcriptContent;
};

const beautifyChatTranscripts = (chatTranscripts: string, renderMarkDown?: (transcriptContent: string) => string, attachmentMessage?: string): string => {
    const chats = JSON.parse(chatTranscripts).reverse();
    const docTypeTag = "<!DOCTYPE html>";
    const docStartTag = "<html>";
    const docMetaTag = "<meta charset='UTF-8'>";
    const docEndTag = "</html>";
    const bodyStartTag = "<body bgcolor='" + TranscriptConstants.ChatTranscriptsBodyColor + "'>";
    const bodyEndTag = "</body>";
    const divEndTag = "</div>";
    const mainDiv = "<div class='transcripts' style='width:80%;margin-left:10%;'>";
    let beautifiedChats = "";
    let tabIndex = 1;
    const mainTranscriptSection = "<div class='allTranscripts' style='max-width:60%;min-width:30%;margin-left:20%;background-color:#FFFFFF;'>";
    let previousDisplayName = "";
    let chatCount = 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chats.forEach((value: any) => {
        let dialogNameMarginTop = "6px";
        let dialogboxMarginleft = "40px";
        let displayName = "User";
        let iconName = "U";
        let isAgentChat = false;

        let fileAttachmentName = TranscriptConstants.DefaultFileAttachmentName;
        let dialogColor = TranscriptConstants.CustomerDialogColor;
        let fontColor = TranscriptConstants.CustomerFontColor;

        const isSystemMessage = value.tags && value.tags.toLowerCase().indexOf(Constants.systemMessageTag) !== -1;
        const isControlMessage = value.isControlMessage && value.isControlMessage === true;
        const isAdaptiveCard = value.contentType && value.contentType.toLowerCase() === TranscriptConstants.AdaptiveCardType;
        const isInternalMessage = value.deliveryMode && value.deliveryMode.toLowerCase() === TranscriptConstants.InternalMode;
        const isHiddenMessage = value.tags && value.tags.toLowerCase().indexOf(Constants.hiddenTag.toLowerCase()) !== -1;
        const shouldIgnoreMessage = isSystemMessage || isControlMessage || isAdaptiveCard || isInternalMessage || isHiddenMessage;
        if (shouldIgnoreMessage) {
            return;
        } else if (value.from) {
            if (value.from.application) {
                displayName = value.from.application.displayName;
                dialogColor = TranscriptConstants.AgentDialogColor;
                fontColor = TranscriptConstants.AgentFontColor;
                isAgentChat = true;
            } else if (value.from.guest) {
                displayName = value.from.guest.displayName;
                dialogColor = TranscriptConstants.CustomerDialogColor;
            } else if (value.from.user) {
                displayName = value.from.user.displayName;
                dialogColor = TranscriptConstants.CustomerDialogColor;
            }
            displayName = processDisplayName(displayName);
            iconName = constructIconName(displayName);

            if (value.attachments && value.attachments.length > 0 && value.attachments[0].name) {
                fileAttachmentName = value.attachments[0].name;
                value.content = attachmentMessage
                    ? attachmentMessage + " " + fileAttachmentName
                    : "The following attachment was uploaded during the conversation: " + fileAttachmentName;
            }
        }
        let displayNamePlaceholder = processCreatedDateTime(value.createdDateTime, chatCount);
        let iconPara = "";
        if (displayName !== previousDisplayName) {
            dialogboxMarginleft = "0px";
            displayNamePlaceholder = "<b>" + displayName + " </b> " + processCreatedDateTime(value.createdDateTime, chatCount);
            iconPara = "<div class='circle' style='display:inline-block;float:left;margin-right:5px;width:35px;height:35px;border-radius:20px;color:black;line-height:35px;text-align:center;background:" + dialogColor + ";'>\
                            <font tabindex ='" + tabIndex + "' color =" + fontColor + " style='font-family:Segoe UI,SegoeUI,Helvetica Neue,Helvetica,Arial,sans-serif;'>\
                                " + iconName + "\
                            </font>\
                            </div>";
            tabIndex++;
        }
        if (displayName !== previousDisplayName) {
            if (previousDisplayName === "") {
                dialogNameMarginTop = "0px";
            }
            if (previousDisplayName !== "") {
                dialogNameMarginTop = "20px";
            }
        }
        const displayNameDiv = "<div style='margin-right:-2px;margin-top:" + dialogNameMarginTop + ";margin-bottom:-2px;margin-left:42px;top:-2px;position:relative;'>\
                                    <font tabindex ='" + tabIndex + "' size = '1px' color='#000000' style='font-family:Segoe UI,SegoeUI,Helvetica Neue,Helvetica,Arial,sans-serif;font-weight:500;'>\
                                        " + displayNamePlaceholder + "\
                                    </font>\
                                </div>";
        tabIndex++;
        const dialogbox = "<div class='dialogbox' style='font-family:Segoe UI,SegoeUI,Helvetica Neue,Helvetica,Arial,sans-serif;word-break:break-word;min-height:20px;max-width:80%;display:inline-block;margin-left:" + dialogboxMarginleft + ";padding: 10px; background-color:" + dialogColor + "; border-radius: 0px 12px 12px 12px; left: 3px; top: 2px; '>";
        beautifiedChats = beautifiedChats + mainDiv + iconPara + displayNameDiv + dialogbox + "<font tabindex= '" + tabIndex++ + "' color =" + fontColor + ">" + processContent(value.content, isAgentChat, renderMarkDown) + "</font>" + divEndTag + divEndTag;
        previousDisplayName = displayName;
        chatCount++;
    });
    const str = docTypeTag + docStartTag + docMetaTag + bodyStartTag + mainTranscriptSection + beautifiedChats + divEndTag + bodyEndTag + docEndTag;
    return str;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const downloadTranscript = async (chatSDK: any, downloadTranscriptProps: IDownloadTranscriptProps, state?: ILiveChatWidgetContext) => {

    // Need to keep existing live chat context for scenarios when transcript is downloaded after endchat
    let liveChatContext = state?.domainStates?.liveChatContext;
    if (!liveChatContext) {
        const inMemoryState = executeReducer(state as ILiveChatWidgetContext, { type: LiveChatWidgetActionType.GET_IN_MEMORY_STATE, payload: null });
        liveChatContext = inMemoryState.domainStates.liveChatContext;
    }

    let data = await chatSDK?.getLiveChatTranscript({liveChatContext});
    if (typeof (data) === Constants.String) {
        data = JSON.parse(data);
    }

    const { bannerMessageOnError, renderMarkDown, attachmentMessage, webChatTranscript } = downloadTranscriptProps;

    if (data[Constants.ChatMessagesJson] !== null && data[Constants.ChatMessagesJson] !== undefined) {
        const useWebChatTranscript = isNullOrUndefined(webChatTranscript?.disabled) || webChatTranscript?.disabled === false;
        if (useWebChatTranscript) {
            const transcriptOptions = {
                ...webChatTranscript
            };
            await createChatTranscript(data[Constants.ChatMessagesJson], chatSDK, false, transcriptOptions);
        } else {
            // Legacy Transcript
            const chatTranscripts = window.btoa(encodeURIComponent(beautifyChatTranscripts(data[Constants.ChatMessagesJson], renderMarkDown, attachmentMessage)));
            const byteCharacters = decodeURIComponent(window.atob(chatTranscripts));
            createFileAndDownload(TranscriptConstants.ChatTranscriptDownloadFile, byteCharacters, "text/html;charset=utf-8");
        }
    } else {
        TelemetryHelper.logActionEvent(LogLevel.ERROR, {
            Event: TelemetryEvent.DownloadTranscriptResponseNullOrUndefined,
            ExceptionDetails: {
                exception: "Download transcript failed: response null or undefined."
            }
        });
        NotificationHandler.notifyError(
            NotificationScenarios.DownloadTranscriptError,
            bannerMessageOnError ?? Constants.defaultDownloadTranscriptError);
    }
};