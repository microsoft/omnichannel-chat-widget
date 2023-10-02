import React, { useEffect, useRef } from "react";

import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { IAudioNotificationStatefulParams } from "./interfaces/IAudioNotificationStatefulParams";

export const AudioNotificationStateful = (props: IAudioNotificationStatefulParams) => {
    const { audioSrc, isAudioMuted } = props;
    const audioRef = useRef(new Audio(audioSrc));

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
        BroadcastService.getMessageByEventName("NewMessageNotification").subscribe((msg: any) => {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    //TODO: handle success
                }).catch(() => {
                    //TODO: handle error
                });
            }
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