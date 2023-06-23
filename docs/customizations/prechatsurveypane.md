# Pre-Chat Survey Pane

## Table of Contents
- [Interfaces](#interfaces)
    - [IPreChatSurveyPaneStatefulParams](#iprechatsurveypanestatefulparams)
    - [IPreChatSurveyPaneProps](#iprechatsurveypaneprops)
    - [IPreChatSurveyPaneStyleProps](#iprechatsurveypanecontrolprops)
- [Sample Scenarios](#sample-scenarios)

## Interfaces

### IPreChatSurveyPaneStatefulParams

| Attribute | Type | Required | Description | Default |
| --- | --- | --- | --- | --- |
| surveyProps | [IPreChatSurveyPaneProps](#iprechatsurveypaneprops) | No | Used for overriding default `Header` components | - |

### IPreChatSurveyPaneProps

| Attribute | Type | Required | Description | Default |
| --- | --- | --- | --- | --- |
| controlProps | [IPreChatSurveyPaneControlProps](#iprechatsurveypanecontrolprops) | No | Properties that control the element behaviors | [defaultPreChatSurveyPaneControlProps](../../chat-components//src/components/prechatsurveypane/common/defaultProps/defaultPreChatSurveyPaneControlProps.ts) |
| styleProps | [IPreChatSurveyPaneStyleProps](#iprechatsurveypanecontrolprops) | No | Properties that control the element styles | - |

### IPreChatSurveyPaneControlProps

| Attribute | Type | Required | Description | Default |
| --- | --- | --- | --- | --- |
| id | string | No | The top-level element id for the header | - |
| role | string | No | Sets the `role` attribute at the top level element of the `PreChatSurveyPane` component | - |
| dir | string | No | The locale direction under the `PreChatSurveyPane` component | - |
| payload | string | No | Adaptive Card payload of `PreChatSurvey` | - |
| adaptiveCardHostConfig | string | No | Sets how an Adaptive Card Renderer generates UI | - |
| requiredFieldMissingMessage | string | No | Error message on validating inputs | "{0} field is required" |
| onSubmit | () => void) | No | Sets the behavior after the `PreChatSurveyPane` is submitted | [Starts the chat flow] |

### IPreChatSurveyPaneStyleProps

| Attribute | Type | Required | Description | Default |
| --- | --- | --- | --- | --- |
| generalStyleProps | [IStyle](https://github.com/microsoft/fluentui/blob/master/packages/merge-styles/src/IStyle.ts) | No | Overall styles of `PreChatSurveyPane` | [defaultGeneralPreChatSurveyPaneStyleProps](./../../chat-widget/src/components/prechatsurveypanestateful/common/defaultStyles/defaultGeneralPreChatSurveyPaneStyleProps.ts)
| adaptiveCardContainerStyleProps | [IStyle](https://github.com/microsoft/fluentui/blob/master/packages/merge-styles/src/IStyle.ts) | No | Styles of the adaptive card container | - |
| customButtonStyleProps | [IPreChatSurveyPaneButtonStyles](../../chat-components/src/components/prechatsurveypane/interfaces/IPreChatSurveyPaneButtonStyles.ts) | No | Styles of the `PreChatSurveyPane` submit button | - |
| customTextStyleProps | [IPreChatSurveyPaneElementStyles](../../chat-components/src/components/prechatsurveypane/interfaces/IPreChatSurveyPaneElementStyles.ts) | No | Styles of the `PreChatSurveyPane` texts | - |
| customTextInputStyleProps | [IPreChatSurveyPaneElementStyles](../../chat-components/src/components/prechatsurveypane/interfaces/IPreChatSurveyPaneElementStyles.ts) | No | Styles of the `PreChatSurveyPane` text inputs | - |
| customMultilineTextInputStyleProps | [IPreChatSurveyPaneElementStyles](../../chat-components/src/components/prechatsurveypane/interfaces/IPreChatSurveyPaneElementStyles.ts) | No | Styles of the `PreChatSurveyPane` multiple text inputs | - |
| customMultichoiceInputStyleProps | [IPreChatSurveyPaneElementStyles](../../chat-components/src/components/prechatsurveypane/interfaces/IPreChatSurveyPaneElementStyles.ts) | No | Styles of the `PreChatSurveyPane` multiple choice inputs | - |

## Sample Scenarios