import { IHeaderProps } from "@microsoft/omnichannel-chat-components/lib/types/components/header/interfaces/IHeaderProps";

export interface IHeaderStatefulParams {
    /**
     * headerProps: Props for regular Header usage
     * These props are used for all regular usages of Header excluding special scenarios
     */
    headerProps?: IHeaderProps;

    /**
     * outOfOfficeHeaderProps: Props for Out of Office Header usage
     * These props are used for styling and control of Header during Out Of Office actions
     */
    outOfOfficeHeaderProps?: IHeaderProps;

    /**
     * endChat: Internal Prop injected for triggering end of a chat using chatSDK
     * @param adapter : The chat adapter for the live chat session
     * @param skipEndChatSDK : If set to true endchat will skip chatSDK endChat call
     * @param skipCloseChat : If set to true endchat will skip closing the live chat instance
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    endChat: (adapter: any, skipEndChatSDK?: boolean, skipCloseChat?: boolean) => Promise<void>;
}