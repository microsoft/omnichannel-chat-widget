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

### BroadcastService

`BroadcastService` is a component library service used for publishing and subscribing events from/to components. All actionable controls in library emits `onClick` and `onKeyDown` by default. The service has following methods:

| Method | Description | Parameters |
| ------- | ----------- | ---------- |
| `postMessage` | to publish an event | Accepts [ICustomEvent](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/interfaces/ICustomEvent.ts) as parameter
|`disposeChannel` | closes the channel | none
|`getMessageByEventName` | to subscribe to an event by string | Accepts `eventName` as parameter
|`getMessage` | to subscribe to an event by `ICustomEvent` | Accepts [ICustomEvent](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/interfaces/ICustomEvent.ts) as parameter
|`getAnyMessage` | to subscribe to all events | none

**_Pseudo Code_**

_Publishing Event_:

```js
    import { BroadcastService } from "../../../services/BroadcastService";
    import { ICustomEvent } from "../../../interfaces/ICustomEvent";

    //generateEventName - (,<controlid>,<prefix>, <suffix>)
    const onClickEventName = props.headerActionControlProps.existingEventName? 
    props.headerActionControlProps.existingEventName: 
    generateEventName(props.headerActionControlProps.id, "on"); 
    
    const onClickEvent: ICustomEvent = { eventName: onClickEventName }

    BroadcastService.postMessage(onClickEvent);
```

_Subscribing Event_:

```js
    import { BroadcastService } from "../../services/BroadcastService";
    import { ICustomEvent } from "../../interfaces/ICustomEvent";
    import { ElementType } from "../../common/Constants";


    //inside function component
    React.useEffect(() => {
        const message : ICustomEvent = {
            elementType: ElementType.HeaderCloseButton,
            eventName: "OnClick",
            elementId: "webChatHeaderCloseButton"
        };
        const subscription = BroadcastService.getMessage(message)
            .subscribe((msg: ICustomEvent) => {
                console.log("message received!!" + JSON.stringify(msg));
            });
    
        return () => {
            console.log("unsubscribing event");
            subscription.unsubscribe();
        };
    }, []);
```

### Broadcast Events

Refer to the below table to understand different broadcast events raised during the lifetime of the chat widget. These events can be subscribed to perform certain optional features of Live Chat Widget. These are primarily used to perform certain functionalities within the widget, instead of for logging purposes.

| Event Name | Scenario |
| -------- | -------- |
| `ProactiveChatStartChat`          |On `ProactiveChatPane` start chat |
| `ProactiveChatStartPopoutChat`    |On `ProactiveChatPane` start chat in a new window |
| `LoadPostChatSurvey`              |On loading post chat survey |
| `ChatEnded`                       |On ending chat |
| `NewMessageNotification`          |On getting a new message |
| `UnreadMessageCount`              |On toggling minimize state or changing unread message count |
| `ChatWidgetStateChanged`          |On changing chat widget state |
| `InvalidAdaptiveCardFormat`       |On invalid adaptive card format |
| `NewMessageReceived`              |On new message received |
| `NewMessageSent`                  |On new user message sent |
| `RedirectPageRequest`             |On redirecting unauthenticated reconnect chat |
| `StartChatSkippingChatButtonRendering`      |On starting chat skipping chat button rendering |
| `StartUnauthenticatedReconnectChat`      |On starting unauthenticated reconnect chat |

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
| `PostChatSurveyLoadingPaneLoaded`  |On `PostChatSurveyLoadingPane` load complete |
| `PostChatSurveyLoaded`  |On `PostChatSurvey` load complete |
| `EmailTranscriptLoaded` |On Email transcript pane load complete |
| `OutOfOfficePaneLoaded` |On Out of office pane load complete |
| `ConfirmationPaneLoaded`|On `ConfirmationPane` load complete |
| `ProactiveChatPaneLoaded`|On `PropactiveChatPane` load complete|
| `ReconnectChatPaneLoaded` | On `ReconnectChatPane` load complete|

#### Action Events

