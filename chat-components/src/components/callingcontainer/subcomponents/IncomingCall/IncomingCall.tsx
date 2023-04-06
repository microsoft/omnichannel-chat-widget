import * as React from "react";

import { IStackStyles, IStackTokens, Label, Stack } from "@fluentui/react";

import CommandButton from "../../../common/commandbutton/CommandButton";
import { ElementType, EventNames, Ids, KeyCodes } from "../../../../common/Constants";
import { ICustomEvent } from "../../../../interfaces/ICustomEvent";
import { IIncomingCallProps } from "./interfaces/IIncomingCallProps";
import { decodeComponentString } from "../../../../common/decodeComponentString";
import { defaultIncomingCallProps } from "./common/defaultProps/defaultIncomingCallProps";
import { processCustomComponents } from "../../../../common/utils";
import { useCallback, useEffect } from "react";

function IncomingCall(props: IIncomingCallProps) {

    const incomingCallId = props.controlProps?.id ?? defaultIncomingCallProps.controlProps?.id;
    const declineCallButtonId = props.controlProps?.declineCallButtonProps?.id ?? defaultIncomingCallProps.controlProps?.declineCallButtonProps?.id;
    const audioCallButtonId = props.controlProps?.audioCallButtonProps?.id ?? defaultIncomingCallProps.controlProps?.audioCallButtonProps?.id;
    const videoCallButtonId = props.controlProps?.videoCallButtonProps?.id ?? defaultIncomingCallProps.controlProps?.videoCallButtonProps?.id;

    const stackStyles: Partial<IStackStyles> = {
        root: Object.assign({}, defaultIncomingCallProps.styleProps?.generalStyleProps, props.styleProps?.generalStyleProps)
    };

    const leftGroupStackTokens: IStackTokens = { childrenGap: props.controlProps?.leftGroup?.gap ?? defaultIncomingCallProps.controlProps?.leftGroup?.gap };
    const rightGroupStackTokens: IStackTokens = { childrenGap: props.controlProps?.rightGroup?.gap ?? defaultIncomingCallProps.controlProps?.rightGroup?.gap };
    const middleGroupStackTokens: IStackTokens = { childrenGap: props.controlProps?.middleGroup?.gap ?? defaultIncomingCallProps.controlProps?.middleGroup?.gap };

    const declineCallButtonProps = Object.assign({}, defaultIncomingCallProps.controlProps?.declineCallButtonProps,
        props.controlProps?.declineCallButtonProps);

    const videoCallButtonProps = Object.assign({}, defaultIncomingCallProps.controlProps?.videoCallButtonProps,
        props.controlProps?.videoCallButtonProps);

    const audioCallButtonProps = Object.assign({}, defaultIncomingCallProps.controlProps?.audioCallButtonProps,
        props.controlProps?.audioCallButtonProps);

    const incomingCallTitleProps = Object.assign({}, defaultIncomingCallProps.controlProps?.incomingCallTitle,
        props.controlProps?.incomingCallTitle);

    const declineCallButtonStyles = Object.assign({}, defaultIncomingCallProps.styleProps?.declineCallButtonStyleProps,
        props.styleProps?.declineCallButtonStyleProps);

    const declineCallButtonHoverStyles = Object.assign({}, defaultIncomingCallProps.styleProps?.declineCallButtonHoverStyleProps,
        props.styleProps?.declineCallButtonHoverStyleProps);

    const videoCallButtonStyles = Object.assign({}, defaultIncomingCallProps.styleProps?.videoCallButtonStyleProps,
        props.styleProps?.videoCallButtonStyleProps);

    const videoCallButtonHoverStyles = Object.assign({}, defaultIncomingCallProps.styleProps?.videoCallButtonHoverStyleProps,
        props.styleProps?.videoCallButtonHoverStyleProps);

    const audioCallButtonStyles = Object.assign({}, defaultIncomingCallProps.styleProps?.audioCallButtonStyleProps,
        props.styleProps?.audioCallButtonStyleProps);

    const audioCallButtonHoverStyles = Object.assign({}, defaultIncomingCallProps.styleProps?.audioCallButtonHoverStyleProps,
        props.styleProps?.audioCallButtonHoverStyleProps);

    const incomingCallTitleStyles = {
        root: Object.assign({}, defaultIncomingCallProps.styleProps?.incomingCallTitleStyleProps,
            props.styleProps?.incomingCallTitleStyleProps)
    };

    const incomingCallItemFocusStyles = Object.assign({}, defaultIncomingCallProps.styleProps?.itemFocusStyleProps,
        props.styleProps?.itemFocusStyleProps);

    const declineCustomEvent: ICustomEvent = {
        elementType: ElementType.IncomingCallDeclineCallButton,
        elementId: declineCallButtonId,
        eventName: EventNames.IncomingCallEnded
    };
    const handleDeclineCallClick = useCallback(() => {
        if (props.controlProps?.onDeclineCallClick) {
            props.controlProps?.onDeclineCallClick();
        }
    }, []);
    const videoCustomEvent: ICustomEvent = {
        elementType: ElementType.IncomingCallVideoCallButton,
        elementId: videoCallButtonId,
        eventName: EventNames.OnClick
    };
    const handleVideoCallClick = useCallback(() => {
        if (props.controlProps?.onVideoCallClick) {
            props.controlProps?.onVideoCallClick();
        }
    }, []);
    const audioCustomEvent: ICustomEvent = {
        elementType: ElementType.IncomingCallAudioCallButton,
        elementId: audioCallButtonId,
        eventName: EventNames.OnClick
    };
    const handleAudioCallClick = useCallback(() => {
        if (props.controlProps?.onAudioCallClick) {
            props.controlProps?.onAudioCallClick();
        }
    }, []);

    useEffect(() => {
        const declineCallShortcut = (e: KeyboardEvent) => e.ctrlKey && e.shiftKey && e.key === KeyCodes.DeclineCallHotKey;
        const acceptAudioCallShortcut = (e: KeyboardEvent) => e.ctrlKey && e.shiftKey && e.key === KeyCodes.AcceptAudioCallHotKey;
        const acceptVideoCallShortcut = (e: KeyboardEvent) => e.ctrlKey && e.shiftKey && e.key === KeyCodes.AcceptVideoCallHotKey;

        const shortcutKeysHandler = (e: KeyboardEvent) => {
            if (declineCallShortcut(e)) {
                handleDeclineCallClick();
            } else if (acceptAudioCallShortcut(e)) {
                handleAudioCallClick();
            } else if (acceptVideoCallShortcut(e)) {
                handleVideoCallClick();
            }
        };

        const ignoreDefault = (e: KeyboardEvent) => {
            if (declineCallShortcut(e) || acceptAudioCallShortcut(e) || acceptVideoCallShortcut(e)) {
                e.preventDefault();
            }
        };

        window.addEventListener("keyup", shortcutKeysHandler);
        window.addEventListener("keydown", ignoreDefault);

        return () => {
            window.removeEventListener("keyup", shortcutKeysHandler);
            window.removeEventListener("keydown", ignoreDefault);
        };
    }, []);

    useEffect(() => {
        // Setting focus to decline call button when incoming call alert appears
        if (declineCallButtonId) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const declineCallButton: any = document.getElementById(declineCallButtonId);
            if (declineCallButton) {
                declineCallButton.focus();
            }
        }
    },[]);

    return (

        <Stack horizontal className={props.styleProps?.className} horizontalAlign="space-between"
            styles={stackStyles}
            dir={props.controlProps?.dir ?? defaultIncomingCallProps.controlProps?.dir} role="alert"
            aria-label={incomingCallTitleProps?.text}>
            <Stack horizontal id={Ids.IncomingCallLeftGroupId} verticalAlign="center" tokens={leftGroupStackTokens}>
                {!props.controlProps?.hideIncomingCallTitle && (decodeComponentString(props.componentOverrides?.incomingCallTitle) ||
                    <Label
                        {...incomingCallTitleProps}
                        id={incomingCallId + "-title"}
                        tabIndex={-1}
                        styles={incomingCallTitleStyles}>
                        {incomingCallTitleProps?.text}
                    </Label>)
                }
                {processCustomComponents(props.controlProps?.leftGroup?.children)}
            </Stack>
            <Stack horizontal id={Ids.IncomingCallMiddleGroupId} verticalAlign="center" tokens={middleGroupStackTokens}>
                {processCustomComponents(props.controlProps?.middleGroup?.children)}
            </Stack>
            <Stack horizontal id={Ids.IncomingCallRightGroupId} verticalAlign="center" tokens={rightGroupStackTokens}>
                {processCustomComponents(props.controlProps?.rightGroup?.children)}
                {!props.controlProps?.hideDeclineCall &&
                    <CommandButton
                        {...declineCallButtonProps}
                        onClick={handleDeclineCallClick}
                        id={declineCallButtonId}
                        styles={declineCallButtonStyles}
                        hoverStyles={declineCallButtonHoverStyles}
                        focusStyles={incomingCallItemFocusStyles}
                        customEvent={declineCustomEvent} />
                }
                {!props.controlProps?.hideVideoCall &&
                    <CommandButton
                        {...videoCallButtonProps}
                        onClick={handleVideoCallClick}
                        id={videoCallButtonId}
                        styles={videoCallButtonStyles}
                        hoverStyles={videoCallButtonHoverStyles}
                        focusStyles={incomingCallItemFocusStyles}
                        customEvent={videoCustomEvent} />
                }
                {!props.controlProps?.hideAudioCall &&
                    <CommandButton
                        {...audioCallButtonProps}
                        onClick={handleAudioCallClick}
                        id={audioCallButtonId}
                        styles={audioCallButtonStyles}
                        hoverStyles={audioCallButtonHoverStyles}
                        focusStyles={incomingCallItemFocusStyles}
                        customEvent={audioCustomEvent} />
                }
            </Stack>
        </Stack>
    );
}

export default IncomingCall;