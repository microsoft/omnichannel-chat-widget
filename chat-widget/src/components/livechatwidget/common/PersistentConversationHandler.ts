import { BroadcastEvent, LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";

import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import ChatWidgetEvents from "./ChatWidgetEvents";
import { FacadeChatSDK } from "../../../common/facades/FacadeChatSDK";
import { IPersistentChatHistoryProps } from "../interfaces/IPersistentChatHistoryProps";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import conversationDividerActivity from "../../webchatcontainerstateful/common/activities/conversationDividerActivity";
import convertPersistentChatHistoryMessageToActivity from "../../webchatcontainerstateful/common/activityConverters/convertPersistentChatHistoryMessageToActivity";
import { defaultPersistentChatHistoryProps } from "./defaultProps/defaultPersistentChatHistoryProps";
import dispatchCustomEvent from "../../../common/utils/dispatchCustomEvent";

class PersistentConversationHandler {
    // Indicates whether the last page of messages has been pulled
    private isLastPull = false;

    // Number of messages to fetch per page
    private pageSize = 4;

    // Token for fetching the next page of messages
    private pageToken: string | null = null;

    // Stores the last processed message
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private lastMessage: any = null; // Replace `any` with a proper type

    // Counter for assigning unique metadata to activities
    private count = 0;

    // Stores the applied properties for persistent chat history
    private appliedProps: IPersistentChatHistoryProps | null = null;

    // Instance of the FacadeChatSDK for interacting with the chat service
    private facadeChatSDK: FacadeChatSDK;

    constructor(facadeChatSDK: FacadeChatSDK, props: IPersistentChatHistoryProps) {
        this.facadeChatSDK = facadeChatSDK;
        this.appliedPropsHandler(props); // Merge default and provided properties
    }

    // Merges default properties with the provided properties
    private appliedPropsHandler(props: IPersistentChatHistoryProps) {
        this.appliedProps = {
            ...defaultPersistentChatHistoryProps,
            ...props,
        };

        this.pageSize = this.appliedProps?.pageSize || 4;
    }

    // Subscribes to the reset event to handle conversation resets
    private resetEventListener = BroadcastService.getMessageByEventName(BroadcastEvent.PersistentConversationReset).subscribe(() => {
        this.reset();
    });

    // Resets the handler state
    public reset() {
        this.isLastPull = false;
        this.pageToken = null;
        this.lastMessage = null;
        this.count = 0;
        this.resetEventListener.unsubscribe(); // Unsubscribe from the reset event
    }

    // Pulls the persistent chat history
    public async pullHistory() {
        const messages = await this.fetchHistoryMessages(); // Fetch messages from the chat service
        const messagesDescOrder = [...messages].reverse(); // Reverse the order of messages

        this.processHistoryMessages(messagesDescOrder); // Process the fetched messages
    }

    // Processes the fetched messages and converts them to activities
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private processHistoryMessages(messagesDescOrder: any[]) {
        for (const message of messagesDescOrder) {
            try {
                const activity = this.processMessageToActivity(message); // Convert message to activity

                if (activity) {
                    dispatchCustomEvent(ChatWidgetEvents.ADD_ACTIVITY, { activity }); // Dispatch the activity

                    const dividerActivity = this.createDividerActivity(activity); // Create a divider activity if needed

                    if (dividerActivity) {
                        dispatchCustomEvent(ChatWidgetEvents.ADD_ACTIVITY, { activity: dividerActivity }); // Dispatch the divider activity
                    }

                    this.lastMessage = activity; // Update the last processed message
                }

            } catch (error) {
                TelemetryHelper.logActionEvent(LogLevel.ERROR, {
                    Event: TelemetryEvent.ConvertPersistentChatHistoryMessageToActivityFailed,
                    ExceptionDetails: error,
                }); // Log telemetry for conversion failure
            }
        }
    }

    // Fetches the persistent chat history messages
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async fetchHistoryMessages(): Promise<any[]> {
        if (!this.shouldPull()) {
            return []; // Exit if no more messages should be pulled
        }

        const options = {
            pageSize: this.pageSize,
            pageToken: this.pageToken || undefined,
        };

        try {
            const response = await this.facadeChatSDK.fetchPersistentConversationHistory(options);
            const { chatMessages: messages, nextPageToken: pageToken } = response;
            this.pageToken = pageToken || null; // Update the page token

            if (pageToken === null) {
                this.isLastPull = true; // Mark as last pull if no next page token
            }

            return messages;
        } catch (error) {
            TelemetryHelper.logSDKEvent(LogLevel.ERROR, {
                Event: TelemetryEvent.FetchPersistentChatHistoryFailed,
                ExceptionDetails: error,
            }); // Log telemetry for fetch failure

            this.isLastPull = true;
            this.pageToken = null;
            return [];
        }
    }

    // Determines whether more messages should be pulled
    private shouldPull(): boolean {
        return !this.isLastPull; // Pull if not the last page
    }

    // Converts a message to an activity
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private processMessageToActivity(message: any): any {
        try {
            const activity = convertPersistentChatHistoryMessageToActivity(message); // Convert message to activity

            activity.id = activity.id || `activity-${this.count}`; // Assign a unique ID if missing
            activity.channelData = {
                ...activity.channelData,
                metadata: {
                    count: this.count, // Add metadata with the current count
                },
            };

            this.count += 1; // Increment the count

            return activity;
        } catch (error) {
            TelemetryHelper.logActionEvent(LogLevel.ERROR, {
                Event: TelemetryEvent.ConvertPersistentChatHistoryMessageToActivityFailed,
                ExceptionDetails: error,
            }); // Log telemetry for conversion failure
            throw error;
        }
    }

    // Creates a divider activity if the conversation ID has changed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private createDividerActivity(activity: any): any | null {
        if (this.lastMessage?.channelData?.conversationId !== activity.channelData.conversationId) {
            const sequenceId = activity.channelData["webchat:sequence-id"] + 1; // Increment sequence ID
            const timestamp = new Date(activity.timestamp).getTime() + 1; // Increment timestamp

            return {
                ...conversationDividerActivity,
                channelData: {
                    ...conversationDividerActivity.channelData,
                    conversationId: activity.channelData.conversationId, // Update conversation ID
                    "webchat:sequence-id": sequenceId, // Update sequence ID
                },
                timestamp: new Date(timestamp).toISOString(), // Update timestamp
            };
        }

        return null; // Return null if no divider activity is needed
    }
}

export default PersistentConversationHandler;