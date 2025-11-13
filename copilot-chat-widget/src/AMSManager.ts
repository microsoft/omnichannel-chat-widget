import createAMSClient from "@microsoft/omnichannel-amsclient";
import FramedClient from "@microsoft/omnichannel-amsclient/lib/FramedClient";
import { OmnichannelChatToken } from "./types";
import FileMetadata from "@microsoft/omnichannel-amsclient/lib/FileMetadata";


export class AMSManager {
    private static AMSClient: FramedClient|undefined ;
    private static chatToken: OmnichannelChatToken;
    private static supportedImagesMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/heic", "image/webp"];


    public static async initialize(chatToken: OmnichannelChatToken) {
        AMSManager.chatToken = chatToken;
        const framedMode = true;
        if (!this.AMSClient) {
            this.AMSClient = await createAMSClient({
                    framedMode,
                    multiClient: true,
                    debug: true,
                    logger: {
                        logClientSdkTelemetryEvent: (logLevel, event) => {
                            console.log("AMSTelemetry: [",logLevel,"] event: ", event)
                        }
                    },
                    baseUrl: "https://oc-cdn-ppe2.azureedge.net/livechatwidget/v2scripts/ams"
                }) as FramedClient;
            await this.AMSClient?.initialize({ chatToken: AMSManager.chatToken});
        };
        //return this.AMSClient;
    }

    public static getAmsClient() {
        if (!AMSManager.AMSClient) console.error("initialize ams client first");
        return AMSManager.AMSClient;
    }

    public static async getBlobUrl(fileMetadata: FileMetadata) {
        if (!AMSManager.AMSClient || !AMSManager.chatToken) return undefined;
        const response = await AMSManager.AMSClient.getViewStatus(fileMetadata, AMSManager.chatToken, AMSManager.supportedImagesMimeTypes) as any;
        console.log("debugging: response received: ", response);
        const view = await AMSManager.AMSClient.getView(fileMetadata, response["view_location"], AMSManager.chatToken, AMSManager.supportedImagesMimeTypes) as any;
        console.log("debugging: view received: ", view);
        const blob = URL.createObjectURL(view);
        console.log("debugging: blob: ", blob);
        return blob;
    }
}
