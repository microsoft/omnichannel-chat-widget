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

    // Create a simple separator that screen readers can detect without being interactive
    // Preserve the visual divider styling while making it accessible
    // Use a ref to programmatically remove only the "EL said:" prefix from the label
    const dividerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (dividerRef.current) {
            // Find and hardcode the text in the label div to just show the divider label
            const article = dividerRef.current.closest(".webchat__basic-transcript__activity");
            if (article) {
                const labelDiv = article.querySelector("div[id*=\"webchat__basic-transcript__active-descendant-label--\"]");
                if (labelDiv) {
                    // Hardcode the text to just the aria label
                    (labelDiv as HTMLElement).textContent = ariaLabel || "";
                }
            }
        }
    }, [ariaLabel]);

    return (
        <div
            ref={dividerRef}
            role="separator"
            aria-label={ariaLabel}
            aria-hidden={false}
            className={styleApplied}
            data-accessibility-divider="true"
            style={{ 
                // Add accessibility enhancements
                position: "relative"
            }}
        />
    );
};
export default ConversationDividerActivity;