| Event Name| Scenario |
| -------- | -------- |
| `PrechatSubmitted`     |On PreChat survey Submit button click |
| `PreChatSurveyStartChatMethodFailed`|On Pre-Chat survey submit failed|
| `LCWChatButtonClicked`  |On Start Chat button click |
| `StartProactiveChatEventReceived`|On receiving start proactive chat event|
| `ChatAlreadyTriggered`|On attempting to start proactive chat pane with chat already triggered|
| `ProactiveChatAccepted` |On Proactive chat Start Chat button click |
| `ProactiveChatRejected` |On Proactive chat invitation time out |
| `ProactiveChatClosed`   |On Proactive chat closed |
| `ReconnectChatContinueConversation` |On clicking Continute Chat button On Reconnect Chat Pane |
| `ReconnectChatStartNewConversation` |On clicking Start New button On Reconnect Chat Pane |
| `ReconnectChatMinimize`   |On clicking Minimize button On Reconnect Chat Pane |
| `ProcessingHTMLTextMiddlewareFailed`     |On HTML Field adding noopener noreferrer failed |
| `ProcessingSanitizationMiddlewareFailed`     |On HTML Field sanitization failed |
| `FormatTagsMiddlewareJSONStringifyFailed`     |On ACS Format Message Tags Middleware failed |
|`IC3ThreadUpdateEventReceived`|On `IC3 ThreadUpdateEvent` Received|
|`AverageWaitTimeMessageRecieved`|On Average Wait Time system message Received|
|`QueuePositionMessageRecieved`|On Queue Position system message Received|
|`IC3ThreadUpdateEventReceived`|On `IC3 ThreadUpdateEvent` Received|
| `ConversationEndedThreadEventReceived`     |On Conversation ended by agent side or by timeout |
| `InvalidConfiguration`     |On Invalid data masking regex rule collection |
| `DataMaskingRuleApplied`     |On data masking regex rule applied |
| `EmailTranscriptSent`     |On transcript sent to email successfully |
|`EmailTranscriptFailed`|On transcript sent to email failure|
|`EmailTranscriptButtonClicked`|On Email Transcript footer button clicked|
|`EmailTranscriptCancelButtonClicked`|On Email Transcript Pane Cancel button clicked|
|`DownloadTranscriptButtonClicked`|On download transcript button clicked|
|`DownloadTranscriptFailed`|On download transcript failed|
| `DownloadTranscriptResponseNullOrUndefined`     |On downloading transcript response exception |
|`AudioToggleButtonClicked`| On Audio Notification button clicked|
|`ConfirmationCancelButtonClicked`|On confirmation pane Cancel button clicked|
|`ConfirmationConfirmButtonClicked`|On confirmation pane Confirm button clicked|
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
|`StartChatSDKCall`| On initiating start chat SDK call|
|`StartChatEventRecevied `| On start chat event received|
|`StartChatMethodException`|On failed to start chat|
|`CloseChatMethodException`|On failed to end chat from `ConfirmationPane` Confirm button click|
|`GetChatReconnectContextSDKCallFailed`| On get reconnect context SDK call failed|
|`GetConversationDetailsCallFailed`|On `PropactiveChatPane` load complete|
|`EndChatSDKCall`|On initiating ChatSDK end chat call|
|`EndChatEventRecevied `| On end chat event received|
|`EndChatSDKCallFailed`|On ChatSDK end chat failure|
|`PostChatContextCallFailed`|On `ChatSDK` post chat context failure|
|`PostChatContextCallSucceed`|On `ChatSDK` post chat context load success|

#### Configuration Events

| Event Name | Scenario |
| -------- |-------- |
|`ParseAdaptiveCardFailed`|On parsing adaptive card failure|

#### Web Chat Events
| Event Name | Scenario |
| -------- |-------- |
|`WebChatEvent`|On Web Chat specific events, see [BotFramework-WebChat](https://github.com/microsoft/BotFramework-WebChat/blob/main/docs/TELEMETRY.md)|

## Bring Your Own Logger

Customized LCW provides a way to inject your own custom logger to Live Chat Widget. For this, the custom logger should implement type [IChatSDKLogger](#ichatsdklogger). Then this logger is passed into chat widget to as part of telemetryConfiguration property as shown below.

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
| `dispose` | return type `void` | dispose the logger when browser closed |
