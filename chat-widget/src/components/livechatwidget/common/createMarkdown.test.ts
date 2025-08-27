import { createMarkdown } from "./createMarkdown";

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
