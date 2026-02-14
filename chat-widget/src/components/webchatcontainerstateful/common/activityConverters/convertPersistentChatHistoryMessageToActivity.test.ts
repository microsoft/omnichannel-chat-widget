/* eslint-disable @typescript-eslint/no-explicit-any */
import convertPersistentChatHistoryMessageToActivity from "./convertPersistentChatHistoryMessageToActivity";

// Mock botActivity
jest.mock("../activities/botActivity", () => ({
    __esModule: true,
    default: {
        from: { role: "bot" },
        type: "message"
    }
}));

describe("convertPersistentChatHistoryMessageToActivity", () => {

    const createBaseMessage = (overrides: any = {}) => ({
        content: "Hello",
        from: {
            user: { displayName: "Agent" },
            application: { displayName: "Bot" }
        },
        created: "2024-01-01T00:00:00.000Z",
        additionalData: {
            tags: "tag1,tag2",
            ConversationId: "conv-1"
        },
        transcriptOriginalMessageId: "1704067200000",
        attachments: [],
        ...overrides
    });

    describe("plain text messages", () => {
        it("should return activity with text for plain string content", () => {
            const message = createBaseMessage({ content: "Hello world" });
            const result = convertPersistentChatHistoryMessageToActivity(message);

            expect(result).toBeTruthy();
            expect(result.text).toBe("Hello world");
            expect(result.from.role).toBe("bot");
            expect(result.type).toBe("message");
        });

        it("should return activity with text for non-JSON content", () => {
            const message = createBaseMessage({ content: "This is not JSON" });
            const result = convertPersistentChatHistoryMessageToActivity(message);

            expect(result.text).toBe("This is not JSON");
        });
    });

    describe("adaptive card detection", () => {
        it("should handle content with standard adaptive card attachments", () => {
            const cardContent = JSON.stringify({
                type: "message",
                text: "",
                attachments: [{
                    contentType: "application/vnd.microsoft.card.adaptive",
                    content: {
                        type: "AdaptiveCard",
                        version: "1.3",
                        body: [{ type: "TextBlock", text: "Choose an option" }]
                    }
                }]
            });
            const message = createBaseMessage({ content: cardContent });
            const result = convertPersistentChatHistoryMessageToActivity(message);

            expect(result.attachments).toBeDefined();
            expect(result.attachments).toHaveLength(1);
            expect(result.attachments[0].contentType).toBe("application/vnd.microsoft.card.adaptive");
            expect(result.attachments[0].content.type).toBe("AdaptiveCard");
        });

        it("should handle hero card content", () => {
            const cardContent = JSON.stringify({
                type: "message",
                attachments: [{
                    contentType: "application/vnd.microsoft.card.hero",
                    content: {
                        title: "Choose your location",
                        buttons: [
                            { type: "imBack", title: "Bellevue", value: "Bellevue" }
                        ]
                    }
                }]
            });
            const message = createBaseMessage({ content: cardContent });
            const result = convertPersistentChatHistoryMessageToActivity(message);

            expect(result.attachments).toBeDefined();
            expect(result.attachments[0].contentType).toBe("application/vnd.microsoft.card.hero");
        });

        it("should handle thumbnail card content", () => {
            const cardContent = JSON.stringify({
                type: "message",
                attachments: [{
                    contentType: "application/vnd.microsoft.card.thumbnail",
                    content: { title: "Test", subtitle: "Subtitle" }
                }]
            });
            const message = createBaseMessage({ content: cardContent });
            const result = convertPersistentChatHistoryMessageToActivity(message);

            expect(result.attachments).toBeDefined();
            expect(result.attachments[0].contentType).toBe("application/vnd.microsoft.card.thumbnail");
        });

        it("should handle multiple card attachments (carousel)", () => {
            const cardContent = JSON.stringify({
                type: "message",
                attachmentLayout: "carousel",
                attachments: [
                    { contentType: "application/vnd.microsoft.card.hero", content: { title: "Card 1" } },
                    { contentType: "application/vnd.microsoft.card.hero", content: { title: "Card 2" } },
                    { contentType: "application/vnd.microsoft.card.hero", content: { title: "Card 3" } }
                ]
            });
            const message = createBaseMessage({ content: cardContent });
            const result = convertPersistentChatHistoryMessageToActivity(message);

            expect(result.attachments).toHaveLength(3);
            expect(result.attachmentLayout).toBe("carousel");
        });
    });

    describe("raw adaptive card body wrapping", () => {
        it("should wrap raw AdaptiveCard body in a proper activity attachment", () => {
            const cardBody = JSON.stringify({
                type: "AdaptiveCard",
                $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
                version: "1.3",
                body: [{ type: "TextBlock", text: "Hello from adaptive card" }]
            });
            const message = createBaseMessage({ content: cardBody });
            const result = convertPersistentChatHistoryMessageToActivity(message);

            expect(result.type).toBe("message");
            expect(result.attachments).toBeDefined();
            expect(result.attachments).toHaveLength(1);
            expect(result.attachments[0].contentType).toBe("application/vnd.microsoft.card.adaptive");
            expect(result.attachments[0].content.type).toBe("AdaptiveCard");
            expect(result.attachments[0].content.body[0].text).toBe("Hello from adaptive card");
        });

        it("should not set type to AdaptiveCard on the activity when wrapping", () => {
            const cardBody = JSON.stringify({
                type: "AdaptiveCard",
                version: "1.3",
                body: []
            });
            const message = createBaseMessage({ content: cardBody });
            const result = convertPersistentChatHistoryMessageToActivity(message);

            // Activity type must be "message", not "AdaptiveCard"
            expect(result.type).toBe("message");
        });
    });

    describe("suggested actions", () => {
        it("should handle content with suggestedActions property", () => {
            const cardContent = JSON.stringify({
                type: "message",
                text: "What would you like help with?",
                suggestedActions: {
                    actions: [
                        { type: "imBack", title: "Help", value: "help" },
                        { type: "imBack", title: "Cancel", value: "cancel" }
                    ]
                }
            });
            const message = createBaseMessage({ content: cardContent });
            const result = convertPersistentChatHistoryMessageToActivity(message);

            expect(result.suggestedActions).toBeDefined();
            expect(result.suggestedActions.actions).toHaveLength(2);
            expect(result.text).toBe("What would you like help with?");
        });
    });

    describe("structural detection (attachments without recognized card type substrings)", () => {
        it("should detect activity with attachments even without standard card type strings", () => {
            const content = JSON.stringify({
                type: "message",
                text: "",
                attachments: [{
                    contentType: "application/vnd.microsoft.card.custom",
                    content: { title: "Custom card" }
                }]
            });
            const message = createBaseMessage({ content });
            const result = convertPersistentChatHistoryMessageToActivity(message);

            // Should detect via structural check (hasAttachments) not just substring
            expect(result.attachments).toBeDefined();
            expect(result.attachments).toHaveLength(1);
            expect(result.text).not.toBe(content); // Should NOT fall through to plain text
        });

        it("should detect activity with suggestedActions structurally", () => {
            const content = JSON.stringify({
                type: "message",
                text: "Pick one",
                suggestedActions: {
                    actions: [{ type: "imBack", title: "A", value: "a" }]
                }
            });
            const message = createBaseMessage({ content });
            const result = convertPersistentChatHistoryMessageToActivity(message);

            expect(result.suggestedActions).toBeDefined();
        });
    });

    describe("fallback for type:message with value property", () => {
        it("should handle activity with value property as rich message", () => {
            const content = JSON.stringify({
                type: "message",
                text: "",
                value: {
                    type: "list",
                    items: [
                        { type: "imBack", title: "Option A", value: "optionA" }
                    ]
                }
            });
            const message = createBaseMessage({ content });
            const result = convertPersistentChatHistoryMessageToActivity(message);

            // Should NOT show raw JSON as text
            expect(result.text).not.toBe(content);
            expect(result.value).toBeDefined();
        });
    });

    describe("from.role preservation", () => {
        it("should preserve from.role as bot when parsedContent has from without role", () => {
            const content = JSON.stringify({
                type: "message",
                from: { id: "28:bot-id", name: "Bot Name" },
                attachments: [{
                    contentType: "application/vnd.microsoft.card.adaptive",
                    content: { type: "AdaptiveCard", body: [] }
                }]
            });
            const message = createBaseMessage({ content });
            const result = convertPersistentChatHistoryMessageToActivity(message);

            expect(result.from.role).toBe("bot");
            // parsedContent.from.name takes precedence over activity.from.name
            expect(result.from.name).toBe("Bot Name");
            expect(result.from.id).toBe("28:bot-id");
        });

        it("should set from.role as user for customer messages", () => {
            const message = createBaseMessage({
                content: "Hi there",
                from: {
                    user: null,
                    application: { displayName: "Customer" }
                }
            });
            const result = convertPersistentChatHistoryMessageToActivity(message);

            expect(result.from.role).toBe("user");
        });
    });

    describe("customer form submission filtering", () => {
        it("should return null for customer RichObjectMessage_Form submissions", () => {
            const content = JSON.stringify({
                value: { type: "RichObjectMessage_Form", data: { field: "value" } }
            });
            const message = createBaseMessage({
                content,
                from: {
                    user: null,
                    application: { displayName: "Customer" }
                }
            });
            const result = convertPersistentChatHistoryMessageToActivity(message);

            expect(result).toBeNull();
        });

        it("should NOT filter RichObjectMessage_Form from bot messages", () => {
            const content = JSON.stringify({
                value: { type: "RichObjectMessage_Form", data: { field: "value" } }
            });
            const message = createBaseMessage({
                content,
                from: {
                    user: { displayName: "Bot" },
                    application: { displayName: "Bot" }
                }
            });
            const result = convertPersistentChatHistoryMessageToActivity(message);

            expect(result).not.toBeNull();
        });
    });

    describe("channelData and metadata", () => {
        it("should include persistentChatHistoryMessageTag in tags", () => {
            const message = createBaseMessage({ content: "Hello" });
            const result = convertPersistentChatHistoryMessageToActivity(message);

            expect(result.channelData.tags).toContain("PersistentChatHistory");
        });

        it("should include additionalData tags", () => {
            const message = createBaseMessage({
                content: "Hello",
                additionalData: { tags: "public,FromCustomer", ConversationId: "conv-1" }
            });
            const result = convertPersistentChatHistoryMessageToActivity(message);

            expect(result.channelData.tags).toContain("public");
            expect(result.channelData.tags).toContain("FromCustomer");
        });

        it("should set webchat:sequence-id from transcriptOriginalMessageId", () => {
            const message = createBaseMessage({
                content: "Hello",
                transcriptOriginalMessageId: "1704067200000"
            });
            const result = convertPersistentChatHistoryMessageToActivity(message);

            expect(result.channelData["webchat:sequence-id"]).toBe(1704067200000);
        });

        it("should set conversationId from additionalData", () => {
            const message = createBaseMessage({
                content: "Hello",
                additionalData: { ConversationId: "test-conv-id", tags: "" }
            });
            const result = convertPersistentChatHistoryMessageToActivity(message);

            expect(result.channelData.conversationId).toBe("test-conv-id");
        });
    });

    describe("file attachments (non-content)", () => {
        it("should handle file attachments when no content", () => {
            const message = createBaseMessage({
                content: undefined,
                attachments: [{ name: "document.pdf" }]
            });
            const result = convertPersistentChatHistoryMessageToActivity(message);

            expect(result.text).toContain("document.pdf");
        });

        it("should handle file attachments with unknown name", () => {
            const message = createBaseMessage({
                content: undefined,
                attachments: [{}]
            });
            const result = convertPersistentChatHistoryMessageToActivity(message);

            expect(result.text).toContain("Unknown");
        });
    });

    describe("edge cases", () => {
        it("should return null when neither content nor attachments are present", () => {
            const message = createBaseMessage({
                content: undefined,
                attachments: []
            });
            const result = convertPersistentChatHistoryMessageToActivity(message);

            expect(result).toBeNull();
        });

        it("should handle JSON number content as plain text", () => {
            const message = createBaseMessage({ content: "42" });
            const result = convertPersistentChatHistoryMessageToActivity(message);

            // JSON.parse("42") returns 42 (a number, not an object)
            // Should fall through to plain text
            expect(result.text).toBe("42");
        });

        it("should handle JSON string content as plain text", () => {
            const message = createBaseMessage({ content: '"hello"' });
            const result = convertPersistentChatHistoryMessageToActivity(message);

            // JSON.parse('"hello"') returns "hello" (a string, not an object)
            // Should fall through to plain text
            expect(result.text).toBe('"hello"');
        });

        it("should handle JSON array content as plain text", () => {
            const message = createBaseMessage({ content: "[1,2,3]" });
            const result = convertPersistentChatHistoryMessageToActivity(message);

            // Arrays are objects but don't have meaningful activity properties
            // Should fall through to plain text since it doesn't match any card detection
            expect(result.text).toBe("[1,2,3]");
        });

        it("should handle empty JSON object as plain text", () => {
            const message = createBaseMessage({ content: "{}" });
            const result = convertPersistentChatHistoryMessageToActivity(message);

            expect(result.text).toBe("{}");
        });

        it("should not display JSON content as raw text when it contains adaptive card data", () => {
            // Simulate a message where the content is valid JSON with card data
            // but doesn't exactly match the substring checks
            const content = JSON.stringify({
                type: "message",
                attachments: [{
                    contentType: "application/vnd.microsoft.card.adaptive",
                    content: {
                        type: "AdaptiveCard",
                        body: [{ type: "TextBlock", text: "Test" }],
                        actions: [{ type: "Action.Submit", title: "Submit" }]
                    }
                }]
            });
            const message = createBaseMessage({ content });
            const result = convertPersistentChatHistoryMessageToActivity(message);

            // The content should NOT be set as plain text
            expect(result.text).not.toBe(content);
            // Should have attachments
            expect(result.attachments).toBeDefined();
            expect(result.attachments.length).toBeGreaterThan(0);
        });
    });
});
