/* eslint-disable @typescript-eslint/no-explicit-any */
import convertPersistentChatHistoryMessageToActivity from "./convertPersistentChatHistoryMessageToActivity";

// Mock Constants
jest.mock("../../../../common/Constants", () => ({
    Constants: {
        persistentChatHistoryMessageTag: "PersistentChatHistory",
        AdaptiveCardType: "adaptivecard",
        SuggestedActionsType: "suggestedactions"
    }
}));

// Mock SupportedAdaptiveCards
jest.mock("@microsoft/omnichannel-chat-sdk/lib/utils/printers/interfaces/SupportedAdaptiveCards", () => ({
    SupportedAdaptiveCards: {
        Adaptive: "application/vnd.microsoft.card.adaptive",
        Hero: "application/vnd.microsoft.card.hero",
        Thumbnail: "application/vnd.microsoft.card.thumbnail"
    }
}));

// Mock botActivity
jest.mock("../activities/botActivity", () => ({
    __esModule: true,
    default: {
        from: { role: "bot" },
        type: "message"
    }
}));

describe("convertPersistentChatHistoryMessageToActivity", () => {

    describe("plain text messages", () => {
        it("should convert a simple text message to an activity", () => {
            const message = {
                content: "Hello, how can I help you?",
                from: { user: { displayName: "Agent 1" } },
                transcriptOriginalMessageId: "1700000000000"
            };

            const result = convertPersistentChatHistoryMessageToActivity(message);

            expect(result).not.toBeNull();
            expect(result.text).toBe("Hello, how can I help you?");
            expect(result.from.role).toBe("bot");
            expect(result.from.name).toBe("Agent 1");
            expect(result.channelData.tags).toContain("PersistentChatHistory");
        });

        it("should set webchat:sequence-id from transcriptOriginalMessageId", () => {
            const message = {
                content: "Test message",
                transcriptOriginalMessageId: "1700000000000"
            };

            const result = convertPersistentChatHistoryMessageToActivity(message);

            expect(result.channelData["webchat:sequence-id"]).toBe(1700000000000);
        });

        it("should handle message from customer with user role", () => {
            const message = {
                content: "I need help",
                from: { application: { displayName: "Customer" } },
                transcriptOriginalMessageId: "1700000000000"
            };

            const result = convertPersistentChatHistoryMessageToActivity(message);

            expect(result).not.toBeNull();
            expect(result.from.role).toBe("user");
            expect(result.from.name).toBe("Customer");
        });
    });

    describe("customer adaptive card response filter", () => {
        it("should return null for customer responses to adaptive cards", () => {
            const message = {
                content: "{\"value\":{\"goPaperless\":\"yes\"}}",
                botContentType: "azurebotservice.adaptivecard",
                from: { application: { displayName: "Customer" } },
                transcriptOriginalMessageId: "1700000000000"
            };

            const result = convertPersistentChatHistoryMessageToActivity(message);

            expect(result).toBeNull();
        });

        it("should NOT filter bot adaptive card messages", () => {
            const message = {
                content: "{\"type\":\"AdaptiveCard\",\"body\":[{\"type\":\"TextBlock\",\"text\":\"Choose\"}]}",
                botContentType: "azurebotservice.adaptivecard",
                from: { user: { displayName: "Bot" } },
                transcriptOriginalMessageId: "1700000000000"
            };

            const result = convertPersistentChatHistoryMessageToActivity(message);

            expect(result).not.toBeNull();
        });

        it("should NOT filter customer text messages without adaptivecard botContentType", () => {
            const message = {
                content: "My answer is yes",
                from: { application: { displayName: "Customer" } },
                transcriptOriginalMessageId: "1700000000000"
            };

            const result = convertPersistentChatHistoryMessageToActivity(message);

            expect(result).not.toBeNull();
            expect(result.text).toBe("My answer is yes");
        });
    });

    describe("suggested reply filter", () => {
        it("should return null for messages with suggestedActions", () => {
            const message = {
                content: JSON.stringify({
                    text: "Suggested reply",
                    suggestedActions: {
                        to: [],
                        actions: [{ type: "imBack", title: "Option A", value: "A" }]
                    }
                }),
                from: { user: { displayName: "Bot" } },
                transcriptOriginalMessageId: "1700000000000"
            };

            const result = convertPersistentChatHistoryMessageToActivity(message);

            expect(result).toBeNull();
        });

        it("should return null for suggested actions with multiple buttons", () => {
            const message = {
                content: JSON.stringify({
                    text: "Please choose",
                    suggestedActions: {
                        to: [],
                        actions: [
                            { type: "imBack", title: "Yes", value: "yes" },
                            { type: "imBack", title: "No", value: "no" }
                        ]
                    }
                }),
                from: { user: { displayName: "Bot" } },
                transcriptOriginalMessageId: "1700000000000"
            };

            const result = convertPersistentChatHistoryMessageToActivity(message);

            expect(result).toBeNull();
        });

        it("should NOT filter messages with empty suggestedActions array", () => {
            const message = {
                content: JSON.stringify({
                    text: "Regular message",
                    suggestedActions: { actions: [] }
                }),
                from: { user: { displayName: "Bot" } },
                transcriptOriginalMessageId: "1700000000000"
            };

            const result = convertPersistentChatHistoryMessageToActivity(message);

            expect(result).not.toBeNull();
            expect(result.text).toBe("Regular message");
        });
    });

    describe("RichObjectMessage_Form filter", () => {
        it("should return null for customer form submission responses", () => {
            const message = {
                content: JSON.stringify({
                    value: { type: "RichObjectMessage_Form", data: "form data" }
                }),
                from: { application: { displayName: "Customer" } },
                transcriptOriginalMessageId: "1700000000000"
            };

            const result = convertPersistentChatHistoryMessageToActivity(message);

            expect(result).toBeNull();
        });

        it("should NOT filter form submissions from non-customer", () => {
            const message = {
                content: JSON.stringify({
                    value: { type: "RichObjectMessage_Form", data: "form data" }
                }),
                from: { user: { displayName: "Bot" } },
                transcriptOriginalMessageId: "1700000000000"
            };

            const result = convertPersistentChatHistoryMessageToActivity(message);

            expect(result).not.toBeNull();
        });
    });

    describe("rich content detection", () => {
        it("should wrap raw AdaptiveCard body as an attachment", () => {
            const adaptiveCard = {
                type: "AdaptiveCard",
                body: [{ type: "TextBlock", text: "Hello" }],
                actions: [{ type: "Action.Submit", title: "Submit" }]
            };

            const message = {
                content: JSON.stringify(adaptiveCard),
                from: { user: { displayName: "Bot" } },
                transcriptOriginalMessageId: "1700000000000"
            };

            const result = convertPersistentChatHistoryMessageToActivity(message);

            expect(result).not.toBeNull();
            expect(result.text).toBe("");
            expect(result.attachments).toHaveLength(1);
            expect(result.attachments[0].contentType).toBe("application/vnd.microsoft.card.adaptive");
            expect(result.attachments[0].content.type).toBe("AdaptiveCard");
        });

        it("should handle messages with attachments in parsed content", () => {
            const message = {
                content: JSON.stringify({
                    text: "Here is a card",
                    attachments: [{
                        contentType: "application/vnd.microsoft.card.hero",
                        content: { title: "Hero Card" }
                    }]
                }),
                from: { user: { displayName: "Bot" } },
                transcriptOriginalMessageId: "1700000000000"
            };

            const result = convertPersistentChatHistoryMessageToActivity(message);

            expect(result).not.toBeNull();
            expect(result.attachments).toHaveLength(1);
            expect(result.from.role).toBe("bot");
        });
    });

    describe("attachments (file uploads)", () => {
        it("should create activity text for file attachments", () => {
            const message = {
                attachments: [{ name: "document.pdf" }],
                transcriptOriginalMessageId: "1700000000000"
            };

            const result = convertPersistentChatHistoryMessageToActivity(message);

            expect(result).not.toBeNull();
            expect(result.text).toBe("The following attachment was uploaded during the conversation: document.pdf");
        });

        it("should use 'Unknown' for attachments without name", () => {
            const message = {
                attachments: [{}],
                transcriptOriginalMessageId: "1700000000000"
            };

            const result = convertPersistentChatHistoryMessageToActivity(message);

            expect(result.text).toBe("The following attachment was uploaded during the conversation: Unknown");
        });
    });

    describe("null/empty handling", () => {
        it("should return null when message has no content and no attachments", () => {
            const message = {
                transcriptOriginalMessageId: "1700000000000"
            };

            const result = convertPersistentChatHistoryMessageToActivity(message);

            expect(result).toBeNull();
        });

        it("should handle invalid JSON content gracefully as plain text", () => {
            const message = {
                content: "this is not json {broken",
                transcriptOriginalMessageId: "1700000000000"
            };

            const result = convertPersistentChatHistoryMessageToActivity(message);

            expect(result).not.toBeNull();
            expect(result.text).toBe("this is not json {broken");
        });
    });

    describe("metadata handling", () => {
        it("should include additionalData tags in channelData", () => {
            const message = {
                content: "Test",
                additionalData: { tags: "tag1,tag2,tag3" },
                transcriptOriginalMessageId: "1700000000000"
            };

            const result = convertPersistentChatHistoryMessageToActivity(message);

            expect(result.channelData.tags).toContain("PersistentChatHistory");
            expect(result.channelData.tags).toContain("tag1");
            expect(result.channelData.tags).toContain("tag2");
            expect(result.channelData.tags).toContain("tag3");
        });

        it("should set conversationId from additionalData", () => {
            const message = {
                content: "Test",
                additionalData: { ConversationId: "conv-123" },
                transcriptOriginalMessageId: "1700000000000"
            };

            const result = convertPersistentChatHistoryMessageToActivity(message);

            expect(result.channelData.conversationId).toBe("conv-123");
        });

        it("should handle missing transcriptOriginalMessageId", () => {
            const message = {
                content: "Test message"
            };

            const result = convertPersistentChatHistoryMessageToActivity(message);

            expect(result).not.toBeNull();
            expect(result.text).toBe("Test message");
            expect(result.channelData["webchat:sequence-id"]).toBeUndefined();
        });
    });
});
