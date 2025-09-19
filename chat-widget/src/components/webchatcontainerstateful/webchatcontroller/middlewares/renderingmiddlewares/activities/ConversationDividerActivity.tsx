import { IPersistentChatHistoryProps } from "../../../../../livechatwidget/interfaces/IPersistentChatHistoryProps";
import React from "react";
import { defaultPersistentChatHistoryProps } from "../../../../../livechatwidget/common/defaultProps/defaultPersistentChatHistoryProps";
import { mergeStyles } from "@fluentui/react";

const ConversationDividerActivity = (props: IPersistentChatHistoryProps) => {
    const styleApplied = mergeStyles(
        defaultPersistentChatHistoryProps.dividerActivityStyle,
        props.dividerActivityStyle
    );
    
    return <div className={styleApplied} />;
};
export default ConversationDividerActivity;