import React, { Dispatch } from "react";

import { ILiveChatWidgetAction } from "../../../../../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../../../../../contexts/common/ILiveChatWidgetContext";
import { Stack } from "@fluentui/react";
import { defaultMiddlewareLocalizedTexts } from "../../../../common/defaultProps/defaultMiddlewareLocalizedTexts";
import { defaultTimestampContentStyles } from "../defaultStyles/defaultTimestampContentStyles";
import { getTimestampHourMinute } from "../../../../../../common/utils";
import useChatContextStore from "../../../../../../hooks/useChatContextStore";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const HistoryMessageTimestamp = ({ args }: any) => {
    const [state,]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    const dir = state.domainStates.renderingMiddlewareProps?.timestampDir ?? state.domainStates.globalDir;
    const {
        activity: {
            timestamp,
            from: { name, role }
        }
    } = args;

    const contentStyles = {
        ...defaultTimestampContentStyles,
        ...state.domainStates.renderingMiddlewareProps?.timestampContentStyleProps
    };

    const getTimeElement = (timestamp: string): string | JSX.Element => {
        const timeString = getTimestampHourMinute(timestamp);
        const isAmPmFormat = timeString.toLowerCase().includes("am") || timeString.toLowerCase().includes("pm");

        if (dir === "rtl" && isAmPmFormat) {
            return <span dir="ltr">{getTimestampHourMinute(timestamp)}</span>;
        } else {
            return <span dir={dir}>{getTimestampHourMinute(timestamp)}</span>;
        }
    };


    console.log(
        "LOPEZ :: HistoryMessageTimestamp", { name, role, timestamp }
    );
    return (
        <Stack style={contentStyles} dir={dir}>
            {role === "bot" && <>
                <span dir={dir} aria-hidden="false">{name} : {getTimeElement(timestamp)}</span>
            </>}
            {role === "user" && <>
                <span aria-hidden="false" dir={dir}> {getTimeElement(timestamp)}{" - "}
                    {state.domainStates.middlewareLocalizedTexts?.MIDDLEWARE_MESSAGE_DELIVERED ?? defaultMiddlewareLocalizedTexts.MIDDLEWARE_MESSAGE_DELIVERED}</span>            </>}
        </Stack>
    );
};