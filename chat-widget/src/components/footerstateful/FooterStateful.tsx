import { LogLevel, TelemetryEvent } from "../../common/telemetry/TelemetryConstants";
import React, { Dispatch, useEffect } from "react";

import AudioNotificationStateful from "./audionotificationstateful/AudioNotificationStateful";
import { Constants } from "../../common/Constants";
import { Footer } from "@microsoft/omnichannel-chat-components";
import { IFooterControlProps } from "@microsoft/omnichannel-chat-components/lib/types/components/footer/interfaces/IFooterControlProps";
import { ILiveChatWidgetAction } from "../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../contexts/common/ILiveChatWidgetContext";
import { LiveChatWidgetActionType } from "../../contexts/common/LiveChatWidgetActionType";
import { NewMessageNotificationSoundBase64 } from "../../assets/Audios";
import { NotificationHandler } from "../webchatcontainerstateful/webchatcontroller/notification/NotificationHandler";
import { NotificationScenarios } from "../webchatcontainerstateful/webchatcontroller/enums/NotificationScenarios";
import { TelemetryHelper } from "../../common/telemetry/TelemetryHelper";
import { downloadTranscript } from "./downloadtranscriptstateful/DownloadTranscriptStateful";
import useChatContextStore from "../../hooks/useChatContextStore";
import useChatSDKStore from "../../hooks/useChatSDKStore";
import { ConversationState } from "../../contexts/common/ConversationState";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const FooterStateful = (props: any) => {
    const [state, dispatch]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    // hideFooterDisplay - the purpose of this is to keep the footer always "active",
    // but hide it visually in certain states (e.g., loading state) and show in some other states (e.g. active state).
    // The reason for this approach is to make sure that state variables for audio notification work correctly after minimizing
    const { footerProps, downloadTranscriptProps, audioNotificationProps, hideFooterDisplay } = props;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chatSDK: any = useChatSDKStore();
    const controlProps: IFooterControlProps = {
        id: "oc-lcw-footer",
        dir: state.domainStates.globalDir,
        onDownloadTranscriptClick: async () => {
            try {
                TelemetryHelper.logActionEvent(LogLevel.INFO, { Event: TelemetryEvent.DownloadTranscriptButtonClicked, Description: "Download Transcript button clicked." });
                await downloadTranscript(chatSDK, downloadTranscriptProps, state);
            } catch (ex) {
                TelemetryHelper.logActionEvent(LogLevel.ERROR, {
                    Event: TelemetryEvent.DownloadTranscriptFailed,
                    ExceptionDetails: {
                        exception: ex
                    }
                });
                NotificationHandler.notifyError(
                    NotificationScenarios.DownloadTranscriptError,
                    downloadTranscriptProps?.bannerMessageOnError ?? Constants.defaultDownloadTranscriptError);
            }
        },
        onEmailTranscriptClick: () => {
            TelemetryHelper.logActionEvent(LogLevel.INFO, { Event: TelemetryEvent.EmailTranscriptButtonClicked, Description: "Email Transcript button clicked." });
            const emailTranscriptButtonId = footerProps?.controlProps?.emailTranscriptButtonProps?.id ?? `${controlProps.id}-emailtranscript-button`;
            if (emailTranscriptButtonId) {
                dispatch({ type: LiveChatWidgetActionType.SET_PREVIOUS_FOCUSED_ELEMENT_ID, payload: emailTranscriptButtonId });
            }
            dispatch({ type: LiveChatWidgetActionType.SET_SHOW_EMAIL_TRANSCRIPT_PANE, payload: true });
        },
        onAudioNotificationClick: () => {
            TelemetryHelper.logActionEvent(LogLevel.INFO, { Event: TelemetryEvent.AudioToggleButtonClicked, Description: "Audio button clicked." });
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