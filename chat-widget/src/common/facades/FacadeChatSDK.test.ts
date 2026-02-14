import { FacadeChatSDK } from "./FacadeChatSDK";
import { IFacadeChatSDKInput } from "./types/IFacadeChatSDKInput";
import { OmnichannelChatSDK } from "@microsoft/omnichannel-chat-sdk";
import { handleAuthentication, isMidAuthEnabled } from "../../components/livechatwidget/common/authHelper";

// mock BroadcastService
jest.mock("@microsoft/omnichannel-chat-components", () =>({
    BroadcastService: {
        postMessage: jest.fn()
    }}));

jest.mock("../../components/livechatwidget/common/authHelper", () => ({
    ...jest.requireActual("../../components/livechatwidget/common/authHelper"),
    handleAuthentication: jest.fn(),
    getAuthClientFunction: jest.fn()
}));
// function to mimic a jwt token with exp time from now to 5 min in the future in seconds
function getJWTToken() {
    const now = Math.floor(Date.now() / 1000);
    const expiration = now + 300; // 5 minutes in the future (300 seconds)
    const tokenPayload = {
        sub: "user_id+2",
        name: "hey@hey.com",
        data: "http://example.com/?id=123-45\\456&name=John+Doe&age=30",
        special: "+/=?\\",
        html: "<div><h1>Hello, World!</h1><p>This is a <strong>test</strong> HTML snippet.</p></div>",
        lwicontexts: "{\"BingConsent\":{\"value\":\"true\",\"isDisplayable\":true},\"HostingApp\":{\"value\":\"M365AdminPortal\",\"isDisplayable\":true},\"ClientContext0\":{\"value\":\"{\\\"profile\\\":{\\\"billing\\\":{\\\"list\\\":{\\\"Subscriptions\\\":[{\\\"NextSubscriptionState\\\":\\\"InGracePeriod\\\",\\\"Channel\\\":\\\"Direct\\\",\\\"IsLifecycleExpired\\\":false,\\\"TotalLicenseQuantity\\\":1,\\\"IsInGracePeriod\\\":false,\\\"Name\\\":null,\\\"SubscriptionEndDate\\\":\\\"2025-08-08T00:00:00Z\\\",\\\"SubscriptionStartDate\\\":\\\"2023-08-08T00:00:00Z\\\",\\\"SubscriptionState\\\":1,\"isDisplayable\":true}}",
        exp: expiration
    };
    const tokenPayloadBase64 = Buffer.from(JSON.stringify(tokenPayload)).toString("base64");
    return {
        token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${tokenPayloadBase64}.signature`,
        expiration: expiration
    };
}

function getJWTTokenBase64Url() {
    const now = Math.floor(Date.now() / 1000);
    const expiration = now + 300; // 5 minutes in the future (300 seconds)
    const tokenPayload = {
        sub: "user_id+2",
        name: "hey@hey.com",
        data: "http://example.com/?id=123-45\\456&name=John+Doe&age=30",
        special: "+/=?\\",
        html: "<div><h1>Hello, World!</h1><p>This is a <strong>test</strong> HTML snippet.</p></div>",
        lwicontexts: "{\"BingConsent\":{\"value\":\"true\",\"isDisplayable\":true},\"HostingApp\":{\"value\":\"M365AdminPortal\",\"isDisplayable\":true},\"ClientContext0\":{\"value\":\"{\\\"profile\\\":{\\\"billing\\\":{\\\"list\\\":{\\\"Subscriptions\\\":[{\\\"NextSubscriptionState\\\":\\\"InGracePeriod\\\",\\\"Channel\\\":\\\"Direct\\\",\\\"IsLifecycleExpired\\\":false,\\\"TotalLicenseQuantity\\\":1,\\\"IsInGracePeriod\\\":false,\\\"Name\\\":null,\\\"SubscriptionEndDate\\\":\\\"2025-08-08T00:00:00Z\\\",\\\"SubscriptionStartDate\\\":\\\"2023-08-08T00:00:00Z\\\",\\\"SubscriptionState\\\":1,\"isDisplayable\":true}}",
        exp: expiration
    };

    // Convert payload to JSON string and then to Base64URL
    const tokenPayloadBase64 = Buffer.from(JSON.stringify(tokenPayload)).toString("base64");
    const base64url = tokenPayloadBase64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    return {
        token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${base64url}.signature`,
        expiration: expiration
    };
}

