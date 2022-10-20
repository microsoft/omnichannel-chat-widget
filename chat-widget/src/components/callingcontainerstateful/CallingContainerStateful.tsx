import { LogLevel, TelemetryEvent } from "../../common/telemetry/TelemetryConstants";
import React, { Dispatch, useCallback, useEffect } from "react";

import { CallingContainer } from "@microsoft/omnichannel-chat-components";
import { ICallingContainerControlProps } from "@microsoft/omnichannel-chat-components/lib/types/components/callingcontainer/interfaces/ICallingContainerControlProps";
import { ICallingContainerStatefulProps } from "./ICallingContainerStatefulProps";
import { ILiveChatWidgetAction } from "../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../contexts/common/ILiveChatWidgetContext";
import { LiveChatWidgetActionType } from "../../contexts/common/LiveChatWidgetActionType";
import { TelemetryHelper } from "../../common/telemetry/TelemetryHelper";
import useChatContextStore from "../../hooks/useChatContextStore";
import useChatSDKStore from "../../hooks/useChatSDKStore";

export const CallingContainerStateful = (props: ICallingContainerStatefulProps) => {

    //TODO : Close button confirmation implmentation is pending

    const [state, dispatch]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chatSDK: any = useChatSDKStore();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { voiceVideoCallingSdk } = props as any;

    let callId: string;

    const resetCallingStates = (reset: boolean) => {
        if (reset) {
            dispatch({ type: LiveChatWidgetActionType.SHOW_CALLING_CONTAINER, payload: false });
            dispatch({ type: LiveChatWidgetActionType.SET_INCOMING_CALL, payload: true });
            dispatch({ type: LiveChatWidgetActionType.DISABLE_VIDEO_CALL, payload: true });
            dispatch({ type: LiveChatWidgetActionType.DISABLE_LOCAL_VIDEO, payload: true });
            dispatch({ type: LiveChatWidgetActionType.DISABLE_REMOTE_VIDEO, payload: true });
        }
    };

    useEffect(() => {
        const init = async () => {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                TelemetryHelper.callId = callId;
                await voiceVideoCallingSdk.initialize({
                    chatToken: state.domainStates.chatToken,
                    selfVideoHTMLElementId: controlProps.currentCallControlProps?.nonActionIds?.selfVideoTileId, // HTML element id where video stream of the agent will be rendered
                    remoteVideoHTMLElementId: controlProps.currentCallControlProps?.nonActionIds?.remoteVideoTileId, // HTML element id where video stream of the customer will be rendered
                    OCClient: chatSDK?.OCClient
                });
            } catch (e) {
                TelemetryHelper.logCallingEvent(LogLevel.ERROR, {
                    Event: TelemetryEvent.VoiceVideoSdkInitializeException,
                    Description: `Failed to initialize VideoVoiceCalling Sdk:  ${e}`
                });
            }
        };
        init().then(() => {
            if (voiceVideoCallingSdk) {
                TelemetryHelper.logCallingEvent(LogLevel.INFO, {
                    Event: TelemetryEvent.VoiceVideoSdkInitialize,
                    Description: "Initialize VideoVoiceCalling Sdk Success",
                }, callId);

                voiceVideoCallingSdk.onCallAdded(() => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    callId = (voiceVideoCallingSdk as any).callId;
                    TelemetryHelper.logCallingEvent(LogLevel.INFO, {
                        Event: TelemetryEvent.CallAdded,
                    }, callId);

                    dispatch({ type: LiveChatWidgetActionType.SHOW_CALLING_CONTAINER, payload: true });
                    dispatch({ type: LiveChatWidgetActionType.SET_INCOMING_CALL, payload: true });
                });

                voiceVideoCallingSdk.onRemoteVideoStreamAdded(() => {
                    TelemetryHelper.logCallingEvent(LogLevel.INFO, {
                        Event: TelemetryEvent.RemoteVideoStreamAdded,
                    }, callId);

                    const isRemoteVideoDisabled = !voiceVideoCallingSdk.isRemoteVideoEnabled();
                    const isLocalVideoDisabled = !voiceVideoCallingSdk.isLocalVideoEnabled();
                    dispatch({ type: LiveChatWidgetActionType.DISABLE_VIDEO_CALL, payload: false });
                    dispatch({ type: LiveChatWidgetActionType.DISABLE_LOCAL_VIDEO, payload: isLocalVideoDisabled });
                    dispatch({ type: LiveChatWidgetActionType.DISABLE_REMOTE_VIDEO, payload: isRemoteVideoDisabled });
                });

                voiceVideoCallingSdk.onLocalVideoStreamAdded(() => {
                    TelemetryHelper.logCallingEvent(LogLevel.INFO, {
                        Event: TelemetryEvent.LocalVideoStreamAdded,
                    }, callId);

                    const isLocalVideoDisabled = !voiceVideoCallingSdk.isLocalVideoEnabled();
                    const isRemoteVideoDisabled = !voiceVideoCallingSdk.isRemoteVideoEnabled();
                    dispatch({ type: LiveChatWidgetActionType.DISABLE_VIDEO_CALL, payload: false });
                    dispatch({ type: LiveChatWidgetActionType.DISABLE_REMOTE_VIDEO, payload: isRemoteVideoDisabled });
                    dispatch({ type: LiveChatWidgetActionType.DISABLE_LOCAL_VIDEO, payload: isLocalVideoDisabled });
                });

                voiceVideoCallingSdk.onRemoteVideoStreamRemoved(() => {
                    TelemetryHelper.logCallingEvent(LogLevel.INFO, {
                        Event: TelemetryEvent.RemoteVideoStreamRemoved,
                    }, callId);

                    const isRemoteVideoDisabled = !voiceVideoCallingSdk.isRemoteVideoEnabled();
                    const isLocalVideoDisabled = !voiceVideoCallingSdk.isLocalVideoEnabled();
                    if (isRemoteVideoDisabled && isLocalVideoDisabled) {
                        dispatch({ type: LiveChatWidgetActionType.DISABLE_VIDEO_CALL, payload: true });
                    }
                    dispatch({ type: LiveChatWidgetActionType.DISABLE_REMOTE_VIDEO, payload: isRemoteVideoDisabled });
                });

                voiceVideoCallingSdk.onLocalVideoStreamRemoved(() => {
                    TelemetryHelper.logCallingEvent(LogLevel.INFO, {
                        Event: TelemetryEvent.LocalVideoStreamRemoved,
                    }, callId);

                    const isLocalVideoDisabled = !voiceVideoCallingSdk.isLocalVideoEnabled();
                    const isRemoteVideoDisabled = !voiceVideoCallingSdk.isRemoteVideoEnabled();
                    if (isRemoteVideoDisabled && isLocalVideoDisabled) {
                        dispatch({ type: LiveChatWidgetActionType.DISABLE_VIDEO_CALL, payload: true });
                    }
                    dispatch({ type: LiveChatWidgetActionType.DISABLE_LOCAL_VIDEO, payload: isLocalVideoDisabled });
                });

                voiceVideoCallingSdk.onCallDisconnected(() => {
                    TelemetryHelper.logCallingEvent(LogLevel.INFO, {
                        Event: TelemetryEvent.CallDisconnected,
                    }, callId);

                    resetCallingStates(true);
                });

                voiceVideoCallingSdk.addEventListener(TelemetryEvent.IncomingCallEnded, () => {
                    TelemetryHelper.logCallingEvent(LogLevel.INFO, {
                        Event: TelemetryEvent.IncomingCallEnded,
                    }, callId);
                    resetCallingStates(true);
                });
            }
        });
        window.addEventListener("beforeunload", () => {
            if (state.uiStates.isIncomingCall) {
                voiceVideoCallingSdk?.rejectCall();
            } else {
                voiceVideoCallingSdk?.stopCall();
            }
            voiceVideoCallingSdk?.close();
            dispatch({ type: LiveChatWidgetActionType.SET_E2VV_ENABLED, payload: false });
            resetCallingStates(true);
        });
    }, []);

    const controlProps: ICallingContainerControlProps = {
        id: "oc-lcw-callingcontainer",
        dir: state.domainStates.globalDir,
        isIncomingCall: state.uiStates.isIncomingCall,
        hideCallingContainer: state.appStates.isMinimized ? true : false,
        ...props?.controlProps,
        incomingCallControlProps: {
            onDeclineCallClick: useCallback(async () => {
                try {
                    voiceVideoCallingSdk.rejectCall();
                    TelemetryHelper.logCallingEvent(LogLevel.INFO, {
                        Event: TelemetryEvent.CallRejectClick,
                    }, callId);
                    resetCallingStates(true);
                } catch (error) {
                    TelemetryHelper.logCallingEvent(LogLevel.ERROR, {
                        Event: TelemetryEvent.CallRejectClickException,
                        ExceptionDetails: {
                            exception: `Failed to reject call:  ${error}`
                        }
                    }, callId);
                }
            }, [voiceVideoCallingSdk]),
            onAudioCallClick: useCallback(() => {
                try {
                    voiceVideoCallingSdk.acceptCall({
                        withVideo: false
                    });
                    TelemetryHelper.logCallingEvent(LogLevel.INFO, {
                        Event: TelemetryEvent.VoiceCallAcceptButtonClick,
                    }, callId);
                }
                catch (err) {
                    TelemetryHelper.logCallingEvent(LogLevel.ERROR, {
                        Event: TelemetryEvent.VoiceVideoAcceptCallException,
                        ExceptionDetails: {
                            exception: `Failed to accept call without video:  ${err}`
                        }
                    }, callId);
                }

                dispatch({ type: LiveChatWidgetActionType.SET_INCOMING_CALL, payload: false });
                dispatch({ type: LiveChatWidgetActionType.DISABLE_VIDEO_CALL, payload: true });
            }, []),
            onVideoCallClick: useCallback(() => {
                try {
                    voiceVideoCallingSdk.acceptCall({
                        withVideo: true
                    });

                    TelemetryHelper.logCallingEvent(LogLevel.INFO, {
                        Event: TelemetryEvent.VideoCallAcceptButtonClick,
                    }, callId);
                } catch (err) {
                    TelemetryHelper.logCallingEvent(LogLevel.ERROR, {
                        Event: TelemetryEvent.VoiceVideoAcceptCallWithVideoException,
                        ExceptionDetails: {
                            exception: `Failed to accept call with video:  ${err}`
                        }
                    }, callId);
                }

                dispatch({ type: LiveChatWidgetActionType.SET_INCOMING_CALL, payload: false });
                dispatch({ type: LiveChatWidgetActionType.DISABLE_LOCAL_VIDEO, payload: false });
            }, []),
            ...props?.controlProps?.incomingCallControlProps
        },
        currentCallControlProps: {
            hideCallTimer: true,
            onEndCallClick: useCallback(() => {
                try {
                    voiceVideoCallingSdk.stopCall();
                    TelemetryHelper.logCallingEvent(LogLevel.INFO, {
                        Event: TelemetryEvent.EndCallButtonClick,
                    }, callId);
                    resetCallingStates(true);
                } catch (error) {
                    TelemetryHelper.logCallingEvent(LogLevel.ERROR, {
                        Event: TelemetryEvent.EndCallButtonClickException,
                        ExceptionDetails: {
                            exception: `Failed to End Call:  ${error}`
                        }
                    }, callId);
                }
            }, []),

            onMicCallClick: useCallback(() => {
                try {
                    voiceVideoCallingSdk.toggleMute();
                    TelemetryHelper.logCallingEvent(LogLevel.INFO, {
                        Event: TelemetryEvent.ToggleMuteButtonClick,
                    }, callId);
                } catch (error) {
                    TelemetryHelper.logCallingEvent(LogLevel.ERROR, {
                        Event: TelemetryEvent.ToggleMuteButtonClickException,
                        ExceptionDetails: {
                            exception: `Failed to toggle mute button :  ${error}`
                        }
                    }, callId);
                }
            }, []),

            onVideoOffClick: useCallback(() => {
                try {
                    voiceVideoCallingSdk.toggleLocalVideo();
                    TelemetryHelper.logCallingEvent(LogLevel.INFO, {
                        Event: TelemetryEvent.ToggleCameraButtonClick,
                    }, callId);
                } catch (error) {
                    TelemetryHelper.logCallingEvent(LogLevel.ERROR, {
                        Event: TelemetryEvent.ToggleCameraButtonClickException,
                        ExceptionDetails: {
                            exception: `Failed to toggle video button :  ${error}`
                        }
                    }, callId);
                }
            }, []),

            nonActionIds: {
                ...props?.controlProps?.currentCallControlProps?.nonActionIds,
                selfVideoTileId: props?.controlProps?.currentCallControlProps?.nonActionIds?.selfVideoTileId ?? "selfVideo",
                remoteVideoTileId: props?.controlProps?.currentCallControlProps?.nonActionIds?.remoteVideoTileId ?? "remoteVideo"
            },
            videoCallDisabled: state.uiStates.disableVideoCall,
            selfVideoDisabled: state.uiStates.disableSelfVideo,
            remoteVideoDisabled: state.uiStates.disableRemoteVideo,
            ...props?.controlProps?.currentCallControlProps
        }
    };

    return (
        <>
            {state.uiStates.showCallingPopup &&
                <CallingContainer controlProps={controlProps} styleProps={props?.styleProps} />
            }
        </>
    );
};

export default CallingContainerStateful;