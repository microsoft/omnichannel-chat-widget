import { Constants } from "../../../common/Constants";
import MarkdownIt from "markdown-it";
import MarkdownItForInline from "markdown-it-for-inline";
import StateCore from "markdown-it/lib/rules_core/state_core";
import Token from "markdown-it/lib/token";
import { defaultMarkdownLocalizedTexts } from "../../webchatcontainerstateful/common/defaultProps/defaultMarkdownLocalizedTexts";
import { addSlackMarkdownIt } from "./helpers/markdownHelper";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createMarkdown = (disableMarkdownMessageFormatting: boolean, disableNewLineMarkdownSupport: boolean, opensMarkdownLinksInSameTab?: boolean) => {
    let markdown: MarkdownIt;

    if (!disableMarkdownMessageFormatting) {
        markdown = new MarkdownIt(
            Constants.Default,
            {
                html: true,
                linkify: true,
                breaks: (!disableNewLineMarkdownSupport)
            }
        );
        markdown = addSlackMarkdownIt(markdown);
    } else {
        markdown = new MarkdownIt(
            Constants.Zero,
            {
                html: true,
                linkify: true,
                breaks: (!disableNewLineMarkdownSupport)
            }
        );
        markdown.enable([
            "entity", // Rule to process html entity - &#123;, &#xAF;, &quot;
            "linkify", // Rule to replace link-like texts with link nodes
            "html_block", // Rule to process html blocks and paragraphs
            "html_inline", // Rule to process html tags
            "newline", // Rule to proceess '\n'
            "list" // Enable list parsing rule
        ]);
    }

    markdown.disable([
        "strikethrough"
    ]);

    // Custom plugin to fix numbered list continuity and merge adjacent markdown links with the same href.
    markdown.use(function(md) {
        function preprocessText(text: string): string {
            // Handle numbered lists that come with double line breaks (knowledge article format)
            // This ensures proper continuous numbering instead of separate lists
            
            let result = text;
            
            // Only process if the text contains the double line break pattern
            // But exclude simple numbered lists (where content after \n\n starts with another number)
            if (!/\d+\.\s+.*?\n\n(?!\d+\.\s)[\s\S]*?(?:\n\n\d+\.|\s*$)/.test(text)) {
                return result;
            }
            
            // Convert "1. Item\n\nContent\n\n2. Item" to proper markdown list format
            // Use improved pattern with negative lookahead to exclude cases where content starts with numbered list
            const listPattern = /(\d+\.\s+[^\n]+)(\n\n(?!\d+\.\s)[\s\S]*?)(?=\n\n\d+\.|\s*$)/g;
            if (listPattern.test(result)) {
                // Reset regex state for actual replacement
                listPattern.lastIndex = 0;
                
                result = result.replace(listPattern, (match, listItem, content) => {
                    if (!content) {
                        return match;
                    }
                    
                    // Format content with proper indentation
                    const cleanContent = content.substring(2); // Remove leading \n\n
                    const lines = cleanContent.split("\n");
                    const indentedContent = lines.map((line: string) => 
                        line.trim() ? `${Constants.MARKDOWN_LIST_INDENTATION}${line}` : ""
                    ).join("\n");
                    
                    const lineBreak = disableNewLineMarkdownSupport ? "\n" : "\n\n";
                    return `${listItem}${lineBreak}${indentedContent}`;
                });
            }
            
            return result;
        }

        // Accessibility fix: when a bot emits content like "[1.](url) [View details](url)",
        // markdown-it renders two sibling links that screen readers announce as two separate
        // focusable links. Merge consecutive markdown link tokens with identical attributes so
        // the number and label form one combined focusable link without discarding metadata.
        md.core.ruler.after("inline", "merge_adjacent_same_href_links", function(state: StateCore) {
            const sortedAttrs = (token: Token) => (token.attrs || [])
                .map((attr: string[]) => `${attr[0]}=${attr[1]}`)
                .sort();

            const hasSameAttributes = (first: Token, second: Token): boolean => {
                const firstAttrs = sortedAttrs(first);
                const secondAttrs = sortedAttrs(second);
                return firstAttrs.length === secondAttrs.length
                    && firstAttrs.every((attr: string, index: number) => attr === secondAttrs[index]);
            };

            const collectLink = (children: Token[], index: number) => {
                const open = children[index];
                if (!open || open.type !== "link_open") {
                    return undefined;
                }
                const href = open.attrGet?.("href");
                if (!href) {
                    return undefined;
                }

                let depth = 0;
                for (let currentIndex = index; currentIndex < children.length; currentIndex++) {
                    const token = children[currentIndex];
                    if (token.type === "link_open") {
                        depth++;
                    } else if (token.type === "link_close") {
                        depth--;
                        if (depth === 0) {
                            return {
                                closeIndex: currentIndex,
                                href,
                                open
                            };
                        }
                    }
                }

                return undefined;
            };

            const getNextAdjacentLink = (children: Token[], startIndex: number) => {
                const separatorTokens = [];
                let index = startIndex;
                while (index < children.length && children[index].type === "text" && /^\s*$/.test(children[index].content || "")) {
                    separatorTokens.push(children[index]);
                    index++;
                }

                const link = collectLink(children, index);
                if (!link) {
                    return undefined;
                }

                return {
                    ...link,
                    openIndex: index,
                    separatorTokens
                };
            };

            state.tokens.forEach((blockToken: Token) => {
                if (blockToken.type !== "inline" || !blockToken.children) {
                    return;
                }
                const mergedChildren = [];
                const children = blockToken.children;
                let index = 0;

                while (index < children.length) {
                    const firstLink = collectLink(children, index);
                    if (!firstLink) {
                        mergedChildren.push(children[index]);
                        index++;
                        continue;
                    }

                    const linkTokens = [
                        firstLink.open,
                        ...children.slice(index + 1, firstLink.closeIndex)
                    ];
                    let nextIndex = firstLink.closeIndex + 1;
                    let mergedAnyLink = false;

                    let nextLink = getNextAdjacentLink(children, nextIndex);
                    while (nextLink
                        && nextLink.href === firstLink.href
                        && hasSameAttributes(firstLink.open, nextLink.open)) {
                        linkTokens.push(...nextLink.separatorTokens);
                        linkTokens.push(...children.slice(nextLink.openIndex + 1, nextLink.closeIndex));
                        nextIndex = nextLink.closeIndex + 1;
                        mergedAnyLink = true;
                        nextLink = getNextAdjacentLink(children, nextIndex);
                    }

                    if (mergedAnyLink) {
                        mergedChildren.push(...linkTokens, children[firstLink.closeIndex]);
                        index = nextIndex;
                    } else {
                        mergedChildren.push(children[index]);
                        index++;
                    }
                }

                blockToken.children = mergedChildren;
            });
        });
         
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        md.render = function(text: string, env?: any): string {
            const safeEnv = env ?? {};
            const processedText = preprocessText(text);
            return md.renderer.render(md.parse(processedText, safeEnv), md.options, safeEnv);
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        md.renderInline = function(text: string, env?: any): string {
            const safeEnv = env ?? {};
            const processedText = preprocessText(text);
            return md.renderer.render(md.parseInline(processedText, safeEnv), md.options, safeEnv);
        };
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    markdown.use(MarkdownItForInline, "url_new_win", "link_open", function (tokens: any, idx: number, env: any) {
        const targetAttrIndex = tokens[idx].attrIndex(Constants.Target);
        // Put a transparent pixel instead of the "open in new window" icon, so developers can easily modify the icon in CSS.
        const TRANSPARENT_GIF = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

        const targetValue = opensMarkdownLinksInSameTab ? Constants.TargetTop : Constants.Blank;
        if (~targetAttrIndex) {
            tokens[idx].attrs[targetAttrIndex][1] = targetValue;  
        } else {
            tokens[idx].attrPush([Constants.Target, targetValue]);
        }

        const relAttrIndex = tokens[idx].attrIndex(Constants.TargetRelationship);
        if (~relAttrIndex) {
            tokens[idx].attrs[relAttrIndex][1] = Constants.TargetRelationshipAttributes;
        } else {
            tokens[idx].attrPush([Constants.TargetRelationship, Constants.TargetRelationshipAttributes]);

            if (!disableMarkdownMessageFormatting) {
                tokens[idx].attrPush([Constants.Title, defaultMarkdownLocalizedTexts.MARKDOWN_EXTERNAL_LINK_ALT]);
                // eslint-disable-next-line quotes
                const iconTokens = markdown.parseInline(`![${defaultMarkdownLocalizedTexts.MARKDOWN_EXTERNAL_LINK_ALT}](${TRANSPARENT_GIF})`, env)[0].children;

                if (iconTokens && iconTokens.length > 0) {
                    iconTokens[0].attrJoin("class", Constants.OpenLinkIconCssClass);
                    tokens.splice(idx + 2, 0, ...iconTokens);
                }
            }
        }
    });

    return markdown;
};
