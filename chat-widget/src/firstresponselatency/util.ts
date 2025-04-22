import { Constants } from "../common/Constants";
import { IActivity } from "botframework-directlinejs";

export const isHistoryMessage = (activity: IActivity, startTime : number) => {
    try {
        if (activity?.type === Constants.message) {
            // this is an old piece of code, probably no longer relevant
            if (activity?.channelData?.tags?.includes(Constants.historyMessageTag)) return true;

            // Id is an epoch time in milliseconds , in utc format, for some reason is in a string format
            if (activity?.id) {
                /// activity.id is an string that contains epoch time in milliseconds
                const activityId = parseInt(activity?.id);

                // if the activity id is less than the start time, it means that the message is a history message
                if (activityId < startTime) {
                    return true;
                }
                // anything else will be considered a new message
                return false;
            }
            return false;
        }
    } catch (e) {
        // if there is an error in parsing the activity id, we will consider it a new message
        return false;
    }
    return false;
};