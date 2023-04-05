# Change Log

All notable changes to this project will be documented in this file.

# Chat Widget

## [Unreleased]

### Added

- Added MIDDLEWARE_BANNER_FILE parameter `{2}` to show the user the file name when an exception occurs, also implementing standard for parameter to keep backwards compatibility
- Added initialCustomContext to ILiveChatWidgetProps
- Added `UpdateSessionDataForTelemetry` and `UpdateConversationDataForTelemetry` in `BroadcastEvents`

### Fixed

- Fixed custom context not showing for embed chat
- Fixed hyperlink not working in prechat pane

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

## [1.0.1] - 2023-4-4

### Changed

- Moved ids and strings to Constants file
- Changed Footer vertical alignment to "center", and changed footer padding

## [1.0.0] - 2023-3-15

### Added

- Added individual UI components like `Header`, `Footer`, and `ChatButton`, etc. with customizable `controlProps` and `styleProps`
- Added `BroadcastService` to communicate with package consumer layer, and for telemetry purposes
- Exposed `encodeComponentString` and `encodeComponentString`