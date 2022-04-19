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
            {role === DirectLineSenderRole.Bot && <span aria-hidden="false">{name}</span>}
            {role === DirectLineSenderRole.Bot && <span> &nbsp;-&nbsp; </span>}
            <span dir={dir}> {getTimestampHourMinute(timestamp)}</span>
            {role === DirectLineSenderRole.User && <span> &nbsp;-&nbsp; </span>}
            {role === DirectLineSenderRole.User && <span aria-hidden="false">{state.domainStates.middlewareLocalizedTexts?.MIDDLEWARE_MESSAGE_DELIVERED ?? defaultMiddlewareLocalizedTexts.MIDDLEWARE_MESSAGE_DELIVERED}</span>}
        </Stack>
    );
};