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
import { defaultAriaConfig } from "./defaultConfigs/defaultAriaConfig";
import { TelemetryHelper } from "./TelemetryHelper";

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
        if (TelemetryManager.InternalTelemetryData?.telemetryConfig?.disableConsoleLog === false ||
            TelemetryManager.InternalTelemetryData?.telemetryConfig?.telemetryDisabled === false) {
            BroadcastService.getAnyMessage()
                .subscribe((event: ICustomEvent) => {
                    if ((event as ITelemetryEvent).payload && ((event as ITelemetryEvent).eventName in TelemetryEvent)) {
                        logTelemetry(event);
                    }
                });
        }

        if (TelemetryManager.InternalTelemetryData?.telemetryConfig?.disableConsoleLog === false) {
            loggers.push(consoleLogger());
        }

        if (TelemetryManager.InternalTelemetryData?.telemetryConfig?.telemetryDisabled === false) {
            if (TelemetryManager.InternalTelemetryData?.ariaConfig) {
                loggers.push(ariaTelemetryLogger(
                    TelemetryManager.InternalTelemetryData?.ariaConfig?.ariaTelemetryKey ?? (defaultAriaConfig.ariaTelemetryKey as string),
                    TelemetryManager.InternalTelemetryData?.ariaConfig?.disableCookieUsage ?? (defaultAriaConfig.disableCookieUsage as boolean),
                    TelemetryManager.InternalTelemetryData?.ariaConfig?.collectorUriForTelemetry ?? (defaultAriaConfig.collectorUriForTelemetry as string),
                    TelemetryManager.InternalTelemetryData?.ariaConfig?.ariaTelemetryApplicationName ?? (defaultAriaConfig.ariaTelemetryApplicationName as string)));
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
            const scenarioType = (telemetryEvent as ITelemetryEvent).payload?.scenarioType ?? ScenarioType.UNDEFINED;
            const telemetryInput = parseInput(telemetryEvent?.payload, scenarioType);
            telemetryInput.telemetryInfo = { telemetryInfo: TelemetryHelper.buildTelemetryEvent(logLevel, telemetryInput) };
            //Do not log events without an Event Name
            if (telemetryInput?.payload?.Event) {
                logger.log(logLevel, telemetryInput);
            }
        });
    };
    return registerLoggers();
};