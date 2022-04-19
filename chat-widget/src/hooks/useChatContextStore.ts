import { Dispatch, useContext } from "react";

import { ChatContextStore } from "../contexts/ChatContextStore";
import { ILiveChatWidgetAction } from "../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../contexts/common/ILiveChatWidgetContext";

const useChatContextStore = () => {
    const context: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useContext(ChatContextStore);

    if (!context) {
        throw new Error("This hook can only be used on component that is descendants of <ChatContextStore.Provider>");
    }

    return context;
};

export default useChatContextStore;