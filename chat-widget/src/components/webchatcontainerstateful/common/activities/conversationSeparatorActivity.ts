import botActivity from "./botActivity";

const conversationSeparator = {
    ...botActivity,
    channelData: {
        tags: ['conversation-separator'],
    }
};

export default conversationSeparator;