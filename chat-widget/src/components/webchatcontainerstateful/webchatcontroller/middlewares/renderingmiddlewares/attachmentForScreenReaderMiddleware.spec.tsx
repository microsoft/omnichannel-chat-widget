/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
import { createAttachmentForScreenReaderMiddleware, getAdaptiveCardSpeak } from "./attachmentForScreenReaderMiddleware";

import React from "react";
import { createScreenReaderMarkdownRenderer } from "../../../../livechatwidget/common/initWebChatComposer";
import { render } from "@testing-library/react";

// Use the Adaptive Cards package that Web Chat renders the visible card with, so parsing, fallbacks and date formatting match.
const loadWebChatAdaptiveCards = () => {
    const path = require("path");
    return require(require.resolve("adaptivecards", { paths: [path.resolve(process.cwd(), "node_modules/botframework-webchat")] }));
};

jest.mock("botframework-webchat", () => {
    const path = require("path");
    const adaptiveCardsPackage = require(require.resolve("adaptivecards", { paths: [path.resolve(process.cwd(), "node_modules/botframework-webchat")] }));
    return {
        hooks: {
            useAdaptiveCardsPackage: () => [adaptiveCardsPackage],
            useStyleOptions: () => [{}]
        }
    };
});

const ADAPTIVE_CARD = "application/vnd.microsoft.card.adaptive";
const adaptiveCardsPackage = loadWebChatAdaptiveCards();

// Adaptive Cards sets plain text, such as a TextRun, with innerText. jsdom does not implement innerText, so set it as browsers do.
const originalInnerText = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "innerText");

beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, "innerText", {
        configurable: true,
        get() { return this.textContent; },
        set(value: string) {
            this.textContent = "";
            String(value).split("\n").forEach((line, index) => {
                if (index) {
                    this.appendChild(document.createElement("br"));
                }
                this.appendChild(document.createTextNode(line));
            });
        }
    });
});

afterAll(() => {
    if (originalInnerText) {
        Object.defineProperty(HTMLElement.prototype, "innerText", originalInnerText);
    } else {
        delete (HTMLElement.prototype as any).innerText;
    }
});

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

const speakOf = (body: any[], webChatContainerProps: any = {}) =>
    getAdaptiveCardSpeak({ type: "AdaptiveCard", version: "1.5", body }, adaptiveCardsPackage, createScreenReaderMarkdownRenderer(webChatContainerProps));

const runMiddleware = (attachment: any) => {
    // eslint-disable-next-line react/display-name
    const next = jest.fn(() => () => <span>rendered by Web Chat</span>);
    const activity = { type: "message", attachments: [attachment] };
    const renderer = createAttachmentForScreenReaderMiddleware(createScreenReaderMarkdownRenderer({}))()(next)({ activity, attachment });
    const { container } = render(<>{typeof renderer === "function" ? renderer() : renderer}</>);

    return { activity, container, next, renderer };
};

