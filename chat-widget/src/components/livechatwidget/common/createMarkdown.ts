import { Constants } from "../../../common/Constants";
import MarkdownIt from "markdown-it";
import MarkdownItForInline from "markdown-it-for-inline";
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

    // Custom plugin to fix numbered list continuity
    markdown.use(function(md) {
        const originalRender = md.render.bind(md);
        const originalRenderInline = md.renderInline.bind(md);
        
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
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        md.render = function(text: string, env?: any): string {
            const processedText = preprocessText(text);
            return originalRender(processedText, env);
        };
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        md.renderInline = function(text: string, env?: any): string {
            const processedText = preprocessText(text);
            return originalRenderInline(processedText, env);
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