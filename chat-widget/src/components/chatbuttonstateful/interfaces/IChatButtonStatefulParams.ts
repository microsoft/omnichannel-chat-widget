import { IChatButtonProps } from "@microsoft/omnichannel-chat-components/lib/types/components/chatbutton/interfaces/IChatButtonProps";

export interface IChatButtonStatefulParams {
    /**
     * buttonProps: Props for regular chat Button usage
     * These props are used for all regular usages of chat button excluding special scenarios
     */
    buttonProps?: IChatButtonProps;

    /**
     * outOfOfficeButtonProps: Props for Out of Office chat Button usage
     * These props are used for styling and control of chat Button during Out Of Office actions
     */
    outOfOfficeButtonProps?: IChatButtonProps;

    /**
     * startChat: Internal Prop injected for triggering start of a chat using chatSDK
     */
    startChat: () => Promise<void>;
}