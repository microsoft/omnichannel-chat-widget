import MarkdownIt from "markdown-it";
import SlackMarkdown from "slack-markdown-it";

export const addSlackMarkdownIt = (markdown: MarkdownIt) => {
    try {
        markdown.use(SlackMarkdown);
    } catch (e) {
        // this is to support the case when slack-markdown-it 
        // transpiled code doesn't export default (webpack5)
        if (SlackMarkdown.default.apply) {
            markdown.use(SlackMarkdown.default);
        } else {
            console.error("Error while adding slackMarkdown plugin", e);
        }

    }
    return markdown;
};