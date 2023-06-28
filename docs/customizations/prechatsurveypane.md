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
| id | string | No | The top-level element id for the header | "lcw-prechat-survey-pane-default" |
| role | string | No | Sets the `role` attribute at the top level element of the `PreChatSurveyPane` component | "alert" |
| dir | string | No | The locale direction under the `PreChatSurveyPane` component | "auto" |
| payload | string | No | Adaptive Card payload of `PreChatSurvey` | - |
| adaptiveCardHostConfig | string | No | Sets how an Adaptive Card Renderer generates UI | "{\"fontFamily\":\"Segoe UI, Helvetica Neue, sans-serif\",\"containerStyles\":{\"default\":{\"foregroundColors\":{\"default\":{\"default\":\"#000000\"}},\"backgroundColor\":\"#FFFFFF\"}},\"actions\":{\"actionsOrientation\":\"Vertical\",\"actionAlignment\":\"stretch\"}}" |
| requiredFieldMissingMessage | string | No | Error message on validating inputs | "{0} field is required" |
| onSubmit | () => void) | No | Sets the behavior after the `PreChatSurveyPane` is submitted | [Starts the chat flow] |

### IPreChatSurveyPaneStyleProps

| Attribute | Type | Required | Description | Default |
| --- | --- | --- | --- | --- |
| generalStyleProps | [IStyle](https://github.com/microsoft/fluentui/blob/master/packages/merge-styles/src/IStyle.ts) | No | Overall styles of `PreChatSurveyPane` | [defaultGeneralPreChatSurveyPaneStyleProps](./../../chat-widget/src/components/prechatsurveypanestateful/common/defaultStyles/defaultGeneralPreChatSurveyPaneStyleProps.ts)
| adaptiveCardContainerStyleProps | [IStyle](https://github.com/microsoft/fluentui/blob/master/packages/merge-styles/src/IStyle.ts) | No | Styles of the adaptive card container | [defaultPreChatSurveyPaneACContainerStyles.ts](../../chat-components/src/components/prechatsurveypane/common/defaultProps/defaultStyles/defaultPreChatSurveyPaneACContainerStyles.ts) |
| customButtonStyleProps | [IPreChatSurveyPaneButtonStyles](../../chat-components/src/components/prechatsurveypane/interfaces/IPreChatSurveyPaneButtonStyles.ts) | No | Styles of the `PreChatSurveyPane` submit button | [defaultPreChatSurveyPaneButtonStyles.ts](../../chat-components/src/components/prechatsurveypane/common/defaultProps/defaultStyles/defaultPreChatSurveyPaneButtonStyles.ts) |
| customTextStyleProps | [IPreChatSurveyPaneElementStyles](../../chat-components/src/components/prechatsurveypane/interfaces/IPreChatSurveyPaneElementStyles.ts) | No | Styles of the `PreChatSurveyPane` texts | - |
| customTextInputStyleProps | [IPreChatSurveyPaneElementStyles](../../chat-components/src/components/prechatsurveypane/interfaces/IPreChatSurveyPaneElementStyles.ts) | No | Styles of the `PreChatSurveyPane` text inputs | [defaultPreChatSurveyPaneTextInputStyles.ts](../../chat-components/src/components/prechatsurveypane/common/defaultProps/defaultStyles/defaultPreChatSurveyPaneTextInputStyles.ts) |
| customMultilineTextInputStyleProps | [IPreChatSurveyPaneElementStyles](../../chat-components/src/components/prechatsurveypane/interfaces/IPreChatSurveyPaneElementStyles.ts) | No | Styles of the `PreChatSurveyPane` multiple text inputs | [defaultPreChatSurveyPaneMultilineTextInputStyles.ts](../../chat-components/src/components/prechatsurveypane/common/defaultProps/defaultStyles/defaultPreChatSurveyPaneMultilineTextInputStyles.ts) |
| customMultichoiceInputStyleProps | [IPreChatSurveyPaneElementStyles](../../chat-components/src/components/prechatsurveypane/interfaces/IPreChatSurveyPaneElementStyles.ts) | No | Styles of the `PreChatSurveyPane` multiple choice inputs | [defaultPreChatSurveyPaneMultichoiceInputStyles.ts](../../chat-components/src/components/prechatsurveypane/common/defaultProps/defaultStyles/defaultPreChatSurveyPaneMultichoiceInputStyles.ts) |

## Sample Scenarios