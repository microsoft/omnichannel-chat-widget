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
| controlProps | [IPreChatSurveyPaneControlProps](#iprechatsurveypanecontrolprops) | No | Properties that control the element behaviors | - |
| styleProps | [IPreChatSurveyPaneStyleProps](#iprechatsurveypanecontrolprops) | No | Properties that control the element styles | - |

### IPreChatSurveyPaneControlProps

| Attribute | Type | Required | Description | Default |
| --- | --- | --- | --- | --- |
| id | string | No | The top-level element id for the header | |
| role | string | No | Sets the `role` attribute at the top level element of the `PreChatSurveyPane` component |
| dir | string | No | The locale direction under the `PreChatSurveyPane` component |
| payload | string | No | Adaptive Card payload of `PreChatSurvey` |
| adaptiveCardHostConfig | string | No | Sets how an Adaptive Card Renderer generates UI |
| requiredFieldMissingMessage | string | No | Adaptive Card  |
| onSubmit | () => void) | No | Sets the behavior after the `PreChatSurveyPane` is submitted |

### IPreChatSurveyPaneStyleProps

| Attribute | Type | Required | Description | Default |
| --- | --- | --- | --- | --- |
| generalStyleProps | [IStyle](https://github.com/microsoft/fluentui/blob/master/packages/merge-styles/src/IStyle.ts) | No |
| adaptiveCardContainerStyleProps | [IStyle](https://github.com/microsoft/fluentui/blob/master/packages/merge-styles/src/IStyle.ts) | No |
| customButtonStyleProps | [IPreChatSurveyPaneButtonStyles](../../chat-components/src/components/prechatsurveypane/interfaces/IPreChatSurveyPaneButtonStyles.ts) | No
| customTextStyleProps | [IPreChatSurveyPaneElementStyles](../../chat-components/src/components/prechatsurveypane/interfaces/IPreChatSurveyPaneElementStyles.ts) | No
| customTextInputStyleProps | [IPreChatSurveyPaneElementStyles](../../chat-components/src/components/prechatsurveypane/interfaces/IPreChatSurveyPaneElementStyles.ts) | No
| customMultilineTextInputStyleProps | [IPreChatSurveyPaneElementStyles](../../chat-components/src/components/prechatsurveypane/interfaces/IPreChatSurveyPaneElementStyles.ts) | No
| customMultichoiceInputStyleProps | [IPreChatSurveyPaneElementStyles](../../chat-components/src/components/prechatsurveypane/interfaces/IPreChatSurveyPaneElementStyles.ts) | No

## Sample Scenarios