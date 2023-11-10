import ChatConfig from "@microsoft/omnichannel-chat-sdk/lib/core/ChatConfig";
import { ConversationState } from "./ConversationState";
import { IInternalTelemetryData } from "../../common/telemetry/interfaces/IInternalTelemetryData";
import { ILiveChatWidgetLocalizedTexts } from "./ILiveChatWidgetLocalizedTexts";
import { IRenderingMiddlewareProps } from "../../components/webchatcontainerstateful/interfaces/IRenderingMiddlewareProps";
import { ConfirmationState, ConversationEndEntity, ParticipantType } from "../../common/Constants";
import { StartChatFailureType } from "./StartChatFailureType";

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
        transcriptRequestId: string; //Contains request id for downloading transcript
        confirmationPaneConfirmedOptionClicked: boolean; //shows if confirmation pane already displayed
        confirmationState: ConfirmationState;
        startChatFailureType: StartChatFailureType;
    };
    appStates: {
        conversationState: ConversationState; // The state that the conversation is currently in
        isMinimized?: boolean; // true when chat button is visible & chat widget is hidden & chat is ongoing
        previousElementIdOnFocusBeforeModalOpen: string | null; // The previous element id on focus before a modal opened. Focus will return to this element after the modal is closed by default
        startChatFailed: boolean; // true when start chat is failing
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
        conversationEndedBy: ConversationEndEntity; // The entity that ends conversation
        chatDisconnectEventReceived: boolean; // true when customer disconnect event is received
        selectedSurveyMode: string | null; // selected survey mode
        postChatParticipantType: undefined | ParticipantType; // participant type to render post chat survey
    };
    uiStates: {
        showConfirmationPane: boolean; // true if the confirmation pane should show
        showStartChatErrorPane: boolean; // true if the start chat error pane should show
        showEmailTranscriptPane: boolean; // true if the email transcript pane should show
        disableVideoCall: boolean; // true when voice call is enabled
        showCallingPopup: boolean; // true when showing the calling container
        disableRemoteVideo: boolean; // true when remote video is off
        disableSelfVideo: boolean; // true when self video is off
        isIncomingCall: boolean; //incoming/currentcall
        focusChatButton: boolean; // true after the first rendering for chat button
    };
}