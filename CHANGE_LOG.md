# Change Log

All notable changes to this project will be documented in this file.

# Chat Widget

## [Unreleased]

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

# Chat Components

## [Unreleased]

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