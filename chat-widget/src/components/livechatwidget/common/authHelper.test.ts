import { LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";
import { OmnichannelChatSDK } from "@microsoft/omnichannel-chat-sdk";
import type ChatConfig from "@microsoft/omnichannel-chat-sdk/lib/core/ChatConfig";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { WidgetLoadCustomErrorString } from "../../../common/Constants";
import { handleAuthentication } from "./authHelper";

jest.mock("../../../common/telemetry/TelemetryHelper", () => ({
    TelemetryHelper: { logActionEvent: jest.fn() }
}));

jest.mock("../../../common/utils", () => ({
    isNullOrEmptyString: (value: string | null | undefined) => value == null || value === ""
}));

const createChatSDK = () => new OmnichannelChatSDK({
    orgId: "unit-test-org",
    orgUrl: "https://unit-test-org.example",
    widgetId: "unit-test-widget"
});

const createChatConfig = (midAuthEnabled = false): ChatConfig => ({
    ChatWidgetLanguage: undefined,
    DataMaskingInfo: undefined,
    LiveChatConfigAuthSettings: {
        msdyn_javascriptclientfunction: "getCustomerAuthToken"
    },
    LiveChatVersion: 2,
    LiveWSAndLiveChatEngJoin: {
        msdyn_authenticatedsigninoptional: midAuthEnabled
    },
    allowedFileExtensions: "",
    maxUploadFileSize: ""
});

describe("handleAuthentication token renewal", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("preserves the single initial host-token request", async () => {
        const chatSDK = createChatSDK();
        const getAuthToken = jest.fn().mockResolvedValue("initial-host-token");

        const result = await handleAuthentication(chatSDK, createChatConfig(), getAuthToken);

        expect(result).toEqual({ result: true, token: "initial-host-token" });
        expect(getAuthToken).toHaveBeenCalledTimes(1);
        expect(getAuthToken).toHaveBeenCalledWith("getCustomerAuthToken");
        expect(chatSDK.chatSDKConfig.getAuthToken).toBeDefined();
    });

    it("requests a fresh host token on every subsequent SDK callback", async () => {
        const chatSDK = createChatSDK();
        const getAuthToken = jest.fn()
            .mockResolvedValueOnce("initial-host-token")
            .mockResolvedValueOnce("replacement-host-token")
            .mockResolvedValueOnce("next-host-token");

        await handleAuthentication(chatSDK, createChatConfig(), getAuthToken);

        await expect(chatSDK.chatSDKConfig.getAuthToken?.()).resolves.toBe("replacement-host-token");
        await expect(chatSDK.chatSDKConfig.getAuthToken?.()).resolves.toBe("next-host-token");
        expect(getAuthToken).toHaveBeenCalledTimes(3);
    });

    it("preserves mid-auth callback options during renewal", async () => {
        const chatSDK = createChatSDK();
        const getAuthToken = jest.fn()
            .mockResolvedValueOnce("initial-host-token")
            .mockResolvedValueOnce("replacement-host-token");

        await handleAuthentication(chatSDK, createChatConfig(true), getAuthToken);
        await expect(chatSDK.chatSDKConfig.getAuthToken?.()).resolves.toBe("replacement-host-token");

        expect(getAuthToken).toHaveBeenCalledTimes(2);
        expect(getAuthToken).toHaveBeenNthCalledWith(1, "getCustomerAuthToken", { isMidAuthEnabled: true });
        expect(getAuthToken).toHaveBeenNthCalledWith(2, "getCustomerAuthToken", { isMidAuthEnabled: true });
    });

    it.each([null, ""])("preserves the initial unsigned-in mid-auth result for %p", async (token) => {
        const chatSDK = createChatSDK();
        const getAuthToken = jest.fn().mockResolvedValue(token);

        await expect(handleAuthentication(chatSDK, createChatConfig(true), getAuthToken))
            .resolves.toEqual({ result: true, token: null });
        expect(getAuthToken).toHaveBeenCalledTimes(1);
        expect(chatSDK.chatSDKConfig.getAuthToken).toBeUndefined();
    });

    it.each([null, ""])("rejects initial authenticated setup with an empty token: %p", async (token) => {
        const chatSDK = createChatSDK();
        const getAuthToken = jest.fn().mockResolvedValue(token);

        await expect(handleAuthentication(chatSDK, createChatConfig(), getAuthToken))
            .rejects.toThrow(WidgetLoadCustomErrorString.AuthenticationFailedErrorString);
        expect(chatSDK.chatSDKConfig.getAuthToken).toBeUndefined();
    });

    it.each([false, true])("rejects an empty renewal without reusing the old token, mid-auth=%p", async (midAuthEnabled) => {
        const chatSDK = createChatSDK();
        const getAuthToken = jest.fn()
            .mockResolvedValueOnce("initial-host-token")
            .mockResolvedValueOnce(null);

        await handleAuthentication(chatSDK, createChatConfig(midAuthEnabled), getAuthToken);

        await expect(chatSDK.chatSDKConfig.getAuthToken?.())
            .rejects.toThrow(WidgetLoadCustomErrorString.AuthenticationFailedErrorString);
        expect(TelemetryHelper.logActionEvent).toHaveBeenCalledWith(
            LogLevel.ERROR, { Event: TelemetryEvent.ReceivedNullOrEmptyToken });
    });

    it("propagates host renewal failures instead of returning the captured token", async () => {
        const chatSDK = createChatSDK();
        const failure = new Error("Host authentication unavailable");
        const getAuthToken = jest.fn()
            .mockResolvedValueOnce("initial-host-token")
            .mockRejectedValueOnce(failure);

        await handleAuthentication(chatSDK, createChatConfig(), getAuthToken);

        await expect(chatSDK.chatSDKConfig.getAuthToken?.()).rejects.toBe(failure);
        expect(getAuthToken).toHaveBeenCalledTimes(2);
    });

    it("allows a later callback to obtain a token after a failed renewal", async () => {
        const chatSDK = createChatSDK();
        const getAuthToken = jest.fn()
            .mockResolvedValueOnce("initial-host-token")
            .mockResolvedValueOnce("")
            .mockResolvedValueOnce("recovered-host-token");

        await handleAuthentication(chatSDK, createChatConfig(), getAuthToken);

        await expect(chatSDK.chatSDKConfig.getAuthToken?.())
            .rejects.toThrow(WidgetLoadCustomErrorString.AuthenticationFailedErrorString);
        await expect(chatSDK.chatSDKConfig.getAuthToken?.()).resolves.toBe("recovered-host-token");
    });

    it("retains a caller-supplied SDK authentication provider", async () => {
        const chatSDK = createChatSDK();
        const provider = jest.fn().mockResolvedValue("caller-host-token");
        chatSDK.chatSDKConfig.getAuthToken = provider;

        await expect(handleAuthentication(chatSDK, undefined, undefined))
            .resolves.toEqual({ result: true, token: "caller-host-token" });
        expect(chatSDK.chatSDKConfig.getAuthToken).toBe(provider);
        expect(provider).toHaveBeenCalledTimes(1);
    });

    it("keeps credential providers isolated between widget SDK instances", async () => {
        const firstSDK = createChatSDK();
        const secondSDK = createChatSDK();
        const firstProvider = jest.fn()
            .mockResolvedValueOnce("first-initial-token")
            .mockResolvedValueOnce("first-renewed-token");
        const secondProvider = jest.fn()
            .mockResolvedValueOnce("second-initial-token")
            .mockResolvedValueOnce("second-renewed-token");

        await Promise.all([
            handleAuthentication(firstSDK, createChatConfig(), firstProvider),
            handleAuthentication(secondSDK, createChatConfig(), secondProvider)
        ]);

        await expect(firstSDK.chatSDKConfig.getAuthToken?.()).resolves.toBe("first-renewed-token");
        await expect(secondSDK.chatSDKConfig.getAuthToken?.()).resolves.toBe("second-renewed-token");
    });
});
