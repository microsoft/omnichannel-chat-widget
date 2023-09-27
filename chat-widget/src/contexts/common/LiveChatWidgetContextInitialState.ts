import { ConversationState } from "./ConversationState";
import { ILiveChatWidgetContext } from "./ILiveChatWidgetContext";
import { ILiveChatWidgetProps } from "../../components/livechatwidget/interfaces/ILiveChatWidgetProps";
import { defaultMiddlewareLocalizedTexts } from "../../components/webchatcontainerstateful/common/defaultProps/defaultMiddlewareLocalizedTexts";
import { getWidgetCacheIdfromProps, isNullOrUndefined } from "../../common/utils";
import { defaultClientDataStoreProvider } from "../../common/storage/default/defaultClientDataStoreProvider";
import { ConfirmationState, Constants, ConversationEndEntity, StorageType } from "../../common/Constants";
import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { BroadcastEvent } from "../../common/telemetry/TelemetryConstants";
import { inMemoryDataStore } from "../../common/storage/default/defaultInMemoryDataStore";

export const getLiveChatWidgetContextInitialState = (props: ILiveChatWidgetProps) => {

    //   console.log("ELOPEZANAYA :: getLiveChatWidgetContextInitialState :: creating BroadcastServiceInitialize");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const widgetCacheId = getWidgetCacheIdfromProps(props);
    const cacheTtlInMins = props?.controlProps?.cacheTtlInMins ?? Constants.CacheTtlInMinutes;
    const storageType = props?.useSessionStorage === true ? StorageType.sessionStorage : StorageType.localStorage;
    const alternateStorage = props?.liveChatWidgetExternalStorage;
    let initialState;

    try {   
        
        BroadcastService.getMessageByEventName(BroadcastEvent.ReceiveExternalItemData).subscribe((data) => {
            const result = data.payload.data;
            // we save the data in the in memory db
            inMemoryDataStore().setData(widgetCacheId, result);
            //indicates the response was received, we can stop waiting
        }
        );

        if (props?.liveChatWidgetExternalStorage?.useExternalStorage && props.liveChatWidgetExternalStorage.cachedData){
            initialState = props.liveChatWidgetExternalStorage.cachedData;
        }else{
            initialState = defaultClientDataStoreProvider(cacheTtlInMins, storageType, alternateStorage?.useExternalStorage, alternateStorage?.timeOutWaitForResponse).getData(widgetCacheId);

        }
    } catch (e) {
        initialState = null;
        console.error("Error while getting initial state from cache", e);
    }

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
            transcriptRequestId: "",
            confirmationPaneConfirmedOptionClicked: false,
            confirmationState: ConfirmationState.NotSet
        },
        appStates: {
            conversationState: ConversationState.Closed,
            isMinimized: undefined,
            previousElementIdOnFocusBeforeModalOpen: null,
            startChatFailed: false,
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
            conversationEndedBy: ConversationEndEntity.NotSet,
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
