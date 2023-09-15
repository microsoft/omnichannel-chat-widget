import { INotificationPaneProps } from "@microsoft/omnichannel-chat-components/lib/types/components/notificationpane/interfaces/INotificationPaneProps";

export interface INotificationPaneStatefulProps extends INotificationPaneProps {
    notificationPaneProps?: INotificationPaneProps;
    notificationScenarioType?: string;

    /**
     * endChat: Internal Prop injected for triggering end of a chat using chatSDK
     * @param adapter : The chat adapter for the live chat session
     * @param skipEndChatSDK : If set to true endchat will skip chatSDK endChat call
     * @param skipCloseChat : If set to true endchat will skip closing the live chat instance
     * @param postMessageToOtherTab : If set to true endchat will send a message to other tabs(multi-tabs)
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    endChat: (adapter: any, skipEndChatSDK?: boolean, skipCloseChat?: boolean, postMessageToOtherTab?: boolean) => Promise<void>;
}