import botActivity from "./botActivity";

const conversationSeparator = {
    ...botActivity,
    channelData: {
        tags: ['conversation-separator'],
    },
    type: 'message'
};

export default conversationSeparator;