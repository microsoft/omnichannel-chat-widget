import { ChatAdapterShim } from "../../../common/ShimAdapter/ChatShimAdapter";


export const createChatAdapterShim = async (chatAdapter : any) => {
    return new ChatAdapterShim(chatAdapter);
};