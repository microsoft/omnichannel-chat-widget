/* eslint-disable @typescript-eslint/no-explicit-any */

import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { Constants } from "../../../../../common/Constants";
import { IWebChatAction } from "../../../interfaces/IWebChatAction";
import { WebChatActionType } from "../../enums/WebChatActionType";
import { defaultWebChatStyles } from "../../../common/defaultStyles/defaultWebChatStyles";
import { getIconText } from "../../../../../common/utils";

let currentAgentInitials = defaultWebChatStyles.botAvatarInitials;
let currentAgentName = defaultWebChatStyles.botAvatarInitials;

// Optional external updater (React context dispatch wrapper) set at runtime
let externalInitialsUpdater: ((initials: string) => void) | undefined;

const hasTransferTag = (activity: any): boolean => {
    const tags = [
        ...(Array.isArray(activity?.channelData?.tags) ? activity.channelData.tags : []),
        ...(Array.isArray(activity?.tags) ? activity.tags : [])
    ];
    return tags.some((tag) => typeof tag === "string" && tag.toLowerCase().includes("transfer"));
};

const isTransferSystemMessage = (activity: any): boolean => {
    const text: string = (activity?.text || "").toString();
    return hasTransferTag(activity) || /\btransfer(?:red|ring)?\b/i.test(text);
};

const resetCachedAgentName = (dispatch: any): void => {
    if (currentAgentName !== defaultWebChatStyles.botAvatarInitials ||
        currentAgentInitials !== defaultWebChatStyles.botAvatarInitials) {
        currentAgentName = defaultWebChatStyles.botAvatarInitials;
        currentAgentInitials = defaultWebChatStyles.botAvatarInitials;
        externalInitialsUpdater?.(currentAgentInitials || "");
        BroadcastService.postMessage({
            eventName: "BotAvatarInitialsUpdated",
            payload: { initials: currentAgentInitials }
        });
        dispatch({ type: "__BOT_INITIALS_UPDATED__" });
    }
};

export const localizedStringsBotInitialsMiddleware = (onInitialsChange?: (initials: string) => void) => ({ dispatch }: { dispatch: any }) => (next: any) => (action: IWebChatAction) => {
    if (onInitialsChange && !externalInitialsUpdater) {
        externalInitialsUpdater = onInitialsChange; // capture once
    }

    if (action.type === WebChatActionType.DIRECT_LINE_INCOMING_ACTIVITY) {
        const activity = action.payload?.activity;

        if (activity?.from?.name && activity.from.role !== Constants.userMessageTag && activity.from.name !== Constants.userMessageTag) {
            const agentName = activity.from.name.trim();
            const isSystemMessage = agentName === "__agent__" ||
                agentName.startsWith("__") ||
                activity.channelData?.tags?.includes(Constants.systemMessageTag) ||
                activity.tags?.includes(Constants.systemMessageTag);

            if (isSystemMessage) {
                // transfer-stale-bot-name: when a transfer system message indicates the
                // conversation has been routed to a different agent, the
                // previously-cached agent name must NOT linger. Otherwise the
                // next non-system activity (e.g. typing indicator, welcome
                // message, or the new agent's first turn before their name
                // is observed) is announced to screen readers as the OLD
                // agent. Reset to defaults so the next observed name takes
                // effect cleanly.
                if (isTransferSystemMessage(activity)) {
                    resetCachedAgentName(dispatch);
                }
            } else if (agentName) {
                const newInitials = getIconText(agentName) || currentAgentInitials;
                const hasInitialsChanged = newInitials !== currentAgentInitials;
                const hasNameChanged = agentName !== currentAgentName;

                currentAgentName = agentName;

                if (hasInitialsChanged) {
                    currentAgentInitials = newInitials;
                    // Notify external React context if provided
                    externalInitialsUpdater?.(currentAgentInitials || "");
                    // Broadcast (optional) for multi-tab sync without forcing consumers
                    BroadcastService.postMessage({
                        eventName: "BotAvatarInitialsUpdated",
                        payload: { initials: currentAgentInitials }
                    });
                }

                if (hasInitialsChanged || hasNameChanged) {
                    // Also dispatch a no-op action into WebChat store to encourage re-render (cheap)
                    dispatch({ type: "__BOT_INITIALS_UPDATED__" });
                }
            }
        }
    }
    return next(action);
};

export const getOverriddenLocalizedStrings = (existingOverrides?: any) => {
    return (strings: any) => {
        
        const result = {
            ...strings,
            ...existingOverrides,
        };
        // Apply dynamic bot initials to alt text if not already overridden through props
        if (!existingOverrides?.ACTIVITY_BOT_SAID_ALT) {
            result.ACTIVITY_BOT_SAID_ALT = `${currentAgentName} said:`;
        }
        
        if (!existingOverrides?.ACTIVITY_BOT_ATTACHED_ALT) {
            result.ACTIVITY_BOT_ATTACHED_ALT = `${currentAgentName} attached:`;
        }
        
        return result;
    };
};
