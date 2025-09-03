/* eslint-disable @typescript-eslint/no-explicit-any */

import { Constants } from "../../../../../common/Constants";
import { getIconText } from "../../../../../common/utils";
import { defaultWebChatStyles } from "../../../common/defaultStyles/defaultWebChatStyles";
import { IWebChatAction } from "../../../interfaces/IWebChatAction";
import { WebChatActionType } from "../../enums/WebChatActionType";


let currentAgentInitials = defaultWebChatStyles.botAvatarInitials;

export const localizedStringsBotInitialsMiddleware = () => ({ dispatch }: { dispatch: any }) => (next: any) => (action: IWebChatAction) => {
    if (action.type === WebChatActionType.DIRECT_LINE_INCOMING_ACTIVITY) {
        const activity = action.payload?.activity;

        if (activity?.from?.name && activity.from.role !== Constants.userMessageTag && activity.from.name !== Constants.userMessageTag) {
            const agentName = activity.from.name.trim();
            
            const isSystemMessage = agentName === "__agent__" || 
                                    agentName.startsWith("__") ||
                                    activity.channelData?.tags?.includes(Constants.systemMessageTag) ||
                                    activity.tags?.includes(Constants.systemMessageTag);
            
            if (!isSystemMessage && agentName !== "") {
                // Update initials for valid agent/bot names
                const newInitials = getIconText(agentName) || currentAgentInitials;
                currentAgentInitials = newInitials;
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