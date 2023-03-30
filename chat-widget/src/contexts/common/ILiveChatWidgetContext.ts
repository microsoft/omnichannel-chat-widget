import ChatConfig from "@microsoft/omnichannel-chat-sdk/lib/core/ChatConfig";
import { ConversationState } from "./ConversationState";
import { IInternalTelemetryData } from "../../common/telemetry/interfaces/IInternalTelemetryData";
import { ILiveChatWidgetLocalizedTexts } from "./ILiveChatWidgetLocalizedTexts";
import { IRenderingMiddlewareProps } from "../../components/webchatcontainerstateful/interfaces/IRenderingMiddlewareProps";
import { ConversationEndEntity } from "./ConversationEndEntity";

export interface ILiveChatWidgetContext {
    domainStates: {
        liveChatConfig: ChatConfig | undefined;
        widgetElementId: string;
        preChatSurveyResponse: string; //Contains the preChat Survey payload if set
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        chatToken: any;
        renderingMiddlewareProps: IRenderingMiddlewareProps | undefined;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        postChatContext: any;
        middlewareLocalizedTexts: ILiveChatWidgetLocalizedTexts | undefined;
        telemetryInternalData: IInternalTelemetryData;
        globalDir: "rtl" | "ltr";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        liveChatContext: any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        customContext: any; //Contains the customContext payload if set
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        widgetSize: any;
        widgetInstanceId: string;
        initialChatSdkRequestId: string;
    };
    appStates: {
        conversationState: ConversationState; // The state that the conversation is currently in
        isMinimized?: boolean; // true when chat button is visible & chat widget is hidden & chat is ongoing
        previousElementIdOnFocusBeforeModalOpen: string | null; // The previous element id on focus before a modal opened. Focus will return to this element after the modal is closed by default
        isStartChatFailing: boolean; // true when start chat is failing
        outsideOperatingHours: boolean; // true when chat session is out of office hours
        preChatResponseEmail: string; // The email from preChat survey response
        isAudioMuted: boolean | null; // true/false if the sound notification is on/off. Initial value is null, in such case it gets set to true if audio notification icon is set, otherwise it gets set to false
        newMessage: boolean; // new message state
        hideStartChatButton: boolean; // true if we want to open popout chat
        reconnectId: string | undefined; // used to reconnect to previous chat if one exists
        proactiveChatStates: {
            proactiveChatBodyTitle: string; // proactive chat body title
            proactiveChatEnablePrechat: boolean; // true if we want to enable prechat survey after proactive chat
            proactiveChatInNewWindow: boolean; // true if we want to start a popout chat after proactive chat
        };
        e2vvEnabled: boolean; // true if voice/video calling is enabled and callingSDK instance created
        unreadMessageCount: number; // keep count of unread messages
        conversationEndedByAgentEventReceived: boolean; // true when agent end conversation or timeout event is received
        conversationEndedBy: ConversationEndEntity | undefined; // The entity that ends conversation
        postChatWorkflowInProgress: boolean; // true when customer ends conversation and postChat workflow has initiated
        shouldUseBotSurvey: boolean; // true when bot configured survey needs to be used
        chatDisconnectEventReceived: boolean; // true when customer disconnect event is received
        selectedSurveyMode: string | null; // selected survey mode
    };
    uiStates: {
        showConfirmationPane: boolean; // true if the confirmation pane should show
        showEmailTranscriptPane: boolean; // true if the email transcript pane should show
        disableVideoCall: boolean; // true when voice call is enabled
        showCallingPopup: boolean; // true when showing the calling container
        disableRemoteVideo: boolean; // true when remote video is off
        disableSelfVideo: boolean; // true when self video is off
        isIncomingCall: boolean; //incoming/currentcall
        focusChatButton: boolean; // true after the first rendering for chat button
    };
}
