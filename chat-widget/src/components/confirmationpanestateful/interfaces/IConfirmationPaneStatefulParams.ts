import { IConfirmationPaneStatefulProps } from "./IConfirmationPaneStatefulProps";

export interface IConfirmationPaneStatefulParams extends IConfirmationPaneStatefulProps {
    /**
     * setPostChatContext: Internal Prop injected for setting Post Chat Context
     */
    setPostChatContext: () => Promise<void>;

    /**
     * endChat: Internal Prop injected for triggering end of a chat using chatSDK
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    endChat: (adapter: any) => Promise<void>;
}