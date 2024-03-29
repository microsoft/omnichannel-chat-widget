import * as React from "react";

import { IButtonStyles, IIconProps, IStackStyles, IStackTokens, IconButton, Stack } from "@fluentui/react";

import { BroadcastService } from "../../../../services/BroadcastService";
import CommandButton from "../../../common/commandbutton/CommandButton";
import { ElementType, EventNames, Ids, KeyCodes } from "../../../../common/Constants";
import { ICurrentCallProps } from "./interfaces/ICurrentCallProps";
import { ICustomEvent } from "../../../../interfaces/ICustomEvent";
import Timer from "../Timer/Timer";
import { defaultCurrentCallProps } from "./common/defaultProps/defaultCurrentCallProps";
import { processCustomComponents } from "../../../../common/utils";
import { useBoolean } from "@fluentui/react-hooks";
import { useCallback, useEffect } from "react";

function CurrentCall(props: ICurrentCallProps) {

    const currentCallId = props.controlProps?.id ?? defaultCurrentCallProps.controlProps?.id;
    const endCallButtonId = props.controlProps?.endCallButtonProps?.id ?? defaultCurrentCallProps.controlProps?.endCallButtonProps?.id;
    const micButtonId = props.controlProps?.micButtonProps?.id ?? defaultCurrentCallProps.controlProps?.micButtonProps?.id;
    const videoOffButtonId = props.controlProps?.videoButtonProps?.id ?? defaultCurrentCallProps.controlProps?.videoButtonProps?.id;
    const callTimerId = props.controlProps?.callTimerProps?.id ?? defaultCurrentCallProps.controlProps?.callTimerProps?.id;
    const videoTileId = props.controlProps?.nonActionIds?.videoTileGroupId ?? defaultCurrentCallProps.controlProps?.nonActionIds?.videoTileGroupId;
    const remoteVideoTileId = props.controlProps?.nonActionIds?.remoteVideoTileId ?? defaultCurrentCallProps.controlProps?.nonActionIds?.remoteVideoTileId;
    const selfVideoTileId = props.controlProps?.nonActionIds?.selfVideoTileId ?? defaultCurrentCallProps.controlProps?.nonActionIds?.selfVideoTileId;
    const dir = props.controlProps?.dir ? props.controlProps?.dir : defaultCurrentCallProps.controlProps?.dir;

    const stackStyles: Partial<IStackStyles> = {
        root: Object.assign({}, defaultCurrentCallProps.styleProps?.generalStyleProps, props.styleProps?.generalStyleProps)
    };


    const leftGroupStackTokens: IStackTokens = { childrenGap: props.controlProps?.leftGroup?.gap ?? defaultCurrentCallProps.controlProps?.leftGroup?.gap };
    const rightGroupStackTokens: IStackTokens = { childrenGap: props.controlProps?.rightGroup?.gap ?? defaultCurrentCallProps.controlProps?.rightGroup?.gap };
    const middleGroupStackTokens: IStackTokens = { childrenGap: props.controlProps?.middleGroup?.gap ?? defaultCurrentCallProps.controlProps?.middleGroup?.gap };

    const videoOffIcon: IIconProps = props.controlProps?.videoButtonProps?.imageToggleIconProps ?
        {
            imageProps: props.controlProps?.videoButtonProps?.imageToggleIconProps ?? defaultCurrentCallProps.controlProps?.videoButtonProps?.imageToggleIconProps,
            styles: { root: { fontSize: props.controlProps?.videoButtonProps?.iconSize ?? defaultCurrentCallProps.controlProps?.videoButtonProps?.iconSize } }
        } :
        {
            iconName: props.controlProps?.videoButtonProps?.toggleIconName ?? defaultCurrentCallProps.controlProps?.videoButtonProps?.toggleIconName,
            styles: { root: { fontSize: props.controlProps?.videoButtonProps?.iconSize ?? defaultCurrentCallProps.controlProps?.videoButtonProps?.iconSize } }
        };
    const videoOnIcon: IIconProps = props.controlProps?.videoButtonProps?.imageIconProps ?
        {
            imageProps: props.controlProps?.videoButtonProps?.imageIconProps ?? defaultCurrentCallProps.controlProps?.videoButtonProps?.imageIconProps,
            styles: { root: { fontSize: props.controlProps?.videoButtonProps?.iconSize ?? defaultCurrentCallProps.controlProps?.videoButtonProps?.iconSize } }
        } :
        {
            iconName: props.controlProps?.videoButtonProps?.iconName ?? defaultCurrentCallProps.controlProps?.videoButtonProps?.iconName,
            styles: { root: { fontSize: props.controlProps?.videoButtonProps?.iconSize ?? defaultCurrentCallProps.controlProps?.videoButtonProps?.iconSize } }
        };

    const hideVideoDialog = props.controlProps?.videoCallDisabled ?? defaultCurrentCallProps.controlProps?.videoCallDisabled;
    const hideSelfVideo = props.controlProps?.selfVideoDisabled ?? defaultCurrentCallProps.controlProps?.selfVideoDisabled;
    const hideRemoteVideo = props.controlProps?.remoteVideoDisabled ?? defaultCurrentCallProps.controlProps?.remoteVideoDisabled;
    const micOffIcon: IIconProps = props.controlProps?.micButtonProps?.imageIconProps ?
        {
            imageProps: props.controlProps?.micButtonProps?.imageIconProps ?? defaultCurrentCallProps.controlProps?.micButtonProps?.imageIconProps,
            styles: { root: { fontSize: props.controlProps?.micButtonProps?.iconSize ?? defaultCurrentCallProps.controlProps?.micButtonProps?.iconSize } }
        }
        :
        {
            iconName: props.controlProps?.micButtonProps?.iconName ?? defaultCurrentCallProps.controlProps?.micButtonProps?.iconName,
            styles: { root: { fontSize: props.controlProps?.micButtonProps?.iconSize ?? defaultCurrentCallProps.controlProps?.micButtonProps?.iconSize } }
        };

    const micOnIcon: IIconProps = props.controlProps?.micButtonProps?.imageToggleIconProps ?
        {
            imageProps: props.controlProps?.micButtonProps?.imageToggleIconProps ?? defaultCurrentCallProps.controlProps?.micButtonProps?.imageToggleIconProps,
            styles: { root: { fontSize: props.controlProps?.videoButtonProps?.iconSize ?? defaultCurrentCallProps.controlProps?.videoButtonProps?.iconSize } }
        } :
        {
            iconName: props.controlProps?.micButtonProps?.toggleIconName ?? defaultCurrentCallProps.controlProps?.micButtonProps?.toggleIconName,
            styles: { root: { fontSize: props.controlProps?.videoButtonProps?.iconSize ?? defaultCurrentCallProps.controlProps?.videoButtonProps?.iconSize } }
        };
    const [micState, { toggle: setMicState }] = useBoolean(false);

    const endCallButtonProps = Object.assign({}, defaultCurrentCallProps.controlProps?.endCallButtonProps,
        props.controlProps?.endCallButtonProps);

    const callTimerProps = Object.assign({}, defaultCurrentCallProps.controlProps?.callTimerProps,
        props.controlProps?.callTimerProps);

    const endCallButtonStyles = Object.assign({}, defaultCurrentCallProps.styleProps?.endCallButtonStyleProps,
        props.styleProps?.endCallButtonStyleProps);

    const endCallButtonHoverStyles = Object.assign({}, defaultCurrentCallProps.styleProps?.endCallButtonHoverStyleProps,
        props.styleProps?.endCallButtonHoverStyleProps);

    const remoteVideoStyles: Partial<IStackStyles> =
        { root: Object.assign({}, defaultCurrentCallProps.styleProps?.remoteVideoStyleProps, props.styleProps?.remoteVideoStyleProps) };

    let selfVideoStyles: Partial<IStackStyles> =
        { root: Object.assign({}, defaultCurrentCallProps.styleProps?.selfVideoStyleProps, props.styleProps?.selfVideoStyleProps) };

    if (hideRemoteVideo && !hideSelfVideo) {
        selfVideoStyles = { root: Object.assign({}, defaultCurrentCallProps.styleProps?.selfVideoMaximizeStyleProps, props.styleProps?.selfVideoMaximizeStyleProps) };
    }

    let videoTileStackStyles: Partial<IStackStyles>;
    if (hideVideoDialog) {
        videoTileStackStyles = { root: Object.assign({}, defaultCurrentCallProps.styleProps?.videoTileStyleProps, props.styleProps?.videoTileStyleProps) };
    } else {
        videoTileStackStyles = { root: Object.assign({}, defaultCurrentCallProps.styleProps?.videoTileStyleWithVideoProps, props.styleProps?.videoTileStyleWithVideoProps) };
    }

    const videoOffButtonStyles: IButtonStyles = {
        root: Object.assign({}, defaultCurrentCallProps.styleProps?.videoOffButtonStyleProps,
            props.styleProps?.videoOffButtonStyleProps),
        rootFocused: Object.assign({}, defaultCurrentCallProps.styleProps?.itemFocusStyleProps,
            props.styleProps?.itemFocusStyleProps)
    };

    const micOffButtonStyles: IButtonStyles = {
        root: Object.assign({}, defaultCurrentCallProps.styleProps?.micButtonStyleProps,
            props.styleProps?.micButtonStyleProps),
        rootFocused: Object.assign({}, defaultCurrentCallProps.styleProps?.itemFocusStyleProps,
            props.styleProps?.itemFocusStyleProps)
    };

    const CurrentCallItemFocusStyles = Object.assign({}, defaultCurrentCallProps.styleProps?.itemFocusStyleProps,
        props.styleProps?.itemFocusStyleProps);

    const endCallCustomEvent: ICustomEvent = {
        elementType: ElementType.CurrentCallEndCallButton,
        elementId: endCallButtonId,
        eventName: EventNames.OnClick
    };

    const handleEndCallClick = useCallback(() => {
        if (props.controlProps?.onEndCallClick) {
            props.controlProps?.onEndCallClick();
        }
    }, []);

    const handleVideoOffClick = useCallback(() => {
        if (props.controlProps?.onVideoOffClick) {
            const videoOffCustomEvent: ICustomEvent = {
                elementType: ElementType.CurrentCallVideoButton,
                elementId: videoOffButtonId,
                eventName: EventNames.OnClick
            };
            BroadcastService.postMessage(videoOffCustomEvent);
            props.controlProps?.onVideoOffClick();
        }
    }, []);

    const handleMicClick = useCallback(() => {
        setMicState();
        if (props.controlProps?.onMicCallClick) {
            const micCustomEvent: ICustomEvent = {
                elementType: ElementType.CurrentCallMicButton,
                elementId: micButtonId,
                eventName: EventNames.OnClick
            };
            BroadcastService.postMessage(micCustomEvent);
            props.controlProps?.onMicCallClick();
        }
    }, []);

    const hideCallTimer = props.controlProps?.hideCallTimer ?? defaultCurrentCallProps.controlProps?.hideCallTimer;

    useEffect(() => {
        const endCallShortcut = (e: KeyboardEvent) => e.ctrlKey && e.shiftKey && e.key === KeyCodes.EndCallHotKey;
        const toggleMicShortcut = (e: KeyboardEvent) => e.ctrlKey && e.shiftKey && e.key === KeyCodes.ToggleMicHotKey;
        const toggleVideoShortcut = (e: KeyboardEvent) => e.ctrlKey && e.shiftKey && e.key === KeyCodes.ToggleCameraHotKey;

        const shortcutKeysHandler = (e: KeyboardEvent) => {
            if (endCallShortcut(e)) {
                handleEndCallClick();
            } else if (toggleMicShortcut(e)) {
                handleMicClick();
            } else if (toggleVideoShortcut(e)) {
                handleVideoOffClick();
            }
        };

        const ignoreDefault = (e: KeyboardEvent) => {
            if (endCallShortcut(e) || toggleMicShortcut(e) || toggleVideoShortcut(e)) {
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

    return (
        <Stack className={props.styleProps?.classNames?.currentCallComponentClassName}
            horizontalAlign="space-between"
            styles={stackStyles}
            id={currentCallId}
            dir={dir}>
            <Stack styles={videoTileStackStyles}
                id={videoTileId}
                className={props.styleProps?.classNames?.videoTileGroupClassName}>
                <Stack styles={remoteVideoStyles}
                    id={remoteVideoTileId}
                    className={props.styleProps?.classNames?.remoteVideoTileClassName} />

                <Stack styles={selfVideoStyles}
                    id={selfVideoTileId}
                    className={props.styleProps?.classNames?.selfVideoTileClassName} />
            </Stack>

            <Stack horizontal
                className={props.styleProps?.classNames?.currentCallfooterClassName}
                horizontalAlign="space-between"
                styles={stackStyles}
                dir={dir}>
                <Stack horizontal id={Ids.CurrentCallLeftGroupId}
                    verticalAlign="center"
                    tokens={leftGroupStackTokens}>
                    {processCustomComponents(props.controlProps?.leftGroup?.children)}
                </Stack>
                <Stack horizontal id={Ids.CurrentCallMiddleGroupId}
                    verticalAlign="center"
                    tokens={middleGroupStackTokens}
                    dir={dir} >
                    {processCustomComponents(props.controlProps?.middleGroup?.children)}
                    {!hideCallTimer &&
                        <Timer {...callTimerProps} id={callTimerId} />
                    }
                    {!props.controlProps?.hideVideoButton &&
                        <IconButton
                            id={videoOffButtonId}
                            toggle
                            iconProps={hideSelfVideo ? videoOffIcon : videoOnIcon}
                            onClick={handleVideoOffClick}
                            allowDisabledFocus
                            disabled={props.controlProps?.videoButtonProps?.disabled}
                            styles={videoOffButtonStyles}
                            ariaLabel={hideSelfVideo ?
                                props.controlProps?.videoButtonProps?.ariaLabel ??
                                defaultCurrentCallProps.controlProps?.videoButtonProps?.ariaLabel :
                                props.controlProps?.videoButtonProps?.toggleAriaLabel ??
                                defaultCurrentCallProps.controlProps?.videoButtonProps?.toggleAriaLabel}
                            className={props.controlProps?.videoButtonProps?.className}
                            title={hideSelfVideo ?
                                props.controlProps?.videoButtonProps?.ariaLabel ??
                                defaultCurrentCallProps.controlProps?.videoButtonProps?.ariaLabel :
                                props.controlProps?.videoButtonProps?.toggleAriaLabel ??
                                defaultCurrentCallProps.controlProps?.videoButtonProps?.toggleAriaLabel}
                        />
                    }
                    {!props.controlProps?.hideMicButton &&
                        <IconButton
                            id={micButtonId}
                            toggle
                            iconProps={micState ? micOnIcon : micOffIcon}
                            onClick={handleMicClick}
                            allowDisabledFocus
                            disabled={props.controlProps?.micButtonProps?.disabled}
                            styles={micOffButtonStyles}
                            ariaLabel={micState ?
                                props.controlProps?.micButtonProps?.toggleAriaLabel ??
                                defaultCurrentCallProps.controlProps?.micButtonProps?.toggleAriaLabel :
                                props.controlProps?.micButtonProps?.ariaLabel ?? defaultCurrentCallProps.controlProps?.micButtonProps?.ariaLabel}
                            className={props.controlProps?.micButtonProps?.className}
                            title={micState ?
                                props.controlProps?.micButtonProps?.toggleAriaLabel ??
                                defaultCurrentCallProps.controlProps?.micButtonProps?.toggleAriaLabel :
                                props.controlProps?.micButtonProps?.ariaLabel ?? defaultCurrentCallProps.controlProps?.micButtonProps?.ariaLabel}
                        />
                    }
                    {!props.controlProps?.hideEndCallButton &&
                        <CommandButton
                            {...endCallButtonProps}
                            onClick={handleEndCallClick}
                            id={endCallButtonId}
                            styles={endCallButtonStyles}
                            hoverStyles={endCallButtonHoverStyles}
                            focusStyles={CurrentCallItemFocusStyles}
                            customEvent={endCallCustomEvent} />
                    }
                </Stack>
                <Stack horizontal
                    id={Ids.CurrentCallRightGroupId}
                    verticalAlign="center"
                    tokens={rightGroupStackTokens}>
                    {processCustomComponents(props.controlProps?.rightGroup?.children)}
                </Stack>
            </Stack>
        </Stack>
    );
}

export default CurrentCall;