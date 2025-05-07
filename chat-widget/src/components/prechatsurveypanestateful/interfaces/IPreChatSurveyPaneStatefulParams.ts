import { IPreChatSurveyPaneProps } from "@microsoft/omnichannel-chat-components/lib/types/components/prechatsurveypane/interfaces/IPreChatSurveyPaneProps";

export interface IPreChatSurveyPaneStatefulParams {
    surveyProps?: IPreChatSurveyPaneProps;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initStartChat: (params?: any, persistedState?: any) => Promise<void>;
}