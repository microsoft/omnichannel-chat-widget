import { IProactiveChatPaneProps } from "@microsoft/omnichannel-chat-components/lib/types/components/proactivechatpane/interfaces/IProactiveChatPaneProps";

export interface IProactiveChatPaneStatefulProps extends IProactiveChatPaneProps {
    ProactiveChatInviteTimeoutInMs?: number;
}