import React, { Dispatch } from "react";

import { DirectLineSenderRole } from "../../../enums/DirectLineSenderRole";
import { ILiveChatWidgetAction } from "../../../../../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../../../../../contexts/common/ILiveChatWidgetContext";
import { Stack } from "@fluentui/react";
import { defaultMiddlewareLocalizedTexts } from "../../../../common/defaultProps/defaultMiddlewareLocalizedTexts";
import { defaultTimestampContentStyles } from "../defaultStyles/defaultTimestampContentStyles";
import { getTimestampHourMinute } from "../../../../../../common/utils";
import { useChatContextStore } from "../../../../../..";

/* eslint @typescript-eslint/no-explicit-any: "off" */
export const DeliveredTimestamp = ({ args, role, name }: any) => {

    const [state,]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
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

    const getTimeElement = (timestamp: string): string | JSX.Element => {
        const timeString = getTimestampHourMinute(timestamp);
        const isAmPmFormat = timeString.toLowerCase().includes("am") || timeString.toLowerCase().includes("pm");

        // For clients that use languages that are written right-to-left, but still use AM/PM time format, we need to
        // make sure the "rtl" direction doesn't produce "PM 1:23", but remains "1:23 PM"
        if (dir === "rtl" && isAmPmFormat) {
            return <span dir="ltr">{getTimestampHourMinute(timestamp)}</span>;
        } else {
            return <span dir={dir}>{getTimestampHourMinute(timestamp)}</span>;
        }

        return timeString;
    };

    return (
        <Stack style={contentStyles} dir={dir}>
            {role === DirectLineSenderRole.Bot && <>
                <span dir={dir} aria-hidden="false">{name}{" - "}{getTimeElement(timestamp)}</span>
            </>}
            {role === DirectLineSenderRole.User && <>
                <span aria-hidden="false" dir={dir}> {getTimeElement(timestamp)}{" - "}
                    {state.domainStates.middlewareLocalizedTexts?.MIDDLEWARE_MESSAGE_DELIVERED ?? defaultMiddlewareLocalizedTexts.MIDDLEWARE_MESSAGE_DELIVERED}</span>
            </>}
        </Stack>
    );
};