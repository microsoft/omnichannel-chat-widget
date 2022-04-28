# Telemetry

Omnichannel's Live Chat Widget collects telemetry data to improve reliability and performance over time by helping Microsoft to understand the usage patterns and troubleshoot.

## Setup

The widget supports logging telemetry data to `aria` and `console` as default loggers. However, both of these default telemetry loggers can be controlled by passing [`ITelemetryConfig`](#itelemetryconfig) telemetry configuration property to `LiveChatWidget`:

```ts
const liveChatWidgetProps = {
    ...liveChatWidgetProps,
    ...
    telemetryConfig: {
        ...
        telemetryDisabled : true,
        disableConsoleLog: true,
        ...
    }
};
...
<LiveChatWidget {...liveChatWidgetProps}/>
```

### *ITelemetryConfig*

| Properties |Type| Description |
| -------- |---------| -------- |
| `appId`     | `string` (optional)     |App Id for the chat widget
|`orgId`|`string` (optional)|Omnichannel Org Id|
|`orgUrl`|`string` (optional)|Omnichannel Org Url|
|`telemetryDisabled`|`boolean` (optional)|`true` for disabling default `aria` telemetry|
|`disableConsoleLog`|`boolean` (optional)|`true` for disabling the console telemetry logs|
|`ariaConfigurations`|`IAriaConfigurations` (optional)|Complex type for accepting aria related configurations|
|`telemetryLoggers`|`IChatSDKLogger` (optional)|Logger type for bringing your own logger|
|`chatWidgetVersion`| `string` (optional) | Omnichannel Chat Widget package version number|
|`chatComponentVersion`| `string` (optional) | Omnichannel Chat Components package version number|
|`OCChatSDKVersion`| `string` (optional) | Omnichannel Chat SDK version number|

### *IAriaConfigurations*

| Properties |Type| Description |
| -------- |---------| -------- |
| `collectorUriForTelemetry`     | `string` (optional)     |Indicates the endpoint to store telemetry data
|`ariaTelemetryKey`|`string` (optional)|Telemetry key to use for logging|
|`ariaTelemetryApplicationName`|`string` (optional)|Aria database name for logging|
|`disableCookieUsage`|`boolean` (optional)|Disable cookie usage, default value `true`|

## Events

Events in the widget are categorized as Telemetry events and pub-sub events. Telemetry events are used for logging telemetry data, whereas pub-sub events are used for message communications which are usually emitted from the widget for customers to provide additional functionality when such events occur.

### Telemetry Events

Refer to the below table to understand different critical telemetry events raised during the lifetime of the chat widget. These events have been further categorized as `Load`, `Configuration`, `Actions`, `SDK`, and `Calling` events.

#### Load Events

| Event Name | Scenario |
| -------- | -------- |
| `WebChatLoaded`     | On `WebChatContainer` load complete |
| `WidgetLoadComplete`     |On Chat Widget load complete |
| `WidgetLoadFailed`     |On Chat Widget load failure |
| `IncomingProactiveChatScreenLoaded` |On Proactive chat load complete |
| `LCWChatButtonShow`     |On Start button show complete |
| `PrechatSurveyLoaded`   |On `PreChatSurvey` load complete |
| `LoadingPaneLoaded`     |On `LoadingPane` load complete |
| `PostChatSurveyLoaded`  |On `PostChatSurvey` load complete |
| `EmailTranscriptLoaded` |On Email transcript pane load complete |
| `OutOfOfficePaneLoaded` |On Out of office pane load complete |
| `ConfirmationPaneLoaded`|On `ConfirmationPane` load complete |
| `ProactiveChatPaneLoaded`|On `PropactiveChatPane` load complete|
| `StartChatSDKCall`| On initiating start chat SDK call|

#### Action Events

| Event Name| Scenario |
| -------- | -------- |
| `PrechatSubmitted`     |On PreChat survey Submit button click |
| `LCWChatButtonClicked`  |On Start Chat button click |
| `ProactiveChatAccepted` |On Proactive chat Start Chat button click |
| `ProactiveChatRejected` |On Proactive chat invitation time out |
| `ProactiveChatClosed`   |On Proactive chat closed |
| `ProcessingHTMLTextMiddlewareFailed`     |On HTML Field sanitization failed |
| `DataMaskingRuleApplied`     |On data masking regex rule applied failed error |
| `ConversationEndedThreadEventReceived`     |On Conversation ended by agent side or by timeout |
| `InvalidConfiguration`     |On Invalid data masking regex rule collection |
| `DownloadTranscriptResponseNullOrUndefined`     |On downloading transcript response exception |
| `EmailTranscriptSent`     |On transcript sent to email successfully |
|`EmailTranscriptFailed`|On transcript sent to email failure|
|`DownloadTranscriptFailed`|On download transcript failed|
|`IC3ThreadUpdateEventReceived`|On `IC3 ThreadUpdateEvent` Received|
|`ConfirmationCancelButtonClicked`|On confirmation pane Cancel button clicked|
|`ConfirmationConfirmButtonClicked`|On confirmation pane Confirm button clicked|
|`PreChatSurveyStartChatMethodFailed`|On Pre-Chat survey submit failed|
|`HeaderCloseButtonClicked`|On Header Close button clicked|
|`HeaderMinimizeButtonClicked`|On Header Minimize button clicked|

#### Calling Events

| Event Name | Scenario |
| -------- |-------- |
| `VideoCallAcceptButtonClick`      |On accepting call with video on |
| `CallAdded`     |      On receiving incoming call |
| `LocalVideoStreamAdded`     |      On local video stream added |
| `LocalVideoStreamRemoved`     |      On local video stream removed |
| `RemoteVideoStreamAdded`     |      On remote video stream added |
| `RemoteVideoStreamRemoved`     |      On remote video stream removed |
| `CallDisconnected`     |      On call disconnected successfully  |
| `CallDisconnectedException`     |      On call disconnected exception |
| `IncomingCallEnded`           |On incoming call reject button clicked |
| `VoiceVideoInitialize`     |      On video and voice calling SDK initialization |
| `VoiceVideoInitializeException`           |On exception while video and voice calling SDK initialization |
|`VoiceVideoAcceptCallException`|On failed to accept call without video|
|`VoiceVideoAcceptCallWithVideoException`|On failed to accept call with video|
|`VoiceCallAcceptButtonClick`|On accepting incoming call without video|
|`CallRejectClick`|On declining incoming call|
|`CallRejectClickException`|On exception while declining incoming call|
|`ToggleMuteButtonClick`|On mic button toggling|
|`ToggleMuteButtonClickException`|On mic button toggling exception|
|`ToggleCameraButtonClick`|On Camera button toggling|
|`ToggleCameraButtonClickException`|On Camera button toggling exception|
|`EndCallButtonClick`|On ending ongoing call|
|`EndCallButtonClickException`|On ending ongoing call exception|
|`CallingSDKLoadSuccess`|On Calling SDK load successful|
|`CallingSDKLoadFailed`|On Calling SDK load failed|

#### Chat SDK Events

| Event Name | Scenario |
| -------- | -------- |
|`StartChatMethodException`|On failed to start chat|
|`CloseChatMethodException`|On failed to end chat from `ConfirmationPane` Confirm button click|
|`GetConversationDetailsCallFailed`|On `PropactiveChatPane` load complete|
|`EndChatSDKCallFailed`|On ChatSDK end chat failure|
|`PostChatContextCallFailed`|On `ChatSDK` post chat context failure|
|`PostChatContextCallSucceed`|On `ChatSDK` post chat context load success|

#### Configuration Events

| Event Name | Scenario |
| -------- |-------- |
|`ParseAdaptiveCardFailed`|On parsing adaptive card failure|

## Bring Your Own Logger

Customized LCW provides a way to inject your own custom logger to Live Chat Widget. For this, the custom logger should implement type [IChatSDKLogger](#ichatsdklogger). Then this logger is passed into chat widget to as part of telemetryConfiguration property as showb below.

```ts
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

// Injecting customConsoleLogger
const liveChatWidgetProps = {
    ...liveChatWidgetProps,
    ...
    telemetryConfig: {
        ...
        telemetryLoggers: [customConsoleLogger()],
        ...
    }
};

// Using prop in LiveChatWidget
<LiveChatWidget {...liveChatWidgetProps}/>
```

### *IChatSDKLogger*

| Properties |Type| Description |
| -------- |---------| -------- |
| `log: (logLevel: LogLevel, telemetryInput: TelemetryInput)` | return type `void` | implement the `log` method in custom logger |
| `dispose` | return type `void` | provide log dispose when browser closed |
