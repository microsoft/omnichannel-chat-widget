import { OmnichannelChatSDK } from "@microsoft/omnichannel-chat-sdk";
import ChatTranscriptBody from "@microsoft/omnichannel-chat-sdk/lib/core/ChatTranscriptBody";
import { cleanup } from "@testing-library/react";

jest.mock("@microsoft/omnichannel-chat-sdk");

describe("EmailTranscriptPaneStateful unit test", () => {
    afterEach(() => {
        cleanup;
        jest.resetAllMocks();
    });
    it("Method emailLiveChatTranscript is called", async () => {
        const omnichannelConfig = {
            orgUrl: "",
            orgId: "",
            widgetId: ""
        };

        const chatSDK = new OmnichannelChatSDK(omnichannelConfig);

        jest.spyOn(chatSDK, "emailLiveChatTranscript").mockResolvedValue(Promise.resolve());

        const chatTranscriptBody: ChatTranscriptBody = {
            emailAddress: "sample@microsoft.com",
            attachmentMessage: "sample",
            locale: "sample"
        };

        try {
            await chatSDK.emailLiveChatTranscript(chatTranscriptBody);

            expect(chatSDK.emailLiveChatTranscript).toHaveBeenCalledTimes(1);
            // eslint-disable-next-line no-empty
        } catch (ex) {}
    
    });

    it("Method emailLiveChatTranscript throws exception", async () => {
        const errorMessage = "Error";

        const omnichannelConfig = {
            orgUrl: "",
            orgId: "",
            widgetId: ""
        };

        const chatSDK = new OmnichannelChatSDK(omnichannelConfig);

        jest.spyOn(chatSDK, "emailLiveChatTranscript").mockRejectedValue(new Error(errorMessage));

        const chatTranscriptBody: ChatTranscriptBody = {
            emailAddress: "sample@microsoft.com",
            attachmentMessage: "sample",
            locale: "sample"
        };

        try {
            await chatSDK.emailLiveChatTranscript(chatTranscriptBody);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (ex: any) {
            expect(ex.message).toEqual(errorMessage);
        }
    });

    it("Method emailLiveChatTranscript undefined throws exception", async () => {
        const errorMessage = "Error";

        const omnichannelConfig = {
            orgUrl: "",
            orgId: "",
            widgetId: ""
        };

        const chatSDK = new OmnichannelChatSDK(omnichannelConfig);

        const chatTranscriptBody: ChatTranscriptBody = {
            emailAddress: "sample@microsoft.com",
            attachmentMessage: "sample",
            locale: "sample"
        };

        try {
            await chatSDK.emailLiveChatTranscript(chatTranscriptBody);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (ex: any) {
            expect(ex.message).toEqual(errorMessage);
        }
    });
});