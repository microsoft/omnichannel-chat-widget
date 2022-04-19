import { ChatAdapterStore } from "../contexts/ChatAdapterStore";
import { useContext } from "react";

const useChatAdapterStore = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adapter: [any, (adapter: any) => void] = useContext(ChatAdapterStore);

    if (!adapter) {
        throw new Error("This hook can only be used on component that is descendants of <ChatAdapterStore.Provider>");
    }

    return adapter;
};

export default useChatAdapterStore;