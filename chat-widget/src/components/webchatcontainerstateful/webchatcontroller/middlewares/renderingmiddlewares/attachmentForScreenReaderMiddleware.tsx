/* eslint-disable @typescript-eslint/no-explicit-any */
/******
 * AttachmentForScreenReaderMiddleware
 *
 * Web Chat reads an Adaptive Card to screen readers only from the card's `speak` property.
 * A card without `speak` is announced as "A card" with no content.
 * This middleware sets `speak` from the visible text of the card, then lets Web Chat render it as usual.
 ******/

import React, { useMemo } from "react";

import DOMPurify from "dompurify";
import { createMarkdown } from "../../../../livechatwidget/common/createMarkdown";
import { hooks } from "botframework-webchat";

const { useAdaptiveCardsPackage, useStyleOptions } = hooks;

const ADAPTIVE_CARD_CONTENT_TYPE = "application/vnd.microsoft.card.adaptive";
const HTML_BLOCK_END = /<\/(p|li|h[1-6]|div|tr|td|th|blockquote|pre)>|<br\s*\/?>/gi;

let renderMarkdown: ((markdown: string) => string) | undefined;

// Markdown is always rendered, even when the widget shows Markdown unformatted, so that screen readers do not read the syntax characters.
// The HTML is sanitized, so content that the visible card does not show, such as scripts, is not read.
const renderMarkdownAsSafeHTML = (markdown: string): string => {
    if (!renderMarkdown) {
        const markdownIt = createMarkdown(false, false);
        renderMarkdown = markdownIt.render.bind(markdownIt);
    }

    return DOMPurify.sanitize(renderMarkdown(markdown));
};

const htmlToText = (html: string): string => {
    const body = new DOMParser().parseFromString(html.replace(HTML_BLOCK_END, "$& "), "text/html").body;
    body.querySelectorAll("img").forEach(image => image.replaceWith(` ${image.getAttribute("alt") ?? ""} `));
    return (body.textContent ?? "").replace(/\s+/g, " ").trim();
};

// Renders the element as the visible card does: Adaptive Cards formats {{DATE()}} and {{TIME()}}, then the Markdown is rendered.
// Web Chat sets the static Markdown handler before each visible render, and this restores the previous handler after rendering.
const getRenderedText = (element: any, AdaptiveCard: any): string => {
    const previousOnProcessMarkdown = AdaptiveCard.onProcessMarkdown;

    try {
        AdaptiveCard.onProcessMarkdown = (text: string, result: any) => {
            result.outputHtml = renderMarkdownAsSafeHTML(text);
            result.didProcess = true;
        };

        const renderedElement = element.render();

        return renderedElement ? htmlToText(renderedElement.outerHTML) : "";
    } catch {
        return element.asString?.() ?? "";
    } finally {
        AdaptiveCard.onProcessMarkdown = previousOnProcessMarkdown;
    }
};

// Collects the visible text of the card in document order, after the parser has applied element fallbacks.
// Inputs and actions are not collected because Web Chat already lists them after the card text.
export const getAdaptiveCardSpeak = (content: any, adaptiveCardsPackage: any, adaptiveCardsParserMaxVersion?: string): string => {
    const { AdaptiveCard, FactSet, Image, RichTextBlock, SerializationContext, TextBlock, Version } = adaptiveCardsPackage;
    const maxVersion = adaptiveCardsParserMaxVersion ? Version.parse(adaptiveCardsParserMaxVersion, new SerializationContext()) : undefined;
    const card = new AdaptiveCard();
    const texts: string[] = [];

    card.parse(content, new SerializationContext(maxVersion?.isValid ? maxVersion : undefined));

    const getFactText = (factSet: any, text: string): string => {
        const textBlock = new TextBlock(text);
        textBlock.setParent(factSet);
        return getRenderedText(textBlock, AdaptiveCard);
    };

    const walk = (element: any): void => {
        if (!element?.isVisible) {
            return;
        }

        if (element instanceof TextBlock || element instanceof RichTextBlock) {
            texts.push(getRenderedText(element, AdaptiveCard));
        } else if (element instanceof FactSet) {
            element.facts.forEach(({ name, value }: { name?: string; value?: string }) => {
                texts.push([name, value].map(text => text ? getFactText(element, text) : "").filter(Boolean).join(": "));
            });
        } else if (element instanceof Image) {
            texts.push(element.altText);
        }

        if (element.getItemAt && element.getItemCount) {
            for (let index = 0, count = element.getItemCount(); index < count; index++) {
                walk(element.getItemAt(index));
            }
        }
    };

    walk(card);

    return texts.filter(text => typeof text === "string" && text).join(" ").replace(/\s+/g, " ").trim();
};

interface AdaptiveCardForScreenReaderProps {
    args: any[];
    next: (...args: any[]) => any;
}

const AdaptiveCardForScreenReader = ({ args, next }: AdaptiveCardForScreenReaderProps) => {
    const [adaptiveCardsPackage] = useAdaptiveCardsPackage();
    const [{ adaptiveCardsParserMaxVersion }] = useStyleOptions();
    const [options] = args;
    const { attachment } = options;

    const contentWithSpeak = useMemo(() => {
        try {
            const content = typeof attachment.content === "string" ? JSON.parse(attachment.content) : attachment.content;

            if (!content || typeof content !== "object" || content.speak) {
                return undefined;
            }

            const speak = getAdaptiveCardSpeak(content, adaptiveCardsPackage, adaptiveCardsParserMaxVersion);

            return speak ? { ...content, speak } : undefined;
        } catch {
            return undefined;
        }
    }, [adaptiveCardsPackage, adaptiveCardsParserMaxVersion, attachment]);

    const render = contentWithSpeak ?
        next({ ...options, attachment: { ...attachment, content: contentWithSpeak } }, ...args.slice(1)) :
        next(...args);

    return typeof render === "function" ? render() : null;
};

export const createAttachmentForScreenReaderMiddleware = () => {
    const attachmentForScreenReaderMiddleware = () => (next: any) => (...args: any[]) => {
        const attachment = args[0]?.attachment;

        // Web Chat renders nothing for a card without content, so it is left to Web Chat.
        if (attachment?.contentType !== ADAPTIVE_CARD_CONTENT_TYPE || !attachment.content) {
            return next(...args);
        }

        // eslint-disable-next-line react/display-name
        return () => <AdaptiveCardForScreenReader args={args} next={next} />;
    };

    return attachmentForScreenReaderMiddleware;
};
