import { ILoadingPaneProps } from "@microsoft/omnichannel-chat-components/lib/types/components/loadingpane/interfaces/ILoadingPaneProps";
import { IStartChatErrorPaneProps } from "@microsoft/omnichannel-chat-components/lib/types/components/startchaterrorpane/interfaces/IStartChatErrorPaneProps";

export interface ILoadingPaneStatefulParams {
    /**
     * headerProps: Props for regular Header usage
     * These props are used for all regular usages of Header excluding special scenarios
     */
    loadingPaneProps?: ILoadingPaneProps;

    /**
     * outOfOfficeHeaderProps: Props for Out of Office Header usage
     * These props are used for styling and control of Header during Out Of Office actions
     */
    startChatErrorPaneProps?: IStartChatErrorPaneProps;
}