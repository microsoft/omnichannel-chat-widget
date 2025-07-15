import "@testing-library/jest-dom";

import { Regex } from "./Constants";

describe("Regex unit tests", () => {
    describe("EmailRegex", () => {
        const emailRegex = new RegExp(Regex.EmailRegex);

        it("should validate common email formats", () => {
            const validEmails = [
                "test@example.com",
                "user.name@domain.co.uk",
                "user+label@domain.org",
                "test123@test-domain.com",
                "a@b.co"
            ];

            validEmails.forEach(email => {
                expect(emailRegex.test(email)).toBe(true);
            });
        });

        it("should reject invalid email formats", () => {
            const invalidEmails = [
                "invalid-email",
                "@domain.com",
                "user@",
                "user..name@domain.com",
                "user@domain",  // No TLD
                "",
                "\u0001test@domain.com",
                "test@\u0001domain.com"
            ];

            invalidEmails.forEach(email => {
                const result = emailRegex.test(email);
                expect(result).toBe(false);
            });
        });

        it("should not cause performance issues with problematic input", () => {
            // Test with input that could cause exponential backtracking
            const problematicInput = "\u0001".repeat(30) + "@test.com";
            
            const start = Date.now();
            const result = emailRegex.test(problematicInput);
            const end = Date.now();
            
            // Should complete quickly (less than 100ms for such a simple test)
            expect(end - start).toBeLessThan(100);
            expect(result).toBe(false);
        });

        it("should handle edge cases efficiently", () => {
            const edgeCases = [
                "a".repeat(100) + "@" + "b".repeat(100) + ".com",
                "\u0001\u0002\u0003@test.com",
                "test@" + "\u0001".repeat(10) + ".com"
            ];

            edgeCases.forEach(testCase => {
                const start = Date.now();
                emailRegex.test(testCase);
                const end = Date.now();
                
                // Should complete quickly
                expect(end - start).toBeLessThan(50);
            });
        });
    });
});