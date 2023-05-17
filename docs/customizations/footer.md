# Footer

## Table of contents
- [Interfaces](#interfaces)
    - [IFooterProps](#ifooterprops)
    - [IFooterComponentOverrides](#ifootercomponentoverrides)
    - [IFooterControlProps](#ifootercontrolprops)
    - [IFooterStyleProps](#ifooterstyleprops)
- [Sample Scenarios](#sample-scenarios)
    - [Changing footer title and icon](#changing-footer-title-and-icon)
    - [Changing button icons](#changing-button-icons)
    - [Hiding sub-components](#hiding-sub-components)
    - [Adding a custom button](#adding-a-custom-button)
    - [Adding a custom image](#adding-a-custom-image)
    - [Changing element styles](#changing-element-styles)

## Interfaces

### [IFooterProps](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/footer/interfaces/IFooterProps.ts)

The top-level interface for customizing `Footer`.

| Attribute | Type | Required | Description | Default |
| - | - | - | - | - |
| `componentOverrides`     | [`IFooterComponentOverrides`](#ifootercomponentoverrides)     | No | Used for overriding default `Footer` components, including all the default buttons | -
`controlProps` | [`IFooterControlProps`](#ifootercontrolprops) | No | Properties that control the element behariors | -
`styleProps` | [`IFooterStyleProps`](#ifooterstyleprops) | No | Properties that control the element styles | -

### [IFooterComponentOverrides](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/footer/interfaces/IFooterComponentOverrides.ts)

Custom React components can be passed as input to override the default sub-components. Alternatively, you can stringify the React component before passing it in. The `chat-components` library provides one util function that can be used: [`encodeComponentString`](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/common/encodeComponentString.ts).

| Attribute | Type | Required | Description	| Default |	
| - | - | - | - | - |
| `DownloadTranscriptButton`     | `ReactNode\|string`     | No | Used for overriding default download transcript button | -
`EmailTranscriptButton` | `ReactNode\|string` | No | Used for overriding default email transcript button | -
`AudioNotificationButton` | `ReactNode\|string` | No | Used for overriding default audio toggle button | -

### [IFooterControlProps](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/footer/interfaces/IFooterControlProps.ts)

| Attribute | Type | Required | Description | Default |	
| - | - | - | - | - |
| `id`     | `string`     | No | The top-level element id for the footer | `"oc-lcw-footer"`
`hideDownloadTranscriptButton` | `boolean` | No | Whether to hide the download transcript button on the footer | `false`
`hideEmailTranscriptButton` | `boolean` | No | Whether to hide the email transcript button on the footer | `false`
`hideAudioNotificationButton` | `boolean` | No | Whether to hide the audio notification button on the footer | `false`
`onDownloadTranscriptClick` | `() => void` | No | The callback function that will be triggered when the download transcript button is clicked | [Starts downloading the whole transcript]
`onEmailTranscriptClick` | `() => void` | No | The callback function that will be triggered when the email transcript button is clicked | [Opens the pane for sending transcript over email]
`onAudioNotificationClick` | `() => void` | No | The callback function that will be triggered when the audio notification button is clicked | [Toggles audio notification on/off]
`downloadTranscriptButtonProps` | [`ICommandButtonControlProps`](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/common/interfaces/ICommandButtonControlProps.ts) | No | Properties to further customize the download transcript button | [`defaultFooterControlProps`](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/footer/common/defaultProps/defaultFooterControlProps.ts)
`emailTranscriptButtonProps` | [`ICommandButtonControlProps`](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/common/interfaces/ICommandButtonControlProps.ts) | No | Properties to further customize the email transcript button | [`defaultFooterControlProps`](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/footer/common/defaultProps/defaultFooterControlProps.ts)
`audioNotificationButtonProps` | [`ICommandButtonControlProps`](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/common/interfaces/ICommandButtonControlProps.ts) | No | Properties to further customize the audio notification button | [`defaultFooterControlProps`](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/footer/common/defaultProps/defaultFooterControlProps.ts)
`dir` | `"rtl"\|"ltr"\|"auto"` | No | The locale direction under the `Footer` component | `"ltr"`
`leftGroup` | `{children: ReactNode[]\|string[]}` | No | Additional custom components to be added on the left side of the footer (right of the default sub-components)| -
`middleGroup` | `{children: ReactNode[]\|string[]}` | No | Additional custom components to be added on the middle section of the footer | -
`rightGroup` | `{children: ReactNode[]\|string[]}` | No | Additional custom components to be added on the right side of the footer (left of the default sub-components) | -

> :pushpin: If both `hide-` option and `componentOverride` are used on the same sub-component, that sub-component will be hidden. `hide-` options take higher priority.

> :pushpin: `leftGroup`, `middleGroup`, and `rightGroup` take in the same kind of input types as with `componentOverrides` inputs.

### [IFooterStyleProps](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/footer/interfaces/IFooterStyleProps.ts)

[`IStyle`](https://github.com/microsoft/fluentui/blob/master/packages/merge-styles/src/IStyle.ts) is the interface provided by [FluentUI](https://developer.microsoft.com/en-us/fluentui#/). 

| Attribute | Type | Required | Description | Default |	
| - | - | - | - | - |
| `generalStyleProps` | [`IStyle`](https://github.com/microsoft/fluentui/blob/master/packages/merge-styles/src/IStyle.ts) | No | Overall styles of the `Footer` component, including the container | [`defaultFooterStyleProps`](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/footer/common/defaultStyles/defaultFooterStyleProps.ts) |
| `downloadTranscriptButtonStyleProps` | [`IStyle`](https://github.com/microsoft/fluentui/blob/master/packages/merge-styles/src/IStyle.ts) | No | Styles of the download transcript button | [`defaultFooterStyleProps`](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/footer/common/defaultStyles/defaultFooterStyleProps.ts) |
| `downloadTranscriptButtonHoverStyleProps` | [`IStyle`](https://github.com/microsoft/fluentui/blob/master/packages/merge-styles/src/IStyle.ts) | No | Styles of the download transcript button while hovered | [`defaultFooterStyleProps`](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/footer/common/defaultStyles/defaultFooterStyleProps.ts) |
| `emailTranscriptButtonStyleProps` | [`IStyle`](https://github.com/microsoft/fluentui/blob/master/packages/merge-styles/src/IStyle.ts) | No | Styles of the email transcript button | [`defaultFooterStyleProps`](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/footer/common/defaultStyles/defaultFooterStyleProps.ts) |
| `emailTranscriptButtonHoverStyleProps` | [`IStyle`](https://github.com/microsoft/fluentui/blob/master/packages/merge-styles/src/IStyle.ts) | No | Styles of the email transcript button while hovered | [`defaultFooterStyleProps`](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/footer/common/defaultStyles/defaultFooterStyleProps.ts) |
| `audioNotificationButtonStyleProps` | [`IStyle`](https://github.com/microsoft/fluentui/blob/master/packages/merge-styles/src/IStyle.ts) | No | Styles of the audio notification button | [`defaultFooterStyleProps`](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/footer/common/defaultStyles/defaultFooterStyleProps.ts) |
| `audioNotificationButtonHoverStyleProps` | [`IStyle`](https://github.com/microsoft/fluentui/blob/master/packages/merge-styles/src/IStyle.ts) | No | Styles of the audio notification button while hovered | [`defaultFooterStyleProps`](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/footer/common/defaultStyles/defaultFooterStyleProps.ts) |
| `footerItemFocusStyleProps` | [`IStyle`](https://github.com/microsoft/fluentui/blob/master/packages/merge-styles/src/IStyle.ts) | No | Styles of the footer sub-components while focused | [`defaultFooterStyleProps`](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/footer/common/defaultStyles/defaultFooterStyleProps.ts) |

## Sample Scenarios

Below samples are build upon the base sample, which can be found [here](https://github.com/microsoft/omnichannel-chat-widget#example-usage). The code snippets below will only show the changes needed to be added before `ReactDOM.render`.

--------------------------------
### Replacing default sub-components with copyright disclaimer
<details>
    <summary>Show code</summary>

```tsx
...
liveChatWidgetProps = {
    ...liveChatWidgetProps,
    footerProps: {
        controlProps: {
            footerIconProps: {
                src: "https://msft-lcw-trial.azureedge.net/public/resources/microsoft.jpg"
            },
            footerTitleProps: {
                text: "Contoso Coffee"
            },
        }
    }
};
...
```
</details>

<img src="../.attachments/customizations-footer-change-title-icon.png" width="450">

--------------------------------
### Changing button icons
<details>
    <summary>Show code</summary>

```tsx
...
liveChatWidgetProps = {
    ...liveChatWidgetProps,
    footerProps: {
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

<img src="../.attachments/customizations-footer-change-button-icons.png" width="450">

--------------------------------
### Hiding sub-components
<details>
    <summary>Show code</summary>

```tsx
...
liveChatWidgetProps = {
    ...liveChatWidgetProps,
    footerProps: {
        controlProps: {
            hideMinimizeButton: true,
            hideIcon: true
        }
    }
};
...
```
</details>

<img src="../.attachments/customizations-footer-hide-elements.png" width="450">

--------------------------------
### Adding a custom button
<details>
    <summary>Show code</summary>

```tsx
...
const CustomButton = () => {
    const onClick = () => {
        alert("Clicked custom button!");
    };
    return (
        <button onClick={onClick}>Custom Button</button>
    );
};

liveChatWidgetProps = {
    ...liveChatWidgetProps,
    footerProps: {
        controlProps: {
            rightGroup: {
                children: [
                    <CustomButton/>
                ]
            }
        }
    }
};
...
```
</details>

<img src="../.attachments/customizations-footer-add-custom-button.gif" width="450">

--------------------------------
### Adding a custom image
<details>
    <summary>Show code</summary>

```tsx
...
const CustomImage = () => {
    return (
        <img style={{width: "35px", height:"35px", margin:"3px"}}
            src="https://msft-lcw-trial.azureedge.net/public/resources/microsoft.jpg"></img>
    );
};

liveChatWidgetProps = {
    ...liveChatWidgetProps,
    footerProps: {
        controlProps: {
            hideIcon: true,
            hideTitle: true,
            hideMinimizeButton: true,
            hideCloseButton: true,
            middleGroup: {
                children: [
                    <CustomImage/>
                ]
            }
        }
    }
};
...
```
</details>

<img src="../.attachments/customizations-footer-add-custom-image.png" width="450">

--------------------------------
### Changing element styles
<details>
    <summary>Show code</summary>

```tsx
...
liveChatWidgetProps = {
    ...liveChatWidgetProps,
    styleProps: {
        ...liveChatWidgetProps.styleProps,
        generalStyles: {
            ...liveChatWidgetProps.styleProps.generalStyles,
            borderRadius: "10px 10px 0 0",
        }
    },
    footerProps: {
        styleProps: {
            generalStyleProps: {
                borderRadius: "10px 10px 0 0",
                backgroundColor: "#ffdae9",
            },
            iconStyleProps: {
                width: "50px",
                height: "50px"
            },
            titleStyleProps: {
                color: "black",
                fontWeight: 600
            },
            closeButtonStyleProps: {
                margin: "10px 5px 5px 5px",
                color: "black"
            },
            closeButtonHoverStyleProps: {
                backgroundColor: "rgb(200, 200, 200, 0.2)",
                margin: "10px 5px 5px 5px",
                color: "black"
            },
            minimizeButtonStyleProps: {
                margin: "10px 5px 5px 5px",
                color: "black"
            },
            minimizeButtonHoverStyleProps: {
                backgroundColor: "rgb(200, 200, 200, 0.2)",
                margin: "10px 5px 5px 5px",
                color: "black"
            }
        }
    }
};
...
```
</details>

<img src="../.attachments/customizations-footer-change-styles.png" width="450">