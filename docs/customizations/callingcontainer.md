# Header

## Table of contents
- [Interfaces](#interfaces)
    - [IHeaderProps](#iheaderprops)
    - [IHeaderComponentOverrides](#iheadercomponentoverrides)
    - [IHeaderControlProps](#iheadercontrolprops)
    - [IHeaderStyleProps](#iheaderstyleprops)
- [Sample Scenarios](#sample-scenarios)
    - [Changing header title and icon](#changing-header-title-and-icon)
    - [Changing button icons](#changing-button-icons)
    - [Hiding sub-components](#hiding-sub-components)
    - [Adding a custom button](#adding-a-custom-button)
    - [Adding a custom image](#adding-a-custom-image)
    - [Changing element styles](#changing-element-styles)

## Introduction

By enabling calling options from admin center when creatiing a chat channel, the agent can initiate a voice/video call with the customer for better service. For more details of this feature, see this [public documentation](https://learn.microsoft.com/en-us/dynamics365/customer-service/call-options-visual-engagement).

### Term definitions

IncomingCall:

<img src="../.attachments/customizations-calling-incoming-call.png" width="450">

CurrentCall:

<img src="../.attachments/customizations-intro-callingcontainer.png" width="450">

## Interfaces

### [ICallingContainerProps](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/callingcontainer/interfaces/ICallingContainerProps.ts)

The top-level interface for customizing `CallingContainer`.

| Attribute | Type | Required | Description | Default |
| - | - | - | - | - |
controlProps | [ICallingContainerControlProps](#icallingcontainercontrolprops) | No | Properties that control the element behariors | -
styleProps | [ICallingContainerStyleProps](#icallingcontainerstyleprops) | No | Properties that control the element styles | -

### [ICallingContainerControlProps](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/callingcontainer/interfaces/ICallingContainerControlProps.ts)

| Attribute | Type | Required | Description | Default |
| - | - | - | - | - |
id    | string     | No | The top-level element id for the calling container | "lcw-calling-container"
isIncomingCall | boolean | No | Whether to show the incoming call screen, or the current call screen. The currentCall screen will appear after an incoming call request is accepted | false
dir | "rtl"\|"ltr"\|"auto" | No | The locale direction under the `CallingContainer` component | "ltr"
incomingCallControlProps | [IIncomingCallControlProps](#iincomingcallcontrolprops) | No | The control props for the incoming call screen | [defaultIncomingCallControlProps](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/callingcontainer/subcomponents/IncomingCall/common/defaultProps/defaultIncomingCallControlProps.ts)
currentCallControlProps | [ICurrentCallControlProps](#icurrentcallcontrolprops) | No | The control props for the current call screen |  [defaultCurrentCallControlProps](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/callingcontainer/subcomponents/CurrentCall/common/defaultProps/defaultCurrentCallControlProps.ts)
hideCallingContainer | boolean | No | Whether to hide the calling container. This is mostly for internal use in case  of minimize scenarios | false

### [ICallingContainerStyleProps](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/callingcontainer/interfaces/ICallingContainerStyleProps.ts)

[IStyle](https://github.com/microsoft/fluentui/blob/master/packages/merge-styles/src/IStyle.ts) is the interface provided by [FluentUI](https://developer.microsoft.com/en-us/fluentui#/). 

| Attribute | Type | Required | Description | Default |
| - | - | - | - | - |
| generalStyleProps | [`IStyle`](https://github.com/microsoft/fluentui/blob/master/packages/merge-styles/src/IStyle.ts) | No | Overall styles of the `CallingContainer` component, including the top level container | [`defaultCallingContainerStyles`](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/callingcontainer/common/defaultStyles/defaultCallingContainerStyles.ts) |
| className | string | No | Calling container's class name | -
| incomingCallStyleProps | [IIncomingCallStyleProps](#iincomingcallstyleprops) | No | Styles of the incoming call container | -
| currentCallStyleProps | [ICurrentCallStyleProps](#icurrentcallstyleprops) | No | Styles of the current call container | -

### [IIncomingCallControlProps](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/callingcontainer/subcomponents/IncomingCall/interfaces/IIncomingCallControlProps.ts)

| Attribute | Type | Required | Description | Default |
| - | - | - | - | - |
id    | string     | No | The top-level element id for the calling container | "lcw-incoming-call"
dir | "rtl"\|"ltr"\|"auto" | No | The locale direction under the `IncomingCall` component | "ltr"
ariaLabel | string | No | The aria label of the `IncomingCall` component | "Incoming call area"
className | string | No | The class name of the `IncomingCall` component | -
hideAudioCall | boolean | No | Whether to hide the "Accept audio call" button | false
hideVideoCall | boolean | No | Whether to hide the "Accept video call" button | false
hideDeclineCall | boolean | No | Whether to hide the "Decline call" button | false
hideIncomingCallTitle | boolean | No | Whether to hide the title text of the incoming call screen | false
incomingCallTitle | [ILabelControlProps](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/common/interfaces/ILabelControlProps.ts) | No | The title text props | [defaultIncomingCallControlProps](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/callingcontainer/subcomponents/IncomingCall/common/defaultProps/defaultIncomingCallControlProps.ts)
onAudioCallClick | () => void | No | Defines the behavior when the "Accept audio call" button is clicked | [Starts the audio call and shows current call screen]
onVideoCallClick | () => void | No | Defines the behavior when the "Accept video call" button is clicked | [Starts the video call and shows current call screen]
onDeclineCallClick | () => void | No | Defines the behavior when the "Decline call" button is clicked | [Hide the incoming call screen and returns to chat]
audioCallButtonProps | [ICommandButtonControlProps](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/common/interfaces/ICommandButtonControlProps.ts) | No | Define more properties of the "Accept audio call" button | [defaultIncomingCallControlProps](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/callingcontainer/subcomponents/IncomingCall/common/defaultProps/defaultIncomingCallControlProps.ts)
videoCallButtonProps | [ICommandButtonControlProps](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/common/interfaces/ICommandButtonControlProps.ts) | No | Define more properties of the "Accept video call" button | [defaultIncomingCallControlProps](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/callingcontainer/subcomponents/IncomingCall/common/defaultProps/defaultIncomingCallControlProps.ts)
declineCallButtonProps | [ICommandButtonControlProps](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/common/interfaces/ICommandButtonControlProps.ts) | No | Define more properties of the "Decline call" button | [defaultIncomingCallControlProps](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/callingcontainer/subcomponents/IncomingCall/common/defaultProps/defaultIncomingCallControlProps.ts)
leftGroup | {gap?: number, children: ReactNode[] \| string[]} | No | Add more custom components on the left side of the control | -
middleGroup | {gap?: number, children: ReactNode[] \| string[]} | No | Add more custom components on the middle section of the control | -
rightGroup | {gap?: number, children: ReactNode[] \| string[]} | No | Add more custom components on the right side of the control | -

### [IIncomingCallStyleProps](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/callingcontainer/subcomponents/IncomingCall/interfaces/IIncomingCallStyleProps.ts)

[IStyle](https://github.com/microsoft/fluentui/blob/master/packages/merge-styles/src/IStyle.ts) is the interface provided by [FluentUI](https://developer.microsoft.com/en-us/fluentui#/).

| Attribute | Type | Required | Description | Default |
| - | - | - | - | - |
| generalStyleProps | [IStyle](https://github.com/microsoft/fluentui/blob/master/packages/merge-styles/src/IStyle.ts) | No | Overall styles of the `IncomingCall` component, including the container | [defaultChatButtonGeneralStyles](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/callingcontainer/subcomponents/IncomingCall/common/defaultStyles/defaultIncomingCallStyleProps.ts) |
| audioCallButtonStyleProps | [IStyle](https://github.com/microsoft/fluentui/blob/master/packages/merge-styles/src/IStyle.ts) | No | Styles of the "Accept audio call" button | [defaultChatButtonGeneralStyles](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/callingcontainer/subcomponents/IncomingCall/common/defaultStyles/defaultIncomingCallStyleProps.ts) |
| audioCallButtonHoverStyleProps | [IStyle](https://github.com/microsoft/fluentui/blob/master/packages/merge-styles/src/IStyle.ts) | No | Styles of the "Accept audio call" button while hovered | [defaultChatButtonGeneralStyles](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/callingcontainer/subcomponents/IncomingCall/common/defaultStyles/defaultIncomingCallStyleProps.ts) |
| videoCallButtonStyleProps | [IStyle](https://github.com/microsoft/fluentui/blob/master/packages/merge-styles/src/IStyle.ts) | No | Styles of the "Accept video call" button | [defaultChatButtonGeneralStyles](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/callingcontainer/subcomponents/IncomingCall/common/defaultStyles/defaultIncomingCallStyleProps.ts) |
| videoCallButtonHoverStyleProps | [IStyle](https://github.com/microsoft/fluentui/blob/master/packages/merge-styles/src/IStyle.ts) | No | Styles of the "Accept video call" button while hovered | [defaultChatButtonGeneralStyles](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/callingcontainer/subcomponents/IncomingCall/common/defaultStyles/defaultIncomingCallStyleProps.ts) |
| declineCallButtonStyleProps | [IStyle](https://github.com/microsoft/fluentui/blob/master/packages/merge-styles/src/IStyle.ts) | No | Styles of the "Decline call" button | [defaultChatButtonGeneralStyles](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/callingcontainer/subcomponents/IncomingCall/common/defaultStyles/defaultIncomingCallStyleProps.ts) |
| declineCallButtonHoverStyleProps | [IStyle](https://github.com/microsoft/fluentui/blob/master/packages/merge-styles/src/IStyle.ts) | No | Styles of the "Decline call" button while hovered | [defaultChatButtonGeneralStyles](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/callingcontainer/subcomponents/IncomingCall/common/defaultStyles/defaultIncomingCallStyleProps.ts) |
| incomingCallTitleStyleProps | [IStyle](https://github.com/microsoft/fluentui/blob/master/packages/merge-styles/src/IStyle.ts) | No | Styles of the title text | [defaultChatButtonGeneralStyles](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/callingcontainer/subcomponents/IncomingCall/common/defaultStyles/defaultIncomingCallStyleProps.ts) |
| itemFocusStyleProps | [IStyle](https://github.com/microsoft/fluentui/blob/master/packages/merge-styles/src/IStyle.ts) | No | Styles of the buttons while on focus | [defaultChatButtonGeneralStyles](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/callingcontainer/subcomponents/IncomingCall/common/defaultStyles/defaultIncomingCallStyleProps.ts) |
| className | string | No | The class name of the incoming call container | [defaultChatButtonGeneralStyles](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/callingcontainer/subcomponents/IncomingCall/common/defaultStyles/defaultIncomingCallStyleProps.ts) |

### [ICurrentCallControlProps](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/callingcontainer/subcomponents/CurrentCall/interfaces/ICurrentCallControlProps.ts)

| Attribute | Type | Required | Description | Default |
| - | - | - | - | - |
id    | string     | No | The top-level element id for the calling container | "lcw-incoming-call"
dir | "rtl"\|"ltr"\|"auto" | No | The locale direction under the `IncomingCall` component | "ltr"
ariaLabel | string | No | The aria label of the `IncomingCall` component | "Incoming call area"
className | string | No | The class name of the `IncomingCall` component | -
hideAudioCall | boolean | No | Whether to hide the "Accept audio call" button | false
hideVideoCall | boolean | No | Whether to hide the "Accept video call" button | false
hideDeclineCall | boolean | No | Whether to hide the "Decline call" button | false
hideIncomingCallTitle | boolean | No | Whether to hide the title text of the incoming call screen | false
incomingCallTitle | [ILabelControlProps](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/common/interfaces/ILabelControlProps.ts) | No | The title text props | [defaultIncomingCallControlProps](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/callingcontainer/subcomponents/IncomingCall/common/defaultProps/defaultIncomingCallControlProps.ts)
onAudioCallClick | () => void | No | Defines the behavior when the "Accept audio call" button is clicked | [Starts the audio call and shows current call screen]
onVideoCallClick | () => void | No | Defines the behavior when the "Accept video call" button is clicked | [Starts the video call and shows current call screen]
onDeclineCallClick | () => void | No | Defines the behavior when the "Decline call" button is clicked | [Hide the incoming call screen and returns to chat]
audioCallButtonProps | [ICommandButtonControlProps](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/common/interfaces/ICommandButtonControlProps.ts) | No | Define more properties of the "Accept audio call" button | [defaultIncomingCallControlProps](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/callingcontainer/subcomponents/IncomingCall/common/defaultProps/defaultIncomingCallControlProps.ts)
videoCallButtonProps | [ICommandButtonControlProps](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/common/interfaces/ICommandButtonControlProps.ts) | No | Define more properties of the "Accept video call" button | [defaultIncomingCallControlProps](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/callingcontainer/subcomponents/IncomingCall/common/defaultProps/defaultIncomingCallControlProps.ts)
declineCallButtonProps | [ICommandButtonControlProps](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/common/interfaces/ICommandButtonControlProps.ts) | No | Define more properties of the "Decline call" button | [defaultIncomingCallControlProps](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/callingcontainer/subcomponents/IncomingCall/common/defaultProps/defaultIncomingCallControlProps.ts)
leftGroup | {gap?: number, children: ReactNode[] \| string[]} | No | Add more custom components on the left side of the control | -
middleGroup | {gap?: number, children: ReactNode[] \| string[]} | No | Add more custom components on the middle section of the control | -
rightGroup | {gap?: number, children: ReactNode[] \| string[]} | No | Add more custom components on the right side of the control | -

### [ICurrentCallStyleProps](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/header/interfaces/IHeaderStyleProps.ts)

