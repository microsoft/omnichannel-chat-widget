import { LogLevel, TelemetryEvent } from "../../common/telemetry/TelemetryConstants";
import React, { Dispatch, useEffect } from "react";

import AudioNotificationStateful from "./audionotificationstateful/AudioNotificationStateful";
import { Constants } from "../../common/Constants";
import { ConversationState } from "../../contexts/common/ConversationState";
import { FacadeChatSDK } from "../../common/facades/FacadeChatSDK";
import { Footer } from "@microsoft/omnichannel-chat-components";
import { IFooterControlProps } from "@microsoft/omnichannel-chat-components/lib/types/components/footer/interfaces/IFooterControlProps";
import { ILiveChatWidgetAction } from "../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../contexts/common/ILiveChatWidgetContext";
import { ITimer } from "../../common/interfaces/ITimer";
import { LiveChatWidgetActionType } from "../../contexts/common/LiveChatWidgetActionType";
import { NewMessageNotificationSoundBase64 } from "../../assets/Audios";
import { NotificationHandler } from "../webchatcontainerstateful/webchatcontroller/notification/NotificationHandler";
import { NotificationScenarios } from "../webchatcontainerstateful/webchatcontroller/enums/NotificationScenarios";
import { TelemetryHelper } from "../../common/telemetry/TelemetryHelper";
import { createTimer } from "../../common/utils";
import { downloadTranscript } from "./downloadtranscriptstateful/DownloadTranscriptStateful";
import useChatContextStore from "../../hooks/useChatContextStore";
import useFacadeSDKStore from "../../hooks/useFacadeChatSDKStore";

let uiTimer : ITimer;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const FooterStateful = (props: any) => {

    useEffect(() => {
        uiTimer = createTimer();
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
            Event: TelemetryEvent.UXFooterStart
        });
    }, []);

    const [state, dispatch]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    // hideFooterDisplay - the purpose of this is to keep the footer always "active",
    // but hide it visually in certain states (e.g., loading state) and show in some other states (e.g. active state).
    // The reason for this approach is to make sure that state variables for audio notification work correctly after minimizing
    const { footerProps, downloadTranscriptProps, audioNotificationProps, hideFooterDisplay } = props;
    
    const [facadeChatSDK]: [FacadeChatSDK, (facadeChatSDK: FacadeChatSDK) => void] = useFacadeSDKStore();
    
    const controlProps: IFooterControlProps = {
        id: "oc-lcw-footer",
        dir: state.domainStates.globalDir,
        onDownloadTranscriptClick: async () => {
            try {
                TelemetryHelper.logActionEvent(LogLevel.INFO, { 
                    Event: TelemetryEvent.DownloadTranscriptButtonClicked, 
                    Description: "Download Transcript button clicked.",
                    LogToAppInsights: true
                });
                await downloadTranscript(facadeChatSDK, downloadTranscriptProps, state);
            } catch (ex) {
                TelemetryHelper.logActionEvent(LogLevel.ERROR, {
                    Event: TelemetryEvent.DownloadTranscriptFailed,
                    ExceptionDetails: {
                        exception: ex
                    },
                    LogToAppInsights: true
                });
                NotificationHandler.notifyError(
                    NotificationScenarios.DownloadTranscriptError,
                    downloadTranscriptProps?.bannerMessageOnError ?? Constants.defaultDownloadTranscriptError);
            }
        },
        onEmailTranscriptClick: () => {
            TelemetryHelper.logActionEvent(LogLevel.INFO, { 
                Event: TelemetryEvent.EmailTranscriptButtonClicked, 
                Description: "Email Transcript button clicked.",
                LogToAppInsights: true 
            });
            const emailTranscriptButtonId = footerProps?.controlProps?.emailTranscriptButtonProps?.id ?? `${controlProps.id}-emailtranscript-button`;
            if (emailTranscriptButtonId) {
                dispatch({ type: LiveChatWidgetActionType.SET_PREVIOUS_FOCUSED_ELEMENT_ID, payload: emailTranscriptButtonId });
            }
            dispatch({ type: LiveChatWidgetActionType.SET_SHOW_EMAIL_TRANSCRIPT_PANE, payload: true });
        },
        onAudioNotificationClick: () => {
            TelemetryHelper.logActionEvent(LogLevel.INFO, { 
                Event: TelemetryEvent.AudioToggleButtonClicked, 
                Description: "Audio button clicked.",
                LogToAppInsights: true
            });
            dispatch({ type: LiveChatWidgetActionType.SET_AUDIO_NOTIFICATION, payload: !state.appStates.isAudioMuted });
        },
        ...footerProps?.controlProps,
        audioNotificationButtonProps: {
            ...footerProps?.controlProps?.audioNotificationButtonProps,
            isAudioMuted: state.appStates.isAudioMuted
        },
    };

    useEffect(() => {
        if (state.appStates.conversationState === ConversationState.Active) {
            if (state.appStates.isAudioMuted === null) {
                dispatch({ type: LiveChatWidgetActionType.SET_AUDIO_NOTIFICATION, payload: footerProps?.controlProps?.hideAudioNotificationButton ? true : footerProps?.controlProps?.audioNotificationButtonProps?.isAudioMuted ?? false  });
            }
        }
        
    }, [state.appStates.conversationState]);


    useEffect(() => {
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
            Event: TelemetryEvent.UXFooterCompleted,
            ElapsedTimeInMilliseconds: uiTimer.milliSecondsElapsed
        });
    }, []);

    return (
        <>
            {!hideFooterDisplay &&
                <Footer
                    componentOverrides={footerProps?.componentOverrides}
                    controlProps={controlProps}
                    styleProps={footerProps?.styleProps}
                />
            }
            <AudioNotificationStateful
                audioSrc={audioNotificationProps?.audioSrc ?? NewMessageNotificationSoundBase64}
                isAudioMuted={state.appStates.isAudioMuted ?? false}
            />
        </>
    );
};

export default FooterStateful;

