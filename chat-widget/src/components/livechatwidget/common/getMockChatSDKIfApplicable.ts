import { DemoChatSDK } from "../../webchatcontainerstateful/common/DemoChatSDK";
import { DesignerChatSDK } from "../../webchatcontainerstateful/common/DesignerChatSDK";
import { MockChatSDK } from "../../webchatcontainerstateful/common/mockchatsdk";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getMockChatSDKIfApplicable = (chatSDK: any, type?: string) => {    
    if (type) {
        switch(type.toLocaleLowerCase()) {
            case "demo":
                chatSDK = new DemoChatSDK();
                break;
            case "designer":
                chatSDK = new DesignerChatSDK();
                break;
            default:
                chatSDK = new MockChatSDK();
        }
    }

    return chatSDK;
};