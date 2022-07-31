# Changelog

All notable changes to this project will be documented in this file.## [Unreleased]

## [Unreleased]
### Added 
- Added the flag for toggling the focus on chatbutton component
- Updated the version of @microsoft/omnichannel-chat-components to @0.1.0-main.3e712be
- Added more telemetry and broadcast events for proactive chat pane
- Added support for PostChat Link Mode
- Refactored telemetry/broadcast events
- Added lcw event support
- Fixed an issue where telemetry is not flowing correctly
- Added support for conversation force closure
- Added broadcast event support for startChat and endChat
- Added custom componentOverride for preChat
- Added Telemetry events for PostChat Loading Pane
- Added web chat telemetry logger
- Updated ARIA Collector URLs for EU vs Non-EU telemetry data to comply with EUDB requirements
- Added custom context support
- Added font-family property to preChat Survey button
- Added `lcw:chatRetrieved` event
- Multi-widget support on same browser
- Added support to ensure order of messages from PVA bot for orgs using ACS.
## [0.1.0] - 2022-7-19
### Added
- Updated the version of @microsoft/omnichannel-chat-components to @0.1.0-main.423d0ce
- Added and localized the unread Message Count alert text
- Updated the version of @microsoft/omnichannel-chat-components to @0.1.0-main.353ecff
### Fixed
- Fixed hover customizations for Audio notification button
### Fixed
- Multiple issues with `startChat` SDK method
- Clearing unread message after chat ended
- Correcting the `lcw:onMaximize` event