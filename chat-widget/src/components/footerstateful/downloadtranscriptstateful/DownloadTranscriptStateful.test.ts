/* eslint-disable @typescript-eslint/no-explicit-any */

jest.mock("@microsoft/omnichannel-chat-sdk", () => ({
    uuidv4: jest.fn(() => "mock-uuid"),
    OmnichannelChatSDK: jest.fn()
}));

jest.mock("../../../common/telemetry/TelemetryHelper", () => ({
    TelemetryHelper: { logActionEvent: jest.fn() }
}));

jest.mock("../../webchatcontainerstateful/webchatcontroller/notification/NotificationHandler", () => ({
    NotificationHandler: { notifyError: jest.fn() }
}));

jest.mock("../../../plugins/createChatTranscript", () => jest.fn());

jest.mock("../../../contexts/createReducer", () => ({
    executeReducer: jest.fn()
}));

jest.mock("../../../common/facades/FacadeChatSDK", () => ({
    FacadeChatSDK: jest.fn()
}));

import { processContent, beautifyChatTranscripts } from "./DownloadTranscriptStateful";

describe("processContent - XSS sanitization", () => {
    it("should strip img tags with onerror handlers", () => {
        const input = "<img src=x onerror=alert(1)>";
        const result = processContent(input, false);
        expect(result).not.toMatch(/<img/i);
        expect(result).not.toContain("onerror");
    });

    it("should strip script tags", () => {
        const input = "<script>alert(1)</script>";
        const result = processContent(input, false);
        expect(result).not.toMatch(/<script/i);
    });

    it("should strip iframe tags", () => {
        const input = "<iframe src=\"evil.com\"></iframe>";
        const result = processContent(input, false);
        expect(result).not.toMatch(/<iframe/i);
    });

    it("should strip svg tags with event handlers", () => {
        const input = "<svg onload=alert(1)></svg>";
        const result = processContent(input, false);
        expect(result).not.toMatch(/<svg/i);
        expect(result).not.toContain("onload");
    });

    it("should allow safe tags like <b>, <i>, <a>, <strong>, <em>", () => {
        const input = "<b>bold</b> <i>italic</i> <strong>strong</strong> <em>emphasis</em>";
        const result = processContent(input, false);
        expect(result).toContain("<b>bold</b>");
        expect(result).toContain("<i>italic</i>");
        expect(result).toContain("<strong>strong</strong>");
        expect(result).toContain("<em>emphasis</em>");
    });

    it("should allow anchor tags with safe attributes", () => {
        const input = "<a href=\"https://example.com\" target=\"_blank\" rel=\"noopener\">link</a>";
        const result = processContent(input, true);
        // DOMPurify may reorder attributes; check each individually
        expect(result).toContain("href=\"https://example.com\"");
        expect(result).toContain("rel=\"noopener\"");
        expect(result).toContain("link</a>");
    });

    it("should strip dangerous attributes from allowed tags", () => {
        const input = "<a href=\"https://example.com\" onclick=\"alert(1)\">link</a>";
        const result = processContent(input, false);
        expect(result).not.toContain("onclick");
        expect(result).toContain("<a href=\"https://example.com\"");
    });

    it("should strip div and style attributes not in allowlist", () => {
        const input = "<div style=\"background:red\">content</div>";
        const result = processContent(input, false);
        expect(result).not.toMatch(/<div/i);
        expect(result).toContain("content");
    });

    it("should use renderMarkDown callback when provided instead of DOMPurify", () => {
        const mockRenderMarkDown = jest.fn((content: string) => `<p>${content}</p>`);
        const input = "some markdown text";
        const result = processContent(input, false, mockRenderMarkDown);
        expect(mockRenderMarkDown).toHaveBeenCalledWith(input);
        expect(result).toBe("<p>some markdown text</p>");
    });
});

describe("beautifyChatTranscripts - XSS sanitization", () => {
    const createTranscriptJson = (messages: Array<{
        content: string;
        displayName?: string;
        createdDateTime?: string;
        attachments?: Array<{ name: string }>;
        isApplication?: boolean;
    }>) => {
        const chatMessages = messages.map((msg) => ({
            content: msg.content,
            createdDateTime: msg.createdDateTime || "2026-01-01T12:00:00Z",
            from: msg.isApplication
                ? { application: { displayName: msg.displayName || "Agent" } }
                : { guest: { displayName: msg.displayName || "Customer" } },
            ...(msg.attachments ? { attachments: msg.attachments } : {})
        }));
        return JSON.stringify(chatMessages);
    };

    it("should escape HTML in displayName to prevent XSS", () => {
        const transcript = createTranscriptJson([{
            content: "Hello",
            displayName: "<script>alert(1)</script>"
        }]);
        const result = beautifyChatTranscripts(transcript);
        expect(result).not.toMatch(/<script>alert\(1\)<\/script>/);
        expect(result).toContain("&lt;script&gt;");
    });

    it("should escape HTML in attachment filenames to prevent XSS", () => {
        const transcript = createTranscriptJson([{
            content: "file attached",
            displayName: "Customer",
            attachments: [{ name: "<img src=x onerror=alert(1)>.pdf" }]
        }]);
        const result = beautifyChatTranscripts(transcript);
        expect(result).not.toMatch(/<img src=x/);
        expect(result).toContain("&lt;img src=x onerror=alert(1)&gt;.pdf");
    });

    it("should sanitize message content via processContent", () => {
        const transcript = createTranscriptJson([{
            content: "<script>alert('xss')</script>Hello",
            displayName: "Customer"
        }]);
        const result = beautifyChatTranscripts(transcript);
        expect(result).not.toMatch(/<script>/);
        expect(result).toContain("Hello");
    });

    it("should escape displayName with nested HTML tags", () => {
        const transcript = createTranscriptJson([{
            content: "Hello",
            displayName: "<img src=x onerror=alert(document.cookie)>"
        }]);
        const result = beautifyChatTranscripts(transcript);
        // displayName should be entity-encoded in both the name display and the icon
        expect(result).not.toMatch(/<img src=x/);
        expect(result).toContain("&lt;img");
    });

    it("should preserve safe HTML in message content", () => {
        const transcript = createTranscriptJson([{
            content: "<b>Important</b> message with <a href=\"https://example.com\">link</a>",
            displayName: "Agent",
            isApplication: true
        }]);
        const result = beautifyChatTranscripts(transcript);
        expect(result).toContain("<b>Important</b>");
        expect(result).toContain("<a href=\"https://example.com\"");
    });

    it("should handle multiple messages with mixed XSS payloads", () => {
        const transcript = createTranscriptJson([
            { content: "<script>steal()</script>", displayName: "Customer" },
            { content: "Safe message", displayName: "Agent", isApplication: true },
            { content: "<iframe src=evil></iframe>", displayName: "Customer" }
        ]);
        const result = beautifyChatTranscripts(transcript);
        expect(result).not.toMatch(/<script>/);
        expect(result).not.toMatch(/<iframe/i);
        expect(result).toContain("Safe message");
    });
});
