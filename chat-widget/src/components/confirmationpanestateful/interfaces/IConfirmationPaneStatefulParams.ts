import { IConfirmationPaneStatefulProps } from "./IConfirmationPaneStatefulProps";

export interface IConfirmationPaneStatefulParams extends IConfirmationPaneStatefulProps {
    /**
     * setPostChatContext: Internal Prop injected for setting Post Chat Context
     */
    setPostChatContext: () => Promise<void>;
}