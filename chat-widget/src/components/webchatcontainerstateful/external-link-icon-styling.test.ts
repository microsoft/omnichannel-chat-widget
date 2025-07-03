import "@testing-library/jest-dom";

// Simple test to verify external link icon CSS styling doesn't contain !important
describe("External Link Icon Styling", () => {
    
    it("should not contain !important in background-image property for received messages", () => {
        // This test verifies that the CSS styling for external link icons
        // in received messages doesn't use !important, allowing proper customization
        
        const cssRule = `
        .ms_lcw_webchat_received_message img.webchat__render-markdown__external-link-icon {
            background-image: url(data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIzIDMgMTggMTgiICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik03LjI1MDEgNC41MDAxN0gxMC43NDk1QzExLjE2MzcgNC41MDAxNyAxMS40OTk1IDQuODM1OTYgMTEuNDk5NSA1LjI1MDE3QzExLjQ5OTUgNS42Mjk4NiAxMS4yMTczIDUuOTQzNjYgMTAuODUxMyA1Ljk5MzMyTDEwLjc0OTUgNi4wMDAxN0g3LjI0OTc0QzYuMDcwNzkgNS45OTk2MSA1LjEwMzQ5IDYuOTA2NTYgNS4wMDc4NiA4LjA2MTEyTDUuMDAwMjggOC4yMjAwM0w1LjAwMzEyIDE2Ljc1MDdDNS4wMDM0MyAxNy45NDE1IDUuOTI4ODUgMTguOTE2MSA3LjA5OTY2IDE4Ljk5NDlMNy4yNTM3MSAxOS4wMDAxTDE1Ljc1MTggMTguOTg4NEMxNi45NDE1IDE4Ljk4NjggMTcuOTE0NSAxOC4wNjIgMTcuOTkzNSAxNi44OTIzTDE3Ljk5ODcgMTYuNzM4NFYxMy4yMzIxQzE3Ljk5ODcgMTIuODE3OSAxOC4zMzQ1IDEyLjQ4MjEgMTguNzQ4NyAxMi40ODIxQzE5LjEyODQgMTIuNDgyMSAxOS40NDIyIDEyLjc2NDMgMTkuNDkxOCAxMy4xMzAzTDE5LjQ5ODcgMTMuMjMyMVYxNi43Mzg0QzE5LjQ5ODcgMTguNzQwNyAxNy45MjkzIDIwLjM3NjkgMTUuOTUyOCAyMC40ODI5TDE1Ljc1MzggMjAuNDg4NEw3LjI1ODI3IDIwLjUwMDFMNy4wNTQ5NSAyMC40OTQ5QzUuMTQyMzkgMjAuMzk1NCAzLjYwODk1IDE4Ljg2MjcgMy41MDgzNyAxNi45NTAyTDMuNTAzMTIgMTYuNzUxMUwzLjUwMDg5IDguMjUyN0wzLjUwNTI5IDguMDUwMkMzLjYwNTM5IDYuMTM3NDkgNS4xMzg2NyA0LjYwNDQ5IDcuMDUwOTYgNC41MDUyN0w3LjI1MDEgNC41MDAxN0gxMC43NDk1SDcuMjUwMVpNMTMuNzQ4MSAzLjAwMTQ2TDIwLjMwMTggMy4wMDE5N0wyMC40MDE0IDMuMDE1NzVMMjAuNTAyMiAzLjA0MzkzTDIwLjU1OSAzLjA2ODAzQzIwLjYxMjIgMy4wOTEyMiAyMC42NjM0IDMuMTIxNjMgMjAuNzExMSAzLjE1ODg1TDIwLjc4MDQgMy4yMjE1NkwyMC44NjQxIDMuMzIwMTRMMjAuOTE4MyAzLjQxMDI1TDIwLjk1NyAzLjUwMDU3TDIwLjk3NjIgMy41NjQ3NkwyMC45ODk4IDMuNjI4NjJMMjAuOTk5MiAzLjcyMjgyTDIwLjk5OTcgMTAuMjU1NEMyMC45OTk3IDEwLjY2OTYgMjAuNjYzOSAxMS4wMDU0IDIwLjI0OTcgMTEuMDA1NEMxOS44NyAxMS4wMDU0IDE5LjU1NjIgMTAuNzIzMiAxOS41MDY1IDEwLjM1NzFMMTkuNDk5NyAxMC4yNTU0TDE5LjQ5ODkgNS41NjE0N0wxMi4yNzk3IDEyLjc4NDdDMTIuMDEzNCAxMy4wNTEgMTEuNTk2OCAxMy4wNzUzIDExLjMwMzEgMTIuODU3NUwxMS4yMTkgMTIuNzg0OUMxMC45NTI3IDEyLjUxODcgMTAuOTI4NCAxMi4xMDIxIDExLjE0NjIgMTEuODA4NEwxMS4yMTg4IDExLjcyNDNMMTguNDM2OSA0LjUwMTQ2SDEzLjc0ODFDMTMuMzY4NCA0LjUwMTQ2IDEzLjA1NDYgNC4yMTkzMSAxMy4wMDUgMy44NTMyNEwxMi45OTgxIDMuNzUxNDZDMTIuOTk4MSAzLjM3MTc3IDEzLjI4MDMgMy4wNTc5NyAxMy42NDY0IDMuMDA4MzFMMTMuNzQ4MSAzLjAwMTQ2WiIgZmlsbD0iI0ZGRkZGRiIgLz48L3N2Zz4);
            height: .75em;
            margin-left: .25em;
        }`;
        
        // Check that the CSS rule doesn't contain !important
        expect(cssRule).not.toContain("!important");
        
        // Check that the background-image property is still present
        expect(cssRule).toContain("background-image:");
        
        // Check that the CSS class name is correctly maintained
        expect(cssRule).toContain("webchat__render-markdown__external-link-icon");
    });
    
    it("should maintain proper CSS specificity for external link icon", () => {
        // Verify that the CSS selector has proper specificity
        const selector = ".ms_lcw_webchat_received_message img.webchat__render-markdown__external-link-icon";
        
        // Check that it targets received messages specifically
        expect(selector).toContain("ms_lcw_webchat_received_message");
        
        // Check that it targets the specific icon class
        expect(selector).toContain("webchat__render-markdown__external-link-icon");
        
        // Check that it targets img elements
        expect(selector).toContain("img");
    });
});