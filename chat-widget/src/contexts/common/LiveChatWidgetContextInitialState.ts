import { ConfirmationState, Constants, ConversationEndEntity, StorageType } from "../../common/Constants";
import { getWidgetCacheIdfromProps, isNullOrUndefined } from "../../common/utils";

import { ConversationState } from "./ConversationState";
import { ILiveChatWidgetContext } from "./ILiveChatWidgetContext";
import { ILiveChatWidgetProps } from "../../components/livechatwidget/interfaces/ILiveChatWidgetProps";
import { StartChatFailureType } from "./StartChatFailureType";
import { defaultClientDataStoreProvider } from "../../common/storage/default/defaultClientDataStoreProvider";
import { defaultMiddlewareLocalizedTexts } from "../../components/webchatcontainerstateful/common/defaultProps/defaultMiddlewareLocalizedTexts";

export const getLiveChatWidgetContextInitialState = (props: ILiveChatWidgetProps) => {

    const outOfOfficeStateStrategy = (initialStateFromCache: ILiveChatWidgetContext, props: ILiveChatWidgetProps) => {
        // Out of office hours may change from second to another, so we need to alway evaluate it from the props config
        if (props.chatConfig?.LiveWSAndLiveChatEngJoin?.OutOfOperatingHours) {
            const liveChatConfig = initialStateFromCache.domainStates?.liveChatConfig?.LiveWSAndLiveChatEngJoin;
            if (liveChatConfig) {
                liveChatConfig.OutOfOperatingHours =
                    initialStateFromCache.appStates.outsideOperatingHours = liveChatConfig.OutOfOperatingHours;
    
                // this is needed to prevent the case of some errors preventing the ooo pane to show.
                if (liveChatConfig.OutOfOperatingHours === true) {
                    initialStateFromCache.appStates.conversationState = ConversationState.OutOfOffice;
                }
            }
        }
    };

    const widgetCacheId = getWidgetCacheIdfromProps(props);
    const cacheTtlInMins = props?.controlProps?.cacheTtlInMins ?? Constants.CacheTtlInMinutes;
    const storageType = props?.useSessionStorage === true ? StorageType.sessionStorage : StorageType.localStorage;
    const initialState = defaultClientDataStoreProvider(cacheTtlInMins, storageType).getData(widgetCacheId);

    if (!isNullOrUndefined(initialState)) {
        const initialStateFromCache: ILiveChatWidgetContext = JSON.parse(initialState);

        /*
        * this step is needed to avoid the pre-chat pane to be injected in the DOM when the widget is reloaded, because wont be visible
        * and it will be blocking all elements behind it
        * as part of the flow, the pre-chat will be detected and then it will be displayed properly 
        * this case is only and only for pre-chat pane.
        * **/
        if (initialStateFromCache.appStates.conversationState === ConversationState.Prechat) {
            initialStateFromCache.appStates.conversationState = ConversationState.Closed;
        }

        // we are always setting the chatConfig from the props to avoid any issues with the cache
        initialStateFromCache.domainStates.liveChatConfig = props.chatConfig;

        // Out of office hours may change from second to another, so we need to alway evaluate it from the props config
        outOfOfficeStateStrategy(initialStateFromCache, props);

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
            transcriptRequestId: "",
            confirmationPaneConfirmedOptionClicked: false,
            confirmationState: ConfirmationState.NotSet,
            startChatFailureType: StartChatFailureType.Generic
        },
        appStates: {
            conversationState: (props.chatConfig?.LiveWSAndLiveChatEngJoin?.OutOfOperatingHours.toString().toLowerCase() === "true")
                ? ConversationState.OutOfOffice
                : ConversationState.Closed,            isMinimized: undefined,
            previousElementIdOnFocusBeforeModalOpen: null,
            startChatFailed: false,
            outsideOperatingHours: (props.chatConfig?.LiveWSAndLiveChatEngJoin?.OutOfOperatingHours.toString().toLowerCase() === "true"),            preChatResponseEmail: "",
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
            conversationEndedBy: ConversationEndEntity.NotSet,
            chatDisconnectEventReceived: false,
            selectedSurveyMode: null,
            postChatParticipantType: undefined
        },
        uiStates: {
            showConfirmationPane: false,
            showStartChatErrorPane: false,
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