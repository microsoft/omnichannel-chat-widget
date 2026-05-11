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
                "https://powerva.appsplatform.us"
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

        it("isValidSurveyUrl() should reject China-cloud PVA survey URLs when no org URL or a non-China org URL is provided", () => {
            const chinaPvaSurvey = "https://powerva.powervirtualagents.cn";

            expect(isValidSurveyUrl(chinaPvaSurvey)).toBe(false);
            expect(isValidSurveyUrl(chinaPvaSurvey, "")).toBe(false);
            expect(isValidSurveyUrl(chinaPvaSurvey, "https://contoso.crm.dynamics.com")).toBe(false);
            expect(isValidSurveyUrl(chinaPvaSurvey, "https://contoso.crm4.omnichannelengagementhub.com")).toBe(false);
            expect(isValidSurveyUrl(chinaPvaSurvey, "https://gov.omnichannelengagementhub.us")).toBe(false);
        });

        it("isValidSurveyUrl() should accept China-cloud PVA survey URLs only when the org URL is in the China cloud", () => {
            const chinaPvaSurvey = "https://powerva.powervirtualagents.cn";

            expect(isValidSurveyUrl(chinaPvaSurvey, "https://contoso.crm7.dynamics.cn")).toBe(true);
            expect(isValidSurveyUrl(chinaPvaSurvey, "https://contoso.crm7.omnichannelengagementhub.cn")).toBe(true);
        });

        it("isValidSurveyUrl() China-cloud gating should not loosen the public allow-list", () => {
            const attacker = "https://attacker-server.com/customervoice.microsoft.com";
            expect(isValidSurveyUrl(attacker, "https://contoso.crm7.dynamics.cn")).toBe(false);
        });
    });
});
