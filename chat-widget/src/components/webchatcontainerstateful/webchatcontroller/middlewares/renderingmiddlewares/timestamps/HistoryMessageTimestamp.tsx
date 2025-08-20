import React, { Dispatch } from "react";

import { ILiveChatWidgetAction } from "../../../../../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../../../../../contexts/common/ILiveChatWidgetContext";
import { Stack } from "@fluentui/react";
import { defaultTimestampContentStyles } from "../defaultStyles/defaultTimestampContentStyles";
import { getLocaleStringFromId } from "@microsoft/omnichannel-chat-sdk";
import useChatContextStore from "../../../../../../hooks/useChatContextStore";

export const HistoryMessageTimestamp = ({ args }: any) => {
    const [state, ]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    const dir = state.domainStates.renderingMiddlewareProps?.timestampDir ?? state.domainStates.globalDir;
    const {
        activity
    } = args;
    const { timestamp } = activity;
    
    const contentStyles = {
        ...defaultTimestampContentStyles,
        ...state.domainStates.renderingMiddlewareProps?.timestampContentStyleProps
    };

    const getLocalizedTimestamp = (timestamp: string) => {
        const locale = navigator.language || "en-US";
        const currentDate = new Date(timestamp);
        return `${currentDate.toLocaleDateString(locale)} ${currentDate.toLocaleTimeString(locale)}`;
    };

    return (
        <Stack style={contentStyles} dir={dir} horizontal>
            <span> {getLocalizedTimestamp(timestamp)}</span>
        </Stack>
    )
}