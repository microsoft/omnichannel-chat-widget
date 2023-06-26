# Post chat survey pane

## Table of contents

- [Post chat survey pane](#post-chat-survey-pane)
  - [Table of contents](#table-of-contents)
  - [Interfaces](#interfaces)
    - [IPostChatSurveyPaneProps](#ipostchatsurveypaneprops)
    - [IPostChatSurveyPaneControlProps](#ipostchatsurveypanecontrolprops)
    - [IPostChatSurveyPaneStyleProps](#ipostchatsurveypanestyleprops)
    - [IPostChatSurveyPaneClassNames](#ipostchatsurveypaneclassnames)
  - [Sample Scenarios](#sample-scenarios)
    - [Extending post chat survey pane survey URL](#extending-post-chat-survey-pane-survey-url)
    - [Extending post chat survey pane container title](#extending-post-chat-survey-pane-container-title)

## Interfaces

### [IPostChatSurveyPaneProps](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/postchatsurveypane/interfaces/IPostChatSurveyPaneProps.ts)

The top-level interface for customizing `PostChatSurveyPane`.

| Attribute | Type | Required | Description | Default |
| - | - | - | - | - |
| controlProps | [IPostChatSurveyPaneControlProps](#ipostchatsurveypanecontrolprops) | No | Properties that control the element behariors | -
styleProps | [IPostChatSurveyPaneStyleProps](#ipostchatsurveypanestyleprops) | No | Properties that control the element styles | -

### [IPostChatSurveyPaneControlProps](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/postchatsurveypane/interfaces/IPostChatSurveyPaneControlProps.ts)

| Attribute | Type | Required | Description | Default |
| - | - | - | - | - |
| id     | string     | No | The top-level element id for the post chat survey pane | "lcw-postchat-survey-pane"
title | string | No | The post chat survey pane title | "Post chat survey pane"
role | string | No | Sets the `role` attribute at the top level element of the post chat survey pane | -

### [IPostChatSurveyPaneStyleProps](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/postchatsurveypane/interfaces/IPostChatSurveyPaneStyleProps.ts)

[IStyle](https://github.com/microsoft/fluentui/blob/master/packages/merge-styles/src/IStyle.ts) is the interface provided by [FluentUI](https://developer.microsoft.com/en-us/fluentui#/).

| Attribute | Type | Required | Description | Default |
| - | - | - | - | - |
| generalStyleProps | [IStyle](https://github.com/microsoft/fluentui/blob/master/packages/merge-styles/src/IStyle.ts) | No | Overall styles of the `PostChatSurveyPane` component, including the container | [defaultPostChatSurveyPaneGeneralStyles](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/postchatsurveypane/common/defaultProps/defaultStyles/defaultPostChatSurveyPaneGeneralStyles.ts) |
| classNames | [IPostChatSurveyPaneClassNames](#ipostchatsurveypaneclassnames) | No | Sets custom class names for sub-components | - |

### [IPostChatSurveyPaneClassNames](https://github.com/microsoft/omnichannel-chat-widget/blob/main/chat-components/src/components/postchatsurveypane/interfaces/IPostChatSurveyPaneClassNames.ts)

| Attribute | Type | Required | Description | Default |
| - | - | - | - | - |
| iframeClassName | string | No | Custom class name for `PostChatSurveyPane` | -

## Sample Scenarios

Below samples are build upon the base sample, which can be found [here](https://github.com/microsoft/omnichannel-chat-widget#example-usage). The code snippets below will only show the changes needed to be added before `ReactDOM.render`.

--------------------------------

### Extending post chat survey pane survey URL

<details>
    <summary>Show code</summary>

```tsx
...
liveChatWidgetProps = {
    ...liveChatWidgetProps,
    postChatSurveyPaneProps: {
					controlProps: {
						surveyURL: "https://tip.dcv.ms/CouM7itE1c"
					}
				}
};
...
```

</details>

<img src="../.attachments/post-chat-survey-pane-oob-survey.png" height="100">

<img src="../.attachments/customizations-post-chat-survey-pane-survey-url.png" height="100">

--------------------------------

### Extending post chat survey pane container title

<details>
    <summary>Show code</summary>

```tsx
...
liveChatWidgetProps = {
    ...liveChatWidgetProps,
    postChatSurveyPaneProps: {
					controlProps: {
						title: "This is custom title"
					}
				}
};
...
```

</details>

<img src="../.attachments/customizations-post-chat-survey-pane-container-title.png" height="100">

--------------------------------