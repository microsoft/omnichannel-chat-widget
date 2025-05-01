import { act, cleanup } from "@testing-library/react";
import isValidSurveyUrl from "./isValidSurveyUrl";

describe("isValidSurveyURL unit tests", () => {
    afterEach(() => {
        cleanup();
        jest.resetAllMocks();
    });

    act(() => {
        it("isValidSurveyUrl() should return 'true' on valid production urls", () => {
            const urls = [
                "https://tip.customervoice.microsoft.com",
                "https://customervoice.microsoft.com",
                "https://web.test.powerva.microsoft.com",
                "https://web.preprod.powerva.microsoft.com",
                "https://web.powerva.microsoft.com",
                "https://gcc.powerva.microsoft.us",
                "https://high.powerva.microsoft.us",
                "https://powerva.appsplatform.us",
                "https://powerva.powervirtualagents.cn"
            ];

            for (const url of urls) {
                const result = isValidSurveyUrl(url);
                expect(result).toBe(true);
            }
        });

        it("isValidSurveyUrl() should return 'false' on malicious/invalid URLs", () => {
            const urls = [
                "javascript:alert(document.domain)//https://customervoice.microsoft.com/Pages/ResponsePage.aspx?id=123456",
                "https://attacker-server.com/customervoice.microsoft.com"
            ];

            for (const url of urls) {
                const result = isValidSurveyUrl(url);
                expect(result).toBe(false);
            }
        });
    });
});