describe("attachmentForScreenReaderMiddleware", () => {
    // Web Chat announces a card without `speak` as "A card:" with no content, so the card text must be passed to it as `speak`.
    // The Markdown syntax is removed, also when the widget shows Markdown unformatted, so that screen readers do not read "star star".
    it("gives Web Chat the visible card text as speak, without Markdown syntax", () => {
        const attachment = { contentType: ADAPTIVE_CARD, content: answerCard };

        const { container, next } = runMiddleware(attachment);

        const [{ attachment: forwarded }] = (next.mock.calls[0] as any[]);
        expect(forwarded.content.speak).toBe("How to Reset Your Password Select Forgot password on the sign-in page. Follow the link in the email.");
        expect(forwarded.content.body).toBe(answerCard.body);
        expect(container.textContent).toBe("rendered by Web Chat");
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
        ["an Adaptive Card that is not valid JSON", { contentType: ADAPTIVE_CARD, content: "{not json" }],
        ["an Adaptive Card with only actions", { contentType: ADAPTIVE_CARD, content: { type: "AdaptiveCard", body: [], actions: [{ type: "Action.Submit", title: "Yes" }] } }]
    ])("leaves %s to Web Chat unchanged", (_, attachment) => {
        const { next } = runMiddleware(attachment);

        expect((next.mock.calls[0] as any[])[0].attachment).toBe(attachment);
    });

    // Web Chat renders nothing for these, so the middleware must not add a renderer and change the "N attachments" count.
    it.each([
        ["a hero card", { contentType: "application/vnd.microsoft.card.hero", content: { title: "Hero" } }],
        ["a file", { contentType: "image/png", contentUrl: "https://example.invalid/a.png", name: "a.png" }],
        ["an Adaptive Card without content", { contentType: ADAPTIVE_CARD }]
    ])("passes %s directly to Web Chat", (_, attachment) => {
        const next = jest.fn(() => false);
        const args = { activity: { attachments: [attachment] }, attachment };

        expect(createAttachmentForScreenReaderMiddleware()()(next)(args)).toBe(false);
        expect(next).toHaveBeenCalledWith(args);
    });

    it("does not read script content that the visible card does not show", () => {
        const speak = speakOf([{ type: "TextBlock", text: "Hello <script>alert('xss')</script> world" }]);

        expect(speak).toBe("Hello world");
    });

    it("does not read style content that the visible card does not show", () => {
        const speak = speakOf([{ type: "TextBlock", text: "Hello <style>.x{color:red}</style> world" }]);

        expect(speak).toBe("Hello world");
    });

    // The "opens in a new window" icon describes the link target, so repeating it for each link in an announcement is noise.
    it("reads link text without the external link icon", () => {
        const speak = speakOf([{ type: "TextBlock", text: "[Sign in](https://example.invalid/login) to continue." }]);

        expect(speak).toBe("Sign in to continue.");
    });

    it.each([true, false])("removes the Markdown syntax when the widget sets disableMarkdownMessageFormatting to %s", (disableMarkdownMessageFormatting) => {
        const speak = speakOf([{ type: "TextBlock", text: "**Bold** and [a link](https://example.invalid/)" }], { disableMarkdownMessageFormatting });

        expect(speak).toBe("Bold and a link");
    });

    // The visible card shows the URL as the link text when hyperlinkTextOverride is set, so the announcement must read the URL too.
    it("reads link text as the URL when the widget sets hyperlinkTextOverride", () => {
        const speak = speakOf([{ type: "TextBlock", text: "[Sign in](https://example.invalid/login) to continue." }], { hyperlinkTextOverride: true });

        expect(speak).toBe("https://example.invalid/login to continue.");
    });

    it("renders Markdown with the host renderMarkdown when the host provides one", () => {
        const renderMarkdown = jest.fn((text: string) => `<p>Host rendered: ${text.replace(/\*/g, "")}</p>`);

        const speak = speakOf([{ type: "TextBlock", text: "**Answer**" }], { webChatProps: { renderMarkdown } });

        expect(renderMarkdown).toHaveBeenCalledWith("**Answer**");
        expect(speak).toBe("Host rendered: Answer");
    });

    // Web Chat's visible renderer shares the static Markdown handler, so it must be put back after the text is computed.
    it("restores the Adaptive Cards Markdown handler after computing the text", () => {
        const { AdaptiveCard } = adaptiveCardsPackage;
        const previousOnProcessMarkdown = AdaptiveCard.onProcessMarkdown;
        const webChatOnProcessMarkdown = jest.fn();
        AdaptiveCard.onProcessMarkdown = webChatOnProcessMarkdown;

        try {
            speakOf([{ type: "TextBlock", text: "**Answer**" }, { type: "FactSet", facts: [{ title: "Due", value: "Today" }] }]);

            expect(AdaptiveCard.onProcessMarkdown).toBe(webChatOnProcessMarkdown);
            expect(webChatOnProcessMarkdown).not.toHaveBeenCalled();
        } finally {
            AdaptiveCard.onProcessMarkdown = previousOnProcessMarkdown;
        }
    });

    it("reads the fallback element that the visible card shows for an unsupported element", () => {
        const speak = speakOf([
            { type: "Contoso.Unsupported", fallback: { type: "TextBlock", text: "Fallback text" } },
            { type: "Contoso.Dropped", fallback: "drop" }
        ]);

        expect(speak).toBe("Fallback text");
    });

    it("reads dates and times as the visible card formats them, not as template syntax", () => {
        const speak = speakOf([
            { type: "TextBlock", text: "Opens {{DATE(2026-10-20T15:00:00Z, SHORT)}} at {{TIME(2026-10-20T15:00:00Z)}}" },
            { type: "FactSet", facts: [{ title: "Due", value: "{{DATE(2026-10-20T15:00:00Z, LONG)}}" }] },
            { type: "RichTextBlock", inlines: [{ type: "TextRun", text: "Updated {{DATE(2026-10-20T15:00:00Z)}}" }] }
        ]);

        expect(speak).not.toContain("{{");
        expect(speak).toMatch(/^Opens .*2026.* at .+ Due: .*2026.* Updated .+$/);
    });

    it("reads nested text, facts, rich text and image alt text in order, and skips hidden elements", () => {
        const speak = speakOf([
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
            { type: "Table", columns: [{ width: 1 }], rows: [{ type: "TableRow", cells: [{ type: "TableCell", items: [{ type: "TextBlock", text: "Cell text" }] }] }] }
        ]);

        expect(speak).toBe("Order status Product photo Balance: $10.00 Thank you, customer Cell text");
    });
});
