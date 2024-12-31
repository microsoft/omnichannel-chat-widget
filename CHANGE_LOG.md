# Change Log

All notable changes to this project will be documented in this file.

# Chat-Widget

## [Unreleased]

### Added

- Added correct OCChatSDKTelemetryData type when telemetry event builder is alled for logSDKEvent
- Added Event broadcast from OOH pane when minimized so that iframe width height is adjusted
- Padding property to control the padding size choice input adaptive card form field

### Fixed

- Fix to reset chatsdk after a conversation with post survey with prechat present.
- Adding input element to the blocked list of html rendered elements.
- Fixed resetting request id when getConversationDetails returns wrap or closed state
- For disconnected chats, perform a soft end chat.
- Audio button visibility state is tied to audio mute state.
- Restriction of the elements allowed to be render in the UI, to avoid security vulnerabilities.
- New Error Event to notify CX regarding Error in widget
- Padding property to control the padding size choice input adaptive card form field

### Changed

- Uptake [@microsoft/omnichannel-chat-sdk@1.10.4](https://www.npmjs.com/package/@microsoft/omnichannel-chat-sdk/v/1.10.4)
- Uptake [@microsoft/omnichannel-chat-sdk@1.10.3](https://www.npmjs.com/package/@microsoft/omnichannel-chat-sdk/v/1.10.3)
- Uptake [@microsoft/omnichannel-chat-sdk@1.10.2](https://www.npmjs.com/package/@microsoft/omnichannel-chat-sdk/v/1.10.2)
- Uptake [@opentelemetry/api@1.9.0](https://www.npmjs.com/package/@opentelemetry/api/v/1.9.0)
- Uptake [@azure/core-tracing@1.2.0](https://www.npmjs.com/package/@azure/core-tracing/v/1.2.0)

## [1.7.3] 2024-11-20

### Added

- Add mockChatSdk init call mock
- Export getMockChatSDKIfApplicable
- Fix to set the state of audio notification button through configuration props
- Fix to format the output when user do CTRL + COPY in transcript.html
- Add New adapter subscriber to ignore adaptive card message from rendering if it contains all invisible fields
- Add `mock` props to allow chat widget to run in `mock mode` with `DemoChatAdapter`
- Expose `IBotAuthConfig` to support configuration of `fetchBotAuthConfigRetries` and `fetchBotAuthConfigRetryInterval`

### Fixed

- Patch for multitab scenarios with perf changes
- Improve load performance for startchat logic
- Added attachment in message received event payload
- Removed `PreChat Survey` rendering on loading `Persistent Chat` on an existing chat
- Moved `AuthTokenAcquisition` to allow `auth` http calls to Omnichannel service before `StartChat`
- Added `AuthTokenAcquisition` to happen during `StartChat` by default to support `pop-out chat`
- When "offline" session recovers, detect if the session is active, otherwise hide send-box.
- Use of reconnectionId when calling reconnect API instead of orgId.

### Changed

- Change LCW Designer default custom chat.
- Using default component for SlackMarkDown, to avoid problems with the code transpiled when using webpack5
- Uptake [@microsoft/omnichannel-chat-sdk@1.9.10](https://www.npmjs.com/package/@microsoft/omnichannel-chat-sdk/v/1.9.10)
- Stopped logging the end chat exception when the conversation is disconnected or ended by the agent/bot.
- Updated dompurify version
- Uptake [@microsoft/omnichannel-chat-sdk@1.9.6](https://www.npmjs.com/package/@microsoft/omnichannel-chat-sdk/v/1.9.6)
- Uptake [@microsoft/omnichannel-chat-sdk@1.9.9](https://www.npmjs.com/package/@microsoft/omnichannel-chat-sdk/v/1.9.9)
- Uptake [@microsoft/omnichannel-chat-sdk@1.10.0](https://www.npmjs.com/package/@microsoft/omnichannel-chat-sdk/v/1.10.0)
- Uptake [@microsoft/omnichannel-chat-sdk@1.10.1](https://www.npmjs.com/package/@microsoft/omnichannel-chat-sdk/v/1.10.1)

## [1.7.2] 2024-09-03

### Changed

- Uptake [@microsoft/omnichannel-chat-sdk@1.9.5](https://www.npmjs.com/package/@microsoft/omnichannel-chat-sdk/v/1.9.5)
- Uptake [@microsoft/omnichannel-chat-sdk@1.9.4](https://www.npmjs.com/package/@microsoft/omnichannel-chat-sdk/v/1.9.4)
- Removed postchat telemetry logs when postchat survey is disabled
- Add disclaimer note for prechat sample.
- Uptake [@microsoft/omnichannel-chat-sdk@1.9.3](https://www.npmjs.com/package/@microsoft/omnichannel-chat-sdk/v/1.9.3)
- Updated `handleStartChatError` to log `AuthenticatedChatConversationRetrievalFailure` as warning using `logWidgetLoadCompleteWithError` instead of an error.

### Fixed

- Cleaning postsurvey state when ending the chat.
- Fixing disable strike through in markdown
- checking localStorage null or undefined

## [1.7.1] 2024-06-21

### Changed

- Uptake [@microsoft/omnichannel-chat-sdk@1.9.1](https://www.npmjs.com/package/@microsoft/omnichannel-chat-sdk/v/1.9.1)

### Added

- Add ability to pass external hosted URLs for the libraries of chat transcript

### Fixed

- Fixed an issue allowing multiple listeners to execute multiple times for the same event (GetLiveWorkItemDetail)
- Prechat payload from survey props get used when submitting response.
- Fixed external link icon color css issue for markdown messages.
- Fixed unread message count set to 0 on page refresh issue.
- Fixed the subsequent click issues in the multitab and popup modes when chat is in minimized state.

## [1.7.0] 2024-05-30

### Changed

- Uptake [@microsoft/omnichannel-chat-sdk@1.9.0](https://www.npmjs.com/package/@microsoft/omnichannel-chat-sdk/v/1.9.0)

### Added

- Send `omnichannel-chat-widget` as part of `ocUserAgent`

### Changed

- Uptake [@microsoft/omnichannel-chat-sdk@1.8.3](https://www.npmjs.com/package/@microsoft/omnichannel-chat-sdk/v/1.8.3)

## [1.6.5] 2024-05-10

### Added

- Uptake [@microsoft/omnichannel-chat-sdk@1.8.2](https://www.npmjs.com/package/@microsoft/omnichannel-chat-sdk/v/1.8.2)

### Changed

- Fix `suggestedActions` with `to` property not rendering by passing `userID` to `Composer`

### Fixed

- Fix for handling properly close chat for persistent chat with postsurvey
- Fix for emoji characters showing for combination like :0 and :-0

### Changed

- reverted - Fix `suggestedActions` with `to` property not rendering by passing `userID` to `Composer`

## [1.6.4] 2024-04-29

### Changed

- Uptake [@microsoft/omnichannel-chat-components@1.1.5](https://www.npmjs.com/package/@microsoft/omnichannel-chat-components/v/1.1.5)
- Uptake [@microsoft/omnichannel-chat-sdk@1.8.1](https://www.npmjs.com/package/@microsoft/omnichannel-chat-sdk/v/1.8.1)

### Fixed

- Fix system message dynamic themeing capability
- Fix systems messages are not being part of markdown rendering for active links

## [1.6.3] 2024-04-02

### Changed

- Update banner message for browser storage unavailable.
- Uptake [@microsoft/omnichannel-chat-components@1.1.3](https://www.npmjs.com/package/@microsoft/omnichannel-chat-components/v/1.1.3)
- Uptake [@microsoft/omnichannel-chat-sdk@1.8.0](https://www.npmjs.com/package/@microsoft/omnichannel-chat-sdk/v/1.8.0)
- Uptake [@microsoft/omnichannel-chat-components@1.1.4](https://www.npmjs.com/package/@microsoft/omnichannel-chat-components/v/1.1.4)

### Fixed

- Running startChat SDK multiple times on an active chat without local storage is treated as a no-op
- Reconnecting to an unauthenticated popout reconnect chat with pre-chat survey configured does not present the pre-chat survey again
- Fix data `Data Masking` being enabled when `msdyn_maskforcustomer` is set to `false` and `dataMaskingRules` is not empty.  
- Forcing failures on authenticated chats to be sent immediately during reconnect flow and don't allow to continue with the chat flow.
- Fix to handle pre-chat pane during reload and avoid the pane to be injected but no visible.
- Fix `ChatSDK.emailLiveChatTranscript()` not working after `ChatSDK.endChat()` is called by not clearing `liveChatContext` on `chatTokenCleanUp`
- Fix `ChatSDK.getLiveChatTranscript()` not working during post chat survey when user ends the conversation by retreving `liveChatContext` from `inMemoryState`

## [1.6.2] 2024-01-10

### Changed

- For Auth Reconnect, setting `controlProps.hideReconnectChatPane` to `true` no longer hides the pane UI, but will completely skip the ReconnectPane rendering process. If there is a reconnectable chat, it will directly be rehydrated. If not, the chat button will show up
- Uptake [@microsoft/omnichannel-chat-components@1.1.1](https://www.npmjs.com/package/@microsoft/omnichannel-chat-components/v/1.1.1)
- Added `OCChatSDKVersion`, `OCChatWidgetVersion`, and `OCChatComponentsVersion` to base telemetry contract

## [1.6.1] 2023-12-21

### Fixed

- Fixed an issue where AdaptiveCard push button does not have `cursor: pointer`
- Fixed an issue where StartChat event doesn't work after closing a refreshed chat

## [1.6.0] 2023-12-19

### Added

- Enabled customizations for the start chat error pane by adding new `IStartChatErrorPaneProps` interface
- Added `PrepareEndChat` Telemetry Event to identify end chat workflow
- Add specific error strings to start chat error pane for authentication related failure scenarios by including new texts to `IStartChatErrorPaneControlProps`

### Fixed

- Fixed an issue, where after the agent end the chat and C2 sees the disconnect banner after toggling, refreshing the browser does not show the message box.
- Clear ChatSDK's internal `liveChatContext` when `conversationState` is set to `Closed` on `startChat()`
- A11Y fix for JAWS screen reader, not able to read/navigate messages when scan mode is activated
- Fix for InitiateEndChat event, which now updates state for confirmation pane, to enable close of the widget when clicking on the close button.

### Changed

- Updated exception details on chat start to include http status code for all `WidgetLoadFailed` and `WidgetLoadComplete` events with error
- Uptake [@microsoft/omnichannel-chat-components@1.1.0](https://www.npmjs.com/package/@microsoft/omnichannel-chat-components/v/1.1.0)
- Uptake [@microsoft/omnichannel-chat-sdk@1.6.2](https://www.npmjs.com/package/@microsoft/omnichannel-chat-sdk/v/1.6.2)

## [1.5.0] - 2023-11-21

### Added

- [A11Y] Notification banner when e-mail address is introduced to receive transcript after chat ends
- Added `skipBroadcastChannelInit` prop to avoid duplicate initialization on BroadcastChannel

### Fixed

- Fixed an issue where invoking `StartChat` event will create different chats across all tabs
- Fixed an issue where post chat does not load on first chat on a browser session
- Fixed widget crashing due to `BroadcastChannel` not supported on `Safari` browsers below `15.4`
- Fixed an issue where Chat disconnect banner message is not showing localized text
- Fixed an issue where invoking `StartChat` opens pre-chat survey during out of operation hours
- Fixed an issue where new chat starts even after reconnectUrl is being used

### Changed

- Uptake [@microsoft/omnichannel-chat-components@1.0.8](https://www.npmjs.com/package/@microsoft/omnichannel-chat-components/v/1.0.8)
- Uptake [@microsoft/omnichannel-chat-sdk@1.5.7](https://www.npmjs.com/package/@microsoft/omnichannel-chat-sdk/v/1.5.7)

## [1.4.0] - 2023-10-25

### Changed

- Uptake [@microsoft/omnichannel-chat-sdk@1.5.2](https://www.npmjs.com/package/@microsoft/omnichannel-chat-sdk/v/1.5.2)

### Added

- Added customContext option in `StartChat` BroadcastEvent to pass in custom context variables synchronously
- Add ability to block attachments on file scanning and on malicious files

### Fixed

- Fixed an issue where C2 voice/video feed does not end despite C2 ending the chat
- Added workaround to render all adaptive card texts properly
- Fixed an issue where agent post chat survey is used when customer closes the chat with only bot engagement

## [1.3.0] - 2023-09-18

### Added

- Added toast middleware to override with custom notification pane for chat disconnect scenario

### Changed

- Uptake [@microsoft/omnichannel-chat-sdk@1.4.7](https://www.npmjs.com/package/@microsoft/omnichannel-chat-sdk/v/1.4.7)
- Uptake [@microsoft/omnichannel-chat-components@1.0.7](https://www.npmjs.com/package/@microsoft/omnichannel-chat-components/v/1.0.7)

## [1.2.3] - 2023-09-07

### Added

- Added new middleware (messageSequenceIdOverrideMiddleware) to ensure proper order of messages
- Added handling for OriginalMessageId in transcript component to fix sorting issues

### Changed

- Uptake [@microsoft/omnichannel-chat-components@1.0.6](https://www.npmjs.com/package/@microsoft/omnichannel-chat-components/v/1.0.6)

### Fixed

- Fixed an issue where sign-in card cannot be rendered
- Fixed an issue where video card cannot be rendered
- Fixed an issue where refreshing unauthenticated reconnect chat results in infinite loading
- Fixed an issue where unauthenticated reconnect chat doesn't work with valid reconnect id
- Fixed an issue where system message does not support html tags

## [1.2.2] - 2023-8-16

### Changed

- Uptake [@microsoft/omnichannel-chat-sdk@1.4.5](https://www.npmjs.com/package/@microsoft/omnichannel-chat-sdk/v/1.4.5)
- Added parity to NewMessage event payload, and renamed `HistoryMessageReceived` to `RehydrateMessageReceived` to avoid conflict with the same BroadcastEvent
- Added Pull Request Template

### Fixed

- Fixed an issue where opening a chat right after agent ends the previous chat doesn't work
- Fixed an issue where opening/refreshing a persistent chat shows the Reconnect Pane
- Fixed SSO magic code due to incompatibility of broadcast channel
- Fixed an issue where custom context disappears after state cache expires

## [1.2.1] - 2023-7-24

### Changed

- Uptake [@microsoft/omnichannel-chat-sdk@1.4.4](https://www.npmjs.com/package/@microsoft/omnichannel-chat-sdk/v/1.4.4)

## [1.2.0] - 2023-7-20

### Added

- Add ability for widget to be draggable on desktop browser
- Added warning banner for third party cookies blocked alert

### Fixed

- Code refactor for event listening for custom context in pop-out mode
- Fixed texts in adaptive cards having same color with background
- Validations to avoid empty telemetry data.
- Used slack-markdown-it package for v1 parity

### Changed

- Uptake [@microsoft/omnichannel-chat-sdk@1.4.3](https://www.npmjs.com/package/@microsoft/omnichannel-chat-sdk/v/1.4.3)

## [1.1.0] - 2023-6-8

### Added

- Exposed `adaptiveCardsHostConfig` from webchat and force button text wrap
- Add ability to render transcript using `WebChat`
- Added `OrganizationUrl` as a column in default logger
- Adding `sentMessageAnchorStyles` customization for anchors

### Fixed

- [A11Y] Fix `aria-labels` on PreChatSurvey
- Fix for storybooks issue with transcript properties
- Fix for visual tests

### Changed

- Uptake [@microsoft/omnichannel-chat-components@1.0.3](https://www.npmjs.com/package/@microsoft/omnichannel-chat-components/v/1.0.3)

## [1.0.5] - 2023-5-26

### Added

- Added `enablePrechat` in `ProactiveChatStartPopoutChat` broadcast event
- If `hidePreChatSurveyPane` is set, skip rendering prechat

### Fixed

- Fixed an issue where hideStartChatButton is true, and customer tries to reconnect from a new browser or InPrivate browser
- Fixed post chat survey not rendered for reconnect scnearios
- Fixed `ariaTelemetryLogger` not updating `collectorUri`
- Update `environmentVersion` to be `prod` by default in `defaultInternalTelemetryData`
- Do not log OOOH errors as WidgetLoadFailure

## [1.0.4] - 2023-5-8

### Added

- Added Broadcast event `ContactIdNotFound` when using OAuth 2.0 auth code grant

### Fixed

- Fixed custom context not showing for popout chat
- Fixed an issue where after ending chat and downloading transcript, a new chat cannot be started

### Changed

- Uptake [@microsoft/omnichannel-chat-sdk@1.4.1](https://www.npmjs.com/package/@microsoft/omnichannel-chat-sdk/v/1.4.1)

## [1.0.3] - 2023-4-24

### Added

- Add `hyperlinkTextOverride` props to override anchor element's `innerText` with `href` if they don't match to prevent URL spoofing

### Fixed

- Fixed an issue where data masking rule matching empty strings will cause infitnite loop
- Fixed custom context not showing for embed chat
- Fixed hyperlink not working in prechat pane
- Fixed multiple calls to EndChat when agent/bot ends conversation
- Reducing the number of duplicate logs for webchat client telemetry
- Fixed post chat survey is not rendering bot survey
- Code refactored for post chat survey
- Fixed popout chat is not showing Out of office pane
- Fixed popout chat is showing blank screen
- Better handling of end chat in case of multitab scenarios
- Prevent new chat creation failure after Proactive chat in Popout mode
- Fixed post chat having gap in popout mode
- Fixed initial custom context not being passed to OC
- Adding additional check for auth chats not to set custom context
- Fixed an issue where sending "InitiateEndChat" event doesn't end chat when no post chat is configured
- Fixed logging empty events
- Fixing reconnect message is appearing even after end chat

## [1.0.2] - 2023-4-6

### Added

- Added MIDDLEWARE_BANNER_FILE parameter `{2}` to show the user the file name when an exception occurs, also implementing standard for parameter to keep backwards compatibility
- Added initialCustomContext to ILiveChatWidgetProps
- Added `UpdateSessionDataForTelemetry` and `UpdateConversationDataForTelemetry` in `BroadcastEvents`

### Fixed

- Fixed custom context not showing for embed chat
- Fixed hyperlink not working in prechat pane

### Changed

- Uptake [@microsoft/omnichannel-chat-components@1.0.1](https://www.npmjs.com/package/@microsoft/omnichannel-chat-components/v/1.0.1)
- Uptake [@microsoft/omnichannel-chat-sdk@1.3.0](https://www.npmjs.com/package/@microsoft/omnichannel-chat-sdk/v/1.3.0)

## [1.0.1] - 2023-3-23

### Added

- Added WebChat banner on chat disconnect depending on visibility events

## [1.0.0] - 2023-3-22

### Added

- Stitched all components in chat-components package with default Omnichannel chat flow
- Exposed CSS style customizations on all UI components
- Hooked up with BotFramework WebChat and exposed all WebChat styles
- Included Omnichannel features by default, including pre chat, post chat, voice/video call, operating hours, etc.
- Added various documentations on features and package usages

### Fixed

- Fixed various bugs on chat flow and customizability

# Chat-Components

## [Unreleased]

## [1.1.6] - 2024-04-24

### Fixed

- Set resolution for 2.12.1 sanitize-html  to prevent security vulnerabilities coming from webchat.

## [1.1.5] - 2024-04-05

### Fixed

- Remove alert role from prechat component and use form role instead.

## [1.1.4] - 2024-04-01

### Fixed

- Replacing `end call` shortcut key of pressing `enter` with `ctrl + shift + h` to prevent call to end while sending message

## [1.1.3] - 2024-03-11

### Fixed

- A11Y missing heading for header

## [1.1.2] - 2024-02-13

### Fixed

- A11Y issue with buttons in reconnect pane.
- A11Y issue with missing H1 tag for input pane.
- A11Y issue with reconnect pane style when full screen mode is on.

## [1.1.1] 2024-1-4

### Changed

- Uptake [botframework-webchat@4.16.0](https://www.npmjs.com/package/botframework-webchat/v/4.16.0)

## [1.1.0] 2023-12-12

### Added

- Add ability to customize `PreChatSurveyPane`'s toggle inputs using `IPreChatSurveyPaneToggleInputStyles` & Use `baseline` by default

### Fixed

- Fixed loading pane icon image fit

## [1.0.9] 2023-10-31

### Changed

- Modify texts for email input validation

## [1.0.8] - 2023-10-31

### Added

- Added tooltips for header and footer action bar buttons

## [1.0.7] - 2023-9-13

### Added

- Added notification pane component to support chat disconnect notification customization

## [1.0.6] - 2023-8-18

### Fixed

- Fixed PreChatPane not showing full text for toggle input text

## [1.0.5] - 2023-7-20

### Added

- Added place holder for inputvalidationPane, to display the proper format of an email.

## [1.0.4] - 2023-6-20

### Fixed

- Fixed font family issue with pre-chat survey pane

## [1.0.3] - 2023-6-8

### Changed

- Uptake [botframework-webchat@4.15.8](https://www.npmjs.com/package/botframework-webchat/v/4.15.8)

## [1.0.2] - 2023-6-6

### Added

- [A11Y] Support text spacing for chat button.

### Fixed

- [A11Y] Remove unnecessary region landmarks from header and footer.
- Fixed issue with markdown render which exposed the chat for XSS attacks.

## [1.0.1] - 2023-4-4

### Changed

- Moved ids and strings to Constants file
- Changed Footer vertical alignment to "center", and changed footer padding

## [1.0.0] - 2023-3-15

### Added

- Added individual UI components like `Header`, `Footer`, and `ChatButton`, etc. with customizable `controlProps` and `styleProps`
- Added `BroadcastService` to communicate with package consumer layer, and for telemetry purposes
- Exposed `encodeComponentString` and `encodeComponentString`
