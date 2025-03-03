import { FacadeChatSDK } from "./FacadeChatSDK";
import { IFacadeChatSDKInput } from "./types/IFacadeChatSDKInput";
import { IFeatureConfigProps } from "../../components/livechatwidget/interfaces/IFeatureConfigProps";
import { OmnichannelChatSDK } from "@microsoft/omnichannel-chat-sdk";
import { handleAuthentication } from "../../components/livechatwidget/common/authHelper";

// mock BroadcastService
jest.mock("@microsoft/omnichannel-chat-components", ()=>
    ({
        BroadcastService: {
            postMessage: jest.fn()
        }
    })
);

jest.mock("../../components/livechatwidget/common/authHelper");
// function to mimic a jwt token with exp time from now to 5 min in the future in seconds
function getJWTToken() {
    const now = Math.floor(Date.now() / 1000);
    const expiration = now + 300; // 5 minutes in the future (300 seconds)
    const tokenPayload = {
        exp: expiration
    };
    const tokenPayloadBase64 = Buffer.from(JSON.stringify(tokenPayload)).toString("base64");
    return {
        token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${tokenPayloadBase64}.signature`,
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

        it("should throw error for invalid token format", async () => {
            const token = "any-thing";
            await expect(facadeChatSDK["setToken"](token)).rejects.toThrow("Invalid token format, must be in JWT format");
        });

        it("should throw error for expired token", async () => {
            const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDk0NTkyMDB9.4f1d4f1d4f1d4f1d4f1d4f1d4f1d4f1d4f1d4f1d4f1d4f1d4f1d4f1d4f1d";
            jest.spyOn(Date, "now").mockReturnValue(1609459201000); // mock current time to be after token expiration
            await expect(facadeChatSDK["setToken"](token)).rejects.toThrow("New token is already expired, with epoch time 1609459200");
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
            await expect(facadeChatSDK["validateAndExecuteCall"]("testFunction", mockFn)).rejects.toThrow("Authentication failed: Process to get a token failed for testFunction, Token is invalid");
        });
    });
});
