/******
 * AvatarMiddleware
 * 
 * This middleware handles the avatar icon for each non-system message. It does the following processing:
 * 1. Renders the first two letters of the sender as the profile pic
 ******/

import React from "react";

import { Constants } from "../../../../../common/Constants";
import { defaultAvatarStyles } from "./defaultStyles/defaultAvatarStyles";
import { defaultAvatarTextStyles } from "./defaultStyles/defaultAvatarTextStyles";
import { getIconText } from "../../../../../common/utils";

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
export const createAvatarMiddleware = (avatarStyleProps?: React.CSSProperties, avatarTextStyleProps?: React.CSSProperties) => () => (next: any) => (...args: [any]) => {
    const [params] = args;
    const {
        activity: {
            channelData: {
                tags
            },
            from: {
                name
            }
        },
        fromUser
    } = params;
    if (fromUser !== false || tags && tags.includes(Constants.systemMessageTag)) {
        return false;
    }

    const avatarStyles = {...defaultAvatarStyles, ...avatarStyleProps};
    const avatarTextStyles = {...defaultAvatarTextStyles, ...avatarTextStyleProps};
    // eslint-disable-next-line react/display-name
    return () => (
        <div style={avatarStyles}>
            <p style={avatarTextStyles}> {getIconText(name)} </p>
        </div>
    );
};