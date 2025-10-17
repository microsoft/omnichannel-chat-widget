import { IPersistentChatHistoryProps } from "../../../../../livechatwidget/interfaces/IPersistentChatHistoryProps";
import React from "react";
import { defaultMiddlewareLocalizedTexts } from "../../../../common/defaultProps/defaultMiddlewareLocalizedTexts";
import { defaultPersistentChatHistoryProps } from "../../../../../livechatwidget/common/defaultProps/defaultPersistentChatHistoryProps";
import { mergeStyles } from "@fluentui/react";

const ConversationDividerActivity = (props: IPersistentChatHistoryProps) => {
    const styleApplied = mergeStyles(
        defaultPersistentChatHistoryProps.dividerActivityStyle,
        props.dividerActivityStyle
    );

    const ariaLabel = props.dividerActivityAriaLabel
        || defaultMiddlewareLocalizedTexts.CONVERSATION_DIVIDER_ARIA_LABEL;

    // Using role="separator" to ensure screen readers announce a meaningful role.
    // Providing an aria-label so it isn't announced with unrelated surrounding text like "WC said:".
    return (
        <div
            role="separator"
            aria-label={ariaLabel}
            aria-hidden={false}
            className={styleApplied}
        />
    );
};
export default ConversationDividerActivity;