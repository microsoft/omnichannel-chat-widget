import React, { Dispatch } from "react";

import { ILiveChatWidgetAction } from "../../../../../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../../../../../contexts/common/ILiveChatWidgetContext";
import { Stack } from "@fluentui/react";
import { defaultMiddlewareLocalizedTexts } from "../../../../common/defaultProps/defaultMiddlewareLocalizedTexts";
import { defaultTimestampContentStyles } from "../defaultStyles/defaultTimestampContentStyles";
import { getTimestampHourMinute } from "../../../../../../common/utils";
import { useChatContextStore } from "../../../../../..";

/* eslint @typescript-eslint/no-explicit-any: "off" */
export const SendingTimestamp = ({ args }: any) => {

    const [state, ]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    const dir = state.domainStates.renderingMiddlewareProps?.timestampDir ?? state.domainStates.globalDir;
    const contentStyles = {
        ...defaultTimestampContentStyles,
        ...state.domainStates.renderingMiddlewareProps?.timestampContentStyleProps
    };

    const {
        activity: {
            timestamp
        }
    } = args;

    return (
        <Stack style={contentStyles} dir={dir} horizontal>
            <span> {getTimestampHourMinute(timestamp)}</span>
            <span> &nbsp;-&nbsp; </span>
            <span> {state.domainStates.middlewareLocalizedTexts?.MIDDLEWARE_MESSAGE_SENDING ?? defaultMiddlewareLocalizedTexts.MIDDLEWARE_MESSAGE_SENDING} </span>
        </Stack>
    );
};