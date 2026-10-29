/* eslint-disable @typescript-eslint/no-explicit-any */
/******
 * AttachmentForScreenReaderMiddleware
 *
 * Web Chat reads an Adaptive Card to screen readers only from the card's `speak` property.
 * A card without `speak` is announced as "A card" with no content.
 * This middleware sets `speak` from the visible text of the card, then lets Web Chat render it as usual.
 ******/

import { createMarkdown } from "../../../../livechatwidget/common/createMarkdown";

const ADAPTIVE_CARD_CONTENT_TYPE = "application/vnd.microsoft.card.adaptive";
const CHILD_ELEMENT_KEYS = ["body", "items", "columns", "rows", "cells", "images"];
const HTML_BLOCK_END = /<\/(p|li|h[1-6]|div|tr|td|th|blockquote|pre)>|<br\s*\/?>/gi;

const htmlToText = (html: string): string => {
    const body = new DOMParser().parseFromString(html.replace(HTML_BLOCK_END, "$& "), "text/html").body;
    body.querySelectorAll("img").forEach(image => image.replaceWith(` ${image.getAttribute("alt") ?? ""} `));
    return body.textContent ?? "";
};

// Collects the visible text of the card in document order, as Web Chat does when the card has no `speak`.
// Inputs and actions are not collected because Web Chat already lists them after the card text.
const collectText = (element: any, markdownToText: (markdown: string) => string, texts: string[]): void => {
    if (!element || typeof element !== "object" || element.isVisible === false) {
        return;
    }

    switch (element.type) {
        case "TextBlock":
            texts.push(markdownToText(element.text));
            break;
        case "RichTextBlock":
            texts.push((element.inlines ?? []).map((inline: any) => typeof inline === "string" ? inline : inline?.text ?? "").join(""));
            break;
        case "FactSet":
            (element.facts ?? []).forEach((fact: any) => {
                texts.push([markdownToText(fact?.title), markdownToText(fact?.value)].filter(Boolean).join(": "));
            });
            break;
        case "Image":
            texts.push(element.altText);
            break;
    }

    CHILD_ELEMENT_KEYS.forEach(key => {
        if (Array.isArray(element[key])) {
            element[key].forEach((child: any) => collectText(child, markdownToText, texts));
        }
    });
};

export const getAdaptiveCardText = (content: any, renderMarkdown: (markdown: string) => string): string => {
    const markdownToText = (markdown: string): string => typeof markdown === "string" ? htmlToText(renderMarkdown(markdown)).trim() : "";
    const texts: string[] = [];

    collectText(content, markdownToText, texts);

    return texts
        .filter(text => typeof text === "string")
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
};

// Markdown is always rendered, even when the widget shows Markdown unformatted, so that screen readers do not read the syntax characters.
// The renderer and the cache are shared because the middleware is created again on each render of the widget.
let markdownRenderer: ((markdown: string) => string) | undefined;
const speakByAttachment = new WeakMap<object, string>();

const getSpeak = (attachment: object, content: any): string => {
    let speak = speakByAttachment.get(attachment);

    if (speak === undefined) {
        if (!markdownRenderer) {
            const markdown = createMarkdown(false, false);
            markdownRenderer = markdown.render.bind(markdown);
        }

        speak = getAdaptiveCardText(content, markdownRenderer);
        speakByAttachment.set(attachment, speak);
    }

    return speak;
};

export const createAttachmentForScreenReaderMiddleware = () => {
    const attachmentForScreenReaderMiddleware = () => (next: any) => (...args: any[]) => {
        const [options] = args;
        const attachment = options?.attachment;

        if (attachment?.contentType !== ADAPTIVE_CARD_CONTENT_TYPE) {
            return next(...args);
        }

        try {
            const content = typeof attachment.content === "string" ? JSON.parse(attachment.content) : attachment.content;

            if (!content || typeof content !== "object" || content.speak) {
                return next(...args);
            }

            const speak = getSpeak(attachment, content);

            if (!speak) {
                return next(...args);
            }

            return next({ ...options, attachment: { ...attachment, content: { ...content, speak } } }, ...args.slice(1));
        } catch {
            return next(...args);
        }
    };

    return attachmentForScreenReaderMiddleware;
};
