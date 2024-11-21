import { DemoChatSDK } from "../../webchatcontainerstateful/common/DemoChatSDK";
import { DesignerChatSDK } from "../../webchatcontainerstateful/common/DesignerChatSDK";
import { MockChatSDK } from "../../webchatcontainerstateful/common/mockchatsdk";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getMockChatSDKIfApplicable = (chatSDK: any, type?: string) => {    
    console.log("ELOPEZANAYA :: getMockChatSDKIfApplicable", type);
    if (type) {
        switch(type.toLowerCase()) {
            case "demo":
                console.log("ELOPEZANAYA :: Using DemoChatSDK");
                chatSDK = new DemoChatSDK();
                break;
            case "designer":
                console.log("ELOPEZANAYA :: Using DesignerChatSDK");
                chatSDK = new DesignerChatSDK();
                break;
            default:
                console.log("ELOPEZANAYA :: Using MockChatSDK");
                chatSDK = new MockChatSDK();
        }
    }

    return chatSDK;
};