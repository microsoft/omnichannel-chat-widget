import { Constants } from "../../../common/Constants";
import MarkdownIt from "markdown-it";
import MarkdownItForInline from "markdown-it-for-inline";
import { defaultMarkdownLocalizedTexts } from "../../webchatcontainerstateful/common/defaultProps/defaultMarkdownLocalizedTexts";
import { addSlackMarkdownIt } from "./helpers/markdownHelper";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createMarkdown = (disableMarkdownMessageFormatting: boolean, disableNewLineMarkdownSupport: boolean) => {
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
            "newline" // Rule to proceess '\n'
        ]);
    }

    markdown.disable([
        "strikethrough"
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    markdown.use(MarkdownItForInline, "url_new_win", "link_open", function (tokens: any, idx: number, env: any) {
        const targetAttrIndex = tokens[idx].attrIndex(Constants.Target);
        // Put a transparent pixel instead of the "open in new window" icon, so developers can easily modify the icon in CSS.
        const TRANSPARENT_GIF = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

        if (~targetAttrIndex) {
            tokens[idx].attrs[targetAttrIndex][1] = Constants.Blank;
        } else {
            tokens[idx].attrPush([Constants.Target, Constants.Blank]);
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