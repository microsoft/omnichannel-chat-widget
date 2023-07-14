import { LogLevel, TelemetryEvent } from "../common/telemetry/TelemetryConstants";

import { TelemetryHelper } from "../common/telemetry/TelemetryHelper";
import useChatSDKStore from "./useChatSDKStore";

const useForceEndChat = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chatSDK: any = useChatSDKStore();
    const forceEndChat = () => {
        TelemetryHelper.logLoadingEvent(LogLevel.ERROR, {
            Event: TelemetryEvent.WidgetLoadFailed,
            ExceptionDetails: {
                Exception: "SessionInit was successful, but widget load failed."
            }
        });
        chatSDK?.endChat();
    };
    return forceEndChat;
};

export default useForceEndChat;