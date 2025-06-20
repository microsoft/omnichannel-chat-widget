import { IPostChatSurveyPaneProps } from "@microsoft/omnichannel-chat-components/lib/types/components/postchatsurveypane/interfaces/IPostChatSurveyPaneProps";

export interface IPostChatSurveyPaneStatefulProps extends IPostChatSurveyPaneProps {
    isCustomerVoiceSurveyCompact?: boolean;
    copilotSurveyContext?: Record<string, string>;
    customerVoiceSurveyCorrelationId?: string; // Correlation id passed to CustomerVoice survey query parameters for investigation
}