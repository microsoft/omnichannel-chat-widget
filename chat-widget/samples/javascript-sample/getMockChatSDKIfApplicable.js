import { DesignerChatSDK } from "../../lib/esm/components/webchatcontainerstateful/common/DesignerChatSDK.js";
import { DemoChatSDK } from "../../lib/esm/components/webchatcontainerstateful/common/DemoChatSDK.js";
import { MockChatSDK } from "../../lib/esm/components/webchatcontainerstateful/common/mockchatsdk.js";

const getMockChatSDKIfApplicable = (chatSDK, customizationJson) => {
    if (customizationJson && customizationJson.mock && customizationJson.mock.type) {
        switch(customizationJson.mock.type.toLowerCase()) {
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

export default getMockChatSDKIfApplicable;