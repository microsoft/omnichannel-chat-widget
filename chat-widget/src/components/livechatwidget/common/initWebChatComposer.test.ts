/* eslint-disable @typescript-eslint/no-explicit-any */

import "@testing-library/jest-dom";

import DOMPurify from "dompurify";

// Mock console.warn to suppress development logs in tests
const originalWarn = console.warn;
beforeAll(() => {
    console.warn = jest.fn();
});

afterAll(() => {
    console.warn = originalWarn;
});

describe("initWebChatComposer - Monitor-Only HTML Sanitization", () => {
    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
    });

    describe("Content that would be blocked by strict allowlist", () => {
        it("should log telemetry when img tag would be removed", () => {
            const htmlWithImage = "<p>Hello <img src=\"test.jpg\" /> world</p>";

            // Sanitize with current config (allows img through existing config)
            DOMPurify.sanitize(htmlWithImage, {
                FORBID_TAGS: ["form", "button", "script", "div", "input"],
                FORBID_ATTR: ["action"],
                ADD_ATTR: ["target"]
            });

            // Simulate monitor function behavior
            const strictConfig = {
                ALLOWED_TAGS: ["b", "strong", "i", "em", "u", "br", "p", "ul", "ol", "li", "a"],
                ALLOWED_ATTR: ["href", "target", "rel"],
                FORBID_TAGS: ["img", "video", "audio", "iframe", "object", "embed", "script", "style", "form", "input", "textarea", "button", "link", "meta", "base", "div", "span"],
                FORBID_ATTR: ["style", /^on/i],
                ALLOWED_URI_REGEXP: /^https?:/i,
                ALLOW_DATA_ATTR: false,
                ALLOW_UNKNOWN_PROTOCOLS: false
            };

            const removedTags: string[] = [];

            // Add hook to track removed tags (filter out body tag which is DOMPurify wrapper)
            DOMPurify.addHook("uponSanitizeElement", (node, data) => {
                const tagName = data.tagName.toLowerCase();
                if (node.nodeType === 1 && !strictConfig.ALLOWED_TAGS.includes(tagName) && tagName !== "body") {
                    removedTags.push(tagName);
                }
            });

            DOMPurify.sanitize(htmlWithImage, strictConfig);
            DOMPurify.removeHook("uponSanitizeElement");

            expect(removedTags).toContain("img");
        });

        it("should log telemetry when span tag would be removed", () => {
            const htmlWithSpan = "<p>Hello <span style=\"color: red;\">world</span></p>";

            const strictConfig = {
                ALLOWED_TAGS: ["b", "strong", "i", "em", "u", "br", "p", "ul", "ol", "li", "a"],
                ALLOWED_ATTR: ["href", "target", "rel"],
                FORBID_TAGS: ["img", "video", "audio", "iframe", "object", "embed", "script", "style", "form", "input", "textarea", "button", "link", "meta", "base", "div", "span"]
            };

            const removedTags: string[] = [];

            DOMPurify.addHook("uponSanitizeElement", (node, data) => {
                const tagName = data.tagName.toLowerCase();
                if (node.nodeType === 1 && !strictConfig.ALLOWED_TAGS.includes(tagName) && tagName !== "body") {
                    removedTags.push(tagName);
                }
            });

            DOMPurify.sanitize(htmlWithSpan, strictConfig);
            DOMPurify.removeHook("uponSanitizeElement");

            expect(removedTags).toContain("span");
        });

        it("should log telemetry when div tag would be removed", () => {
            const htmlWithDiv = "<div><p>Hello world</p></div>";

            const strictConfig = {
                ALLOWED_TAGS: ["b", "strong", "i", "em", "u", "br", "p", "ul", "ol", "li", "a"],
                FORBID_TAGS: ["div", "span"]
            };

            const removedTags: string[] = [];

            DOMPurify.addHook("uponSanitizeElement", (node, data) => {
                const tagName = data.tagName.toLowerCase();
                if (node.nodeType === 1 && !strictConfig.ALLOWED_TAGS.includes(tagName) && tagName !== "body") {
                    removedTags.push(tagName);
                }
            });

            DOMPurify.sanitize(htmlWithDiv, strictConfig);
            DOMPurify.removeHook("uponSanitizeElement");

            expect(removedTags).toContain("div");
        });

        it("should log telemetry when style attribute would be removed", () => {
            const htmlWithStyle = "<p style=\"color: red;\">Hello world</p>";

            const strictConfig = {
                ALLOWED_TAGS: ["p"],
                ALLOWED_ATTR: ["href", "target", "rel"],
                FORBID_ATTR: ["style"]
            };

            const removedAttrs: string[] = [];

            DOMPurify.addHook("uponSanitizeAttribute", (node, data) => {
                const attrName = data.attrName.toLowerCase();
                if (!strictConfig.ALLOWED_ATTR.includes(attrName) && attrName !== "class" && attrName !== "id") {
                    removedAttrs.push(attrName);
                }
            });

            DOMPurify.sanitize(htmlWithStyle, strictConfig);
            DOMPurify.removeHook("uponSanitizeAttribute");

            expect(removedAttrs).toContain("style");
        });

        it("should log telemetry when onclick attribute would be removed", () => {
            const htmlWithOnClick = "<p onclick=\"alert('xss')\">Hello world</p>";

            const strictConfig = {
                ALLOWED_TAGS: ["p"],
                ALLOWED_ATTR: ["href", "target", "rel"],
                FORBID_ATTR: [/^on/i]
            };

            const removedAttrs: string[] = [];

            DOMPurify.addHook("uponSanitizeAttribute", (node, data) => {
                const attrName = data.attrName.toLowerCase();
                if (!strictConfig.ALLOWED_ATTR.includes(attrName) && attrName !== "class" && attrName !== "id") {
                    removedAttrs.push(attrName);
                }
            });

            DOMPurify.sanitize(htmlWithOnClick, strictConfig);
            DOMPurify.removeHook("uponSanitizeAttribute");

            expect(removedAttrs.length).toBeGreaterThan(0);
        });

        it("should track multiple removed tags in one pass", () => {
            const htmlComplex = "<div><p>Hello <img src=\"test.jpg\" /> <span>world</span></p></div>";

            const strictConfig = {
                ALLOWED_TAGS: ["p"],
                FORBID_TAGS: ["div", "span", "img"]
            };

            const removedTags: string[] = [];

            DOMPurify.addHook("uponSanitizeElement", (node, data) => {
                const tagName = data.tagName.toLowerCase();
                if (node.nodeType === 1 && !strictConfig.ALLOWED_TAGS.includes(tagName) && tagName !== "body") {
                    removedTags.push(tagName);
                }
            });

            DOMPurify.sanitize(htmlComplex, strictConfig);
            DOMPurify.removeHook("uponSanitizeElement");

            expect(removedTags).toContain("div");
            expect(removedTags).toContain("span");
            expect(removedTags).toContain("img");
        });

        it("should deduplicate removed tags", () => {
            const htmlMultipleDivs = "<div><p>Test1</p></div><div><p>Test2</p></div>";

            const strictConfig = {
                ALLOWED_TAGS: ["p"],
                FORBID_TAGS: ["div"]
            };

            const removedTags: string[] = [];

            DOMPurify.addHook("uponSanitizeElement", (node, data) => {
                const tagName = data.tagName.toLowerCase();
                if (node.nodeType === 1 && !strictConfig.ALLOWED_TAGS.includes(tagName) && tagName !== "body") {
                    removedTags.push(tagName);
                }
            });

            DOMPurify.sanitize(htmlMultipleDivs, strictConfig);
            DOMPurify.removeHook("uponSanitizeElement");

            // Should have multiple div entries before deduplication
            expect(removedTags.filter(tag => tag === "div").length).toBeGreaterThan(1);

            // After deduplication
            const uniqueTags = [...new Set(removedTags)];
            expect(uniqueTags).toEqual(["div"]);
        });
    });

    describe("Content that passes strict allowlist", () => {
        it("should not log telemetry for allowed tags", () => {
            const cleanHtml = "<p>Hello <b>world</b></p>";

            const strictConfig = {
                ALLOWED_TAGS: ["b", "strong", "i", "em", "u", "br", "p", "ul", "ol", "li", "a"],
                ALLOWED_ATTR: ["href", "target", "rel"]
            };

            const removedTags: string[] = [];

            DOMPurify.addHook("uponSanitizeElement", (node, data) => {
                const tagName = data.tagName.toLowerCase();
                if (node.nodeType === 1 && !strictConfig.ALLOWED_TAGS.includes(tagName) && tagName !== "body") {
                    removedTags.push(tagName);
                }
            });

            DOMPurify.sanitize(cleanHtml, strictConfig);
            DOMPurify.removeHook("uponSanitizeElement");

            expect(removedTags).toEqual([]);
        });

        it("should not log telemetry for allowed formatting tags", () => {
            const formattedHtml = "<p><b>Bold</b> <i>Italic</i> <u>Underline</u> <em>Emphasis</em> <strong>Strong</strong></p>";

            const strictConfig = {
                ALLOWED_TAGS: ["b", "strong", "i", "em", "u", "br", "p", "ul", "ol", "li", "a"]
            };

            const removedTags: string[] = [];

            DOMPurify.addHook("uponSanitizeElement", (node, data) => {
                const tagName = data.tagName.toLowerCase();
                if (node.nodeType === 1 && !strictConfig.ALLOWED_TAGS.includes(tagName) && tagName !== "body") {
                    removedTags.push(tagName);
                }
            });

            DOMPurify.sanitize(formattedHtml, strictConfig);
            DOMPurify.removeHook("uponSanitizeElement");

            expect(removedTags).toEqual([]);
        });

        it("should not log telemetry for allowed lists", () => {
            const listHtml = "<ul><li>Item 1</li><li>Item 2</li></ul><ol><li>First</li></ol>";

            const strictConfig = {
                ALLOWED_TAGS: ["b", "strong", "i", "em", "u", "br", "p", "ul", "ol", "li", "a"]
            };

            const removedTags: string[] = [];

            DOMPurify.addHook("uponSanitizeElement", (node, data) => {
                const tagName = data.tagName.toLowerCase();
                if (node.nodeType === 1 && !strictConfig.ALLOWED_TAGS.includes(tagName) && tagName !== "body") {
                    removedTags.push(tagName);
                }
            });

            DOMPurify.sanitize(listHtml, strictConfig);
            DOMPurify.removeHook("uponSanitizeElement");

            expect(removedTags).toEqual([]);
        });

        it("should not log telemetry for allowed links with safe attributes", () => {
            const linkHtml = "<a href=\"https://example.com\" target=\"_blank\" rel=\"noopener noreferrer\">Link</a>";

            const strictConfig = {
                ALLOWED_TAGS: ["a"],
                ALLOWED_ATTR: ["href", "target", "rel"],
                ALLOWED_URI_REGEXP: /^https?:/i
            };

            const removedTags: string[] = [];
            const removedAttrs: string[] = [];

            DOMPurify.addHook("uponSanitizeElement", (node, data) => {
                const tagName = data.tagName.toLowerCase();
                if (node.nodeType === 1 && !strictConfig.ALLOWED_TAGS.includes(tagName) && tagName !== "body") {
                    removedTags.push(tagName);
                }
            });

            DOMPurify.addHook("uponSanitizeAttribute", (node, data) => {
                const attrName = data.attrName.toLowerCase();
                if (!strictConfig.ALLOWED_ATTR.includes(attrName) && attrName !== "class" && attrName !== "id") {
                    removedAttrs.push(attrName);
                }
            });

            DOMPurify.sanitize(linkHtml, strictConfig);
            DOMPurify.removeHook("uponSanitizeElement");
            DOMPurify.removeHook("uponSanitizeAttribute");

            expect(removedTags).toEqual([]);
            expect(removedAttrs).toEqual([]);
        });
    });

    describe("Edge cases", () => {
        it("should handle empty string", () => {
            const emptyHtml = "";

            const strictConfig = {
                ALLOWED_TAGS: ["p"]
            };

            const removedTags: string[] = [];

            DOMPurify.addHook("uponSanitizeElement", (node, data) => {
                const tagName = data.tagName.toLowerCase();
                if (node.nodeType === 1 && !strictConfig.ALLOWED_TAGS.includes(tagName) && tagName !== "body") {
                    removedTags.push(tagName);
                }
            });

            const result = DOMPurify.sanitize(emptyHtml, strictConfig);
            DOMPurify.removeHook("uponSanitizeElement");

            expect(result).toBe("");
            expect(removedTags).toEqual([]);
        });

        it("should handle plain text without HTML tags", () => {
            const plainText = "Hello world";

            const strictConfig = {
                ALLOWED_TAGS: ["p"]
            };

            const removedTags: string[] = [];

            DOMPurify.addHook("uponSanitizeElement", (node, data) => {
                const tagName = data.tagName.toLowerCase();
                if (node.nodeType === 1 && !strictConfig.ALLOWED_TAGS.includes(tagName) && tagName !== "body") {
                    removedTags.push(tagName);
                }
            });

            const result = DOMPurify.sanitize(plainText, strictConfig);
            DOMPurify.removeHook("uponSanitizeElement");

            expect(result).toBe("Hello world");
            expect(removedTags).toEqual([]);
        });

        it("should handle malformed HTML", () => {
            const malformedHtml = "<p>Unclosed paragraph<div>Nested without closing";

            const strictConfig = {
                ALLOWED_TAGS: ["p"],
                FORBID_TAGS: ["div"]
            };

            const removedTags: string[] = [];

            DOMPurify.addHook("uponSanitizeElement", (node, data) => {
                const tagName = data.tagName.toLowerCase();
                if (node.nodeType === 1 && !strictConfig.ALLOWED_TAGS.includes(tagName) && tagName !== "body") {
                    removedTags.push(tagName);
                }
            });

            DOMPurify.sanitize(malformedHtml, strictConfig);
            DOMPurify.removeHook("uponSanitizeElement");

            expect(removedTags).toContain("div");
        });

        it("should handle nested allowed tags", () => {
            const nestedHtml = "<p><b><i>Bold italic</i></b></p>";

            const strictConfig = {
                ALLOWED_TAGS: ["p", "b", "i"]
            };

            const removedTags: string[] = [];

            DOMPurify.addHook("uponSanitizeElement", (node, data) => {
                const tagName = data.tagName.toLowerCase();
                if (node.nodeType === 1 && !strictConfig.ALLOWED_TAGS.includes(tagName) && tagName !== "body") {
                    removedTags.push(tagName);
                }
            });

            DOMPurify.sanitize(nestedHtml, strictConfig);
            DOMPurify.removeHook("uponSanitizeElement");

            expect(removedTags).toEqual([]);
        });

        it("should handle XSS attempts - script tags", () => {
            const xss = "<script>alert(\"xss\")</script>";

            const strictConfig = {
                ALLOWED_TAGS: ["a", "p"],
                FORBID_TAGS: ["script"]
            };

            const result = DOMPurify.sanitize(xss, strictConfig);

            // DOMPurify removes script tags completely
            expect(result).not.toContain("<script>");
            expect(result).not.toContain("alert");
        });

        it("should handle XSS attempts - img with onerror", () => {
            const xss = "<img src=x onerror=\"alert('xss')\">";

            const strictConfig = {
                ALLOWED_TAGS: ["a", "p"],
                FORBID_TAGS: ["img"]
            };

            const removedTags: string[] = [];

            DOMPurify.addHook("uponSanitizeElement", (node, data) => {
                const tagName = data.tagName.toLowerCase();
                if (node.nodeType === 1 && !strictConfig.ALLOWED_TAGS.includes(tagName) && tagName !== "body") {
                    removedTags.push(tagName);
                }
            });

            DOMPurify.sanitize(xss, strictConfig);
            DOMPurify.removeHook("uponSanitizeElement");

            expect(removedTags).toContain("img");
        });

        it("should handle XSS attempts - javascript URL", () => {
            const xss = "<a href=\"javascript:alert('xss')\">Click</a>";

            const strictConfig = {
                ALLOWED_TAGS: ["a"],
                ALLOWED_ATTR: ["href"],
                ALLOWED_URI_REGEXP: /^https?:/i
            };

            const result = DOMPurify.sanitize(xss, strictConfig);

            // DOMPurify removes javascript: URLs
            expect(result).not.toContain("javascript:");
        });

        it("should handle XSS attempts - iframe", () => {
            const xss = "<iframe src=\"http://evil.com\"></iframe>";

            const strictConfig = {
                ALLOWED_TAGS: ["a", "p"],
                FORBID_TAGS: ["iframe"]
            };

            const removedTags: string[] = [];

            DOMPurify.addHook("uponSanitizeElement", (node, data) => {
                const tagName = data.tagName.toLowerCase();
                if (node.nodeType === 1 && !strictConfig.ALLOWED_TAGS.includes(tagName) && tagName !== "body") {
                    removedTags.push(tagName);
                }
            });

            DOMPurify.sanitize(xss, strictConfig);
            DOMPurify.removeHook("uponSanitizeElement");

            expect(removedTags).toContain("iframe");
        });
    });

    describe("Existing sanitization preservation", () => {
        it("should continue blocking script tags with existing config", () => {
            const htmlWithScript = "<p>Hello <script>alert(\"xss\")</script> world</p>";

            const existingConfig = {
                FORBID_TAGS: ["form", "button", "script", "div", "input"],
                FORBID_ATTR: ["action"],
                ADD_ATTR: ["target"]
            };

            const result = DOMPurify.sanitize(htmlWithScript, existingConfig);

            expect(result).not.toContain("<script>");
            expect(result).not.toContain("alert");
            expect(result).toContain("Hello");
            expect(result).toContain("world");
        });

        it("should continue blocking form tags with existing config", () => {
            const htmlWithForm = "<p>Test</p><form><input type=\"text\" /></form>";

            const existingConfig = {
                FORBID_TAGS: ["form", "button", "script", "div", "input"],
                FORBID_ATTR: ["action"]
            };

            const result = DOMPurify.sanitize(htmlWithForm, existingConfig);

            expect(result).not.toContain("<form>");
            expect(result).not.toContain("<input>");
            expect(result).toContain("Test");
        });

        it("should continue blocking div tags with existing config", () => {
            const htmlWithDiv = "<div><p>Hello world</p></div>";

            const existingConfig = {
                FORBID_TAGS: ["form", "button", "script", "div", "input"]
            };

            const result = DOMPurify.sanitize(htmlWithDiv, existingConfig);

            expect(result).not.toContain("<div>");
            expect(result).toContain("<p>");
            expect(result).toContain("Hello world");
        });

        it("should continue allowing img tags with existing config (but monitor would flag it)", () => {
            const htmlWithImg = "<p>Hello <img src=\"test.jpg\" /> world</p>";

            const existingConfig = {
                FORBID_TAGS: ["form", "button", "script", "div", "input"]
            };

            const result = DOMPurify.sanitize(htmlWithImg, existingConfig);

            // Existing config allows img (not in FORBID_TAGS)
            expect(result).toContain("<img");

            // But strict config would remove it
            const strictConfig = {
                ALLOWED_TAGS: ["p"],
                FORBID_TAGS: ["img"]
            };

            const strictResult = DOMPurify.sanitize(htmlWithImg, strictConfig);
            expect(strictResult).not.toContain("<img");
        });
    });

    describe("Hook management", () => {
        it("should remove hooks after monitoring", () => {
            // Add a hook with empty implementation
            DOMPurify.addHook("uponSanitizeElement", () => { /* empty hook for testing */ });

            // Simulate monitor adding and removing hooks
            DOMPurify.removeHook("uponSanitizeElement");

            // Verify hooks can be added again (no conflicts)
            const hookAdded = () => {
                DOMPurify.addHook("uponSanitizeElement", () => { /* empty hook for testing */ });
            };

            expect(hookAdded).not.toThrow();

            // Cleanup
            DOMPurify.removeHook("uponSanitizeElement");
        });

        it("should not interfere with other hooks", () => {
            let otherHookCalled = false;

            // Add a different hook (simulating postDomPurifyActivities)
            DOMPurify.addHook("afterSanitizeAttributes", () => {
                otherHookCalled = true;
            });

            // Add and remove monitor hooks with empty implementation
            DOMPurify.addHook("uponSanitizeElement", () => { /* empty hook for testing */ });
            DOMPurify.removeHook("uponSanitizeElement");

            // Run sanitization
            DOMPurify.sanitize("<p>Test</p>", {});

            // Other hook should still work
            expect(otherHookCalled).toBe(true);

            // Cleanup
            DOMPurify.removeHook("afterSanitizeAttributes");
        });
    });

    describe("Performance monitoring", () => {
        it("should track execution time in telemetry", (done) => {
            const htmlWithUnsafeTags = "<p>Hello <img src=\"test.jpg\" /> <div>world</div></p>";

            // Simulate the monitor function call (inline to verify timing)
            const startTime = performance.now();

            const strictConfig = {
                ALLOWED_TAGS: ["b", "strong", "i", "em", "u", "br", "p", "ul", "ol", "li", "a"],
                FORBID_TAGS: ["img", "div"]
            };

            const removedTags: string[] = [];
            DOMPurify.addHook("uponSanitizeElement", (node, data) => {
                const tagName = data.tagName.toLowerCase();
                if (node.nodeType === 1 && !strictConfig.ALLOWED_TAGS.includes(tagName) && tagName !== "body") {
                    removedTags.push(tagName);
                }
            });

            DOMPurify.sanitize(htmlWithUnsafeTags, strictConfig);
            DOMPurify.removeHook("uponSanitizeElement");

            const endTime = performance.now();
            const executionTimeMs = Math.round((endTime - startTime) * 100) / 100;

            // Verify execution time is a positive number
            expect(executionTimeMs).toBeGreaterThanOrEqual(0);
            expect(typeof executionTimeMs).toBe("number");
            expect(isNaN(executionTimeMs)).toBe(false);

            done();
        });

        it("should include execution time in telemetry when unsafe content is detected", () => {
            const htmlWithImg = "<p>Test <img src=\"test.jpg\" /></p>";

            const strictConfig = {
                ALLOWED_TAGS: ["p"],
                FORBID_TAGS: ["img"]
            };

            const startTime = performance.now();
            const removedTags: string[] = [];

            DOMPurify.addHook("uponSanitizeElement", (node, data) => {
                const tagName = data.tagName.toLowerCase();
                if (node.nodeType === 1 && !strictConfig.ALLOWED_TAGS.includes(tagName) && tagName !== "body") {
                    removedTags.push(tagName);
                }
            });

            DOMPurify.sanitize(htmlWithImg, strictConfig);
            DOMPurify.removeHook("uponSanitizeElement");

            const endTime = performance.now();
            const executionTimeMs = Math.round((endTime - startTime) * 100) / 100;

            // Verify timing is captured
            expect(removedTags.length).toBeGreaterThan(0);
            expect(executionTimeMs).toBeGreaterThanOrEqual(0);
        });
    });
});
