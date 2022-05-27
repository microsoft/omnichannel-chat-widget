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
import { MessageTypes } from "../../enums/MessageType";
import React from "react";
import { TelemetryHelper } from "../../../../../common/telemetry/TelemetryHelper";
import { defaultSystemMessageStyles } from "./defaultStyles/defaultSystemMessageStyles";
import { defaultUserMessageStyles } from "./defaultStyles/defaultUserMessageStyles";
import { escapeHtml } from "../../../../../common/utils";

const loggedSystemMessages = new Array<string>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleSystemMessage = (next: any, args: any[], card: any, systemMessageStyleProps?: React.CSSProperties) => {
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

    // eslint-disable-next-line react/display-name, @typescript-eslint/no-explicit-any
    return () => (
        <div key={card.activity.id} style={systemMessageStyles} aria-hidden="true">
            {card.activity.text}
        </div>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createActivityMiddleware = (systemMessageStyleProps?: React.CSSProperties, userMessageStyleProps?: React.CSSProperties) => () => (next: any) => (...args: any) => {
    const [card] = args;
    if (card.activity) {
        if (card.activity.from?.role === DirectLineSenderRole.Channel) {
            if (card.activity.channelData?.type === MessageTypes.Thread) {
                TelemetryHelper.logActionEvent(LogLevel.INFO, {
                    Event: TelemetryEvent.IC3ThreadUpdateEventReceived,
                    Description: "IC3 ThreadUpdateEvent Received"
                });
            }
            return () => false;
        }

        if (card.activity.channelData?.tags?.includes(Constants.systemMessageTag)) {
            return handleSystemMessage(next, args, card, systemMessageStyleProps);
        } else if (card.activity.text
            && card.activity.type === DirectLineActivityType.Message
        ) {
            if (!card.activity.channelData.isHtmlEncoded && card.activity.channelId === Constants.webchatChannelId) {
                card.activity.text = escapeHtml(card.activity.text);
                card.activity.channelData.isHtmlEncoded = true;
            }

            const userMessageStyles = { ...defaultUserMessageStyles, ...userMessageStyleProps };
            // eslint-disable-next-line react/display-name, @typescript-eslint/no-explicit-any
            return (...renderArgs: any) => (
                <div
                    className={card.activity.from.role === DirectLineSenderRole.User ? Constants.sentMessageClassName : Constants.receivedMessageClassName}
                    style={userMessageStyles} aria-hidden="true">
                    {next(...args)(...renderArgs)}
                </div>
            );
        }
    }
    return next(...args);
};