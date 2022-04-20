# Telemetry

All events emitted from components library (@microsoft/omnichannel-chat-components) are of type `ICustomEvent` with below properties:

```ts
export interface ICustomEvent {
    eventName: string,
    elementType?: ElementType | any,
    elementId?: string,
    payload?: any
}

export enum ElementType {
    ChatButton = "ChatButton",
    HeaderCloseButton = "HeaderCloseButton",
    HeaderMinimizeButton = "HeaderMinimizeButton",
    FooterDownloadTranscriptButton = "FooterDownloadTranscriptButton",
    FooterEmailTranscriptButton = "FooterEmailTranscriptButton",
    FooterSoundNotificationButton = "FooterSoundNotificationButton",
    ReconnectChatContinueChatButton = "ReconnectChatContinueChatButton",
    ReconnectChatStartNewChatButton = "ReconnectChatStartNewChatButton",
    ReconnectChatPane = "ReconnectChatPane",
    ConfirmationPaneConfirmButton = "ConfirmationPaneConfirmButton",
    ConfirmationPaneCancelButton = "ConfirmationPaneCancelButton",
    PreChatSurveySubmitButton = "PreChatSurveySubmitButton",
    PreChatSurveyError = "PreChatSurveyError",
    IncomingCallDeclineCallButton = "IncomingCallDeclineCallButton",
    IncomingCallVideoCallButton = "IncomingCallVideoCallButton",
    IncomingCallAudioCallButton = "IncomingCallAudioCallButton",
    CurrentCallVideoButton = "CurrentCallVideoButton",
    CurrentCallMicButton = "CurrentCallMicButton",
    CurrentCallEndCallButton = "CurrentCallEndCallButton",
    Utility = "Utility",
    Custom = "Custom"
}
```

## BroadcastService

`BroadcastService` is a component library service used for publishing and subscribing events from/to components. All actionable controls in library emits `onClick` and `onKeyDown` by default. The service has following methods:

| methods | description | parameters |
| ------- | ----------- | ---------- |
| `postMessage` | to publish an event | Accepts [ICustomEvent](#icustomevent) as parameter
|`disposeChannel` | closes the channel | none
|`getMessageByEventName` | to subscribe to an event by string | can access `ICustomEvent` in context
|`getMessage` | to subscribe to an event filtered by `ICustomEvent` params | can access `ICustomEvent` in context
|`getAnyMessage` | to subscribe to any event | can access `ICustomEvent` in context, used for telemetry

### Publishing Event

```ts
const onClickEventName = "OnClick";
const onClickEvent: ICustomEvent = { eventName: onClickEventName }
BroadcastService.postMessage(onClickEvent);
```

### Subscribing Event

```js
//inside function component
React.useEffect(() => {
    const message : ICustomEvent = {
        elementType: ElementType.HeaderCloseButton,
        eventName: "OnClick",
        elementId: "webChatHeaderCloseButton"
    };

    const subscription = BroadcastService.getMessage(message)
        .subscribe((msg: ICustomEvent) => {
            console.log("message received: " + JSON.stringify(msg));
        });

    return () => {
        console.log("unsubscribing event");
        subscription.unsubscribe();
    };
}, []);
```

You can also bring in your own custom telemetry logger and plugin to LiveChatWidget using [IChatSDKLogger](#ichatsdklogger).

## Bring in your Custom Logger

### IChatSDKLogger

Custom loggers should implment this interface

| methods | description | parameters |
| ------- | ----------- | ---------- |
| `log(logLevel: LogLevel, telemetryInput: [TelemetryInput]) => void` | custom logger needs to provide implemention to this method for logging | [LogLevel](chat-widget\src\common\telemetry\TelemetryConstants.ts); [TelemetryInput](chat-widget\src\common\telemetry\TelemetryConstants.ts) |

### Example Usage

```js
// customConsoleLogger.ts - Implementing IChatSDKLogger
import LogLevel from "@microsoft/omnichannel-chat-sdk/lib/telemetry/LogLevel";
import { IChatSDKLogger } from "@microsoft/omnichannel-chat-widget/lib/types/common/telemetry/interfaces/IChatSDKLogger";
import { TelemetryInput } from "@microsoft/omnichannel-chat-widget/lib/types/common/telemetry/TelemetryConstants";

export const customConsoleLogger = (): IChatSDKLogger => {
    const customConsoleLogger: IChatSDKLogger = {
        log: (logLevel: LogLevel, telemetryInput: TelemetryInput): void => {
            const payload = telemetryInput?.payload && Object.keys(telemetryInput?.payload).length > 0 ? telemetryInput?.payload : "";
        try {
            switch (logLevel) {
                case LogLevel.INFO:
                    console.info("Custom Logger:", payload);
                    break;
                case LogLevel.DEBUG:
                    console.debug("Custom Logger:", payload);
                    break;
                case LogLevel.WARN:
                    console.warn("Custom Logger:", payload);
                    break;
                case LogLevel.ERROR:
                    console.error("Custom Logger:", payload);
                    break;
                default:
                    console.debug("Custom Logger:", payload);
                    break;
                }
            }
            catch (ex) {
                console.error("An unexpected error occurred in the Telemetry client: " + ex);
            }
        }
    };
    return customConsoleLogger;
};

// Injecting the logger to LiveChatWidget Prop
liveChatWidgetProps = {
    ...,
    telemetryConfig: {
        ...,
        telemetryLoggers: [customConsoleLogger()],
    },
    ...
};
```
