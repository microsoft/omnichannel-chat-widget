import { ConversationState } from "./ConversationState";
import { ILiveChatWidgetContext } from "./ILiveChatWidgetContext";
import { ILiveChatWidgetProps } from "../../components/livechatwidget/interfaces/ILiveChatWidgetProps";
import { defaultMiddlewareLocalizedTexts } from "../../components/webchatcontainerstateful/common/defaultProps/defaultMiddlewareLocalizedTexts";
import { getWidgetCacheIdfromProps, isNullOrUndefined } from "../../common/utils";
import { defaultClientDataStoreProvider } from "../../common/storage/default/defaultClientDataStoreProvider";
import { Constants, ConversationEndEntity, StorageType } from "../../common/Constants";

export const getLiveChatWidgetContextInitialState = (props: ILiveChatWidgetProps) => {

    const widgetCacheId = getWidgetCacheIdfromProps(props);
    const cacheTtlInMins = props?.controlProps?.cacheTtlInMins ?? Constants.CacheTtlInMinutes;
    const storageType = props?.useSessionStorage === true ? StorageType.sessionStorage : StorageType.localStorage;
    const initialState = defaultClientDataStoreProvider(cacheTtlInMins, storageType).getData(widgetCacheId);

    if (!isNullOrUndefined(initialState)) {
        const initialStateFromCache: ILiveChatWidgetContext = JSON.parse(initialState);
        return initialStateFromCache;
    }

    const LiveChatWidgetContextInitialState: ILiveChatWidgetContext = {
        domainStates: {
            liveChatConfig: props.chatConfig,
            widgetElementId: "",
            renderingMiddlewareProps: props.webChatContainerProps?.renderingMiddlewareProps,
            middlewareLocalizedTexts: defaultMiddlewareLocalizedTexts,
            preChatSurveyResponse: "{}",
            chatToken: undefined,
            postChatContext: undefined,
            telemetryInternalData: {},
            globalDir: "ltr",
            liveChatContext: undefined,
            customContext: undefined,
            widgetSize: undefined,
            widgetInstanceId: "",
            initialChatSdkRequestId: "",
            transcriptRequestId: ""
        },
        appStates: {
            conversationState: ConversationState.Closed,
            isMinimized: undefined,
            previousElementIdOnFocusBeforeModalOpen: null,
            isStartChatFailing: false,
            outsideOperatingHours: false,
            preChatResponseEmail: "",
            isAudioMuted: null,
            newMessage: false,
            hideStartChatButton: false,
            reconnectId: undefined,
            proactiveChatStates: {
                proactiveChatBodyTitle: "",
                proactiveChatEnablePrechat: false,
                proactiveChatInNewWindow: false
            },
            e2vvEnabled: false,
            unreadMessageCount: 0,
            conversationEndedByAgentEventReceived: false,
            conversationEndedBy: ConversationEndEntity.NotSet,
            postChatWorkflowInProgress: false,
            shouldUseBotSurvey: false,
            chatDisconnectEventReceived: false,
            selectedSurveyMode: null
        },
        uiStates: {
            showConfirmationPane: false,
            showEmailTranscriptPane: false,
            showCallingPopup: false,
            isIncomingCall: true,
            disableVideoCall: true,
            disableRemoteVideo: true,
            disableSelfVideo: true,
            focusChatButton: false
        }
    };

    return LiveChatWidgetContextInitialState;
};
