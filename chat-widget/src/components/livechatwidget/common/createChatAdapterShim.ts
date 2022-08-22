import { ChatAdapterShim } from "../../../common/ShimAdapter/ChatShimAdapter";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createChatAdapterShim = async (chatAdapter : any) => {
    return new ChatAdapterShim(chatAdapter);
};