import * as AdaptiveCards from "adaptivecards";

import { IStackStyles, Stack } from "@fluentui/react";
import React, { useCallback } from "react";
import { addNoreferrerNoopenerTag, broadcastError, getInputValuesFromAdaptiveCard } from "../../common/utils";

import { BroadcastService } from "../../services/BroadcastService";
import { ElementType } from "../../common/Constants";
import { ICustomEvent } from "../../interfaces/ICustomEvent";
import { IPreChatSurveyPaneProps } from "./interfaces/IPreChatSurveyPaneProps";
import { defaultPreChatSurveyPaneACContainerStyles } from "./common/defaultProps/defaultStyles/defaultPreChatSurveyPaneACContainerStyles";
import { defaultPreChatSurveyPaneControlProps } from "./common/defaultProps/defaultPreChatSurveyPaneControlProps";
import { defaultPreChatSurveyPaneGeneralStyles } from "./common/defaultProps/defaultStyles/defaultPreChatSurveyPaneGeneralStyles";
import { defaultPreChatSurveyPaneStyles } from "./common/defaultProps/defaultStyles/defaultPreChatSurveyPaneStyles";

function PreChatSurveyPane(props: IPreChatSurveyPaneProps) {

    const elementId = props.controlProps?.id ?? "lcw-components-prechatsurvey-pane";
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
                eventName: "OnClick"
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

    return (
        <>
            <style>{`
            .ac-input {
                margin-bottom: 6px;
            }
            .ac-input.ac-textInput {
                height: 20px;
                padding: 8px;
            }
            .ac-input.ac-textInput.ac-multiline {
                height: 52px;
                resize: none;
            }
            .ac-input.ac-multichoiceInput {
                padding: 3px;
                padding-top: 7px;
                padding-bottom: 7px;
            } 
            .ac-pushButton { 
                border: 1px solid #00000000;
                margin: 2px;
                height: 48px;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
                font-size: 15px;
                font-family: ${props.styleProps?.customButtonStyleProps?.fontFamily ?? defaultPreChatSurveyPaneStyles.customButtonStyleProps?.fontFamily};
                color: ${props.styleProps?.customButtonStyleProps?.color ?? defaultPreChatSurveyPaneStyles.customButtonStyleProps?.color};
                background-color: ${props.styleProps?.customButtonStyleProps?.backgroundColor ?? defaultPreChatSurveyPaneStyles.customButtonStyleProps?.backgroundColor}; 
            }`}</style>
            {!props.controlProps?.hidePreChatSurveyPane &&
                <Stack 
                    id={elementId}
                    tabIndex={-1}
                    role={props.controlProps?.role}
                    dir={props.controlProps?.dir ?? defaultPreChatSurveyPaneControlProps.dir}
                    styles={containerStyles}>

                    <Stack
                        tabIndex={-1}
                        styles={adaptiveCardContainerStyles}>
                        <div
                            ref={(n) => { // Returns React element
                                renderedCard && n && n.appendChild(renderedCard);
                                n && (n.childElementCount > 1) && n.lastChild && n.removeChild(n.lastChild); // Removes duplicates fix
                            }} />
                    </Stack>

                </Stack>
            }
        </>
    );
}

export default PreChatSurveyPane;