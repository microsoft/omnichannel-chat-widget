import { Md5 } from "md5-typescript";

export const getWidgetCacheId = (widgetId: string, widgetinstanceId: string, orgId: string): string => {
    const widgetCacheId = `${widgetinstanceId}_${orgId}_${widgetId}`;
    return Md5.init(widgetCacheId);
};