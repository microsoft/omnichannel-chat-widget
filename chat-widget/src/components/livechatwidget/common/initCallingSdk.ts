import { LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";

import { FacadeChatSDK } from "../../../common/facades/FacadeChatSDK";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const initCallingSdk = async (facadeChatSDK: FacadeChatSDK, setVoiceVideoCallingSDK: any): Promise<boolean> => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((facadeChatSDK.getChatSDK() as any).getVoiceVideoCalling) {
            
            const callingSDK = await facadeChatSDK.getVoiceVideoCalling();
            setVoiceVideoCallingSDK(callingSDK);
            TelemetryHelper.logCallingEvent(LogLevel.INFO, {
                Event: TelemetryEvent.CallingSDKLoadSuccess
            });
            return true;
        }
        return false;
    } catch (error) {
        TelemetryHelper.logCallingEvent(LogLevel.ERROR, {
            Event: TelemetryEvent.CallingSDKLoadFailed,
            ExceptionDetails: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                exception: (error as any).message
            }
        });
        return false;
    }
};