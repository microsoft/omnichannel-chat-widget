import { Constants } from "../../../../common/Constants";
import { SupportedAdaptiveCards } from "@microsoft/omnichannel-chat-sdk/lib/utils/printers/interfaces/SupportedAdaptiveCards";
import botActivity from "../activities/botActivity";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const convertStringValueToInt = (value: any) => {
    if (typeof value !== "string" || value === "") {
        return undefined;
    }

    let result;
    try { 
        result = parseInt(value);
    } catch (e) {
        return undefined;
    }

    return isNaN(result) ? undefined : result;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const convertPersistentChatHistoryMessageToActivity = (message: any) => {
    const {additionalData, attachments, botContentType, content, created, from, transcriptOriginalMessageId} = message;
    const isFromCustomer = from?.application?.displayName === "Customer";

    // Filter out customer responses to adaptive cards (e.g., form submissions like {"value":{"goPaperless":"yes"}}).
    // These are the customer's postBack/messageBack replies to bot adaptive cards — not displayable content.
    // In live chat, webchat hides these natively; in history we must filter them explicitly.
    if (isFromCustomer && botContentType === "azurebotservice.adaptivecard") {
        return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activity: any = {
        ...botActivity,
        channelData: {
            tags: [Constants.persistentChatHistoryMessageTag]
        }
    };

    let webchatSequenceId;
    let timestamp;
    if (transcriptOriginalMessageId) { 
        const id = convertStringValueToInt(transcriptOriginalMessageId); // Id used to determine the sequence of messages which is the same as the 'live' messages
        if (id) {
            webchatSequenceId = id;
            timestamp = new Date(id) || created;
            activity.channelData = {
                ...activity.channelData,
                "webchat:sequence-id": webchatSequenceId
            };
        }
    }

    if (additionalData?.tags) {
        const formattedTags = additionalData.tags.split(",");
        activity.channelData = {
            ...activity.channelData,
            tags: [...activity.channelData.tags, ...formattedTags]
        };
    }

    if (additionalData?.ConversationId) {
        activity.channelData.conversationId = additionalData.ConversationId;
    }

    if (from?.user?.displayName) {
        activity.from = {
            ...activity.from,
            name: from.user.displayName
        };
    }

    if (from?.application?.displayName === "Customer") {
        activity.from = {
            role: "user",
            name: from.application.displayName
        };
    }

    if (content) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let parsedContent: any;

        try {
            parsedContent = JSON.parse(content);
        } catch (error) {
            parsedContent = null; // fall back to normal text handling
        }

        // Check if this is a customer form submission response (e.g., RichObjectMessage_Form)
        // These should be ignored as they are form submission data, not displayable content
        if (isFromCustomer && parsedContent?.value?.type === "RichObjectMessage_Form") {
            return null;
        }

        if (parsedContent && typeof parsedContent === "object") {
            // Structural detection: check the parsed object's properties directly
            const hasAttachments = Array.isArray(parsedContent.attachments) && parsedContent.attachments.length > 0;
            const hasSuggestedActions = Array.isArray(parsedContent.suggestedActions?.actions) && parsedContent.suggestedActions.actions.length > 0;
            const isRawAdaptiveCardBody = parsedContent.type === "AdaptiveCard";

            // Filter out suggested-action-only messages from history.
            // WebChat only renders suggestedActions for the most recent activity, so in history
            // these render as empty "Suggested reply" text bubbles with no actionable buttons.
            if (hasSuggestedActions && !hasAttachments) {
                return null;
            }

            // Substring detection: check the raw content string for known card type patterns
            const contentLower = content.toLowerCase();
            const isAdaptiveCard = contentLower.includes(Constants.AdaptiveCardType);
            const isSuggestedActions = contentLower.includes(Constants.SuggestedActionsType);
            const containsSupportedCard = Object.values(SupportedAdaptiveCards).some(type => contentLower.includes(type.toLowerCase()));

            // If the content is a raw adaptive card body (type: "AdaptiveCard"), wrap it as an attachment
            // so webchat can render it properly instead of treating it as an unknown activity type
            if (isRawAdaptiveCardBody) {
                return {
                    ...activity,
                    text: "",
                    attachments: [{
                        contentType: SupportedAdaptiveCards.Adaptive,
                        content: parsedContent
                    }],
                    timestamp,
                    channelData: {
                        ...activity.channelData,
                        "webchat:sequence-id": webchatSequenceId
                    }
                };
            }

            // Detect rich content using both structural checks and substring matching
            if (hasAttachments || hasSuggestedActions || isAdaptiveCard || isSuggestedActions || containsSupportedCard) {
                // Preserve from.role from the base activity — parsedContent.from may lack the role property
                // which webchat needs to determine how to render the message (bot vs user)
                const preservedFrom = {
                    ...activity.from,
                    ...(parsedContent.from || {}),
                    role: activity.from?.role || "bot"
                };

                return {
                    ...activity,
                    ...parsedContent,
                    from: preservedFrom,
                    timestamp,
                    channelData: {
                        ...activity.channelData,
                        "webchat:sequence-id": webchatSequenceId
                    }
                };
            }

            // If parsedContent is a webchat activity (type: "message") but didn't match any specific card check,
            // still treat it as a rich activity to avoid displaying raw JSON as text
            if (parsedContent.type === "message" && (parsedContent.attachments || parsedContent.suggestedActions || parsedContent.value)) {
                const preservedFrom = {
                    ...activity.from,
                    ...(parsedContent.from || {}),
                    role: activity.from?.role || "bot"
                };

                return {
                    ...activity,
                    ...parsedContent,
                    from: preservedFrom,
                    timestamp,
                    channelData: {
                        ...activity.channelData,
                        "webchat:sequence-id": webchatSequenceId
                    }
                };
            }
        }

        // Plain text message
        return {
            ...activity,
            text: content,
            timestamp
        };
    }

    if (attachments && attachments.length > 0) {
        const fileName = attachments[0].name || "Unknown";
        const text = `The following attachment was uploaded during the conversation: ${fileName}`;
        return {
            ...activity,
            text,
            timestamp
        };
    }
    // If neither content nor attachments are present, return null to indicate no activity could be created.
    return null;
};

export default convertPersistentChatHistoryMessageToActivity;