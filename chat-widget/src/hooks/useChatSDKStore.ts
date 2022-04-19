import { ChatSDKStore } from "../contexts/ChatSDKStore";
import { useContext } from "react";

const useChatSDKStore = () => {
    const sdk = useContext(ChatSDKStore);

    if (!sdk) {
        throw new Error("This hook is not called on component that is descendants of <ChatSDKStore.Provider>, or ChatSDK is not passed into LiveChatWidget component.");
    }

    return sdk;
};

export default useChatSDKStore;