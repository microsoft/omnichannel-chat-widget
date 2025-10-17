/* eslint-disable @typescript-eslint/no-explicit-any */

import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { Constants } from "../../../../../common/Constants";
import { IWebChatAction } from "../../../interfaces/IWebChatAction";
import { WebChatActionType } from "../../enums/WebChatActionType";
import { defaultWebChatStyles } from "../../../common/defaultStyles/defaultWebChatStyles";
import { getIconText } from "../../../../../common/utils";

let currentAgentInitials = defaultWebChatStyles.botAvatarInitials;

// Optional external updater (React context dispatch wrapper) set at runtime
let externalInitialsUpdater: ((initials: string) => void) | undefined;

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

            if (!isSystemMessage && agentName) {
                const newInitials = getIconText(agentName) || currentAgentInitials;
                if (newInitials !== currentAgentInitials) {
                    currentAgentInitials = newInitials;
                    // Notify external React context if provided
                    externalInitialsUpdater?.(currentAgentInitials || "");
                    // Broadcast (optional) for multi-tab sync without forcing consumers
                    BroadcastService.postMessage({
                        eventName: "BotAvatarInitialsUpdated",
                        payload: { initials: currentAgentInitials }
                    });
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
            result.ACTIVITY_BOT_SAID_ALT = `${currentAgentInitials} said:`;
        }
        
        if (!existingOverrides?.ACTIVITY_BOT_ATTACHED_ALT) {
            result.ACTIVITY_BOT_ATTACHED_ALT = `${currentAgentInitials} attached:`;
        }
        
        return result;
    };
};