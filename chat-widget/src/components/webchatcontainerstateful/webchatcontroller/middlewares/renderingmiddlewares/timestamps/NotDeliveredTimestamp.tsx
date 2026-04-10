/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { Dispatch, useCallback, useEffect, useRef } from "react";

import { ILiveChatWidgetAction } from "../../../../../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../../../../../contexts/common/ILiveChatWidgetContext";
import { Stack } from "@fluentui/react";
import { defaultMiddlewareLocalizedTexts } from "../../../../common/defaultProps/defaultMiddlewareLocalizedTexts";
import { defaultTimestampContentStyles } from "../defaultStyles/defaultTimestampContentStyles";
import { defaultTimestampFailedStyles } from "../defaultStyles/defaultTimestampFailedStyles";
import { defaultTimestampRetryStyles } from "../defaultStyles/defaultTimestampRetryStyles";
import { getTimestampHourMinute } from "../../../../../../common/utils";
import { hooks } from "botframework-webchat";
import useChatContextStore from "../../../../../../hooks/useChatContextStore";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const NotDeliveredTimestamp = ({ args }: any) => {
    const timestampRef = useRef();

    const { useFocus, usePostActivity } = hooks;
    const focus = useFocus();
    const postActivity = usePostActivity();
    const {
        activity
    } = args;
    const { timestamp } = activity;

    const [state, ]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    const dir = state.domainStates.renderingMiddlewareProps?.timestampDir ?? state.domainStates.globalDir;
    const contentStyles = {
        ...defaultTimestampContentStyles,
        ...state.domainStates.renderingMiddlewareProps?.timestampContentStyleProps
    };
    const failedTextStyles = {
        ...defaultTimestampFailedStyles,
        ...state.domainStates.renderingMiddlewareProps?.timestampFailedTextStyleProps
    };
    const retryTextStyles = {
        ...defaultTimestampRetryStyles,
        ...state.domainStates.renderingMiddlewareProps?.timestampRetryTextStyleProps
    };

    useEffect(() => {
        const timestampWebChatNodes = (timestampRef?.current as any)?.childNodes;
        if (timestampWebChatNodes?.length > 1) {
            (timestampWebChatNodes[1] as HTMLSpanElement).innerText = getTimestampHourMinute(timestamp);
        }
    }, [timestampRef]);

    const onRetryClick = useCallback(async () => {
        activity.previousClientActivityID = activity.channelData?.clientActivityID;
        await postActivity(activity);
        focus("sendBox");
    }, [activity, focus, postActivity]);

    return (
        <Stack style={contentStyles} dir={dir} horizontal>
            <span> {getTimestampHourMinute(timestamp)}</span>
            <span> &nbsp;-&nbsp; </span>
            <span style={failedTextStyles}> {state.domainStates.middlewareLocalizedTexts?.MIDDLEWARE_MESSAGE_NOT_DELIVERED ?? defaultMiddlewareLocalizedTexts.MIDDLEWARE_MESSAGE_NOT_DELIVERED} </span>
            <span> &nbsp;-&nbsp; </span>
            <button
                style={retryTextStyles}
                onClick={onRetryClick}
            >
                {
                    state.domainStates.middlewareLocalizedTexts?.MIDDLEWARE_MESSAGE_RETRY ??
                    defaultMiddlewareLocalizedTexts.MIDDLEWARE_MESSAGE_RETRY
                }
            </button>
        </Stack>
    );
};