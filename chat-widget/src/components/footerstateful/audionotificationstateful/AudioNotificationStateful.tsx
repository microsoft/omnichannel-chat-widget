import React, { useEffect, useRef } from "react";
import { IAudioNotificationStatefulParams } from "./interfaces/IAudioNotificationStatefulParams";
import { BroadcastService } from "@microsoft/omnichannel-chat-components";


export const AudioNotificationStateful = (props: IAudioNotificationStatefulParams) => {
    const { audioSrc, isAudioMuted } = props;
    const audioRef = useRef(new Audio(audioSrc));

    useEffect(() => {
        BroadcastService.getMessageByEventName("NewMessageNotification").subscribe((msg: any) => {
            audioRef.current.play();
        });
    }, []);

    useEffect(() => {
        isAudioMuted ? audioRef.current.muted = true : audioRef.current.muted = false;
    }, [isAudioMuted]);

    return (
        <></>
    );
};

export default AudioNotificationStateful;