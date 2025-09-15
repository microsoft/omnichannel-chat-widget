import React, { Dispatch } from "react";

import { ILiveChatWidgetAction } from "../../../../../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../../../../../contexts/common/ILiveChatWidgetContext";
import { Stack } from "@fluentui/react";
import { defaultTimestampContentStyles } from "../defaultStyles/defaultTimestampContentStyles";
import useChatContextStore from "../../../../../../hooks/useChatContextStore";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const HistoryMessageTimestamp = ({ args }: any) => {
    const [state, ]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    const dir = state.domainStates.renderingMiddlewareProps?.timestampDir ?? state.domainStates.globalDir;
    const {
        activity
    } = args;
    const { timestamp } = activity;
    const { from } = activity;
    const { name, role } = from;

    console.log("LOPEZ :: Persistent history activity", activity);
    console.log("LOPEZ :: Persistent history name", name);
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
            {role === "bot" ? `${name} : ${getLocalizedTimestamp(timestamp)}` : `${getLocalizedTimestamp(timestamp)}`}
        </Stack>
    );
};