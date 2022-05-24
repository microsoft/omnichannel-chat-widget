import { LogLevel, ScenarioType, TelemetryConstants, TelemetryEvent, TelemetryInput } from "./TelemetryConstants";

import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { IChatSDKLogger } from "./interfaces/IChatSDKLogger";
import { ICustomEvent } from "@microsoft/omnichannel-chat-components/lib/types/interfaces/ICustomEvent";
import { IInternalTelemetryData } from "./interfaces/IInternalTelemetryData";
import { ITelemetryEvent } from "./interfaces/ITelemetryEvents";
import { ITimer } from "../interfaces/ITimer";
import { TelemetryData } from "./definitions/Payload";
import { ariaTelemetryLogger } from "./loggers/ariaTelemetryLogger";
import { consoleLogger } from "./loggers/consoleLogger";

export class TelemetryTimers {
    public static LcwLoadToChatButtonTimer: ITimer;
    public static ProactiveChatScreenTimer: ITimer;
    public static WidgetLoadTimer: ITimer;
}

export class TelemetryManager {
    public static InternalTelemetryData: IInternalTelemetryData;
}
const loggers: IChatSDKLogger[] = [];

export const disposeLoggers = () => {
    loggers.map((logger: IChatSDKLogger) => {
        logger.dispose();
    });
};

export const RegisterLoggers = () => {
    const registerLoggers = () => {
        if (!TelemetryManager.InternalTelemetryData?.telemetryConfig?.disableConsoleLog ||
            !TelemetryManager.InternalTelemetryData?.telemetryConfig?.telemetryDisabled) {
            BroadcastService.getAnyMessage()
                .subscribe((event: ICustomEvent) => {
                    if ((event as ITelemetryEvent).payload && ((event as ITelemetryEvent).eventName in TelemetryEvent)) {
                        logTelemetry(event);
                    }
                });
        }

        if (!TelemetryManager.InternalTelemetryData?.telemetryConfig?.disableConsoleLog) {
            loggers.push(consoleLogger());
        }

        if (!TelemetryManager.InternalTelemetryData?.telemetryConfig?.telemetryDisabled) {
            if (TelemetryManager.InternalTelemetryData?.ariaConfig) {
                loggers.push(ariaTelemetryLogger(
                    TelemetryManager.InternalTelemetryData?.ariaConfig?.ariaTelemetryKey ?? "",
                    TelemetryManager.InternalTelemetryData?.ariaConfig?.disableCookieUsage ?? false,
                    TelemetryManager.InternalTelemetryData?.ariaConfig?.collectorUriForTelemetry ?? "",
                    TelemetryManager.InternalTelemetryData?.ariaConfig?.ariaTelemetryApplicationName ?? "OmniChannelProd_Web"));
            }

            const customLoggers = TelemetryManager.InternalTelemetryData?.telemetryConfig?.telemetryLoggers;
            if (customLoggers) {
                customLoggers.map((logger: IChatSDKLogger) => {
                    loggers.push(logger);
                });
            }
        }
    };

    const parseInput = (payload: TelemetryData, scenarioType: ScenarioType = ScenarioType.UNDEFINED): TelemetryInput => {
        return {
            scenarioType: (scenarioType == ScenarioType.UNDEFINED) ?
                TelemetryConstants.mapEventToScenario(payload.Event as TelemetryEvent) : scenarioType,
            payload: payload
        };
    };

    const logTelemetry = (telemetryEvent: ICustomEvent) => {
        loggers.map((logger: IChatSDKLogger) => {
            const logLevel = (telemetryEvent as ITelemetryEvent).logLevel ?? LogLevel.INFO;
            logger.log(logLevel, parseInput(telemetryEvent?.payload));
        });
    };
    return registerLoggers();
};