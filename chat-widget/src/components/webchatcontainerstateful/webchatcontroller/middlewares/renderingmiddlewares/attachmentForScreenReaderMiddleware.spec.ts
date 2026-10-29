import { createAttachmentForScreenReaderMiddleware, getAdaptiveCardText } from "./attachmentForScreenReaderMiddleware";

import { createMarkdown } from "../../../../livechatwidget/common/createMarkdown";

/* eslint-disable @typescript-eslint/no-explicit-any */

const ADAPTIVE_CARD = "application/vnd.microsoft.card.adaptive";

// Shape of a Copilot Studio answer: a single Markdown TextBlock in an Adaptive Card, without `speak`.
const answerCard = {
    type: "AdaptiveCard",
    version: "1.5",
    body: [{
        type: "TextBlock",
        wrap: true,
        text: "**How to Reset Your Password**\n\n- Select Forgot password on the sign-in page.\n- Follow the link in the email."
    }]
};

const defaultMarkdown = createMarkdown(false, false);
const renderDefaultMarkdown = defaultMarkdown.render.bind(defaultMarkdown);

const runMiddleware = (attachment: any) => {
    const next = jest.fn(() => "rendered");
    const activity = { type: "message", attachments: [attachment] };
    const result = createAttachmentForScreenReaderMiddleware()()(next)({ activity, attachment });

    return { activity, next, result };
};

describe("attachmentForScreenReaderMiddleware", () => {
    // Web Chat announces a card without `speak` as "A card:" with no content, so the card text must be passed to it as `speak`.
    // The Markdown syntax is removed, also when the widget shows Markdown unformatted, so that screen readers do not read "star star".
    it("gives Web Chat the visible card text as speak, without Markdown syntax", () => {
        const attachment = { contentType: ADAPTIVE_CARD, content: answerCard };

        const { next, result } = runMiddleware(attachment);

        const [{ attachment: forwarded }] = (next.mock.calls[0] as any[]);
        expect(forwarded.content.speak).toBe("How to Reset Your Password Select Forgot password on the sign-in page. Follow the link in the email.");
        expect(forwarded.content.body).toBe(answerCard.body);
        expect(result).toBe("rendered");
    });

    it("does not change the card that is rendered visibly", () => {
        const attachment = { contentType: ADAPTIVE_CARD, content: answerCard };

        const { activity } = runMiddleware(attachment);

        expect(activity.attachments[0]).toBe(attachment);
        expect(attachment.content).toBe(answerCard);
        expect((answerCard as any).speak).toBeUndefined();
    });

    it("keeps the speak text that the bot provides", () => {
        const attachment = { contentType: ADAPTIVE_CARD, content: { ...answerCard, speak: "Bot provided speech" } };

        const { next } = runMiddleware(attachment);

        expect((next.mock.calls[0] as any[])[0].attachment).toBe(attachment);
    });

    it("reads Adaptive Card content that arrives as a JSON string", () => {
        const attachment = { contentType: ADAPTIVE_CARD, content: JSON.stringify(answerCard) };

        const { next } = runMiddleware(attachment);

        expect((next.mock.calls[0] as any[])[0].attachment.content.speak).toContain("How to Reset Your Password");
    });

    it.each([
        ["a hero card", { contentType: "application/vnd.microsoft.card.hero", content: { title: "Hero" } }],
        ["a file", { contentType: "image/png", contentUrl: "https://example.invalid/a.png", name: "a.png" }],
        ["an Adaptive Card that is not valid JSON", { contentType: ADAPTIVE_CARD, content: "{not json" }],
        ["an Adaptive Card with only actions", { contentType: ADAPTIVE_CARD, content: { type: "AdaptiveCard", body: [], actions: [{ type: "Action.Submit", title: "Yes" }] } }]
    ])("leaves %s to Web Chat unchanged", (_, attachment) => {
        const { next } = runMiddleware(attachment);

        expect((next.mock.calls[0] as any[])[0].attachment).toBe(attachment);
    });

    it("reads nested text, facts, rich text and image alt text in order, and skips hidden elements", () => {
        const card = {
            type: "AdaptiveCard",
            body: [
                { type: "TextBlock", text: "Order status" },
                { type: "TextBlock", text: "Internal note", isVisible: false },
                { type: "Container", isVisible: false, items: [{ type: "TextBlock", text: "Hidden container" }] },
                {
                    type: "ColumnSet",
                    columns: [
                        { type: "Column", items: [{ type: "Image", url: "https://example.invalid/card.png", altText: "Product photo" }] },
                        { type: "Column", items: [{ type: "FactSet", facts: [{ title: "Balance", value: "**$10.00**" }] }] }
                    ]
                },
                { type: "RichTextBlock", inlines: [{ type: "TextRun", text: "Thank you, " }, "customer"] },
                { type: "Table", rows: [{ type: "TableRow", cells: [{ type: "TableCell", items: [{ type: "TextBlock", text: "Cell text" }] }] }] }
            ],
            actions: [{ type: "Action.OpenUrl", title: "Open", url: "https://example.invalid" }]
        };

        expect(getAdaptiveCardText(card, renderDefaultMarkdown)).toBe("Order status Product photo Balance: $10.00 Thank you, customer Cell text");
    });
});
