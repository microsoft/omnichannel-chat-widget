import { DemoChatSDK } from "../../webchatcontainerstateful/common/DemoChatSDK";
import { DesignerChatSDK } from "../../webchatcontainerstateful/common/DesignerChatSDK";
import { IMockProps } from "../interfaces/IMockProps";
import { MockChatSDK } from "../../webchatcontainerstateful/common/mockchatsdk";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getMockChatSDKIfApplicable = (chatSDK: any, mockProps?: IMockProps) => {
    if (mockProps?.type) {
        switch(mockProps.type.toLowerCase()) {
            case "demo":
                chatSDK = new DemoChatSDK();
                break;
            case "designer":
                chatSDK = new DesignerChatSDK();
                chatSDK.mockMessages = mockProps?.mockMessages;
                break;
            default:
                chatSDK = new MockChatSDK();
        }
    }
    return chatSDK;
};