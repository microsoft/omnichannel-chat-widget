import "@testing-library/jest-dom";

import { Regex } from "./Constants";

describe("Regex unit tests", () => {
    describe("EmailRegex", () => {
        const emailRegex = new RegExp(Regex.EmailRegex);

        describe("Valid Email Formats", () => {
            it("should validate common email formats", () => {
                const validEmails = [
                    "test@example.com",
                    "user.name@domain.co.uk",
                    "user+label@domain.org",
                    "test123@test-domain.com",
                    "a@b.co",
                    "firstname.lastname@company.com",
                    "email@[123.123.123.123]", // IP address domains in square brackets
                    "1234567890@example.com",
                    "email@example-one.com",
                    "_______@example.com",
                    "email@example.name",
                    // Special characters supported by original regex
                    "user!test@example.com",
                    "user#test@example.com",
                    "user$test@example.com",
                    "user%test@example.com",
                    "user&test@example.com",
                    "user'test@example.com",
                    "user*test@example.com",
                    "user/test@example.com",
                    "user=test@example.com",
                    "user?test@example.com",
                    "user^test@example.com",
                    "user_test@example.com",
                    "user`test@example.com",
                    "user{test@example.com",
                    "user|test@example.com",
                    "user}test@example.com",
                    "user~test@example.com",
                    // Quoted local parts
                    "\"test user\"@example.com",
                    "\"user.test\"@example.com"
                ];

                validEmails.forEach(email => {
                    expect(emailRegex.test(email)).toBe(true);
                });
            });

            it("should validate emails with underscores and hyphens", () => {
                const validEmails = [
                    "user_name@example.com",
                    "user-name@example.com", 
                    "user+tag@example.com",
                    "user%percent@example.com",
                    "user.with.dots@sub.domain.example.com"
                ];

                validEmails.forEach(email => {
                    expect(emailRegex.test(email)).toBe(true);
                });
            });

            it("should validate case-insensitive emails", () => {
                const validEmails = [
                    "Test@Example.COM",
                    "USER@DOMAIN.ORG",
                    "MixedCase@Example.Co.UK"
                ];

                validEmails.forEach(email => {
                    expect(emailRegex.test(email)).toBe(true);
                });
            });

            it("should validate IP address domains", () => {
                const ipEmails = [
                    "user@[192.168.1.1]",
                    "test@[10.0.0.1]",
                    "email@[255.255.255.255]",
                    "user@[0.0.0.0]"
                ];

                ipEmails.forEach(email => {
                    expect(emailRegex.test(email)).toBe(true);
                });
            });

            it("should validate single-label domains (RFC 5322 compliant)", () => {
                const singleLabelEmails = [
                    "user@domain",
                    "test@localhost",
                    "admin@server",
                    "email@host"
                ];

                singleLabelEmails.forEach(email => {
                    expect(emailRegex.test(email)).toBe(true);
                });
            });

            it("should validate quoted local parts", () => {
                const quotedEmails = [
                    "\"test user\"@example.com",
                    "\"user.with.dots\"@example.com",
                    "\"user@symbol\"@example.com",
                    "\"spaces in quotes\"@example.com"
                ];

                quotedEmails.forEach(email => {
                    expect(emailRegex.test(email)).toBe(true);
                });
            });
        });

        describe("Invalid Email Formats", () => {
            it("should reject emails with invalid formats", () => {
                const invalidEmails = [
                    "invalid-email",
                    "@domain.com",
                    "user@",
                    "",
                    " ",
                    "user@domain.",
                    "user@.domain.com",
                    ".user@domain.com",
                    "user.@domain.com"
                ];

                invalidEmails.forEach(email => {
                    expect(emailRegex.test(email)).toBe(false);
                });
            });

            it("should reject emails with consecutive dots", () => {
                const invalidEmails = [
                    "user..name@domain.com",
                    "user...test@domain.com",
                    "user@domain..com",
                    "user@domain.com."
                ];

                invalidEmails.forEach(email => {
                    expect(emailRegex.test(email)).toBe(false);
                });
            });

            it("should reject emails with invalid domain formats", () => {
                const invalidEmails = [
                    "user@-domain.com",     // Domain starts with hyphen
                    "user@domain-.com",     // Domain ends with hyphen
                    "user@domain..com",     // Consecutive dots in domain
                    "user@.domain.com",     // Domain starts with dot
                    "user@domain.com."      // Domain ends with dot
                    // Removed: "user@domain.c" - single letter TLD is valid per RFC 5322
                    // Removed: "user@domain.123" - numeric TLD is valid per RFC 5322
                ];

                invalidEmails.forEach(email => {
                    expect(emailRegex.test(email)).toBe(false);
                });
            });

            it("should reject emails with special characters", () => {
                const invalidEmails = [
                    "user@domain.com\n",    // Newline
                    "user@domain.com\t",    // Tab
                    "user @domain.com",     // Space in local part (not quoted)
                    "user@ domain.com",     // Space in domain
                    "user[test@domain.com", // Square bracket (not quoted)
                    "user]test@domain.com", // Square bracket (not quoted) 
                    "user\\test@domain.com", // Backslash (not quoted)
                    "user\"test@domain.com", // Quote (not properly quoted)
                    "user(test@domain.com", // Parentheses (not quoted)
                    "user)test@domain.com", // Parentheses (not quoted)
                    "user,test@domain.com", // Comma (not quoted)
                    "user:test@domain.com", // Colon (not quoted)
                    "user;test@domain.com", // Semicolon (not quoted)
                    "user<test@domain.com", // Less than (not quoted)
                    "user>test@domain.com"  // Greater than (not quoted)
                ];

                invalidEmails.forEach(email => {
                    expect(emailRegex.test(email)).toBe(false);
                });
            });
        });

        describe("Security Tests - ReDoS Protection", () => {
            it("should not cause performance issues with null byte characters", () => {
                const problematicInput = "\u0000".repeat(100) + "@test.com";
                
                const start = performance.now();
                const result = emailRegex.test(problematicInput);
                const end = performance.now();
                
                expect(end - start).toBeLessThan(100);
                expect(result).toBe(false);
            });

            it("should not cause performance issues with control characters", () => {
                const problematicInput = "\u0001".repeat(100) + "@test.com";
                
                const start = performance.now();
                const result = emailRegex.test(problematicInput);
                const end = performance.now();
                
                expect(end - start).toBeLessThan(100);
                expect(result).toBe(false);
            });

            it("should handle long strings efficiently", () => {
                const longString = "a".repeat(1000) + "@" + "b".repeat(1000) + ".com";
                
                const start = performance.now();
                const result = emailRegex.test(longString);
                const end = performance.now();
                
                expect(end - start).toBeLessThan(100);
                // Long strings are still valid if they follow email format (no artificial length limits)
                expect(result).toBe(true);
            });

            it("should handle malicious ReDoS patterns efficiently", () => {
                const maliciousPatterns = [
                    // Various control characters that could cause issues (non-printable chars)
                    "\u0001".repeat(50) + "@test.com",
                    "\u0002".repeat(50) + "@test.com", 
                    "\u0003".repeat(50) + "@test.com",
                    // Mixed control characters
                    "\u0001\u0002\u0003".repeat(30) + "@test.com",
                    // Invalid patterns that should fail
                    "..invalid@test.com",               // Starts with dots
                    "invalid..@test.com",               // Consecutive dots
                    "invalid.@test.com",                // Ends with dot
                    "test@.invalid.com",                // Domain starts with dot
                    "test@invalid..com",                // Consecutive dots in domain
                    "test@-invalid.com"                 // Domain starts with hyphen
                ];

                maliciousPatterns.forEach(pattern => {
                    const start = performance.now();
                    const result = emailRegex.test(pattern);
                    const end = performance.now();
                    
                    expect(end - start).toBeLessThan(50);
                    expect(result).toBe(false);
                });
            });

            it("should handle Unicode characters efficiently", () => {
                const unicodePatterns = [
                    "üser@domain.com",      // Non-ASCII characters (should fail)
                    "用户@domain.com",       // Chinese characters (should fail)
                    "тест@domain.com",      // Cyrillic characters (should fail)
                    "test@дomain.com",      // Non-ASCII domain (should fail)
                    "test@domain.рф"        // Non-ASCII TLD (should fail)
                ];

                unicodePatterns.forEach(pattern => {
                    const start = performance.now();
                    const result = emailRegex.test(pattern);
                    const end = performance.now();
                    
                    expect(end - start).toBeLessThan(50);
                    expect(result).toBe(false);
                });
            });

            it("should handle extremely long but valid-structure emails", () => {
                // Create a long but structurally valid email
                const longLocal = "a".repeat(64);  // Max local part length per RFC
                const longDomain = "a".repeat(63); // Max domain segment length
                const longEmail = `${longLocal}@${longDomain}.com`;
                
                const start = performance.now();
                const result = emailRegex.test(longEmail);
                const end = performance.now();
                
                expect(end - start).toBeLessThan(50);
                expect(result).toBe(true);
            });
        });

        describe("Edge Cases", () => {
            it("should handle minimum valid email", () => {
                expect(emailRegex.test("a@b.co")).toBe(true);
            });

            it("should handle emails with numbers", () => {
                const numericEmails = [
                    "123@456.com",              // Numbers in local and domain parts
                    "test123@domain456.org",    // Mixed alphanumeric
                    "user@[192.168.1.100]"     // IP address in square brackets
                ];

                numericEmails.forEach(email => {
                    expect(emailRegex.test(email)).toBe(true);
                });
            });

            it("should handle complex but valid domain structures", () => {
                const complexDomains = [
                    "user@sub.domain.example.com",
                    "user@a.b.c.d.example.org",
                    "user@test-domain-name.co.uk"
                ];

                complexDomains.forEach(email => {
                    expect(emailRegex.test(email)).toBe(true);
                });
            });

            it("should accept emails with various TLD formats per RFC 5322", () => {
                const validTLDs = [
                    "user@domain.c",        // Single letter TLD (valid per RFC 5322)
                    "user@domain.1",        // Numeric TLD (valid per RFC 5322)
                    "user@domain.co",       // Two letter TLD
                    "user@domain.com"       // Three letter TLD
                    // Removed invalid patterns that RFC doesn't allow:
                    // "user@domain.co-" - TLD ending with hyphen is still invalid
                    // "user@domain.-com" - TLD starting with hyphen is still invalid
                ];

                validTLDs.forEach(email => {
                    expect(emailRegex.test(email)).toBe(true);
                });
            });

            it("should reject emails with invalid TLD formats", () => {
                const invalidTLDs = [
                    "user@domain.co-",      // Ends with hyphen
                    "user@domain.-com"      // Starts with hyphen
                ];

                invalidTLDs.forEach(email => {
                    expect(emailRegex.test(email)).toBe(false);
                });
            });
        });

        describe("Performance Benchmarks", () => {
            it("should validate 1000 emails in reasonable time", () => {
                const emails = Array(1000).fill("test@example.com");
                
                const start = performance.now();
                emails.forEach(email => emailRegex.test(email));
                const end = performance.now();
                
                // Should process 1000 emails in less than 100ms
                expect(end - start).toBeLessThan(100);
            });

            it("should reject 1000 invalid emails in reasonable time", () => {
                const emails = Array(1000).fill("invalid.email");
                
                const start = performance.now();
                emails.forEach(email => emailRegex.test(email));
                const end = performance.now();
                
                // Should process 1000 invalid emails in less than 50ms
                expect(end - start).toBeLessThan(50);
            });
        });
    });
});