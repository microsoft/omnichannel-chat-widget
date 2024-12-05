/******
 * ActivityMiddleware
 * 
 * This middleware handles each message bubble in a default Microsoft LiveChatWidget approach. It does the following processing:
 * 1. Renders system messages differently, according to Microsoft LiveChatWidget styles
 * 2. Changes the font size of user messages
 * 3. Decodes certain html characters that came through from chat services
 ******/

import { LogLevel, TelemetryEvent } from "../../../../../common/telemetry/TelemetryConstants";

import { Constants } from "../../../../../common/Constants";
import { DirectLineActivityType } from "../../enums/DirectLineActivityType";
import { DirectLineSenderRole } from "../../enums/DirectLineSenderRole";
import React from "react";
import { TelemetryHelper } from "../../../../../common/telemetry/TelemetryHelper";
import { defaultSystemMessageStyles } from "./defaultStyles/defaultSystemMessageStyles";
import { defaultUserMessageStyles } from "./defaultStyles/defaultUserMessageStyles";
import { escapeHtml } from "../../../../../common/utils";

const loggedSystemMessages = new Array<string>();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleSystemMessage = (next: any, args: any[], card: any, renderMarkdown: (text: string) => string, systemMessageStyleProps?: React.CSSProperties) => {
    const systemMessageStyles = { ...defaultSystemMessageStyles, ...systemMessageStyleProps };

    if (card.activity?.channelData?.tags?.includes(Constants.averageWaitTimeMessageTag) && loggedSystemMessages.indexOf(card.activity?.channelData?.clientmessageid) < 0) {
        TelemetryHelper.logActionEvent(LogLevel.INFO, {
            Event: TelemetryEvent.AverageWaitTimeMessageRecieved,
            Description: "Average wait time message was received"
        });
        loggedSystemMessages.push(card.activity.channelData.clientmessageid);
    }

    if (card.activity?.channelData?.tags?.includes(Constants.queuePositionMessageTag) && loggedSystemMessages.indexOf(card.activity?.channelData?.clientmessageid) < 0) {
        TelemetryHelper.logActionEvent(LogLevel.INFO, {
            Event: TelemetryEvent.QueuePositionMessageRecieved,
            Description: "Queue position message was received"
        });
        loggedSystemMessages.push(card.activity.channelData.clientmessageid);
    }

    if (card.activity?.channelData?.clientmessageid && card.nextVisibleActivity?.channelData?.clientmessageid === card.activity?.channelData?.clientmessageid
        || card.activity?.messageid && card.nextVisibleActivity?.messageid === card.activity?.messageid) {
        return () => false;
    }

    card.activity.text = renderMarkdown(card.activity.text);
    // eslint-disable-next-line react/display-name
    return () => (
        <div key={card.activity.id} style={systemMessageStyles} aria-hidden="false" className={Constants.markDownSystemMessageClass} dangerouslySetInnerHTML={{ __html: card.activity.text }} />
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isTagIncluded = (card: any, tag: string): boolean => {
    return isDataTagsPresent(card) &&
        card.activity.channelData.tags.includes(tag);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isDataTagsPresent = (card: any) => {
    return card &&
        card.activity &&
        card.activity.channelData &&
        card.activity.channelData.tags &&
        card.activity.channelData.tags.length > 0;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createActivityMiddleware = (renderMarkdown: (text: string) => string, systemMessageStyleProps?: React.CSSProperties, userMessageStyleProps?: React.CSSProperties) => () => (next: any) => (...args: any) => {
    const [card] = args;
    if (card.activity) {
        if (card.activity.from?.role === DirectLineSenderRole.Channel) {
            return () => false;
        }

        if (isTagIncluded(card, Constants.hiddenTag)) {
            return () => false;
        }

        if (isTagIncluded(card, Constants.systemMessageTag)) {
            return handleSystemMessage(next, args, card, renderMarkdown, systemMessageStyleProps);
        } 
        
        if (card.activity.text
            && card.activity.type === DirectLineActivityType.Message) {

            if (!card.activity.channelData.isHtmlEncoded && card.activity.channelId === Constants.webchatChannelId) {
                card.activity.text = escapeHtml(card.activity.text);
                card.activity.channelData.isHtmlEncoded = true;
            }

            const userMessageStyles = { ...defaultUserMessageStyles, ...userMessageStyleProps };
            // eslint-disable-next-line react/display-name, @typescript-eslint/no-explicit-any
            return (...renderArgs: any) => (
                <div
                    className={card.activity.from.role === DirectLineSenderRole.User ? Constants.sentMessageClassName : Constants.receivedMessageClassName}
                    style={userMessageStyles}>
                    {next(...args)(...renderArgs)}
                </div>
            );
        }
    }
    return next(...args);
};