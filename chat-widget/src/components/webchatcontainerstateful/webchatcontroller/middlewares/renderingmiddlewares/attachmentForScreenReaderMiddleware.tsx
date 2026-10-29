/* eslint-disable @typescript-eslint/no-explicit-any */
/******
 * AttachmentForScreenReaderMiddleware
 *
 * Web Chat reads an Adaptive Card to screen readers only from the card's `speak` property.
 * A card without `speak` is announced as "A card" with no content.
 * This middleware sets `speak` from the visible text of the card, then lets Web Chat render it as usual.
 ******/

import React, { useMemo } from "react";

import { Constants } from "../../../../../common/Constants";
import { hooks } from "botframework-webchat";

const { useAdaptiveCardsPackage, useStyleOptions } = hooks;

const ADAPTIVE_CARD_CONTENT_TYPE = "application/vnd.microsoft.card.adaptive";
const HTML_BLOCK_END = /<\/(p|li|h[1-6]|div|tr|td|th|blockquote|pre)>|<br\s*\/?>/gi;

type RenderMarkdownAsHTML = (markdown: string) => string;

// The "opens in a new window" icon of each link is left out: it describes the link target, not the content of the message.
const htmlToText = (html: string): string => {
    const body = new DOMParser().parseFromString(html.replace(HTML_BLOCK_END, "$& "), "text/html").body;
    body.querySelectorAll(`script, style, template, img.${Constants.OpenLinkIconCssClass}`).forEach(element => element.remove());
    body.querySelectorAll("img").forEach(image => image.replaceWith(` ${image.getAttribute("alt") ?? ""} `));
    return (body.textContent ?? "").replace(/\s+/g, " ").trim();
};

// Renders the element as the visible card does: Adaptive Cards formats {{DATE()}} and {{TIME()}}, then the Markdown is rendered.
// Web Chat sets the static Markdown handler before each visible render, and this restores the previous handler after rendering.
const getRenderedText = (element: any, AdaptiveCard: any, renderMarkdownAsHTML: RenderMarkdownAsHTML): string => {
    const previousOnProcessMarkdown = AdaptiveCard.onProcessMarkdown;

    try {
        AdaptiveCard.onProcessMarkdown = (text: string, result: any) => {
            result.outputHtml = renderMarkdownAsHTML(text);
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
export const getAdaptiveCardSpeak = (content: any, adaptiveCardsPackage: any, renderMarkdownAsHTML: RenderMarkdownAsHTML, adaptiveCardsParserMaxVersion?: string): string => {
    const { AdaptiveCard, FactSet, Image, RichTextBlock, SerializationContext, TextBlock, Version } = adaptiveCardsPackage;
    const maxVersion = adaptiveCardsParserMaxVersion ? Version.parse(adaptiveCardsParserMaxVersion, new SerializationContext()) : undefined;
    const card = new AdaptiveCard();
    const texts: string[] = [];

    card.parse(content, new SerializationContext(maxVersion?.isValid ? maxVersion : undefined));

    const getFactText = (factSet: any, text: string): string => {
        const textBlock = new TextBlock(text);
        textBlock.setParent(factSet);
        return getRenderedText(textBlock, AdaptiveCard, renderMarkdownAsHTML);
    };

    const walk = (element: any): void => {
        if (!element?.isVisible) {
            return;
        }

        if (element instanceof TextBlock || element instanceof RichTextBlock) {
            texts.push(getRenderedText(element, AdaptiveCard, renderMarkdownAsHTML));
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
    renderMarkdownAsHTML: RenderMarkdownAsHTML;
}

const AdaptiveCardForScreenReader = ({ args, next, renderMarkdownAsHTML }: AdaptiveCardForScreenReaderProps) => {
    const [adaptiveCardsPackage] = useAdaptiveCardsPackage();
    const [{ adaptiveCardsParserMaxVersion }] = useStyleOptions();
    const [options] = args;
    const { attachment } = options;

    // The widget creates a new Markdown renderer on each render with the same settings, so the text is computed once for each attachment.
    const contentWithSpeak = useMemo(() => {
        try {
            const content = typeof attachment.content === "string" ? JSON.parse(attachment.content) : attachment.content;

            if (!content || typeof content !== "object" || content.speak) {
                return undefined;
            }

            const speak = getAdaptiveCardSpeak(content, adaptiveCardsPackage, renderMarkdownAsHTML, adaptiveCardsParserMaxVersion);

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

export const createAttachmentForScreenReaderMiddleware = (renderMarkdownAsHTML: RenderMarkdownAsHTML) => {
    const attachmentForScreenReaderMiddleware = () => (next: any) => (...args: any[]) => {
        const attachment = args[0]?.attachment;

        // Web Chat renders nothing for a card without content, so it is left to Web Chat.
        if (attachment?.contentType !== ADAPTIVE_CARD_CONTENT_TYPE || !attachment.content) {
            return next(...args);
        }

        // eslint-disable-next-line react/display-name
        return () => <AdaptiveCardForScreenReader args={args} next={next} renderMarkdownAsHTML={renderMarkdownAsHTML} />;
    };

    return attachmentForScreenReaderMiddleware;
};
