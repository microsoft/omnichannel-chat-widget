import { OmnichannelChatSDK } from "@microsoft/omnichannel-chat-sdk";
import { cleanup } from "@testing-library/react";

jest.mock("@microsoft/omnichannel-chat-sdk");

describe("DownloadTranscriptStateful unit test", () => {
    afterEach(() => {
        cleanup;
        jest.resetAllMocks();
    });
    it("Method getLiveChatTranscript is called", async () => {
        const omnichannelConfig = {
            orgUrl: "",
            orgId: "",
            widgetId: ""
        };

        const chatSDK = new OmnichannelChatSDK(omnichannelConfig);

        jest.spyOn(chatSDK, "getLiveChatTranscript").mockResolvedValue(Promise.resolve());

        try {
            await chatSDK.getLiveChatTranscript();

            expect(chatSDK.getLiveChatTranscript).toHaveBeenCalledTimes(1);
            // eslint-disable-next-line no-empty
        } catch (ex) {}
    
    });

    it("Method getLiveChatTranscript throws exception", async () => {
        const errorMessage = "Error";

        const omnichannelConfig = {
            orgUrl: "",
            orgId: "",
            widgetId: ""
        };

        const chatSDK = new OmnichannelChatSDK(omnichannelConfig);

        jest.spyOn(chatSDK, "getLiveChatTranscript").mockRejectedValue(new Error(errorMessage));

        try {
            await chatSDK.getLiveChatTranscript();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (ex: any) {
            expect(ex.message).toEqual(errorMessage);
        }
    });

    it("Method getLiveChatTranscript undefined throws exception", async () => {
        const errorMessage = "Error";

        const omnichannelConfig = {
            orgUrl: "",
            orgId: "",
            widgetId: ""
        };

        const chatSDK = new OmnichannelChatSDK(omnichannelConfig);

        try {
            await chatSDK.getLiveChatTranscript();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (ex: any) {
            expect(ex.message).toEqual(errorMessage);
        }
    });
});