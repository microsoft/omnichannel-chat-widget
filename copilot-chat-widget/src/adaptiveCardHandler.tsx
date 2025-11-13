// @ts-ignore

import * as AdaptiveCards from "adaptivecards";
import React from 'react';

interface AdaptiveCardComponentProps {
    content: Object,
    adaptiveCardInstance: AdaptiveCards.AdaptiveCard,
    clientActivityId?: string
}

let adaptiveCardRenderInstance: AdaptiveCards.AdaptiveCard;

export const getAdaptiveCardRender = (config: unknown, callback: (action: any) => void): AdaptiveCards.AdaptiveCard => {
    if (!adaptiveCardRenderInstance) {
        adaptiveCardRenderInstance = new AdaptiveCards.AdaptiveCard();
        adaptiveCardRenderInstance.hostConfig = new AdaptiveCards.HostConfig(config);
        adaptiveCardRenderInstance.onExecuteAction = callback;
    }
    return adaptiveCardRenderInstance;
}

export function convertTextNodeToHtml(
  textNode: Text,
  options?: { sanitize?: (html: string) => string }
): boolean {
  if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return false;

  const raw = textNode.textContent ?? '';
  // Quick heuristic: must contain at least one angle-bracket tag (e.g. <b>, <a ...>)
  if (!/<[a-z][\s\S]*>/i.test(raw)) return false;

  const html = options?.sanitize ? options.sanitize(raw) : raw;

  // Use a Range to create a DocumentFragment from the HTML string
  try {
    const range = document.createRange();
    // createContextualFragment is safe here because we sanitize first if needed.
    const frag = range.createContextualFragment(html);

    const parent = textNode.parentNode;
    if (!parent) return false;

    // Replace the text node with the fragment's children
    parent.replaceChild(frag, textNode);
    return true;
  } catch (e) {
    // Parsing failed — leave the text node untouched
    console.warn('convertTextNodeToHtml: parse failed', e);
    return false;
  }
}

const iterateAndUpdate = (element: HTMLElement) => {
    // if (element.innerHTML && element.innerHTML.indexOf('&lt;') && element.innerHTML.indexOf('&gt;')) {

    // }
    // console.log("debugging: element: ", element.textContent);
    Array.from(element.childNodes).filter(n=>n.nodeType == Node.TEXT_NODE).forEach(node => {
        //console.log("debugging: node text only: ", node.textContent);
        convertTextNodeToHtml(node as Text);
    });
    if (element.childNodes?.length > 0) {
        for(const child of Array.from(element.children) as HTMLElement[]) {
            iterateAndUpdate(child)
        }
    }
}

export const AdaptiveCardComponent = (props: AdaptiveCardComponentProps) => {
    try {
        const {content, adaptiveCardInstance, clientActivityId} = props;
        const containerRef = React.useRef<HTMLDivElement | null>(null);

        React.useEffect(() => {
            if (!containerRef.current || !content) return;
            let rendered: HTMLElement | undefined;
            try {
                // parse the content (may throw)
                adaptiveCardInstance.parse(content);
                rendered = adaptiveCardInstance.render();
                rendered?.setAttribute("acid", clientActivityId ?? "default");
            } catch (e) {
                // parsing/rendering failed
                rendered = undefined;
            }

            if (rendered) {
                //console.log("debugging: rendered: ", rendered);
                iterateAndUpdate(rendered);
                // Post-process: convert any HTML-encoded fragments inside the adaptive card
                // For example strings like "&lt;b&gt;...&lt;/b&gt;" should become real elements.
                // const allDescendants = rendered.querySelectorAll<HTMLElement>('*');
                // allDescendants.forEach((node) => {
                //     const html = node.innerHTML;
                //     if (typeof html === 'string' && (html.indexOf('&lt;') >= 0 || html.indexOf('&gt;') >= 0)) {
                //         // Reassigning innerHTML lets the browser decode entities and create proper elements
                //         node.innerHTML = html;
                //     }
                // });

                                // clear any previous children
                containerRef.current.innerHTML = "";
                // append the adaptive card's DOM
                containerRef.current.appendChild(rendered);
            }

            return () => {
                if (rendered && containerRef.current?.contains(rendered)) {
                    containerRef.current.removeChild(rendered);
                } else if (containerRef.current) {
                    containerRef.current.innerHTML = "";
                }
            };
        }, [adaptiveCardInstance, content]);

        // Render only the container that will receive the adaptive card DOM
        return <div ref={containerRef} />;
    } catch (error) {
        return <div>Failed to Render Adaptive card</div>
    }
}

