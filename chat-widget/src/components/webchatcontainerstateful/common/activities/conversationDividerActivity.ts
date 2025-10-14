import { Constants } from "../../../../common/Constants";
import botActivity from "./botActivity";

const conversationDividerActivity = {
    ...botActivity,
    channelData: {
        tags: [Constants.conversationDividerTag],
    }
};

export default conversationDividerActivity;