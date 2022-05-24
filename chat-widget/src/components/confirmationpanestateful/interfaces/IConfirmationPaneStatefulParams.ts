import { IConfirmationPaneStatefulProps } from "./IConfirmationPaneStatefulProps";

export interface IConfirmationPaneStatefulParams extends IConfirmationPaneStatefulProps {
    /**
     * setPostChatContext: Internal Prop injected for setting Post Chat Context
     */
    setPostChatContext: () => Promise<void>;

    /**
     * endChat: Internal Prop injected for triggering end of a chat using chatSDK
     * @param adapter : The chat adapter for the live chat session
     * @param skipEndChatSDK : If set to true endchat will skip chatSDK endChat call
     * @param skipCloseChat : If set to true endchat will skip closing the live chat instance
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    endChat: (adapter: any, skipEndChatSDK?: boolean, skipCloseChat?: boolean) => Promise<void>;
}