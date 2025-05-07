/******
 * GroupActivitiesMiddleware
 * 
 * This middleware controls which messages are grouped together regarding to timestamps. It does the following processing:
 * 1. Distinguishes different messages by sender name and whether it is a system message
 ******/

import { Constants } from "../../../../../common/Constants";

function bin<T>(items: T[], grouping: (last: T, current: T) => boolean): T[][] {
    let lastBin: T[];
    const bins: T[][] = [];
    let lastItem: T;
    if (items.length > 0) {
        items.forEach(item => {
            if (lastItem && grouping(lastItem, item)) {
                lastBin.push(item);
            } else {
                lastBin = [item];
                bins.push(lastBin);
            }
            lastItem = item;
        });
    }
    return bins;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
export const groupActivitiesMiddleware = () => (next: any) => (args: any) => {
    const {
        activities
    } = args;

    if (activities != null && activities.length > 0) {
        const { status } = next({ activities });
        return {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            sender: bin(activities, (x: any, y: any) => {
                const roleX = (x.channelData && x.channelData.tags) ? x.channelData.tags.includes(Constants.systemMessageTag) ? Constants.systemMessageTag : x.from.name : x.from.name;
                const roleY = (y.channelData && y.channelData.tags) ? y.channelData.tags.includes(Constants.systemMessageTag) ? Constants.systemMessageTag : y.from.name : y.from.name;
                return roleX === roleY;
            }),
            status
        };
    }
    else {
        return () => false;
    }
};