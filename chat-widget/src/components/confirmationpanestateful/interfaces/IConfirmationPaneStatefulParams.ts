import { Dispatch } from "react";
import { ILiveChatWidgetAction } from "../../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../../contexts/common/ILiveChatWidgetContext";
import { IConfirmationPaneStatefulProps } from "./IConfirmationPaneStatefulProps";

export interface IConfirmationPaneStatefulParams extends IConfirmationPaneStatefulProps {
    /**
     * setPostChatContext: Internal Prop injected for setting Post Chat Context
     */
    setPostChatContext: () => Promise<void>;

    /**
    * prepareEndChat: Internal Prop injected for checking PostChat contexts and trigerring end of chat
    * @param adapter : The chat adapter for the live chat session
    * @param state : The chat state where the conversation is currently in
    */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prepareEndChat: () => Promise<void>;
}