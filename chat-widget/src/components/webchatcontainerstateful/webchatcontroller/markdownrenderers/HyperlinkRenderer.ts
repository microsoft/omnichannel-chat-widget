import DOMPurify from "dompurify";

class HyperlinkRenderer {
    private hyperlinkTextOverride: boolean
    constructor(hyperlinkTextOverride: boolean) {
        this.hyperlinkTextOverride = hyperlinkTextOverride;
    }

    private convertTextToHtmlNode(text: string) {
        const htmlNode = document.createElement("div");

        try {
            text = DOMPurify.sanitize(text); // eslint-disable-line @typescript-eslint/no-explicit-any
            htmlNode.innerHTML = text;
        } catch {
            return htmlNode;
        }

        return htmlNode;
    }

    private processANode(htmlNode: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        const aTags = htmlNode.getElementsByTagName("a");

        for (let index = 0; index < aTags.length; index++) {
            const aNode = aTags[index];

            if (!aNode ||
                !aNode.tagName || aNode.tagName.toLowerCase() !== "a" ||
                !aNode.href) continue;
            if (aNode.href !== aNode.innerText.trim()) {
                aNode.innerText = aNode.href;
            }
        }
    }

    private applicable(text: string) {
        if (!this.hyperlinkTextOverride) {
            return false;
        }

        try {
            const htmlNode = this.convertTextToHtmlNode(text);
            const aNodes = htmlNode.getElementsByTagName("a");
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

export default HyperlinkRenderer;