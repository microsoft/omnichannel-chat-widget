import { LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";

import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const initCallingSdk = async (chatSDK: any, setVoiceVideoCallingSDK: any): Promise<boolean> => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((chatSDK as any).getVoiceVideoCalling) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const callingSDK = await (chatSDK as any).getVoiceVideoCalling();
            setVoiceVideoCallingSDK(callingSDK);
            return true;
        }
        return false;
    } catch (error) {
        if (error !== "Voice and video call is not enabled") {
            TelemetryHelper.logCallingEvent(LogLevel.ERROR, {
                Event: TelemetryEvent.CallingSDKLoadFailed,
                ExceptionDetails: {
                    exception: error
                }
            });
        }
        return false;
    }
};