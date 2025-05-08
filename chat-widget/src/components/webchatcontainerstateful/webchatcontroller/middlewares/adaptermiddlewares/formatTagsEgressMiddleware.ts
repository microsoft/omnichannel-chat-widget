import { LogLevel, TelemetryEvent } from "../../../../../common/telemetry/TelemetryConstants";
import { TelemetryHelper } from "../../../../../common/telemetry/TelemetryHelper";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FormatEgressTagsMiddleware = () => (next: (arg0: any) => any) => (activity: any) => {
    const activity_instance = JSON.parse(JSON.stringify(activity));
    if (activity_instance) {
        if (activity_instance.channelData && activity_instance.channelData.tags) {
            const { tags } = activity_instance.channelData;
            if (typeof tags === "string") {
                return next(activity);
            }
            else if (tags instanceof Array) {
                activity_instance.channelData.tags = tags.toString();
            }
            else if (typeof activity_instance.channelData.tags === "object") {
                try {
                    activity_instance.channelData.tags = JSON.stringify(tags);
                }
                catch (exception) {
                    TelemetryHelper.logActionEvent(LogLevel.ERROR, {
                        Event: TelemetryEvent.FormatTagsMiddlewareJSONStringifyFailed,
                        ExceptionDetails: {
                            exception: exception
                        }
                    });
                }
            }
        }
    }
    return next(activity_instance);
};

export default FormatEgressTagsMiddleware;