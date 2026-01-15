import "@testing-library/jest-dom";

import { generateEventName, getHours, getMinutes, getSeconds, getValidatedURL, replaceURLWithAnchor, uuidv4 } from "./utils";

import { act } from "react";
import { cleanup } from "@testing-library/react";

describe("utils unit test", () => {
    afterEach(() => {
        cleanup();
        jest.resetAllMocks();
    });

    act(() => {
        it("uuidv4 should generate valid GUID", () => {
            const random = uuidv4();
            expect(random.length).toBe(36);
            expect(random.charAt(8)).toBe("-");
            expect(random.charAt(13)).toBe("-");
            expect(random.charAt(18)).toBe("-");
            expect(random.charAt(23)).toBe("-");
        });
    });

    act(() => {
        it("generateEventName should generate valid event names", () => {
            const eventNameEmpty = generateEventName("", "", "");
            expect(eventNameEmpty).toBe("");

            const eventNameValid = generateEventName("a", "b", "c");
            expect(eventNameValid).toBe("bac");

            const eventNameHalfValid = generateEventName("a", "", "c");
            expect(eventNameHalfValid).toBe("ac");
        });
    });

    act(() => {
        it("getValidatedURL should check for valid URL or return empty", () => {
            const validTestUrl = getValidatedURL("https://test.microsoft.com");
            expect(validTestUrl).toBe("https://test.microsoft.com");

            const validTestUrl2 = getValidatedURL("http://www.test.co/params");
            expect(validTestUrl2).toBe("http://www.test.co/params");

            const validTestUrl3 = getValidatedURL("http://www.test.co/params");
            expect(validTestUrl3).toBe("http://www.test.co/params");

            const validTestUrl4 = getValidatedURL("https://tip.customervoice.microsoft.com/Pages/ResponsePage.aspx?id=YkJf70oOwkiRb-bmaZvb3VBXiZokKptMk8ceKB79-oxURjFaNFpHVDY2TlAyQTdMNTNKWFlYQ0VKTSQlQCNjPTEu&vt=ef5f4262-0e4a-48c2-916f-e6e6699bdbdd_d99d53e9-c06b-4ad2-a95e-9a23a2c01efa_637847968820000000_TIP_Hash_nr6Xgsy3%2bxKhaLkchRYTaK%2be%2bs3rzco9kzqjYTnSA7w%3d");
            expect(validTestUrl4).toBe("https://tip.customervoice.microsoft.com/Pages/ResponsePage.aspx?id=YkJf70oOwkiRb-bmaZvb3VBXiZokKptMk8ceKB79-oxURjFaNFpHVDY2TlAyQTdMNTNKWFlYQ0VKTSQlQCNjPTEu&vt=ef5f4262-0e4a-48c2-916f-e6e6699bdbdd_d99d53e9-c06b-4ad2-a95e-9a23a2c01efa_637847968820000000_TIP_Hash_nr6Xgsy3%2bxKhaLkchRYTaK%2be%2bs3rzco9kzqjYTnSA7w%3d");

            const validTestUrl5 = getValidatedURL("https://customervoice.microsoft.com/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbRzBkKrakuj1CvYYDsfs8hTBUMUE4WUJHMEZEMjVPRTBTVUYzSzREN1Q1Ry4u&vt=72f988bf-86f1-41af-91ab-2d7cd011db47_33743ab6-750a-4598-b3d1-902bef8e51fd_637847096240000000_MSIT_Hash_j1mV7GqRPNf7lNpsWeFBAL46SoaB0vDccn8TMRuYnZ0%3d&lang=en-us&showmultilingual=false");
            expect(validTestUrl5).toBe("https://customervoice.microsoft.com/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbRzBkKrakuj1CvYYDsfs8hTBUMUE4WUJHMEZEMjVPRTBTVUYzSzREN1Q1Ry4u&vt=72f988bf-86f1-41af-91ab-2d7cd011db47_33743ab6-750a-4598-b3d1-902bef8e51fd_637847096240000000_MSIT_Hash_j1mV7GqRPNf7lNpsWeFBAL46SoaB0vDccn8TMRuYnZ0%3d&lang=en-us&showmultilingual=false");

            const invalidUrl = getValidatedURL("www.badurl");
            expect(invalidUrl).toBe("");

            const invalidUrl2 = getValidatedURL("www.abc#.com");
            expect(invalidUrl2).toBe("");

            const emptyUrl = getValidatedURL("");
            expect(emptyUrl).toBe("");
        });
    });

    act(() => {
        it("getHours should return valid hours ", () => {
            const zeroHours = getHours(0);
            expect(zeroHours).toBe("00");

            const fiveHours = getHours(5.501 * 60 * 60 * 1000);
            expect(fiveHours).toBe("05");
        });
    });

    act(() => {
        it("getMinutes should return correct ", () => {
            const zeroMinutes = getMinutes(0);
            expect(zeroMinutes).toBe("00");

            const thirtyMinutes = getMinutes(5.501 * 60 * 60 * 1000);
            expect(thirtyMinutes).toBe("30");
        });
    });

    act(() => {
        it("getSeconds should return correct ", () => {
            const zeroSeconds = getSeconds(0);
            expect(zeroSeconds).toBe("00");

            const threeSeconds = getSeconds(5.501 * 60 * 60 * 1000);
            expect(threeSeconds).toBe("03");
        });
    });

    act(() => {
        it("replaceURLWithAnchor should check text for valid URL and replace urls with anchor tag ", () => {
            const validTestUrl = replaceURLWithAnchor("https://test.microsoft.com", true);
            // eslint-disable-next-line quotes
            expect(validTestUrl).toBe('<a href="https://test.microsoft.com" rel="noreferrer noopener" target="_blank">https://test.microsoft.com</a>');

            const validTestUrl2 = replaceURLWithAnchor("text start : https://test.microsoft.com text end", true);
            // eslint-disable-next-line quotes
            expect(validTestUrl2).toBe('text start : <a href="https://test.microsoft.com" rel="noreferrer noopener" target="_blank">https://test.microsoft.com</a> text end');

            const validTestUrl3 = replaceURLWithAnchor("https://test.microsoft.com", false);
            // eslint-disable-next-line quotes
            expect(validTestUrl3).toBe('<a href="https://test.microsoft.com">https://test.microsoft.com</a>');

            const emptyUrl = replaceURLWithAnchor("", false);
            expect(emptyUrl).toBe("");
        });
    });

    act(() => {
        it("replaceURLWithAnchor should block dangerous javascript: protocol", () => {
            const maliciousUrl = replaceURLWithAnchor("Click javascript:alert(1)", true);
            expect(maliciousUrl).not.toContain("<a href");
            expect(maliciousUrl).toContain("javascript:alert(1)");
        });
    });

    act(() => {
        it("replaceURLWithAnchor should block data: protocol", () => {
            const maliciousUrl = replaceURLWithAnchor("Visit data:text/html,<script>alert(1)</script>", true);
            expect(maliciousUrl).not.toContain("<a href");
        });
    });

    act(() => {
        it("replaceURLWithAnchor should block vbscript: protocol", () => {
            const maliciousUrl = replaceURLWithAnchor("Link vbscript:msgbox(1)", true);
            expect(maliciousUrl).not.toContain("<a href");
        });
    });

    act(() => {
        it("replaceURLWithAnchor should block file: protocol", () => {
            const maliciousUrl = replaceURLWithAnchor("Open file:///etc/passwd", true);
            expect(maliciousUrl).not.toContain("<a href");
        });
    });

    act(() => {
        it("replaceURLWithAnchor should escape quotes in URL display text", () => {
            const urlWithQuotes = replaceURLWithAnchor('Check http://example.com"test', true);
            expect(urlWithQuotes).toContain("&quot;");
            expect(urlWithQuotes).not.toContain('onclick=');
        });
    });

    act(() => {
        it("replaceURLWithAnchor should escape angle brackets in URL text", () => {
            // When URL contains angle brackets (caught by regex), they're escaped in display
            const urlWithBrackets = replaceURLWithAnchor("http://example.com<test>", true);
            expect(urlWithBrackets).toContain("&lt;test&gt;");
            expect(urlWithBrackets).toContain("http://example.com");
        });
    });

    act(() => {
        it("replaceURLWithAnchor should handle URLs with query parameters", () => {
            const urlWithParams = replaceURLWithAnchor("https://example.com?a=1&b=2", true);
            // Ampersands in href don't need escaping in modern HTML5
            expect(urlWithParams).toContain('href="https://example.com?a=1&b=2"');
            // But they are escaped in the display text
            expect(urlWithParams).toContain(">https://example.com?a=1&amp;b=2</a>");
        });
    });

    act(() => {
        it("replaceURLWithAnchor should handle multiple valid URLs", () => {
            const multipleUrls = replaceURLWithAnchor("Visit https://example.com or http://test.com", true);
            expect(multipleUrls).toContain('href="https://example.com"');
            expect(multipleUrls).toContain('href="http://test.com"');
        });
    });

    act(() => {
        it("replaceURLWithAnchor should handle mixed valid and invalid URLs", () => {
            const mixedUrls = replaceURLWithAnchor("Visit https://example.com or javascript:alert(1)", true);
            expect(mixedUrls).toContain('<a href="https://example.com"');
            expect(mixedUrls).not.toContain('<a href="javascript:alert(1)"');
        });
    });

    act(() => {
        it("replaceURLWithAnchor should handle undefined text", () => {
            const result = replaceURLWithAnchor(undefined, true);
            expect(result).toBeUndefined();
        });
    });

    act(() => {
        it("replaceURLWithAnchor should allow www. URLs", () => {
            const wwwUrl = replaceURLWithAnchor("Visit www.example.com", true);
            expect(wwwUrl).toContain('<a href="www.example.com"');
        });
    });

    act(() => {
        it("replaceURLWithAnchor should allow mailto: links", () => {
            const mailtoUrl = replaceURLWithAnchor("Email us at mailto:support@example.com", true);
            expect(mailtoUrl).toContain('<a href="mailto:support@example.com"');
            expect(mailtoUrl).toContain('rel="noreferrer noopener"');
        });
    });

    act(() => {
        it("replaceURLWithAnchor should allow tel: links", () => {
            const telUrl = replaceURLWithAnchor("Call us at tel:+1-800-555-0123", true);
            expect(telUrl).toContain('<a href="tel:+1-800-555-0123"');
        });
    });

    act(() => {
        it("replaceURLWithAnchor should allow sms: links", () => {
            const smsUrl = replaceURLWithAnchor("Text us at sms:+1-800-555-0123", true);
            expect(smsUrl).toContain('<a href="sms:+1-800-555-0123"');
        });
    });

    act(() => {
        it("replaceURLWithAnchor should handle multiple contact methods", () => {
            const contactInfo = replaceURLWithAnchor("Email mailto:support@example.com or call tel:+1-800-555-0123", true);
            expect(contactInfo).toContain('<a href="mailto:support@example.com"');
            expect(contactInfo).toContain('<a href="tel:+1-800-555-0123"');
        });
    });
});