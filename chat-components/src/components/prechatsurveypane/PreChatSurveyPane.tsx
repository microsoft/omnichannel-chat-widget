import * as AdaptiveCards from "adaptivecards";

import { ElementType, EventNames } from "../../common/Constants";
import { IStackStyles, Stack } from "@fluentui/react";
import React, { useCallback } from "react";
import { addNoreferrerNoopenerTag, broadcastError, getInputValuesFromAdaptiveCard } from "../../common/utils";

import { BroadcastService } from "../../services/BroadcastService";
import { ICustomEvent } from "../../interfaces/ICustomEvent";
import { IPreChatSurveyPaneProps } from "./interfaces/IPreChatSurveyPaneProps";
import { defaultPreChatSurveyPaneACContainerStyles } from "./common/defaultProps/defaultStyles/defaultPreChatSurveyPaneACContainerStyles";
import { defaultPreChatSurveyPaneControlProps } from "./common/defaultProps/defaultPreChatSurveyPaneControlProps";
import { defaultPreChatSurveyPaneGeneralStyles } from "./common/defaultProps/defaultStyles/defaultPreChatSurveyPaneGeneralStyles";
import { defaultPreChatSurveyPaneStyles } from "./common/defaultProps/defaultStyles/defaultPreChatSurveyPaneStyles";

// Detect iOS (iPhone/iPad/iPod) including iPadOS 13+ which reports as Mac with touch support.
// Used to scope iOS-only Safari workarounds; must not match other platforms.
const isIOSDevice = (): boolean => {
    if (typeof navigator === "undefined") {
        return false;
    }
    const ua = navigator.userAgent || "";
    if (/iPad|iPhone|iPod/.test(ua)) {
        return true;
    }
    return ua.includes("Mac") && typeof document !== "undefined" && "ontouchend" in document;
};

