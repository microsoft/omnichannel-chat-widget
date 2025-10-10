import { BroadcastEvent, LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";

import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import ChatWidgetEvents from "./ChatWidgetEvents";
import { FacadeChatSDK } from "../../../common/facades/FacadeChatSDK";
import { IPersistentChatHistoryProps } from "../interfaces/IPersistentChatHistoryProps";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import conversationDividerActivity from "../../webchatcontainerstateful/common/activities/conversationDividerActivity";
import convertPersistentChatHistoryMessageToActivity from "../../webchatcontainerstateful/common/activityConverters/convertPersistentChatHistoryMessageToActivity";
import { createTimer } from "../../../common/utils";
import { defaultPersistentChatHistoryProps } from "./defaultProps/defaultPersistentChatHistoryProps";
import dispatchCustomEvent from "../../../common/utils/dispatchCustomEvent";

/**
 * Class responsible for handling persistent conversation history
 */
class PersistentConversationHandler {
    private appliedProps: IPersistentChatHistoryProps = { ...defaultPersistentChatHistoryProps };
    private isLastPull = false;
    private pageToken: string | null = null;
    private facadeChatSDK: FacadeChatSDK;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private lastMessage: any = null;
    private count = 0;
    private pageSize = 4;
    private isCurrentlyPulling = false;
    private pageTokenInTransitSet = new Set<string>();

    constructor(facadeChatSDK: FacadeChatSDK, props: IPersistentChatHistoryProps) {
        this.facadeChatSDK = facadeChatSDK;
        this.appliedPropsHandler(props);
        
        TelemetryHelper.logActionEventToAllTelemetry(LogLevel.INFO, {
            Event: TelemetryEvent.LCWPersistentConversationHandlerInitialized,
            Description: "PersistentConversationHandler initialized",
            CustomProperties: { pageSize: this.pageSize }
        });
    }

    private appliedPropsHandler(props: IPersistentChatHistoryProps) {
        this.appliedProps = {
            ...defaultPersistentChatHistoryProps,
            ...props,
        };

        this.pageSize = this.appliedProps.pageSize || 4;
    }

    private resetEventListener = BroadcastService.getMessageByEventName(BroadcastEvent.PersistentConversationReset).subscribe(() => {
        this.reset();
    });


    public reset() {
        this.isLastPull = false;
        this.pageToken = null;
        this.lastMessage = null;
        this.count = 0;
        this.isCurrentlyPulling = false;
        this.pageTokenInTransitSet.clear();
    }

    public destroy() {
        // Only unsubscribe when the handler is being destroyed completely
        this.resetEventListener.unsubscribe();
    }

    public async pullHistory() {
        const pullTimer = createTimer();

        // Prevent concurrent pulls regardless of pageToken
        if (this.isCurrentlyPulling) {
            TelemetryHelper.logActionEvent(LogLevel.WARN, {
                Event: TelemetryEvent.LCWPersistentHistoryPullBlocked,
                Description: "History pull blocked - already in progress"
            });
            return;
        }

        // Additional check for specific pageToken duplicates
        if (this.pageToken && this.pageTokenInTransitSet.has(this.pageToken)) {
            return;
        }

        // Mark as currently pulling
        this.isCurrentlyPulling = true;

        if (this.pageToken) {
            this.pageTokenInTransitSet.add(this.pageToken);
        }

        try {
            const messages = await this.fetchHistoryMessages();

            if (messages === null || messages?.length === 0) {
                this.isLastPull = true;
                // Dispatch event to notify UI that no more history is available
                dispatchCustomEvent(ChatWidgetEvents.NO_MORE_HISTORY_AVAILABLE);
                // Also hide the loading banner
                dispatchCustomEvent(ChatWidgetEvents.HIDE_LOADING_BANNER);
                
                TelemetryHelper.logActionEvent(LogLevel.INFO, {
                    Event: TelemetryEvent.LCWPersistentHistoryPullCompleted,
                    Description: "History pull completed - no more messages",
                    ElapsedTimeInMilliseconds: pullTimer.milliSecondsElapsed
                });
                return;
            }

            const messagesDescOrder = [...messages]?.reverse();

            this.processHistoryMessages(messagesDescOrder);
            
            // Dispatch event to hide the loading banner after messages are processed
            dispatchCustomEvent(ChatWidgetEvents.HIDE_LOADING_BANNER);
            
            TelemetryHelper.logActionEvent(LogLevel.INFO, {
                Event: TelemetryEvent.LCWPersistentHistoryPullCompleted,
                Description: "History pull completed successfully",
                ElapsedTimeInMilliseconds: pullTimer.milliSecondsElapsed,
                CustomProperties: { 
                    messageCount: messages.length,
                    totalProcessed: this.count 
                }
            });
        } finally {
            // Always clear the pulling flag when done
            this.isCurrentlyPulling = false;

            // Remove pageToken from transit set if it was added
            if (this.pageToken) {
                this.pageTokenInTransitSet.delete(this.pageToken);
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private processHistoryMessages(messagesDescOrder: any[]) {
        for (const message of messagesDescOrder) {
            try {
                const activity = this.processMessageToActivity(message);

                if (activity) {
                    dispatchCustomEvent(ChatWidgetEvents.ADD_ACTIVITY, { activity });
                    const dividerActivity = this.createDividerActivity(activity);

                    if (dividerActivity) {
                        dispatchCustomEvent(ChatWidgetEvents.ADD_ACTIVITY, { activity: dividerActivity });
                    }
                    this.lastMessage = activity;
                }

            } catch (error) {
                TelemetryHelper.logActionEvent(LogLevel.ERROR, {
                    Event: TelemetryEvent.ConvertPersistentChatHistoryMessageToActivityFailed,
                    ExceptionDetails: error,
                });
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async fetchHistoryMessages(): Promise<any[]> {

        if (!this.shouldPull()) {
            // Dispatch event to ensure banner is hidden when no more pulls are needed
            dispatchCustomEvent(ChatWidgetEvents.NO_MORE_HISTORY_AVAILABLE);
            dispatchCustomEvent(ChatWidgetEvents.HIDE_LOADING_BANNER);
            return [];
        }

        const options = {
            pageSize: this.pageSize,
            pageToken: this.pageToken || undefined,
        };

        try {           
            const response = await this.facadeChatSDK?.fetchPersistentConversationHistory(options);

            const { chatMessages: messages, nextPageToken: pageToken } = response;
            this.pageToken = pageToken || null;

            if (pageToken === null) {
                this.isLastPull = true;
                // Dispatch event when we reach the end of available history
                dispatchCustomEvent(ChatWidgetEvents.NO_MORE_HISTORY_AVAILABLE);
            }

            // if chatMessages is null, return empty array
            if (!messages) {
                this.isLastPull = true;
                // Dispatch event when we reach the end of available history
                dispatchCustomEvent(ChatWidgetEvents.NO_MORE_HISTORY_AVAILABLE);
                // Also hide the loading banner
                dispatchCustomEvent(ChatWidgetEvents.HIDE_LOADING_BANNER);
                return [];
            }

            dispatchCustomEvent(ChatWidgetEvents.HIDE_LOADING_BANNER);

            return messages;
        } catch (error) {

            TelemetryHelper.logSDKEvent(LogLevel.ERROR, {
                Event: TelemetryEvent.FetchPersistentChatHistoryFailed,
                ExceptionDetails: error,
            });

            this.isLastPull = true;
            this.pageToken = null;
            // Dispatch event when there's an error to stop loading banner
            dispatchCustomEvent(ChatWidgetEvents.NO_MORE_HISTORY_AVAILABLE);
            // Also hide the loading banner
            dispatchCustomEvent(ChatWidgetEvents.HIDE_LOADING_BANNER);
            return [];
        }
    }

    private shouldPull(): boolean {
        return !this.isLastPull;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private processMessageToActivity(message: any): any {
        try {
            const activity = convertPersistentChatHistoryMessageToActivity(message);

            activity.id = activity.id || `activity-${this.count}`;
            activity.channelData = {
                ...activity.channelData,
                metadata: {
                    count: this.count,
                },
            };

            // Increment the count after assigning it to the activity
            this.count += 1;

            return activity;
        } catch (error) {
            TelemetryHelper.logActionEvent(LogLevel.ERROR, {
                Event: TelemetryEvent.ConvertPersistentChatHistoryMessageToActivityFailed,
                ExceptionDetails: error,
            });
            throw error;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private createDividerActivity(activity: any): any | null {

        if (this.lastMessage?.channelData?.conversationId !== activity.channelData.conversationId) {
            const rawSequenceId = activity.channelData["webchat:sequence-id"];
            const sequenceId = typeof rawSequenceId === "number" && !isNaN(rawSequenceId) ? rawSequenceId + 1 : 1;
            const timestamp = new Date(activity.timestamp).getTime() + 1;
            return {
                ...conversationDividerActivity,
                channelData: {
                    ...conversationDividerActivity.channelData,
                    conversationId: activity.channelData.conversationId,
                    "webchat:sequence-id": sequenceId,
                },
                timestamp: new Date(timestamp).toISOString(),
                identifier: `divider-${activity.channelData.conversationId}`
            };
        }

        return null;
    }
}

export default PersistentConversationHandler;