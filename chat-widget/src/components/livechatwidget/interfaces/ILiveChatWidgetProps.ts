import ChatConfig from "@microsoft/omnichannel-chat-sdk/lib/core/ChatConfig";
import { IAudioNotificationProps } from "../../footerstateful/audionotificationstateful/interfaces/IAudioNotificationProps";
import { ICallingContainerProps } from "@microsoft/omnichannel-chat-components/lib/types/components/callingcontainer/interfaces/ICallingContainerProps";
import { IChatButtonProps } from "@microsoft/omnichannel-chat-components/lib/types/components/chatbutton/interfaces/IChatButtonProps";
import { IConfirmationPaneStatefulProps } from "../../confirmationpanestateful/interfaces/IConfirmationPaneStatefulProps";
import { IDownloadTranscriptProps } from "../../footerstateful/downloadtranscriptstateful/interfaces/IDownloadTranscriptProps";
import { IEmailTranscriptPaneProps } from "../../emailtranscriptpanestateful/interfaces/IEmailTranscriptPaneProps";
import { IFooterProps } from "@microsoft/omnichannel-chat-components/lib/types/components/footer/interfaces/IFooterProps";
import { IHeaderProps } from "@microsoft/omnichannel-chat-components/lib/types/components/header/interfaces/IHeaderProps";
import { ILiveChatWidgetComponentOverrides } from "./ILiveChatWidgetComponentOverrides";
import { ILiveChatWidgetControlProps } from "./ILiveChatWidgetControlProps";
import { ILiveChatWidgetStyleProps } from "./ILiveChatWidgetStyleProps";
import { ILoadingPaneProps } from "@microsoft/omnichannel-chat-components/lib/types/components/loadingpane/interfaces/ILoadingPaneProps";
import { IOOOHPaneProps } from "@microsoft/omnichannel-chat-components/lib/types/components/outofofficehourspane/interfaces/IOOOHPaneProps";
import { IPreChatSurveyPaneProps } from "@microsoft/omnichannel-chat-components/lib/types/components/prechatsurveypane/interfaces/IPreChatSurveyPaneProps";
import { IProactiveChatPaneStatefulProps } from "../../proactivechatpanestateful/interfaces/IProactiveChatPaneStatefulProps";
import { IReconnectChatPaneStatefulProps } from "../../reconnectchatpanestateful/interfaces/IReconnectChatPaneStatefulProps";
import { IStartChatErrorPaneProps } from "../../startchaterrorpanestateful/interfaces/IStartChatErrorPaneProps";
import { ITelemetryConfig } from "../../../common/telemetry/interfaces/ITelemetryConfig";
import { IWebChatContainerStatefulProps } from "../../webchatcontainerstateful/interfaces/IWebChatContainerStatefulProps";
import { OmnichannelChatSDK } from "@microsoft/omnichannel-chat-sdk";
import { ILiveChatWidgetContext } from "../../../contexts/common/ILiveChatWidgetContext";
import { IContextDataStore } from "../../../common/interfaces/IContextDataStore";
import { IPostChatSurveyPaneStatefulProps } from "../../postchatsurveypanestateful/interfaces/IPostChatSurveyPaneStatefulProps";
import { IScrollBarProps } from "./IScrollBarProps";
import { IDraggableChatWidgetProps } from "./IDraggableChatWidgetProps";
import { INotificationPaneProps } from "@microsoft/omnichannel-chat-components/lib/types/components/notificationpane/interfaces/INotificationPaneProps";
import { IMockProps } from "./IMockProps";

export interface ILiveChatWidgetProps {
    audioNotificationProps?: IAudioNotificationProps;
    callingContainerProps?: ICallingContainerProps;
    chatButtonProps?: IChatButtonProps;
    chatConfig?: ChatConfig;
    chatSDK: OmnichannelChatSDK;
    componentOverrides?: ILiveChatWidgetComponentOverrides;
    confirmationPaneProps?: IConfirmationPaneStatefulProps;
    controlProps?: ILiveChatWidgetControlProps;
    // Since the directLine object contains circular structure; storybook will raise an error if we modify any controls.
    // Therefore this prop is duplicated here so that we can hide this prop only on storybook.
    // Other than storybook scenarios; you should use webChatContainerProps.directLine all the time.
    // This directLine will overwrite webChatContainerProps.directLine
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    directLine?: any;
    downloadTranscriptProps?: IDownloadTranscriptProps;
    emailTranscriptPane?: IEmailTranscriptPaneProps;
    footerProps?: IFooterProps;
    headerProps?: IHeaderProps;
    loadingPaneProps?: ILoadingPaneProps;
    outOfOfficeChatButtonProps?: IChatButtonProps;
    outOfOfficeHeaderProps?: IHeaderProps;
    outOfOfficeHoursPaneProps?: IOOOHPaneProps;
    postChatLoadingPaneProps?: ILoadingPaneProps;
    postChatSurveyPaneProps?: IPostChatSurveyPaneStatefulProps;
    preChatSurveyPaneProps?: IPreChatSurveyPaneProps;
    proactiveChatPaneProps?: IProactiveChatPaneStatefulProps;
    reconnectChatPaneProps?: IReconnectChatPaneStatefulProps;
    startChatErrorPaneProps?: IStartChatErrorPaneProps;
    styleProps?: ILiveChatWidgetStyleProps;
    telemetryConfig: ITelemetryConfig;
    notificationPaneProps?: INotificationPaneProps;
    webChatContainerProps?: IWebChatContainerStatefulProps;
    liveChatContextFromCache?: ILiveChatWidgetContext;
    contextDataStore?: IContextDataStore;
    getAuthToken?: (authClientFunction?: string) => Promise<string | null>;
    scrollBarProps?: IScrollBarProps;
    useSessionStorage?: boolean;
    allowSdkChatSupport?: boolean; // to avoid any performance impact
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialCustomContext?: any;
    draggableChatWidgetProps?: IDraggableChatWidgetProps;
    mock?: IMockProps;
}