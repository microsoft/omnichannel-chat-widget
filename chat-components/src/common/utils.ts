import { ElementType, Regex } from "./Constants";

import { AdaptiveCard } from "adaptivecards";
import { BroadcastService } from "../services/BroadcastService";
import { ICustomEvent } from "../interfaces/ICustomEvent";
import { ReactNode } from "react";
import { decodeComponentString } from "..";

export const uuidv4 = (): string => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0, v = c === "x" ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

export const generateEventName = (controlId?: string, prefix?: string, suffix?: string) => {
    let eventName = "";
    if (prefix) eventName += prefix;
    if (controlId) eventName += controlId;
    if (suffix) eventName += suffix;
    return eventName;
};

//Broadcast Error
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const broadcastError = (elementId: string, error: any, propName: string, elementType: ElementType) => {
    const onJSONParseErrorEventName = generateEventName(elementId, propName, "JSONParseError");
    const onJSONParseErrorEvent: ICustomEvent = {
        elementId: elementId,
        elementType: elementType,
        eventName: onJSONParseErrorEventName,
        payload: error
    };
    console.error("JSON Parse Error ", elementId, propName, error);
    BroadcastService.postMessage(onJSONParseErrorEvent);
};

export const getInputValuesFromAdaptiveCard = (adaptiveCard: AdaptiveCard) => {
    const inputs = adaptiveCard.getAllInputs();
    const adaptiveCardValues: { index: number, label: string | undefined, id: string | undefined, value: string }[] = [];
    for (const input of inputs) {
        adaptiveCardValues.push({ index: input.index, label: input.label, id: input.id, value: input.value });
    }
    return adaptiveCardValues;
};

export const processCustomComponents = (children: ReactNode[] | string[] | undefined) => {
    if (!children || children.length === 0) return null;
    return children.map(child => decodeComponentString(child));
};

export const getValidatedURL = (url: string) => {
    if ((new RegExp(Regex.URLRegex)).test(url)) return url;
    return "";
};

export const getHours = (time: number) => {
    return ("0" + Math.floor((time / (60 * 60 * 1000)) % 24)).slice(-2);
};

export const getMinutes = (time: number) => {
    return ("0" + Math.floor((time / 60000) % 60)).slice(-2);
};

export const getSeconds = (time: number) => {
    return ("0" + Math.floor((time / 1000) % 60)).slice(-2);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const addNoreferrerNoopenerTag = (htmlNode: any) => {
    const aNodes = htmlNode.getElementsByTagName("a");
    if (aNodes?.length > 0) {
        for (let index = 0; index < aNodes.length; index++) {
            const aNode = aNodes[index];
            // Skip if the node is not valid or the node's tag name is not equal to 'a', or the node href is empty.
            if (aNode.tagName?.toLowerCase() !== "a" || !aNode.href) {
                continue;
            }

            // Add target to 'a' node if target is missing or does not equal to blank
            if (!aNode.target || aNode.target !== "_blank") {
                aNode.target = "_blank";
            }

            // If rel is missing or rel does not include noopener and noreferrer, add them
            if (!aNode.rel) {
                aNode.rel = "noopener noreferrer";
            } else {
                if (aNode.rel.indexOf("noopener") === -1) {
                    aNode.rel += " noopener";
                }
                if (aNode.rel.indexOf("noreferrer") === -1) {
                    aNode.rel += " noreferrer";
                }
            }
        }
    }
};

export const replaceURLWithAnchor = (text: string | undefined, openInNewTab: boolean | undefined) => {
    if (text) {
        const modifiedText = text.replace(Regex.URLRegex, function(url) {
            if (openInNewTab) {
                // eslint-disable-next-line quotes
                return '<a href="' + url + '" rel="noreferrer noopener" target="_blank">' + url + '</a>';
            }
            // eslint-disable-next-line quotes
            return '<a href="' + url + '">' + url + '</a>';
        });   
        return modifiedText;
    }
    return text;
};