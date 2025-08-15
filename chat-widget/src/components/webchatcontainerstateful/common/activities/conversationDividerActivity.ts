import botActivity from "./botActivity";

const conversationDividerActivity = {
    ...botActivity,
    channelData: {
        tags: ['conversation-divider'],
    }
};

export default conversationDividerActivity;