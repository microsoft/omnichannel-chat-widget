# Header

## Table of contents
- [Introduction](#intr)
- [Interfaces](#interfaces)
    - [IWebChatContainerStatefulProps](#iwebchatcontainerstatefulprops)
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

[WebChat](https://github.com/microsoft/BotFramework-WebChat) is a customizable chat widget owned by Microsoft BotFramework, that the LiveChatWidget uses as the chat container. Instead of exposing css style customizations for components, WebChat has it's own set of customizabilities. 

Instead of static styles, WebChat exposes middlewares that you can use to inject your custom logic and styles for components like message bubbles, attachments, timestamps, typing indicators, etc. Other middlewares let you change certain behaviors on state change like "Send Button Click", or "WebChat Connected". LiveChatWidget has some default middlewares implemented, and you can choose to completely disable them, overwrite them with your own middlewares, or tweak our default middlewares using props defined in LiveChatWidget. More details on that in below sections.

For more information on WebChat customization, please go to WebChat's official [GitHub page](https://github.com/microsoft/BotFramework-WebChat).

## Interfaces

### [IWebChatContainerStatefulProps](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-widget/src/components/webchatcontainerstateful/interfaces/IWebChatContainerStatefulProps.ts)

> The top-level interface for customizing `WebChatContainer`.

> [IStyle](https://github.com/microsoft/fluentui/blob/master/packages/merge-styles/src/IStyle.ts) is the interface provided by [FluentUI](https://developer.microsoft.com/en-us/fluentui#/).

| Attribute | Type | Required | Description | Default |
| - | - | - | - | - |
| containerStyles    | [IStyle](https://github.com/microsoft/fluentui/blob/master/packages/merge-styles/src/IStyle.ts)     | No | Overall styles of the `WebChatContainer` component, specifically on the container | [defaultWebChatStatefulContainerStyles](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-widget/src/components/webchatcontainerstateful/common/defaultStyles/defaultWebChatStatefulContainerStyles.ts)
| webChatStyles  | [StyleOptions](https://github.com/microsoft/BotFramework-WebChat/blob/main/packages/api/src/StyleOptions.ts)     | No | The set of styles exposed by the `WebChat` component | [defaultWebChatStyles](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-widget/src/components/webchatcontainerstateful/common/defaultStyles/defaultWebChatStyles.ts)
| webChatProps  | [IWebChatProps](#iwebchatprops)  | No | The props of the `WebChat` component, minus the "styleOptions", which is separated out above  | [defaultWebChatStatefulProps](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-widget/src/components/webchatcontainerstateful/common/defaultProps/defaultWebChatStatefulProps.ts). **This file is not the complete list. Please see the "Middlewares" section below**
| directLine  | any  | No | WebChat by default uses DirectLine services as the communication service. In LiveChatWidget case, we are overwriting this prop with ACS Adapter to connect to ACS, which is the chat service used in Omnichannel. Most likely you do not want to touch this | see below
| storeMiddlewares  | any[]  | No | A list of middlewares that you want to run alongside the default WebChat behaviors. LiveChatWidget has implemented several by default. More samples below | see below
| renderingMiddlewareProps  | IRenderingMiddlewareProps(#irenderingmiddlewareprops) | No | For the default rendering middlewares See the "Middlewares" section below | [defaultStyles](https://github.com/microsoft/omnichannel-chat-widget/tree/main/chat-widget/src/components/webchatcontainerstateful/webchatcontroller/middlewares/renderingmiddlewares/defaultStyles). This is the folder that holds all the default rendering middleware styles




`controlProps` | [`IHeaderControlProps`](#iheadercontrolprops) | No | Properties that control the element behariors | -
`styleProps` | [`IHeaderStyleProps`](iheaderstyleprops) | No | Properties that control the element styles | -

### [IHeaderComponentOverrides](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/header/interfaces/IHeaderComponentOverrides.ts)

Custom React components can be passed as input to override the default sub-components. Alternatively, you can stringify the React component before passing it in. The `chat-components` library provides one util function that can be used: [`encodeComponentString`](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/common/encodeComponentString.ts).

| Attribute | Type | Required | Description	| Default |	
| - | - | - | - | - |
| `headerIcon`     | `ReactNode\|string`     | No | Used for overriding default header icon | -
`headerTitle` | `ReactNode\|string` | No | Used for overriding default header title | -
`headerMinimizeButton` | `ReactNode\|string` | No | Used for overriding default minimize button | -
`headerCloseButton` | `ReactNode\|string` | No | Used for overriding default close button | -

### [IHeaderControlProps](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/header/interfaces/IHeaderControlProps.ts)

| Attribute | Type | Required | Description | Default |	
| - | - | - | - | - |
| `id`     | `string`     | No | The top-level element id for the header | `"oc-lcw-header"`
`hideIcon` | `boolean` | No | Whether to hide the icon on the header | `false`
`hideTitle` | `boolean` | No | Whether to hide the title string on the header | `false`
`hideMinimizeButton` | `boolean` | No | Whether to hide the minimize button on the header | `false`
`hideCloseButton` | `ReactNode\|string` | No | Whether to hide the close button on the header | `false`
`onMinimizeClick` | `() => void` | No | The callback function that will be triggered when the minimize button is clicked | [Minimizes the chat widget]
`onCloseClick` | `() => void` | No | The callback function that will be triggered when the close button is clicked | [Closes the chat widget]
`minimizeButtonProps` | [`ICommandButtonControlProps`](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/common/interfaces/ICommandButtonControlProps.ts) | No | Properties to further customize the default minimize button | [`defaultHeaderControlProps`](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/header/common/defaultProps/defaultHeaderControlProps.ts)
`closeButtonProps` | [`ICommandButtonControlProps`](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/common/interfaces/ICommandButtonControlProps.ts) | No | Properties to further customize the default close button | [`defaultHeaderControlProps`](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/header/common/defaultProps/defaultHeaderControlProps.ts)
`headerIconProps` | [`IImageControlProps`](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/common/interfaces/IImageControlProps.ts) | No | Properties to further customize the default header icon | [`defaultHeaderControlProps`](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/header/common/defaultProps/defaultHeaderControlProps.ts)
`headerTitleProps` | [`ILabelControlProps`](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/common/interfaces/ILabelControlProps.ts) | No | Properties to further customize the default header title | [`defaultHeaderControlProps`](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/header/common/defaultProps/defaultHeaderControlProps.ts)
`dir` | `"rtl"\|"ltr"\|"auto"` | No | The locale direction under the `Header` component | `"ltr"`
`leftGroup` | `{children: ReactNode[]\|string[]}` | No | Additional custom components to be added on the left side of the header (right of the default sub-components)| -
`middleGroup` | `{children: ReactNode[]\|string[]}` | No | Additional custom components to be added on the middle section of the header | -
`rightGroup` | `{children: ReactNode[]\|string[]}` | No | Additional custom components to be added on the right side of the header (left of the default sub-components) | -

> :pushpin: If both `hide-` option and `componentOverride` are used on the same sub-component, that sub-component will be hidden. `hide-` options take higher priority.

> :pushpin: `leftGroup`, `middleGroup`, and `rightGroup` take in the same kind of input types as with `componentOverrides` inputs.

### [IHeaderStyleProps](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/header/interfaces/IHeaderStyleProps.ts)

[`IStyle`](https://github.com/microsoft/fluentui/blob/master/packages/merge-styles/src/IStyle.ts) is the interface provided by [FluentUI](https://developer.microsoft.com/en-us/fluentui#/). 

| Attribute | Type | Required | Description | Default |	
| - | - | - | - | - |
| `generalStyleProps` | [`IStyle`](https://github.com/microsoft/fluentui/blob/master/packages/merge-styles/src/IStyle.ts) | No | Overall styles of the `Header` component, including the container | [`defaultHeaderStyleProps`](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/header/common/defaultStyles/defaultHeaderStyleProps.ts) |
| `iconStyleProps` | [`IStyle`](https://github.com/microsoft/fluentui/blob/master/packages/merge-styles/src/IStyle.ts) | No | Styles of the header icon | [`defaultHeaderStyleProps`](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/header/common/defaultStyles/defaultHeaderStyleProps.ts) |
| `titleStyleProps` | [`IStyle`](https://github.com/microsoft/fluentui/blob/master/packages/merge-styles/src/IStyle.ts) | No | Styles of the header title | [`defaultHeaderStyleProps`](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/header/common/defaultStyles/defaultHeaderStyleProps.ts) |
| `closeButtonStyleProps` | [`IStyle`](https://github.com/microsoft/fluentui/blob/master/packages/merge-styles/src/IStyle.ts) | No | Styles of the header close button | [`defaultHeaderStyleProps`](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/header/common/defaultStyles/defaultHeaderStyleProps.ts) |
| `closeButtonHoverStyleProps` | [`IStyle`](https://github.com/microsoft/fluentui/blob/master/packages/merge-styles/src/IStyle.ts) | No | Styles of the header close button while hovered | [`defaultHeaderStyleProps`](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/header/common/defaultStyles/defaultHeaderStyleProps.ts) |
| `minimizeButtonStyleProps` | [`IStyle`](https://github.com/microsoft/fluentui/blob/master/packages/merge-styles/src/IStyle.ts) | No | Styles of the header minimize button | [`defaultHeaderStyleProps`](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/header/common/defaultStyles/defaultHeaderStyleProps.ts) |
| `minimizeButtonHoverStyleProps` | [`IStyle`](https://github.com/microsoft/fluentui/blob/master/packages/merge-styles/src/IStyle.ts) | No | Styles of the header close button while hovered | [`defaultHeaderStyleProps`](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/header/common/defaultStyles/defaultHeaderStyleProps.ts) |
| `headerItemFocusStyleProps` | [`IStyle`](https://github.com/microsoft/fluentui/blob/master/packages/merge-styles/src/IStyle.ts) | No | Styles of the header sub-components while focused | [`defaultHeaderStyleProps`](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/header/common/defaultStyles/defaultHeaderStyleProps.ts) |

## Sample Scenarios

Below samples are build upon the base sample, which can be found [here](https://github.com/microsoft/omnichannel-chat-widget#example-usage). The code snippets below will only show the changes needed to be added before `ReactDOM.render`.

--------------------------------
### Changing header title and icon
<details>
    <summary>Show code</summary>

```tsx
...
liveChatWidgetProps = {
    ...liveChatWidgetProps,
    headerProps: {
        controlProps: {
            headerIconProps: {
                src: "https://msft-lcw-trial.azureedge.net/public/resources/microsoft.jpg"
            },
            headerTitleProps: {
                text: "Contoso Coffee"
            },
        }
    }
};
...
```
</details>

<img src="../.attachments/customizations-header-change-title-icon.png" width="450">

--------------------------------
### Changing button icons
<details>
    <summary>Show code</summary>

```tsx
...
liveChatWidgetProps = {
    ...liveChatWidgetProps,
    headerProps: {
        controlProps: {
            minimizeButtonProps: {
                iconName: "MiniContract"
            },
            closeButtonProps: {
                iconName: "Leave"
            },
        }
    }
};
...
```
</details>

<img src="../.attachments/customizations-header-change-button-icons.png" width="450">
