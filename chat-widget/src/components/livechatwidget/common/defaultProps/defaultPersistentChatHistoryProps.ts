import { IPersistentChatHistoryProps } from "../../interfaces/IPersistentChatHistoryProps";

export const defaultPersistentChatHistoryProps: IPersistentChatHistoryProps = {
    pageSize: 4,
    dividerActivityStyle: {
        border: "1px solid rgb(96, 94, 92, 0.5)",
        margin: "10px 20%"
    },
    bannerStyle: {
        margin: "10px auto"
    }
};