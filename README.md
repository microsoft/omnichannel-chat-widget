# Omnichannel Live Chat Widget UI Components

[![npm version](https://badge.fury.io/js/%40microsoft%2Fomnichannel-chat-components.svg)](https://badge.fury.io/js/%40microsoft%2Fomnichannel-chat-components.svg) ![Release CI](https://github.com/microsoft/omnichannel-chat-widget/workflows/chat-components-release/badge.svg) ![npm](https://img.shields.io/npm/dm/@microsoft/omnichannel-chat-components)

[@microsoft/omnichannel-chat-widget](https://www.npmjs.com/package/@microsoft/omnichannel-chat-widget) is a React-based UI component library which allows you to build your own live chat widget experience using [@microsoft/omnichannel-chat-sdk](https://www.npmjs.com/package/@microsoft/omnichannel-chat-sdk).

## Table of Contents

1. [Introduction](#introduction)
1. [Installation](#installation)
1. [Example Usage](#example-usage)
1. [Customizations](#customizations)
1. [Telemetry](#telemetry)
1. [Features](#features)

## Introduction

Omnichannel Live Chat Widget UI Components offers a re-usable component-based library to help create a custom chat widget that can be connected to the Dynamics 365 Customer Service experience.

For more information about Live Chat Widget, see [here](https://docs.microsoft.com/en-us/dynamics365/customer-service/set-up-chat-widget).

## Installation

```powershell
npm i @microsoft/omnichannel-chat-sdk
npm i @microsoft/omnichannel-chat-widget
```

or

```powershell
yarn add @microsoft/omnichannel-chat-sdk
yarn add @microsoft/omnichannel-chat-widget
```

The repo also contains the ```@microsoft/omnichannel-chat-components``` package, which is a collection of UI components. The ```@microsoft/omnichannel-chat-widget``` package is an integration of the Chat SDK and the UI components. To install the UI components separately, do

```powershell
npm i @microsoft/omnichannel-chat-components
```

or

```powershell
yarn add @microsoft/omnichannel-chat-components
```

## Example Usage

The basic example below takes in the ```<LiveChatWidget/>``` component along with the Chat SDK to create a customized Omnichannel chat widget.
> :warning: The Chat SDK has to be **_initialized_** before being passed in.

```js
import * as React from "react";

import LiveChatWidget from "@microsoft/omnichannel-chat-widget";
import { OmnichannelChatSDK } from "@microsoft/omnichannel-chat-sdk";
import ReactDOM from "react-dom";

const render = async () => {
    const omnichannelConfig = {
        orgId: "00000000-0000-0000-0000-000000000000", // dummy config
        orgUrl: "https://www.org-url.com", // dummy config
        widgetId: "00000000-0000-0000-0000-000000000000" // dummy config
    };
    const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
    await chatSDK.initialize(); // mandatory
    const chatConfig = await chatSDK.getLiveChatConfig();
    liveChatWidgetProps = {
        styleProps: {
            generalStyles: {
                width: "700px",
                height: "800px"
            }
        },
        headerProps: {
            controlProps: {
                hideMinimizeButton: true
            }
        },
        chatSDK: chatSDK, // mandatory
        chatConfig: chatConfig // mandatory
    };

    ReactDOM.render(
        <LiveChatWidget {...liveChatWidgetProps}/>,
        document.getElementById("my-container")
    );
};

render();
```

## Components

### Stateless UI Components

These are components that are included in the ```@microsoft/omnichannel-chat-components``` package.

| Component |  Usage | Interface |
| ----- | -------- | ----- |
| CallingContainerPane | The container for voice and video feature in the chat widget | [ICallingContainerProps](chat-components\src\components\callingcontainer\interfaces\ICallingContainerProps.ts) |
| ChatButton | The button that appears on the user's portal that is designed to be the entry point for the user to initate chat | [IChatButtonProps](chat-components\src\components\chatbutton\interfaces\IChatButtonProps.ts) |
| CommandButton | A customizable button component that can be injected to the header and/or footer | [ICommandButtonProps](chat-components\src\components\common\interfaces\ICommandButtonProps.ts)|
| ConfirmationPane | The default pane used when the Header close button is launched | [IConfirmationPaneProps](chat-components\src\components\confirmationpane\interfaces\IConfirmationPaneProps.ts) |
| Footer | The bottom container of the chat containing the download transcript, notification sound and email transcript buttons by default. | [IFooterProps](chat-components\src\components\footer\interfaces\IFooterProps.ts) |
| Header | The top container of the chat containing the default minimize, close and title of the chat widget | [IHeaderProps](chat-components\src\components\header\interfaces\IHeaderProps.ts) |
| InputValidationPane | A pop-up input pane with validation. In the default widget this is used as part of [EmailTranscriptPane](chat-widget\src\components\emailtranscriptpanestateful\interfaces\IEmailTranscriptPaneProps.ts) | [IInputValidationPaneProps](chat-components\src\components\inputvalidationpane\interfaces\IInputValidationPaneProps.ts) |
| LoadingPane | The default pane used after the chat button is clicked and before the chat loads completely | [ILoadingPaneProps](chat-components\src\components\loadingpane\interfaces\ILoadingPaneProps.ts) |
| OutOfOfficeHoursPane | The pane that is displayed when the chat is outside of operating hours set on admin side | [IOOOHPaneProps](chat-components\src\components\outofofficehourspane\interfaces\IOOOHPaneProps.ts) |
| PostChatSurveyPane | The pane that holds the [Customer Voice](https://dynamics.microsoft.com/en-us/customer-voice/overview/) survey which would be used by the customer to input their chat experience, provide user ratings etc. It uses an IFrame to render the survey URL fetched from `getPostChatSurveyContext` call from [OmniChannel ChatSDK](https://github.com/microsoft/omnichannel-chat-sdk#get-postchat-survey). | [IPostChatSurveyPaneProps](chat-components\src\components\postchatsurveypane\interfaces\IPostChatSurveyPaneProps.ts) |
| PreChatSurveyPane | The pane that holds the form which would be used by the customer to input helpful information for using the Support Chat before starting up the Chat Process. Makes use of [AdaptiveCards](https://adaptivecards.io/) | [IPreChatSurveyPaneProps](chat-components\src\components\prechatsurveypane\interfaces\IPreChatSurveyPaneProps.ts) |
| ProactiveChatSurveyPane | A pane that holds more information than a normal chat button and can be configured to proactively pop up | [IProactiveChatPaneProps](chat-components\src\components\proactivechatpane\interfaces\IProactiveChatPaneProps.ts) |
| ReconnectChatPane | The pane that shows up when the customer is re-connecting to the chat to add additional conversation | [IReconnectChatPaneProps](chat-components\src\components\reconnectchatpane\interfaces\IReconnectChatPaneProps.ts) |

> :warning: Because the components extend Microsoft's [Fluent UI](https://developer.microsoft.com/en-us/fluentui#/) components, the base interface for all the ```styleProps``` in the above table is [IStyle](https://github.com/microsoft/fluentui/blob/master/packages/merge-styles/src/IStyle.ts), which extends the [IRawStyleBase](https://docs.microsoft.com/en-us/javascript/api/merge-styles/irawstylebase?view=office-ui-fabric-react-latest) interface, which is the most useful reference.

### Stateful Components

| Component | Default Usage | Interface |
| ----- | -------- | ----- |
| LiveChatWidget | The default widget that stitches the UI components with Chat SDK | [ILiveChatWidgetProps](chat-widget\src\components\livechatwidget\interfaces\ILiveChatWidgetProps.ts) |

Some of the interfaces listed in the Stateless table have Stateful counterparts defined in the ```@microsoft/omnichannel-chat-widget``` package. For example, [IConfirmationPaneStatefulProps](chat-widget\src\components\confirmationpanestateful\interfaces\IConfirmationPaneStatefulProps.ts) extends [IConfirmationPaneProps](chat-components\src\components\confirmationpane\interfaces\IConfirmationPaneProps.ts) with additional attributes that only makes sense in the stateful context.

### Default Props

For a list of all default props used in the default stateful widget, please see [here](chat-widget\src\components\livechatwidget\common\defaultProps\dummyDefaultProps.ts). If you want to change a default prop, you need to explicitly set it and parse the object as the argument to ```<LiveChatWidget/>```

### Custom Components

There are two ways to custom the components provided in the library - 1) Replacing components using ComponentOverrides, and 2) Adding custom components in header and footer.

#### ComponentOverrides

Most sub-components and the default panes provided can be overriden. Components have "componentOverrides" as part of props interface, which consists of ReactNodes or strings for each part of the component. For example, the "ProactiveChatPane" component has a close button, and the close button can be overriden by creating a custom react node and setting it to the "closeButton" attribute of "componentOverrides" interface that is part of the props.

```js
const customButton = (
    <button style={{
        background: "green",
        height: "80px",
        margin: "30px 15px 0 0",
        padding: "10px",
        width: "160px"
    }}>
        This is a custom button
    </button>
);

const liveChatWidgetProps = {
    proactiveChatPaneProps: {
        componentOverrides: {
            closeButton: customButton
        };
    };
}
```

#### Custom Components in Header and Footer

Header's and Footer's child components consist of three parts:

1. "leftGroup" - adding child components at the left of the Header/Footer
1. "middleGroup" - adding child components in the middle of the Header/Footer
1. "rightGroup" - adding child components at the right of the Header/Footer

By default Header has the header icon and title on the left and minimize and close buttons on the right, and Footer has Download Transcript and Email Transcript buttons on the left and audio notification button on the right. These components can be overriden with [ComponentOverrides](#ComponentOverrides). In addition, other custom child components can be added to both Header and Footer by creating custom react nodes and adding them to attributes "leftGroup", "middleGroup" or "rightGroup" of "controlProps".

```js
const buttonStyleProps: IButtonStyles = {
    root: {
        color: "blue",
        height: 25,
        width: 25,
    }
};

const calendarIcon: IIconProps = { iconName: "Calendar" };
const calendarIconButton = <IconButton
    key="calendarIconButton"
    iconProps={calendarIcon}
    styles={buttonStyleProps}
    title="Calendar">
</IconButton>;

const emojiIcon: IIconProps = { iconName: "Emoji2" };
const emojiIconButton = <IconButton
    key="emojiIconButton"
    iconProps={emojiIcon}
    styles={buttonStyleProps}
    title="Sentiment">
</IconButton>;

const uploadIcon: IIconProps = { iconName: "Upload" };
const uploadIconButton = <IconButton
    key="uploadIconButton"
    iconProps={uploadIcon}
    styles={buttonStyleProps}
    title="Upload">
</IconButton>;

const customizedFooterProp: IFooterProps = {
    controlProps: {
        leftGroup: { children: [uploadIconButton] },
        middleGroup: { children: [calendarIconButton] },
        rightGroup: { children: [emojiIconButton] }
    }
};
```

> :pushpin: Note that [WebChat hooks](https://github.com/microsoft/BotFramework-WebChat/blob/main/docs/HOOKS.md) can also be used in any custom components.

## See Also

[Telemetry](./docs/Telemetry.md)
[Omnichannel Features](./docs/Features.md)
