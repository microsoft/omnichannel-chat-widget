import { FacadeStore } from "../contexts/FacadeStore";
import { useContext } from "react";

const useFacadeSDKStore = () => {
    const facadeChatSDK = useContext(FacadeStore);

    if (!facadeChatSDK) {
        throw new Error("This hook is not called on component that is descendants of <ChatSDKStore.Provider>, or ChatSDK is not passed into LiveChatWidget component.");
    }

    return facadeChatSDK;
};

export default useFacadeSDKStore;