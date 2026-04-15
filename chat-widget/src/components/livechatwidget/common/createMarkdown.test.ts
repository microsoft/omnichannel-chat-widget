import { createMarkdown } from "./createMarkdown";

describe("createMarkdown - XSS Prevention (html: false)", () => {
    describe("when markdown formatting is enabled", () => {
        const markdown = createMarkdown(false, false);

        it("should entity-encode img tags to prevent image injection", () => {
            const input = "<img src=\"https://attacker.site\">";
            const result = markdown.render(input);
            // The raw <img> tag must be entity-encoded; the linkify plugin may add its
            // own icon <img> for the URL inside, but the injected tag itself is neutralized.
            expect(result).toContain("&lt;img src=");
        });

        it("should entity-encode script tags to prevent script execution", () => {
            const input = "<script>alert(1)</script>";
            const result = markdown.render(input);
            expect(result).not.toMatch(/<script/i);
            expect(result).toContain("&lt;script&gt;");
        });

        it("should entity-encode svg tags to prevent event handler injection", () => {
            const input = "<svg onload=alert(1)>";
            const result = markdown.render(input);
            expect(result).not.toMatch(/<svg/i);
            expect(result).toContain("&lt;svg");
        });

        it("should entity-encode iframe tags to prevent frame injection", () => {
            const input = "<iframe src=\"evil.com\">";
            const result = markdown.render(input);
            expect(result).not.toMatch(/<iframe/i);
            expect(result).toContain("&lt;iframe");
        });

        it("should entity-encode nested HTML tags", () => {
            const input = "<div style=\"background:red\"><a href=\"evil.com\">click</a></div>";
            const result = markdown.render(input);
            expect(result).not.toMatch(/<div\s/);
            expect(result).toContain("&lt;div");
            expect(result).toContain("&lt;/div&gt;");
        });

        it("should entity-encode html_block level elements", () => {
            // html_block is a markdown-it rule for block-level HTML; ensure it is disabled
            const input = "<table><tr><td>cell</td></tr></table>";
            const result = markdown.render(input);
            expect(result).not.toMatch(/<table/i);
            expect(result).toContain("&lt;table&gt;");
        });

        it("should entity-encode inline HTML within markdown text", () => {
            const input = "Hello <b>bold</b> world";
            const result = markdown.render(input);
            expect(result).not.toMatch(/<b>/);
            expect(result).toContain("&lt;b&gt;");
        });
    });

    describe("when markdown formatting is disabled (disableMarkdownMessageFormatting=true)", () => {
        const markdown = createMarkdown(true, false);

        it("should still entity-encode script tags", () => {
            const input = "<script>alert(1)</script>";
            const result = markdown.render(input);
            expect(result).not.toMatch(/<script/i);
            expect(result).toContain("&lt;script&gt;");
        });

        it("should still entity-encode img tags", () => {
            const input = "<img src=\"https://attacker.site\">";
            const result = markdown.render(input);
            expect(result).not.toMatch(/<img\s/);
            expect(result).toContain("&lt;img");
        });

        it("should still entity-encode iframe tags", () => {
            const input = "<iframe src=\"evil.com\">";
            const result = markdown.render(input);
            expect(result).not.toMatch(/<iframe/i);
            expect(result).toContain("&lt;iframe");
        });

        it("should still render linkified URLs", () => {
            const input = "Visit https://example.com for details";
            const result = markdown.render(input);
            expect(result).toContain("<a href=\"https://example.com\"");
        });
    });
});

describe("createMarkdown - Markdown Rendering", () => {
    const markdown = createMarkdown(false, false);

    it("should render bold text with strong tags", () => {
        const input = "**bold**";
        const result = markdown.render(input);
        expect(result).toContain("<strong>bold</strong>");
    });

    it("should render italic text with em tags", () => {
        // slack-markdown-it remaps *text* to bold; use _text_ for italic
        const input = "_italic_";
        const result = markdown.render(input);
        expect(result).toContain("<em>italic</em>");
    });

    it("should render links as anchor tags", () => {
        const input = "[link text](https://example.com)";
        const result = markdown.render(input);
        expect(result).toContain("<a href=\"https://example.com\"");
        expect(result).toContain("link text");
    });

    it("should render unordered lists", () => {
        const input = "- item1\n- item2";
        const result = markdown.render(input);
        expect(result).toContain("<ul>");
        expect(result).toContain("<li>");
        expect(result).toContain("item1");
        expect(result).toContain("item2");
    });

    it("should render inline code with code tags", () => {
        const input = "`code`";
        const result = markdown.render(input);
        expect(result).toContain("<code>code</code>");
    });
});

