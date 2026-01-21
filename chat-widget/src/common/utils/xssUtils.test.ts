import { detectAndCleanXSS } from "./xssUtils";

describe("detectAndCleanXSS", () => {
    describe("Safe text handling", () => {
        it("should return clean text unchanged when no XSS is detected", () => {
            const safeText = "Welcome to our chat service!";
            const result = detectAndCleanXSS(safeText);

            expect(result.cleanText).toBe(safeText);
            expect(result.isXSSDetected).toBe(false);
        });

        it("should handle empty string", () => {
            const result = detectAndCleanXSS("");

            expect(result.cleanText).toBe("");
            expect(result.isXSSDetected).toBe(false);
        });

        it("should handle whitespace-only text", () => {
            const whitespaceText = "   \n\t  ";
            const result = detectAndCleanXSS(whitespaceText);

            expect(result.cleanText).toBe(whitespaceText);
            expect(result.isXSSDetected).toBe(false);
        });

        it("should handle special characters without XSS", () => {
            const specialText = "Contact us at support@example.com or call 123-456-7890!";
            const result = detectAndCleanXSS(specialText);

            expect(result.cleanText).toBe(specialText);
            expect(result.isXSSDetected).toBe(false);
        });
    });

    describe("XSS detection", () => {
        it("should detect javascript: protocol", () => {
            const maliciousText = "Click here: javascript:alert(\"xss\")";
            const result = detectAndCleanXSS(maliciousText);

            expect(result.isXSSDetected).toBe(true);
        });

        it("should detect javascript: protocol with different casing", () => {
            const maliciousText = "Link: JAVASCRIPT:alert(1)";
            const result = detectAndCleanXSS(maliciousText);

            expect(result.isXSSDetected).toBe(true);
        });

        it("should detect vbscript: protocol", () => {
            const maliciousText = "vbscript:msgbox(\"xss\")";
            const result = detectAndCleanXSS(maliciousText);

            expect(result.isXSSDetected).toBe(true);
        });

        it("should detect onmouseover events", () => {
            const maliciousText = "Hello onmouseover=alert(\"xss\") world";
            const result = detectAndCleanXSS(maliciousText);

            expect(result.isXSSDetected).toBe(true);
        });

        it("should detect onclick events", () => {
            const maliciousText = "Button onclick=\"maliciousCode()\"";
            const result = detectAndCleanXSS(maliciousText);

            expect(result.isXSSDetected).toBe(true);
        });

        it("should detect script tags", () => {
            const maliciousText = "Hello <script>alert(\"xss\")</script> world";
            const result = detectAndCleanXSS(maliciousText);

            expect(result.isXSSDetected).toBe(true);
            expect(result.cleanText).toBe("Hello  world");
        });

        it("should detect CSS expression() attacks", () => {
            const maliciousText = "style=\"color: expression(alert('xss'))\"";
            const result = detectAndCleanXSS(maliciousText);

            expect(result.isXSSDetected).toBe(true);
        });

        it("should detect position:fixed attacks", () => {
            const maliciousText = "style=\"position:fixed;top:0;left:0\"";
            const result = detectAndCleanXSS(maliciousText);

            expect(result.isXSSDetected).toBe(true);
        });

        it("should detect data:text/html URLs", () => {
            const maliciousText = "src=\"data:text/html,<script>alert(1)</script>\"";
            const result = detectAndCleanXSS(maliciousText);

            expect(result.isXSSDetected).toBe(true);
        });

        it("should detect fragment with escaped quotes", () => {
            const maliciousText = "https://example.com#\\\"onload=alert(1)";
            const result = detectAndCleanXSS(maliciousText);

            expect(result.isXSSDetected).toBe(true);
        });
    });

    describe("HTML tag sanitization", () => {
        it("should remove script tags and preserve text content", () => {
            const maliciousText = "Hello <script>alert(\"xss\")</script> world";
            const result = detectAndCleanXSS(maliciousText);

            expect(result.isXSSDetected).toBe(true);
            expect(result.cleanText).toBe("Hello  world");
            expect(result.cleanText).not.toContain("<script>");
        });

        it("should handle strings with only HTML tags", () => {
            const onlyHTML = "<script>alert(\"xss\")</script>";
            const result = detectAndCleanXSS(onlyHTML);

            expect(result.isXSSDetected).toBe(true);
            expect(result.cleanText).toBe("");
        });

        it("should preserve legitimate content while removing HTML tags", () => {
            const mixedContent = "Welcome to our service! <script>alert(\"xss\")</script> Contact us at support@example.com";
            const result = detectAndCleanXSS(mixedContent);

            expect(result.isXSSDetected).toBe(true);
            expect(result.cleanText).toContain("Welcome to our service!");
            expect(result.cleanText).toContain("Contact us at support@example.com");
            expect(result.cleanText).not.toContain("<script>");
        });
    });

    describe("Mutation XSS (mXSS) attacks", () => {
        it("should detect style attribute split with iframe tags", () => {
            const mxssAttack = "s<iframe></iframe>tyle=onMouseOver=alert(1)";
            const result = detectAndCleanXSS(mxssAttack);

            expect(result.isXSSDetected).toBe(true);
            expect(result.cleanText).toBe("style=onMouseOver=alert(1)");
        });

        it("should detect onclick handler split with script tags", () => {
            const mxssAttack = "on<script></script>click=alert(document.cookie)";
            const result = detectAndCleanXSS(mxssAttack);

            expect(result.isXSSDetected).toBe(true);
            expect(result.cleanText).toBe("onclick=alert(document.cookie)");
        });

        it("should detect javascript protocol split with div tags", () => {
            const mxssAttack = "java<div></div>script:alert(1)";
            const result = detectAndCleanXSS(mxssAttack);

            expect(result.isXSSDetected).toBe(true);
            expect(result.cleanText).toBe("javascript:alert(1)");
        });

        it("should detect onload handler split with span tags", () => {
            const mxssAttack = "onl<span>test</span>oad=malicious()";
            const result = detectAndCleanXSS(mxssAttack);

            expect(result.isXSSDetected).toBe(true);
            expect(result.cleanText).toBe("onltestoad=malicious()");
        });

        it("should detect nested tag mutations", () => {
            const mxssAttack = "o<b>n<i>m</i>o</b>useover=alert(1)";
            const result = detectAndCleanXSS(mxssAttack);

            expect(result.isXSSDetected).toBe(true);
            expect(result.cleanText).toBe("onmouseover=alert(1)");
        });

        it("should detect vbscript protocol split with tags", () => {
            const mxssAttack = "vb<img>script:alert(1)";
            const result = detectAndCleanXSS(mxssAttack);

            expect(result.isXSSDetected).toBe(true);
            expect(result.cleanText).toBe("vbscript:alert(1)");
        });

        it("should handle complex mutation with multiple split patterns", () => {
            const mxssAttack = "s<iframe></iframe>tyle=o<div></div>nmouseover=a<span></span>lert(1)";
            const result = detectAndCleanXSS(mxssAttack);

            expect(result.isXSSDetected).toBe(true);
            expect(result.cleanText).toContain("style=");
            expect(result.cleanText).toContain("onmouseover=");
        });

        it("should detect SVG tag used for mutation", () => {
            const mxssAttack = "on<svg></svg>error=alert('XSS')";
            const result = detectAndCleanXSS(mxssAttack);

            expect(result.isXSSDetected).toBe(true);
            expect(result.cleanText).toBe("onerror=alert('XSS')");
        });
    });

    describe("Complex attack scenarios", () => {
        it("should detect the specific attack pattern from the example", () => {
            const attackPattern = "https://attacker-server.com/#\\\"/style=\\\"display:block;position:fixed;top:0;bottom:0;right:0;left:0;color:#00000000;\\\"/onmouseover=alert(document.domain)&gt;";
            const result = detectAndCleanXSS(attackPattern);

            expect(result.isXSSDetected).toBe(true);
        });

        it("should detect multiple XSS patterns in one string", () => {
            const multipleAttacks = "javascript:alert(1) <script>evil()</script> onmouseover=\"attack()\"";
            const result = detectAndCleanXSS(multipleAttacks);

            expect(result.isXSSDetected).toBe(true);
            expect(result.cleanText).not.toContain("<script>");
        });
    });

    describe("Edge cases and boundary conditions", () => {
        it("should handle very long strings", () => {
            const longSafeText = "a".repeat(10000);
            const result = detectAndCleanXSS(longSafeText);

            expect(result.cleanText).toBe(longSafeText);
            expect(result.isXSSDetected).toBe(false);
        });

        it("should handle strings with only XSS content", () => {
            const onlyXSS = "<script>alert(\"xss\")</script>";
            const result = detectAndCleanXSS(onlyXSS);

            expect(result.isXSSDetected).toBe(true);
            expect(result.cleanText).toBe("");
        });

        it("should handle Unicode characters", () => {
            const unicodeText = "Hello 世界! Welcome 🌍";
            const result = detectAndCleanXSS(unicodeText);

            expect(result.cleanText).toBe(unicodeText);
            expect(result.isXSSDetected).toBe(false);
        });

        it("should handle null and undefined-like strings", () => {
            const nullString = "null";
            const undefinedString = "undefined";

            const nullResult = detectAndCleanXSS(nullString);
            const undefinedResult = detectAndCleanXSS(undefinedString);

            expect(nullResult.cleanText).toBe("null");
            expect(nullResult.isXSSDetected).toBe(false);
            expect(undefinedResult.cleanText).toBe("undefined");
            expect(undefinedResult.isXSSDetected).toBe(false);
        });
    });

    describe("Return value structure", () => {
        it("should always return an object with cleanText and isXSSDetected properties", () => {
            const result = detectAndCleanXSS("test");

            expect(typeof result).toBe("object");
            expect(result).toHaveProperty("cleanText");
            expect(result).toHaveProperty("isXSSDetected");
            expect(typeof result.cleanText).toBe("string");
            expect(typeof result.isXSSDetected).toBe("boolean");
        });
    });
});
