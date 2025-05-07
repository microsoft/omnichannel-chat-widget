import { Constants, WebChatMiddlewareConstants } from "../../../../../common/Constants";

import { DeliveredTimestamp } from "./timestamps/DeliveredTimestamp";
import { NotDeliveredTimestamp } from "./timestamps/NotDeliveredTimestamp";
import React from "react";
import { SendStatus } from "../../enums/SendStatus";
import { SendingTimestamp } from "./timestamps/SendingTimestamp";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, react/display-name, @typescript-eslint/no-unused-vars
export const activityStatusMiddleware = () => (next: any) => (args: any) => {
    const {
        activity: {
            channelData: {
                tags
            },
            from: {
                name,
                role
            },
            timestamp
        },
        sendState,
        sameTimestampGroup
    } = args;

    const current_tags = tags, current_name = name, current_role = role, current_timestamp = timestamp;
    let sameTimestampGroupTemp: boolean = sameTimestampGroup;
    if (args[WebChatMiddlewareConstants.nextVisibleActivity]) {
        const {
            nextVisibleActivity: {
                from: {
                    name
                },
                timestamp
            }
        } = args;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const next_name = name, next_timestamp = timestamp;
        const timestampCurrentInMillisecond = Date.parse(current_timestamp);
        const timestampNextInMillisecond = Date.parse(next_timestamp);
        if (current_name !== next_name || timestampNextInMillisecond - timestampCurrentInMillisecond > WebChatMiddlewareConstants.timeBetweenTimestampGroups) {
            sameTimestampGroupTemp = false;
        }
    }
    
    if (current_tags && current_tags.includes(Constants.systemMessageTag) || (sameTimestampGroupTemp && sendState === SendStatus.Sent)) {
        return;
    } else {
        return (
            <span style={{padding: "2px"}}>
                {sendState === SendStatus.Sending && <SendingTimestamp/>}
                {sendState === SendStatus.SendFailed && <NotDeliveredTimestamp args={args}/>}
                {sendState === SendStatus.Sent && <DeliveredTimestamp args={args} role={current_role} name={current_name} />}
            </span>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ) as any;
    }
};