describe("createMarkdown - Numbered List Continuity", () => {
    it("should handle single line break numbered lists", () => {
        const markdown = createMarkdown(false, false);
        const input = "1. Test1\nInformation below header\n2. Test2\nInformation below header";
        const result = markdown.render(input);
        
        // Should contain both list items
        expect(result).toContain("<ol>");
        expect(result).toContain("Test1");
        expect(result).toContain("Test2");
    });

    it("should fix double line break numbered lists", () => {
        const markdown = createMarkdown(false, false);
        const input = "1. Test1\n\nInformation below header\n\n2. Test2\n\nInformation below header";
        const result = markdown.render(input);
        
        // Should contain a single ordered list with proper numbering
        expect(result).toContain("<ol>");
        expect(result).toContain("Test1");
        expect(result).toContain("Test2");
        expect(result).toContain("Information below header");
        
        // Should create a single list (the preprocessing should work)
        const olCount = (result.match(/<ol>/g) || []).length;
        expect(olCount).toBe(1);
    });

    it("should handle double line break lists with disableNewLineMarkdownSupport=true", () => {
        const markdown = createMarkdown(false, true);
        const input = "1. Test1\n\nInformation below header\n\n2. Test2\n\nInformation below header";
        const result = markdown.render(input);
        
        // Should still create proper list structure
        expect(result).toContain("<ol>");
        expect(result).toContain("Test1");
        expect(result).toContain("Test2");
        expect(result).toContain("Information below header");
    });

    it("should handle single line break lists with disableNewLineMarkdownSupport=true", () => {
        const markdown = createMarkdown(false, true);
        const input = "1. Test1\nInformation below header\n2. Test2\nInformation below header";
        const result = markdown.render(input);
        
        // Should not change the structure
        expect(result).toContain("<ol>");
        expect(result).toContain("Test1");
        expect(result).toContain("Test2");
    });

    it("should handle lists with only one item", () => {
        const markdown = createMarkdown(false, false);
        const input = "1. Test1\n\nInformation below header";
        const result = markdown.render(input);
        
        expect(result).toContain("<ol>");
        expect(result).toContain("Test1");
        expect(result).toContain("Information below header");
    });

    it("should handle empty content between list items", () => {
        const markdown = createMarkdown(false, false);
        const input = "1. Test1\n\n\n\n2. Test2\n\nInformation below header";
        const result = markdown.render(input);
        
        expect(result).toContain("<ol>");
        expect(result).toContain("Test1");
        expect(result).toContain("Test2");
    });

    it("should handle multiple numbered lists correctly", () => {
        const markdown = createMarkdown(false, false);
        const input = "1. First list item 1\n\nContent 1\n\n2. First list item 2\n\nContent 2\n\nSome separator text\n\n1. Second list item 1\n\nContent 3\n\n2. Second list item 2\n\nContent 4";
        const result = markdown.render(input);
        
        expect(result).toContain("<ol>");
        expect(result).toContain("First list item 1");
        expect(result).toContain("First list item 2");
        expect(result).toContain("Second list item 1");
        expect(result).toContain("Second list item 2");
        expect(result).toContain("Some separator text");
    });

    it("should not modify regular text that looks like lists", () => {
        const markdown = createMarkdown(false, false);
        const input = "This is not a list: 1. But looks like one\nAnd continues here\n2. This too";
        const result = markdown.render(input);
        
        // Should not create list structure for this
        expect(result).toContain("This is not a list: 1. But looks like one");
    });

    it("should handle mixed single and double line break patterns", () => {
        const markdown = createMarkdown(false, false);
        const input = "1. Item with single\nbreak\n2. Item with double\n\nbreak content\n\n3. Another double\n\nbreak item";
        const result = markdown.render(input);
        
        expect(result).toContain("<ol>");
        expect(result).toContain("Item with single");
        expect(result).toContain("Item with double");
        expect(result).toContain("Another double");
    });

    it("should preserve markdown formatting within list items", () => {
        const markdown = createMarkdown(false, false);
        const input = "1. **Bold text**\n\n_Italic content_\n\n2. [Link text](https://example.com)\n\nMore content";
        const result = markdown.render(input);
        
        expect(result).toContain("<strong>Bold text</strong>");
        expect(result).toContain("<em>Italic content</em>");
        expect(result).toContain("<a href=\"https://example.com\"");
        expect(result).toContain("Link text");
    });

    it("should handle multi-paragraph content within list items", () => {
        const input = `1. Try going back and forward again

Ask the client if there is a back to previous question button and to try using that if there is and clicking through to the next page again.

2. Check device and browser against the supported list:

Check device details You can check the client's device in Customer Summary > Visitor Details.

Check browser details Go to the additional details area of the customer summary tab, and find the Browser info e.g. (84.0.4147.89).

3. new item added`;

        const md = createMarkdown(false, false);
        const result = md.render(input);
        
        // Should render as a single ordered list with sequential numbering
        expect(result).toContain("<ol>");
        expect(result).toContain("<li>");
        
        // Should maintain proper list structure without numbering restarts
        const listItems = result.match(/<li>/g);
        expect(listItems?.length).toBe(3);
        
        // Should contain all three items' content
        expect(result).toContain("Try going back and forward again");
        expect(result).toContain("Check device and browser against the supported list");
        expect(result).toContain("new item added");
        
        // Should properly indent multi-paragraph content
        expect(result).toContain("Check device details You can check");
        expect(result).toContain("Check browser details Go to");
    });
});
