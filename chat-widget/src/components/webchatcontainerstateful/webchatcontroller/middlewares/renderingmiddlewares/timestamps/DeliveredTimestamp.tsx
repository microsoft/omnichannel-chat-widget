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

    return (
        <Stack style={contentStyles} dir={dir}>
            {role === DirectLineSenderRole.Bot && <>
                <span dir={dir} aria-hidden="false">{name}{" - "}{getTimestampHourMinute(timestamp)}</span>
            </>}
            {role === DirectLineSenderRole.User && <>
                <span aria-hidden="false" dir={dir}> {getTimestampHourMinute(timestamp)}{" - "}
                    {state.domainStates.middlewareLocalizedTexts?.MIDDLEWARE_MESSAGE_DELIVERED ?? defaultMiddlewareLocalizedTexts.MIDDLEWARE_MESSAGE_DELIVERED}</span>
            </>}
        </Stack>
    );
};