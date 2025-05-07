import DOMPurify from "dompurify";
import {HtmlAttributeNames} from "../../../../common/Constants";

class HyperlinkTextOverrideRenderer {
    private hyperlinkTextOverride: boolean
    constructor(hyperlinkTextOverride: boolean) {
        this.hyperlinkTextOverride = hyperlinkTextOverride;
    }

    private convertTextToHtmlNode(text: string) {
        const htmlNode = document.createElement(HtmlAttributeNames.div);

        try {
            text = DOMPurify.sanitize(text, {ADD_ATTR: ["target"]});
            htmlNode.innerHTML = text;
        } catch {
            return htmlNode;
        }

        return htmlNode;
    }

    private processANode(htmlNode: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        const aTags = htmlNode.getElementsByTagName(HtmlAttributeNames.aTagName);

        for (let index = 0; index < aTags.length; index++) {
            const aNode = aTags[index];

            if (!aNode ||
                !aNode.tagName || aNode.tagName.toLowerCase() !== HtmlAttributeNames.aTagName ||
                !aNode.href) continue;

            if (aNode.href !== aNode.text.trim()) {
                aNode.text = aNode.href;
            }
        }
    }

    private applicable(text: string) {
        if (!this.hyperlinkTextOverride) {
            return false;
        }

        try {
            const htmlNode = this.convertTextToHtmlNode(text);
            const aNodes = htmlNode.getElementsByTagName(HtmlAttributeNames.aTagName);
            return !!aNodes && aNodes.length && aNodes.length > 0;
        } catch {
            return false;
        }
    }

    public render(text: string) {
        if (!this.applicable(text)) {
            return text;
        }

        const htmlNode = this.convertTextToHtmlNode(text);
        this.processANode(htmlNode);
        text = htmlNode.innerHTML;
        return text;
    }
}

export default HyperlinkTextOverrideRenderer;