// iOS-only: AdaptiveCards' ChoiceSetInput value getter treats `selectedIndex > 0` as "user selected"
// and returns undefined for index 0 (assuming it is always the injected placeholder).
// On iOS we remove the placeholder to avoid a blank picker row, which shifts the first real
// option to index 0 — so the original getter wrongly reports undefined and required-field
// validation fails. Patch the prototype once to accept index >= 0.
let iosChoiceSetValuePatched = false;
const patchIOSChoiceSetValueGetter = () => {
    if (iosChoiceSetValuePatched) {
        return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ChoiceSetInput = (AdaptiveCards as any).ChoiceSetInput;
    if (!ChoiceSetInput || !ChoiceSetInput.prototype) {
        return;
    }
    const descriptor = Object.getOwnPropertyDescriptor(ChoiceSetInput.prototype, "value");
    if (!descriptor || !descriptor.get) {
        return;
    }
    Object.defineProperty(ChoiceSetInput.prototype, "value", {
        configurable: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        get: function (this: any) {
            if (!this.isMultiSelect && this._selectElement) {
                return this._selectElement.selectedIndex >= 0 ? this._selectElement.value : undefined;
            }
            return descriptor.get?.call(this);
        }
    });
    iosChoiceSetValuePatched = true;
};

function PreChatSurveyPane(props: IPreChatSurveyPaneProps) {

    const elementId = props.controlProps?.id ?? defaultPreChatSurveyPaneControlProps.id as string;
    const isIOS = isIOSDevice();
    if (isIOS) {
        patchIOSChoiceSetValueGetter();
    }
    let adpativeCardPayload;
    let adaptiveCardHostConfig;

    const containerStyles: IStackStyles = {
        root: Object.assign({}, defaultPreChatSurveyPaneGeneralStyles, props.styleProps?.generalStyleProps)
    };

    const adaptiveCardContainerStyles: IStackStyles = {
        root: Object.assign({}, defaultPreChatSurveyPaneACContainerStyles, props.styleProps?.adaptiveCardContainerStyleProps)
    };

    // Parse AC Host Config String input to JSON Object
    try {
        adaptiveCardHostConfig = JSON.parse(props.controlProps?.adaptiveCardHostConfig ?? defaultPreChatSurveyPaneControlProps.adaptiveCardHostConfig as string);
    } catch (error) {
        adaptiveCardHostConfig = "{}";
        broadcastError(elementId, error, "adaptiveCardHostConfig", ElementType.PreChatSurveyError);
    }

    // Parse AC Payload String input to JSON Object
    try {
        adpativeCardPayload = JSON.parse(props.controlProps?.payload ?? defaultPreChatSurveyPaneControlProps.payload as string);
    } catch (error) {
        adpativeCardPayload = "{}";
        broadcastError(elementId, error, "adpativeCardPayload", ElementType.PreChatSurveyError);
    }

    //On Submit Click Action
    const handleSubmitClick = useCallback(() => {
        const values = getInputValuesFromAdaptiveCard(adaptiveCard);
        if (props.controlProps?.onSubmit) {
            const customEvent: ICustomEvent = {
                elementType: ElementType.PreChatSurveySubmitButton,
                elementId: elementId,
                eventName: EventNames.OnClick
            };
            BroadcastService.postMessage(customEvent);
            props.controlProps?.onSubmit(values);
        }
    }, []);

    //Adaptive Card Initilializations
    AdaptiveCards.GlobalSettings.setTabIndexAtCardRoot = false;
    const adaptiveCard = new AdaptiveCards.AdaptiveCard();
    adaptiveCard.hostConfig = new AdaptiveCards.HostConfig(adaptiveCardHostConfig);
    adaptiveCard.parse(adpativeCardPayload);
    adaptiveCard.onExecuteAction = handleSubmitClick;

    // Render the card
    const renderedCard = adaptiveCard.render();
    addNoreferrerNoopenerTag(renderedCard);

    // Fix iOS Safari blank space in <select> dropdowns. iOS-only; other platforms render correctly.
    // The placeholder option that AdaptiveCards injects renders as a blank row in the iOS
    // native picker (CSS display/hidden are ignored on <option>). Removing it from the DOM
    // is the only reliable workaround. After removal, we select the first remaining option
    // and notify AdaptiveCards so required-field validation reads the visible value.
    const applyIOSPrechatFix = (container: HTMLElement) => {
        const selectElements = container.querySelectorAll<HTMLSelectElement>("select.ac-choiceSetInput-compact");
        selectElements.forEach((select) => {
            const firstOption = select.options[0];
            if (firstOption && firstOption.disabled && firstOption.hidden && firstOption.value === "") {
                firstOption.remove();
                if (select.options.length > 0) {
                    select.selectedIndex = 0;
                    select.value = select.options[0].value;
                    select.dispatchEvent(new Event("input", { bubbles: true }));
                    select.dispatchEvent(new Event("change", { bubbles: true }));
                }
            }
        });
    };

    return (
        <>
            <style>{`
            .ac-textBlock {
                font-size: ${props.styleProps?.customTextStyleProps?.fontSize} !important;
                height: ${props.styleProps?.customTextStyleProps?.height};
                padding-top: ${props.styleProps?.customTextStyleProps?.paddingTop};
                font-family: ${props.styleProps?.customTextStyleProps?.fontFamily};
                overflow-wrap: break-word;
                white-space: normal !important;
            }
            .ac-textRun {
                font-size: ${props.styleProps?.customTextStyleProps?.fontSize} !important;
                padding-top: ${props.styleProps?.customTextStyleProps?.paddingTop};
            }
            .ac-input {
                margin-bottom: 6px;
            }
            .ac-input.ac-textInput {
                font-size: ${props.styleProps?.customTextInputStyleProps?.fontSize ?? defaultPreChatSurveyPaneStyles.customTextInputStyleProps?.fontSize};
                font-family: ${props.styleProps?.customTextInputStyleProps?.fontFamily ?? defaultPreChatSurveyPaneStyles.customTextInputStyleProps?.fontFamily};
                height: ${props.styleProps?.customTextInputStyleProps?.height ?? defaultPreChatSurveyPaneStyles.customTextInputStyleProps?.height};
                padding: 8px;
            }
            .ac-input.ac-textInput.ac-multiline {
                font-size: ${props.styleProps?.customMultilineTextInputStyleProps?.fontSize ?? defaultPreChatSurveyPaneStyles.customMultilineTextInputStyleProps?.fontSize};
                font-family: ${props.styleProps?.customMultilineTextInputStyleProps?.fontFamily ?? defaultPreChatSurveyPaneStyles.customMultilineTextInputStyleProps?.fontFamily};
                height: ${props.styleProps?.customMultilineTextInputStyleProps?.height ?? defaultPreChatSurveyPaneStyles.customMultilineTextInputStyleProps?.height};
                resize: none;
            }
            .ac-input.ac-multichoiceInput {
                font-size: ${props.styleProps?.customMultichoiceInputStyleProps?.fontSize ?? defaultPreChatSurveyPaneStyles.customMultichoiceInputStyleProps?.fontSize};
                font-family: ${props.styleProps?.customMultichoiceInputStyleProps?.fontFamily ?? defaultPreChatSurveyPaneStyles.customMultichoiceInputStyleProps?.fontFamily};
                padding: 3px;
                padding-top: 7px;
                padding-bottom: 7px;
            }
            .ac-input.ac-toggleInput {
                align-items: ${props.styleProps?.customToggleInputStyleProps?.alignItems ?? defaultPreChatSurveyPaneStyles.customToggleInputStyleProps?.alignItems} !important;
            }
            .ac-pushButton {
                border: 1px solid #00000000;
                margin: 2px;
                height: ${props.styleProps?.customButtonStyleProps?.height ?? defaultPreChatSurveyPaneStyles.customButtonStyleProps?.height};
                width: ${props.styleProps?.customButtonStyleProps?.width ?? defaultPreChatSurveyPaneStyles.customButtonStyleProps?.width};
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
                font-size: ${props.styleProps?.customButtonStyleProps?.fontSize ?? defaultPreChatSurveyPaneStyles.customButtonStyleProps?.fontSize};
                font-family: ${props.styleProps?.customButtonStyleProps?.fontFamily ?? defaultPreChatSurveyPaneStyles.customButtonStyleProps?.fontFamily};
                color: ${props.styleProps?.customButtonStyleProps?.color ?? defaultPreChatSurveyPaneStyles.customButtonStyleProps?.color};
                background-color: ${props.styleProps?.customButtonStyleProps?.backgroundColor ?? defaultPreChatSurveyPaneStyles.customButtonStyleProps?.backgroundColor};
            }`}</style>
            {!props.controlProps?.hidePreChatSurveyPane &&
                <Stack
                    id={elementId}
                    tabIndex={-1}
                    role={props.controlProps?.role ?? defaultPreChatSurveyPaneControlProps.role}
                    dir={props.controlProps?.dir ?? defaultPreChatSurveyPaneControlProps.dir}
                    styles={containerStyles}>

                    <Stack
                        tabIndex={-1}
                        styles={adaptiveCardContainerStyles}>
                        <div
                            ref={(n) => { // Returns React element
                                renderedCard && n && n.appendChild(renderedCard);
                                n && (n.childElementCount > 1) && n.lastChild && n.removeChild(n.lastChild); // Removes duplicates fix
                                if (isIOS && n) {
                                    applyIOSPrechatFix(n);
                                }
                            }} />
                    </Stack>

                </Stack>
            }
        </>
    );
}

export default PreChatSurveyPane;