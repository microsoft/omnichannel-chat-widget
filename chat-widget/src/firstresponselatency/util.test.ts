/* eslint-disable @typescript-eslint/no-explicit-any */

import "@testing-library/jest-dom";

import { Constants } from "../common/Constants";
import { IActivity } from "botframework-directlinejs";
import { isHistoryMessage } from "./util";

describe("isHistoryMessage", () => {
    const mockStartTime = 1640995200000; // Fixed epoch timestamp for testing

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("Non-message activities", () => {
        it("should return false for non-message activity types", () => {
            const activity: IActivity = {
                type: "typing",
                id: "123",
                timestamp: new Date().toISOString(),
                from: { id: "user1" },
                channelId: "test"
            };

            const result = isHistoryMessage(activity, mockStartTime);
            expect(result).toBe(false);
        });

        it("should return false for undefined activity type", () => {
            const activity: IActivity = {
                id: "123",
                timestamp: new Date().toISOString(),
                from: { id: "user1" },
                channelId: "test",
                type: ""
            };

            const result = isHistoryMessage(activity, mockStartTime);
            expect(result).toBe(false);
        });

        it("should return false for null activity type", () => {
            const activity: IActivity = {
                type: null as any,
                id: "123",
                timestamp: new Date().toISOString(),
                from: { id: "user1" },
                channelId: "test"
            };

            const result = isHistoryMessage(activity, mockStartTime);
            expect(result).toBe(false);
        });
    });

    describe("Legacy history message tag", () => {
        it("should return true when activity has history message tag", () => {
            const activity: IActivity = {
                type: Constants.message,
                id: "123",
                timestamp: new Date().toISOString(),
                from: { id: "user1" },
                channelId: "test",
                channelData: {
                    tags: [Constants.historyMessageTag, "other-tag"]
                }
            };

            const result = isHistoryMessage(activity, mockStartTime);
            expect(result).toBe(true);
        });

        it("should return true when activity has only history message tag", () => {
            const activity: IActivity = {
                type: Constants.message,
                id: "123",
                timestamp: new Date().toISOString(),
                from: { id: "user1" },
                channelId: "test",
                channelData: {
                    tags: [Constants.historyMessageTag]
                }
            };

            const result = isHistoryMessage(activity, mockStartTime);
            expect(result).toBe(true);
        });

        it("should prioritize legacy tag over activity ID comparison", () => {
            // Activity ID is newer than startTime, but has legacy tag
            const newerActivityId = mockStartTime + 10000;
            const activity: IActivity = {
                type: Constants.message,
                id: newerActivityId.toString(),
                timestamp: new Date().toISOString(),
                from: { id: "user1" },
                channelId: "test",
                channelData: {
                    tags: [Constants.historyMessageTag]
                }
            };

            const result = isHistoryMessage(activity, mockStartTime);
            expect(result).toBe(true);
        });

        it("should return false when no history tag is present", () => {
            const activity: IActivity = {
                type: Constants.message,
                id: (mockStartTime + 1000).toString(), // Use a newer timestamp
                timestamp: new Date().toISOString(),
                from: { id: "user1" },
                channelId: "test",
                channelData: {
                    tags: ["other-tag", "another-tag"]
                }
            };

            // Activity ID is newer than startTime, so should be new message
            const result = isHistoryMessage(activity, mockStartTime);
            expect(result).toBe(false);
        });

        it("should handle missing channelData", () => {
            const activity: IActivity = {
                type: Constants.message,
                id: (mockStartTime - 1000).toString(),
                timestamp: new Date().toISOString(),
                from: { id: "user1" },
                channelId: "test"
                // no channelData
            };

            const result = isHistoryMessage(activity, mockStartTime);
            expect(result).toBe(true); // Should fall through to ID comparison
        });

        it("should handle missing tags in channelData", () => {
            const activity: IActivity = {
                type: Constants.message,
                id: (mockStartTime - 1000).toString(),
                timestamp: new Date().toISOString(),
                from: { id: "user1" },
                channelId: "test",
                channelData: {
                    // no tags property
                }
            };

            const result = isHistoryMessage(activity, mockStartTime);
            expect(result).toBe(true); // Should fall through to ID comparison
        });
    });

    describe("Activity ID timestamp comparison", () => {
        it("should return true when activity ID is older than startTime", () => {
            const olderActivityId = mockStartTime - 10000; // 10 seconds earlier
            const activity: IActivity = {
                type: Constants.message,
                id: olderActivityId.toString(),
                timestamp: new Date().toISOString(),
                from: { id: "user1" },
                channelId: "test"
            };

            const result = isHistoryMessage(activity, mockStartTime);
            expect(result).toBe(true);
        });

        it("should return false when activity ID is newer than startTime", () => {
            const newerActivityId = mockStartTime + 10000; // 10 seconds later
            const activity: IActivity = {
                type: Constants.message,
                id: newerActivityId.toString(),
                timestamp: new Date().toISOString(),
                from: { id: "user1" },
                channelId: "test"
            };

            const result = isHistoryMessage(activity, mockStartTime);
            expect(result).toBe(false);
        });

        it("should return false when activity ID equals startTime", () => {
            const activity: IActivity = {
                type: Constants.message,
                id: mockStartTime.toString(),
                timestamp: new Date().toISOString(),
                from: { id: "user1" },
                channelId: "test"
            };

            const result = isHistoryMessage(activity, mockStartTime);
            expect(result).toBe(false);
        });

        it("should return true when activity ID is significantly older", () => {
            const muchOlderActivityId = mockStartTime - 3600000; // 1 hour earlier
            const activity: IActivity = {
                type: Constants.message,
                id: muchOlderActivityId.toString(),
                timestamp: new Date().toISOString(),
                from: { id: "user1" },
                channelId: "test"
            };

            const result = isHistoryMessage(activity, mockStartTime);
            expect(result).toBe(true);
        });
    });

    describe("Invalid activity ID handling", () => {
        it("should return false for non-numeric activity ID", () => {
            const activity: IActivity = {
                type: Constants.message,
                id: "not-a-number",
                timestamp: new Date().toISOString(),
                from: { id: "user1" },
                channelId: "test"
            };

            const result = isHistoryMessage(activity, mockStartTime);
            expect(result).toBe(false);
        });

        it("should return false for UUID-style activity ID", () => {
            const activity: IActivity = {
                type: Constants.message,
                id: "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx", // Pure UUID format that won't parse to a number
                timestamp: new Date().toISOString(),
                from: { id: "user1" },
                channelId: "test"
            };

            const result = isHistoryMessage(activity, mockStartTime);
            expect(result).toBe(false);
        });

        it("should handle UUID that starts with numbers correctly", () => {
            const activity: IActivity = {
                type: Constants.message,
                id: "550e8400-e29b-41d4-a716-446655440000", // UUID starting with numbers
                timestamp: new Date().toISOString(),
                from: { id: "user1" },
                channelId: "test"
            };

            // UUIDs should not be considered history (strict mode)
            const result = isHistoryMessage(activity, mockStartTime);
            expect(result).toBe(false); // UUIDs are not valid numeric IDs
        });

        it("should return false for empty activity ID", () => {
            const activity: IActivity = {
                type: Constants.message,
                id: "",
                timestamp: new Date().toISOString(),
                from: { id: "user1" },
                channelId: "test"
            };

            const result = isHistoryMessage(activity, mockStartTime);
            expect(result).toBe(false);
        });

        it("should return false for null activity ID", () => {
            const activity: IActivity = {
                type: Constants.message,
                id: null as any,
                timestamp: new Date().toISOString(),
                from: { id: "user1" },
                channelId: "test"
            };

            const result = isHistoryMessage(activity, mockStartTime);
            expect(result).toBe(false);
        });

        it("should return false for undefined activity ID", () => {
            const activity: IActivity = {
                type: Constants.message,
                // id: undefined
                timestamp: new Date().toISOString(),
                from: { id: "user1" },
                channelId: "test"
            };

            const result = isHistoryMessage(activity, mockStartTime);
            expect(result).toBe(false);
        });

        it("should handle partial numeric ID", () => {
            const activity: IActivity = {
                type: Constants.message,
                id: "123abc",
                timestamp: new Date().toISOString(),
                from: { id: "user1" },
                channelId: "test"
            };

            // parseInt("123abc") returns 123, which is less than mockStartTime
            const result = isHistoryMessage(activity, mockStartTime);
            expect(result).toBe(true); // parseInt extracts 123, which is < startTime
        });

        it("should handle small numeric IDs correctly", () => {
            const activity: IActivity = {
                type: Constants.message,
                id: "123",
                timestamp: new Date().toISOString(),
                from: { id: "user1" },
                channelId: "test"
            };

            // parseInt("123") returns 123, which is much less than mockStartTime (1640995200000)
            const result = isHistoryMessage(activity, mockStartTime);
            expect(result).toBe(true); // 123 < 1640995200000, so it's considered history
        });
    });

    describe("Edge cases and boundary conditions", () => {
        it("should handle very large timestamp values", () => {
            const veryLargeTimestamp = 9999999999999;
            const activity: IActivity = {
                type: Constants.message,
                id: veryLargeTimestamp.toString(),
                timestamp: new Date().toISOString(),
                from: { id: "user1" },
                channelId: "test"
            };

            const result = isHistoryMessage(activity, mockStartTime);
            expect(result).toBe(false); // Very large timestamp is newer
        });

        it("should handle very small timestamp values", () => {
            const verySmallTimestamp = 1000;
            const activity: IActivity = {
                type: Constants.message,
                id: verySmallTimestamp.toString(),
                timestamp: new Date().toISOString(),
                from: { id: "user1" },
                channelId: "test"
            };

            const result = isHistoryMessage(activity, mockStartTime);
            expect(result).toBe(true); // Very small timestamp is older
        });

        it("should handle zero timestamp", () => {
            const activity: IActivity = {
                type: Constants.message,
                id: "0",
                timestamp: new Date().toISOString(),
                from: { id: "user1" },
                channelId: "test"
            };

            const result = isHistoryMessage(activity, mockStartTime);
            expect(result).toBe(true); // 0 is less than startTime
        });

        it("should handle negative numbers", () => {
            const activity: IActivity = {
                type: Constants.message,
                id: "-1000",
                timestamp: new Date().toISOString(),
                from: { id: "user1" },
                channelId: "test"
            };

            const result = isHistoryMessage(activity, mockStartTime);
            expect(result).toBe(false); // Negative numbers are not valid IDs
        });
    });

    describe("Real-world scenarios", () => {
        it("should correctly identify history message from previous chat session", () => {
            const previousChatTimestamp = mockStartTime - 3600000; // 1 hour ago
            const activity: IActivity = {
                type: Constants.message,
                id: previousChatTimestamp.toString(),
                timestamp: new Date(previousChatTimestamp).toISOString(),
                from: { id: "agent1", role: "agent" },
                channelId: "webchat",
                text: "Hello, how can I help you?"
            };

            const result = isHistoryMessage(activity, mockStartTime);
            expect(result).toBe(true);
        });

        it("should correctly identify new message from current chat session", () => {
            const currentChatTimestamp = mockStartTime + 30000; // 30 seconds after chat start
            const activity: IActivity = {
                type: Constants.message,
                id: currentChatTimestamp.toString(),
                timestamp: new Date(currentChatTimestamp).toISOString(),
                from: { id: "user1", role: "user" },
                channelId: "webchat",
                text: "I need help with my order"
            };

            const result = isHistoryMessage(activity, mockStartTime);
            expect(result).toBe(false);
        });

        it("should handle system message with legacy tag", () => {
            const activity: IActivity = {
                type: Constants.message,
                id: (mockStartTime + 1000).toString(), // Newer than startTime
                timestamp: new Date().toISOString(),
                from: { id: "system", role: "system" },
                channelId: "webchat",
                text: "Chat session restored",
                channelData: {
                    tags: [Constants.historyMessageTag, "system"]
                }
            };

            // Should return true because of legacy tag, even though ID is newer
            const result = isHistoryMessage(activity, mockStartTime);
            expect(result).toBe(true);
        });

        it("should handle message with both legacy tag and old timestamp", () => {
            const oldTimestamp = mockStartTime - 5000;
            const activity: IActivity = {
                type: Constants.message,
                id: oldTimestamp.toString(),
                timestamp: new Date(oldTimestamp).toISOString(),
                from: { id: "agent1", role: "agent" },
                channelId: "webchat",
                text: "Previous conversation message",
                channelData: {
                    tags: [Constants.historyMessageTag]
                }
            };

            const result = isHistoryMessage(activity, mockStartTime);
            expect(result).toBe(true);
        });
    });

    describe("extractTimestampFromId logic (tested through isHistoryMessage)", () => {
        describe("Valid numeric activity ID", () => {
            it("should use activity ID when it's a valid epoch timestamp", () => {
                const epochTimestamp = mockStartTime - 1000;
                const activity: IActivity = {
                    type: Constants.message,
                    id: epochTimestamp.toString(),
                    timestamp: new Date(mockStartTime + 5000).toISOString(), // Different timestamp
                    from: { id: "user1" },
                    channelId: "test"
                };

                // Should use activity.id (epochTimestamp), not activity.timestamp
                const result = isHistoryMessage(activity, mockStartTime);
                expect(result).toBe(true); // epochTimestamp < mockStartTime
            });

            it("should use activity ID even when it's a small number", () => {
                const activity: IActivity = {
                    type: Constants.message,
                    id: "12345",
                    timestamp: new Date(mockStartTime + 1000).toISOString(), // Newer timestamp
                    from: { id: "user1" },
                    channelId: "test"
                };

                // Should use activity.id (12345), not activity.timestamp  
                const result = isHistoryMessage(activity, mockStartTime);
                expect(result).toBe(true); // 12345 < mockStartTime
            });
        });

        describe("Invalid activity ID - fallback to timestamp", () => {
            it("should fall back to timestamp when activity ID is non-numeric", () => {
                const pastTimestamp = new Date(mockStartTime - 5000); // 5 seconds before start
                const activity: IActivity = {
                    type: Constants.message,
                    id: "non-numeric-id",
                    timestamp: pastTimestamp.toISOString(),
                    from: { id: "user1" },
                    channelId: "test"
                };

                // Should use activity.timestamp converted to epoch
                const result = isHistoryMessage(activity, mockStartTime);
                expect(result).toBe(true); // pastTimestamp < mockStartTime
            });

            it("should fall back to timestamp when activity ID is UUID", () => {
                const futureTimestamp = new Date(mockStartTime + 5000); // 5 seconds after start
                const activity: IActivity = {
                    type: Constants.message,
                    id: "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx",
                    timestamp: futureTimestamp.toISOString(),
                    from: { id: "user1" },
                    channelId: "test"
                };

                // Should use activity.timestamp converted to epoch
                const result = isHistoryMessage(activity, mockStartTime);
                expect(result).toBe(false); // futureTimestamp > mockStartTime
            });

            it("should handle partial numeric parsing correctly", () => {
                const activity: IActivity = {
                    type: Constants.message,
                    id: "abc123def", // parseInt will return NaN (no leading digits)
                    timestamp: new Date(mockStartTime - 1000).toISOString(),
                    from: { id: "user1" },
                    channelId: "test"
                };

                // Should fall back to timestamp since parseInt("abc123def") = NaN
                const result = isHistoryMessage(activity, mockStartTime);
                expect(result).toBe(true); // timestamp < mockStartTime
            });
        });

        describe("Edge cases for timestamp fallback", () => {
            it("should return true when both ID and timestamp are invalid (fallback to 0)", () => {
                const activity: IActivity = {
                    type: Constants.message,
                    id: "invalid-id",
                    timestamp: "invalid-timestamp",
                    from: { id: "user1" },
                    channelId: "test"
                };

                // Both parseInt("invalid-id") and new Date("invalid-timestamp").getTime() return NaN
                // extractTimestampFromId should return 0, and 0 < mockStartTime = true
                const result = isHistoryMessage(activity, mockStartTime);
                expect(result).toBe(true); // fallback value 0 < mockStartTime
            });

            it("should handle missing timestamp gracefully", () => {
                const activity: IActivity = {
                    type: Constants.message,
                    id: "non-numeric",
                    // timestamp: undefined
                    from: { id: "user1" },
                    channelId: "test"
                };

                // Should fall back to timestamp, but timestamp is undefined
                // new Date(undefined).getTime() returns NaN, so fallback to 0
                const result = isHistoryMessage(activity, mockStartTime);
                expect(result).toBe(true); // fallback value 0 < mockStartTime
            });

            it("should handle malformed ISO timestamp", () => {
                const activity: IActivity = {
                    type: Constants.message,
                    id: "uuid-style-id",
                    timestamp: "2025-13-45T99:99:99.999Z", // Invalid date
                    from: { id: "user1" },
                    channelId: "test"
                };

                const result = isHistoryMessage(activity, mockStartTime);
                expect(result).toBe(true); // fallback value 0 < mockStartTime
            });
        });

        describe("Priority order validation", () => {
            it("should prioritize activity ID over timestamp when ID is numeric", () => {
                const oldIdTimestamp = mockStartTime - 5000;
                const newTimestamp = mockStartTime + 5000;
                
                const activity: IActivity = {
                    type: Constants.message,
                    id: oldIdTimestamp.toString(), // Old ID
                    timestamp: new Date(newTimestamp).toISOString(), // New timestamp
                    from: { id: "user1" },
                    channelId: "test"
                };

                // Should use activity.id (old), not activity.timestamp (new)
                const result = isHistoryMessage(activity, mockStartTime);
                expect(result).toBe(true); // Uses old ID, not new timestamp
            });

            it("should use timestamp only when activity ID is truly non-numeric", () => {
                const oldTimestamp = mockStartTime - 5000;
                
                const activity: IActivity = {
                    type: Constants.message,
                    id: "definitely-not-a-number",
                    timestamp: new Date(oldTimestamp).toISOString(),
                    from: { id: "user1" },
                    channelId: "test"
                };

                // Should fall back to timestamp
                const result = isHistoryMessage(activity, mockStartTime);
                expect(result).toBe(true); // Uses timestamp since ID is non-numeric
            });
        });
    });

    describe("Performance and type safety", () => {
        it("should handle large number of calls efficiently", () => {
            const activity: IActivity = {
                type: Constants.message,
                id: (mockStartTime - 1000).toString(),
                timestamp: new Date().toISOString(),
                from: { id: "user1" },
                channelId: "test"
            };

            // Call function many times to test performance
            const iterations = 1000;
            const startTime = performance.now();
            
            for (let i = 0; i < iterations; i++) {
                isHistoryMessage(activity, mockStartTime);
            }
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            // Should complete 1000 calls in reasonable time (less than 100ms)
            expect(duration).toBeLessThan(100);
        });

        it("should return boolean type consistently", () => {
            const testCases = [
                { type: Constants.message, id: "123" },
                { type: Constants.message, id: mockStartTime.toString() },
                { type: Constants.message, id: "invalid" },
                { type: "typing", id: "123" },
                { type: Constants.message, id: undefined }
            ];

            testCases.forEach((activityData, index) => {
                const activity: IActivity = {
                    ...activityData,
                    timestamp: new Date().toISOString(),
                    from: { id: "user1" },
                    channelId: "test"
                } as IActivity;

                const result = isHistoryMessage(activity, mockStartTime);
                expect(typeof result).toBe('boolean');
            });
        });
    });
});