describe("FacadeChatSDK", () => {
    let facadeChatSDK: FacadeChatSDK;

    beforeEach(() => {
        const input: IFacadeChatSDKInput = {
            chatSDK: new OmnichannelChatSDK({
                orgId: "your-org-id",
                orgUrl: "https://your-org-url",
                widgetId: "your-widget-id"
            }),
            chatConfig: {
                ChatWidgetLanguage: undefined,
                DataMaskingInfo: undefined,
                LiveChatConfigAuthSettings: undefined,
                LiveChatVersion: 0,
                LiveWSAndLiveChatEngJoin: undefined,
                allowedFileExtensions: "",
                maxUploadFileSize: ""
            },
            getAuthToken: jest.fn(),
            isAuthenticated: true,
            isSDKMocked: false
        };
        facadeChatSDK = new FacadeChatSDK(input, false);
    });

    describe("convertExpiration", () => {
        it("should convert milliseconds to seconds", () => {
            const expiration = 1609459200000; // 2021-01-01T00:00:00.000Z in milliseconds
            const result = facadeChatSDK["convertExpiration"](expiration);
            expect(result).toBe(1609459200); // 2021-01-01T00:00:00Z in seconds
        });

        it("should return seconds as is", () => {
            const expiration = 1609459200; // 2021-01-01T00:00:00Z in seconds
            const result = facadeChatSDK["convertExpiration"](expiration);
            expect(result).toBe(1609459200);
        });

        it("should return 0 if expiration is undefined", () => {
            const result = facadeChatSDK["convertExpiration"](undefined);
            expect(result).toBe(0);
        });
    });

    describe("isTokenExpired", () => {
        it("should return false if expiration is 0", () => {
            facadeChatSDK["expiration"] = 0;
            const result = facadeChatSDK["isTokenExpired"]();
            expect(result).toBe(false);
        });

        it("should return true if current time is greater than expiration", () => {
            const now = Math.floor(Date.now() / 1000);
            facadeChatSDK["expiration"] = now - 10; // expired 10 seconds ago
            const result = facadeChatSDK["isTokenExpired"]();
            expect(result).toBe(true);
        });

        it("should return false if current time is less than expiration", () => {
            const now = Math.floor(Date.now() / 1000);
            facadeChatSDK["expiration"] = now + 10; // expires in 10 seconds
            const result = facadeChatSDK["isTokenExpired"]();
            expect(result).toBe(false);
        });
    });

    describe("setToken", () => {
        it("should set token and expiration correctly", async () => {
            const jwt = getJWTToken();
            await facadeChatSDK["setToken"](jwt.token);
            expect(facadeChatSDK["token"]).toBe(jwt.token);
            expect(facadeChatSDK["expiration"]).toBe(jwt.expiration);
        });

        it("Base64url JWT should be valid", async () => {
            const jwt = getJWTTokenBase64Url();
            await facadeChatSDK["setToken"](jwt.token);
            expect(facadeChatSDK["token"]).toBe(jwt.token);
            expect(facadeChatSDK["expiration"]).toBe(jwt.expiration);
           
        });

        it("should throw error for invalid token format", async () => {
            const token = "any-thing";
            await expect(facadeChatSDK["setToken"](token)).rejects.toThrow("Authentication Setup Error: Invalid token format, must be in JWT format");
        });

        it("should throw error for expired token", async () => {
            const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDk0NTkyMDB9.4f1d4f1d4f1d4f1d4f1d4f1d4f1d4f1d4f1d4f1d4f1d4f1d4f1d4f1d4f1d";
            jest.spyOn(Date, "now").mockReturnValue(1609459201000); // mock current time to be after token expiration
            await expect(facadeChatSDK["setToken"](token)).rejects.toThrow("Authentication Setup Error: New authentication token is already expired");
        });

    });

    describe("tokenRing", () => {
        it("should return true if sdkMocked is true", async () => {
            facadeChatSDK["sdkMocked"] = true;
            const result = await facadeChatSDK["tokenRing"]();
            expect(result).toEqual({ result: true, message: "Authentication not needed" });
        });

        it("should return true if isAuthenticated is false", async () => {
            facadeChatSDK["isAuthenticated"] = false;
            const result = await facadeChatSDK["tokenRing"]();
            expect(result).toEqual({ result: true, message: "Authentication not needed" });
        });

        it("should return true if token is valid", async () => {
            facadeChatSDK["token"] = "valid.token";
            facadeChatSDK["expiration"] = Math.floor(Date.now() / 1000) + 1000; // valid token
            const result = await facadeChatSDK["tokenRing"]();
            expect(result).toEqual({ result: true, message: "Token is valid" });
        });

        it("should return true if Facade is disabled", async () => {

            const input: IFacadeChatSDKInput = {
                chatSDK: new OmnichannelChatSDK({
                    orgId: "your-org-id",
                    orgUrl: "https://your-org-url",
                    widgetId: "your-widget-id"
                }),
                chatConfig: {
                    ChatWidgetLanguage: undefined,
                    DataMaskingInfo: undefined,
                    LiveChatConfigAuthSettings: undefined,
                    LiveChatVersion: 0,
                    LiveWSAndLiveChatEngJoin: undefined,
                    allowedFileExtensions: "",
                    maxUploadFileSize: ""
                },
                getAuthToken: jest.fn(),
                isAuthenticated: true,
                isSDKMocked: false
            };
            facadeChatSDK = new FacadeChatSDK(input, true);

            const result = await facadeChatSDK["tokenRing"]();
            expect(result).toEqual({ result: true, message: "Facade is disabled" });
        });


        it("should return false if getAuthToken is undefined", async () => {
            facadeChatSDK["getAuthToken"] = undefined;
            const result = await facadeChatSDK["tokenRing"]();
            expect(result).toEqual({ result: false, message: "GetAuthToken function is not present" });
        });

        it("should set new token if obtained successfully", async () => {
            const newToken = getJWTToken();
            (handleAuthentication as jest.Mock).mockResolvedValue({ result: true, token: newToken.token });
            const result = await facadeChatSDK["tokenRing"]();
            expect(result).toEqual({ result: true, message: "New Token obtained" });
            expect(facadeChatSDK["token"]).toBe(newToken.token);
        });

    });

    describe("validateAndExecuteCall", () => {
        it("should execute function if token is valid", async () => {
            jest.spyOn(facadeChatSDK, "tokenRing").mockResolvedValue({ result: true, message: "Token is valid" });
            const mockFn = jest.fn().mockResolvedValue("success");
            const result = await facadeChatSDK["validateAndExecuteCall"]("testFunction", mockFn);
            expect(result).toBe("success");
        });

        it("should throw error if token is invalid", async () => {
            jest.spyOn(facadeChatSDK, "tokenRing").mockResolvedValue({ result: false, message: "Token is invalid" });
            const mockFn = jest.fn();
            await expect(facadeChatSDK["validateAndExecuteCall"]("testFunction", mockFn)).rejects.toThrow("Authentication Setup Error: Token validation failed - GetAuthToken function is not present");
        });
    });

    describe("isMidAuthEnabled", () => {
        it("should return true when msdyn_authenticatedsigninoptional is 'true'", () => {
            const config = {
                LiveWSAndLiveChatEngJoin: {
                    msdyn_authenticatedsigninoptional: "true"
                }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any;
            expect(isMidAuthEnabled(config)).toBe(true);
        });

        it("should return true when msdyn_authenticatedsigninoptional is 'True' (case insensitive)", () => {
            const config = {
                LiveWSAndLiveChatEngJoin: {
                    msdyn_authenticatedsigninoptional: "True"
                }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any;
            expect(isMidAuthEnabled(config)).toBe(true);
        });

        it("should return false when msdyn_authenticatedsigninoptional is 'false'", () => {
            const config = {
                LiveWSAndLiveChatEngJoin: {
                    msdyn_authenticatedsigninoptional: "false"
                }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any;
            expect(isMidAuthEnabled(config)).toBe(false);
        });

        it("should return false when msdyn_authenticatedsigninoptional is undefined", () => {
            const config = {
                LiveWSAndLiveChatEngJoin: {}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any;
            expect(isMidAuthEnabled(config)).toBe(false);
        });

        it("should return false when LiveWSAndLiveChatEngJoin is undefined", () => {
            const config = {// eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any;
            expect(isMidAuthEnabled(config)).toBe(false);
        });
    });

    describe("setMidAuthUnauthenticatedState", () => {
        it("should clear authentication state for mid-auth unauthenticated flow", () => {
            // Set up initial authenticated state
            facadeChatSDK["token"] = "some-token";
            facadeChatSDK["expiration"] = 12345;
            facadeChatSDK["isAuthenticated"] = true;
            
            const mockChatSDK = facadeChatSDK["chatSDK"] as unknown;
            mockChatSDK.authenticatedUserToken = "some-token";
            mockChatSDK.chatToken = { chatId: "test-chat-id" };
            mockChatSDK.reconnectId = "reconnect-123";

            facadeChatSDK["setMidAuthUnauthenticatedState"]();

            expect(facadeChatSDK["token"]).toBe("");
            expect(facadeChatSDK["expiration"]).toBe(0);
            expect(facadeChatSDK["isAuthenticated"]).toBe(false);
            expect(mockChatSDK.authenticatedUserToken).toBeNull();
            expect(mockChatSDK.chatToken).toEqual({});
            expect(mockChatSDK.reconnectId).toBeNull();
        });

        it("should clear SDK internal state for fresh unauthenticated chat", () => {
            const mockChatSDK = facadeChatSDK["chatSDK"] as unknown;
            mockChatSDK.requestId = "some-request-id";
            mockChatSDK.sessionId = "some-session-id";
            mockChatSDK.chatToken = { chatId: "test-chat-id" };

            facadeChatSDK["setMidAuthUnauthenticatedState"]();

            expect(mockChatSDK.requestId).toBeNull();
            expect(mockChatSDK.sessionId).toBeNull();
            expect(mockChatSDK.conversation).toBeNull();
            expect(mockChatSDK.chatToken).toEqual({});
        });
    });

    describe("startChat", () => {
        let mockStartChat: jest.Mock;

        beforeEach(() => {
            // Enable mid-auth for these tests since FacadeChatSDK.startChat only
            // mutates deferInitialAuth/authenticatedUserToken when mid-auth is enabled.
            facadeChatSDK["chatConfig"] = {
                LiveWSAndLiveChatEngJoin: {
                    msdyn_authenticatedsigninoptional: "true"
                }
            } as unknown;

            mockStartChat = jest.fn().mockResolvedValue(undefined);
            facadeChatSDK["chatSDK"].startChat = mockStartChat;
            jest.spyOn(facadeChatSDK, "tokenRing").mockResolvedValue({ result: true, message: "Token is valid" });
        });

        it("should call SDK startChat with optionalParams", async () => {
            facadeChatSDK["isAuthenticated"] = false;
            
            await facadeChatSDK.startChat({ isProactiveChat: true });

            expect(mockStartChat).toHaveBeenCalled();
        });

        it("should set deferInitialAuth=true when pendingMidAuthUnauthenticatedState is true", async () => {
            facadeChatSDK["pendingMidAuthUnauthenticatedState"] = true;
            jest.spyOn(facadeChatSDK as unknown, "setMidAuthUnauthenticatedState").mockImplementation(() => {
                facadeChatSDK["isAuthenticated"] = false;
            });

            await facadeChatSDK.startChat({});

            expect(mockStartChat).toHaveBeenCalled();
            // deferInitialAuth is set directly on the SDK object by configureMidAuthState, not on optionalParams
            expect((facadeChatSDK["chatSDK"] as unknown).deferInitialAuth).toBe(true);
        });

        it("should clear liveChatContext when pendingMidAuthUnauthenticatedState is true and wasAuthenticated", async () => {
            facadeChatSDK["pendingMidAuthUnauthenticatedState"] = true;
            jest.spyOn(facadeChatSDK as unknown, "setMidAuthUnauthenticatedState").mockImplementation(() => {
                facadeChatSDK["isAuthenticated"] = false;
            });

            // wasAuthenticated: true triggers Auth→Unauth transition which clears reconnect params
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const optionalParams = { liveChatContext: { chatToken: {}, requestId: "123" }, wasAuthenticated: true } as any;
            await facadeChatSDK.startChat(optionalParams);

            expect(mockStartChat).toHaveBeenCalled();
            const callArgs = mockStartChat.mock.calls[0][0];
            expect(callArgs.liveChatContext).toBeUndefined();
        });

        it("should keep pendingMidAuthUnauthenticatedState true after startChat (not reset until token obtained in tokenRing)", async () => {
            facadeChatSDK["pendingMidAuthUnauthenticatedState"] = true;
            facadeChatSDK["isAuthenticated"] = false;

            await facadeChatSDK.startChat({});

            // pendingMidAuthUnauthenticatedState stays true so CASE 1 re-triggers on every startChat
            // It is only cleared in tokenRing when a valid token is obtained
            expect(facadeChatSDK["pendingMidAuthUnauthenticatedState"]).toBe(true);
        });

        it("should set authenticatedUserToken on SDK when authenticated with valid token", async () => {
            const jwt = getJWTToken();
            facadeChatSDK["isAuthenticated"] = true;
            facadeChatSDK["token"] = jwt.token;
            facadeChatSDK["expiration"] = jwt.expiration;

            await facadeChatSDK.startChat({});

            const chatSDK = facadeChatSDK["chatSDK"] as unknown;
            expect(chatSDK.authenticatedUserToken).toBe(jwt.token);
        });

        it("should set deferInitialAuth=false when authenticated with valid token", async () => {
            const jwt = getJWTToken();
            facadeChatSDK["isAuthenticated"] = true;
            facadeChatSDK["token"] = jwt.token;
            facadeChatSDK["expiration"] = jwt.expiration;

            await facadeChatSDK.startChat({});

            // deferInitialAuth is set directly on the SDK object by handleAuthenticatedState
            expect((facadeChatSDK["chatSDK"] as unknown).deferInitialAuth).toBe(false);
        });

        it("should not modify optionalParams when not authenticated", async () => {
            facadeChatSDK["isAuthenticated"] = false;
            facadeChatSDK["pendingMidAuthUnauthenticatedState"] = false;

            const optionalParams = { isProactiveChat: true };
            await facadeChatSDK.startChat(optionalParams);

            expect(mockStartChat).toHaveBeenCalledWith(optionalParams);
        });
    });

    describe("tokenRing with mid-auth", () => {
        it("should set pendingMidAuthUnauthenticatedState when mid-auth enabled and no token returned", async () => {
            facadeChatSDK["chatConfig"] = {
                LiveWSAndLiveChatEngJoin: {
                    msdyn_authenticatedsigninoptional: "true"
                }
            } as unknown;
            facadeChatSDK["token"] = "";
            facadeChatSDK["expiration"] = 0;
            
            (handleAuthentication as jest.Mock).mockResolvedValue({ result: true, token: "" });

            const result = await facadeChatSDK["tokenRing"]();

            expect(result).toEqual({ result: true, message: "Mid-auth: proceeding as unauthenticated" });
            expect(facadeChatSDK["pendingMidAuthUnauthenticatedState"]).toBe(true);
        });

        it("should not set pendingMidAuthUnauthenticatedState when mid-auth disabled and no token returned", async () => {
            facadeChatSDK["chatConfig"] = {
                LiveWSAndLiveChatEngJoin: {
                    msdyn_authenticatedsigninoptional: "false"
                }
            } as unknown;
            facadeChatSDK["token"] = "";
            facadeChatSDK["expiration"] = 0;
            
            (handleAuthentication as jest.Mock).mockResolvedValue({ result: false, token: "", error: { message: "Auth failed" } });

            const result = await facadeChatSDK["tokenRing"]();

            expect(result.result).toBe(false);
            expect(facadeChatSDK["pendingMidAuthUnauthenticatedState"]).toBe(false);
        });

        it("should keep pendingMidAuthUnauthenticatedState when sdk is mocked (returns early)", async () => {
            facadeChatSDK["pendingMidAuthUnauthenticatedState"] = true;
            facadeChatSDK["sdkMocked"] = true; // Will return early without resetting

            await facadeChatSDK["tokenRing"]();

            // When SDK is mocked, tokenRing returns early and does not reset the flag
            expect(facadeChatSDK["pendingMidAuthUnauthenticatedState"]).toBe(true);
        });
    });

    describe("Mid-auth end-to-end scenarios", () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it("should handle token refresh scenario", async () => {
            // Setup: Authenticated user with expiring token
            const oldJwt = getJWTToken();
            facadeChatSDK["token"] = oldJwt.token;
            facadeChatSDK["expiration"] = Math.floor(Date.now() / 1000) - 10; // Expired
            facadeChatSDK["isAuthenticated"] = true;

            // New token from handleAuthentication
            const newJwt = getJWTToken();
            (handleAuthentication as jest.Mock).mockResolvedValue({ result: true, token: newJwt.token });

            // tokenRing should get new token
            const result = await facadeChatSDK["tokenRing"]();

            expect(result.result).toBe(true);
            expect(facadeChatSDK["token"]).toBe(newJwt.token);
        });

        it("should handle reconnect scenario with hasUserAuthenticated", async () => {
            // Setup: Simulating reconnect - user was authenticated before
            const jwt = getJWTToken();
            facadeChatSDK["isAuthenticated"] = true;
            facadeChatSDK["token"] = jwt.token;
            facadeChatSDK["expiration"] = jwt.expiration;
            
            const mockStartChat = jest.fn().mockResolvedValue(undefined);
            facadeChatSDK["chatSDK"].startChat = mockStartChat;
            jest.spyOn(facadeChatSDK, "tokenRing").mockResolvedValue({ result: true, message: "Token is valid" });

            // Reconnect with liveChatContext
            const liveChatContext = { chatToken: { chatId: "reconnect-chat-id" }, requestId: "reconnect-request" };
            await facadeChatSDK.startChat({ liveChatContext } as unknown);

            expect(mockStartChat).toHaveBeenCalled();
            const callArgs = mockStartChat.mock.calls[0][0];
            // Should pass liveChatContext for reconnect
            expect(callArgs.liveChatContext).toEqual(liveChatContext);
            // deferInitialAuth should be false for authenticated reconnect (set on SDK object)
            expect((facadeChatSDK["chatSDK"] as unknown).deferInitialAuth ?? false).toBe(false);
        });
    });

    describe("Error handling and edge cases", () => {
        it("should preserve authentication state after failed startChat", async () => {
            const jwt = getJWTToken();
            facadeChatSDK["isAuthenticated"] = true;
            facadeChatSDK["token"] = jwt.token;
            facadeChatSDK["expiration"] = jwt.expiration;

            const mockStartChat = jest.fn().mockRejectedValue(new Error("Network error"));
            facadeChatSDK["chatSDK"].startChat = mockStartChat;
            jest.spyOn(facadeChatSDK, "tokenRing").mockResolvedValue({ result: true, message: "Token is valid" });

            await expect(facadeChatSDK.startChat({})).rejects.toThrow("Network error");

            // Authentication state should be preserved
            expect(facadeChatSDK["isAuthenticated"]).toBe(true);
            expect(facadeChatSDK["token"]).toBe(jwt.token);
        });

        it("should handle destroy and cleanup authentication state", () => {
            const jwt = getJWTToken();
            facadeChatSDK["token"] = jwt.token;
            facadeChatSDK["expiration"] = jwt.expiration;

            facadeChatSDK.destroy();

            expect(facadeChatSDK["token"]).toBeNull();
            expect(facadeChatSDK["expiration"]).toBe(0);
        });

        it("should handle isTokenSet correctly", () => {
            expect(facadeChatSDK.isTokenSet()).toBe(false);

            facadeChatSDK["token"] = "some-token";
            expect(facadeChatSDK.isTokenSet()).toBe(true);

            facadeChatSDK["token"] = "";
            expect(facadeChatSDK.isTokenSet()).toBe(false);

            facadeChatSDK["token"] = null;
            expect(facadeChatSDK.isTokenSet()).toBe(false);
        });
    });
    
});