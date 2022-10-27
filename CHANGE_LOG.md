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
- Updated the version of @microsoft/omnichannel-chat-components to @0.1.0-main.423d0ce
- Added and localized the unread Message Count alert text
- Updated the version of @microsoft/omnichannel-chat-components to @0.1.0-main.353ecff
- Fixed hover customizations for Audio notification button
- Multiple issues with `startChat` SDK method
- Clearing unread message after chat ended
- Correcting the `lcw:onMaximize` event
- Fixing duplicate `EndChat` issue
- Fixed `skipChatButtonRendering` flow when enabled
- Fixed the custom context for the first time load
- 'startChat` readability improvement and optimized code
- Making `.eslintrc.json` compatible with VS code
- Fixing Auth chat not to connect cached chat
- Fixed the header on the postchatloading pane
- Added authProps to ILiveChatWidgetProps
- Fixed a bug where links are incorrectly processed by markdown
- Added ChatAdapterShim
- Updating widget specific `BroadcastService`
- Updated props for auth chat
- Adding `WidgetInstanceId` to support same widget with multi origin
- Fixed custom context when `skipchatbuttonrendering` is enabled
- Added exception for authenticated chat when context is passed 
- Fixed description for new messages notification from screen reader.
- Added default properties for background and color for  adaptive cards and properties for customization of the same.
- Added a fix for auth chat to connect to the same chat after refresh.
- Fixed the sound notification when the footer is hidden.
- Replaced proactive chat pane close button with header close button.
- Adding `localStorage` support for widget
- Adding `typescript` sample
- Adding support for customizing anchor tag color in webchat
- Upgraded chat components in widget to replace proactive chat pane close button with header close button.
- Fixed refreshing chat in popout mode and upgraded chat components in widget to fix footer icons.
- Replaced HTMLElement with string in state variables.
- Updated the version of @microsoft/omnichannel-chat-sdk to 1.1.1-main.2f608b7
- Fixed resizing the message box when screen resize
- Updated the version of @microsoft/omnichannel-chat-components to @0.1.0-main.c74643c
- Uptake chat sdk version to fix image file send failures
- Raise HistoryMessageReceived event on polling
- Updated the version of @microsoft/omnichannel-chat-components to @0.1.0-main.cb39af7
- Added Download Transcript support on PostChat Survey Screen (V1 Parity)
- Fixed multiple scrollbars in PostChat to display single scroll bar.
- Fixed chat loading issue, Updating datamasking events
- Added Customer Voice Form Event loggin for PostChat Survey (V1 Parity)
- Removed isReconnectEnabled from props
- Fixed OutOfOffice Chat Button Icon appearance
- Adding support for customizing widget scroll bar
- Clearing live chat context for raise error event