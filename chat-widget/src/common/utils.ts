import { AriaTelemetryConstants, Constants, HtmlAttributeNames, LocaleConstants } from "./Constants";
import { BroadcastEvent, LogLevel, TelemetryEvent } from "./telemetry/TelemetryConstants";

import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { ChatSDKErrorName } from "@microsoft/omnichannel-chat-sdk";
import { DataStoreManager } from "./contextDataStore/DataStoreManager";
import { ICustomEvent } from "@microsoft/omnichannel-chat-components/lib/types/interfaces/ICustomEvent";
import { ITimer } from "./interfaces/ITimer";
import { KeyCodes } from "./KeyCodes";
import { Md5 } from "md5-typescript";
import { TelemetryHelper } from "./telemetry/TelemetryHelper";

const getElementBySelector = (selector: string | HTMLElement) => {
    let element: HTMLElement;
    if (typeof (selector) === "string") {
        element = document.querySelector(selector) as HTMLElement;
    } else {
        element = selector;
    }
    return element;
};

// The purpose of this function is:
// - to make elements not focusable, when confirmation pane or email transcript pane are showing,
// - to set their initial tab indices back after confirmation pane or email transcript pane are closed
// Otherwise, the user will be able to click on the screen and tab through different buttons or other elements, even though
// these dialogs are showing
export const setTabIndices = (elements: HTMLElement[] | null, tabIndexMap: Map<string, number>, shouldBeFocusable: boolean) => {
    if (elements) {
        if (shouldBeFocusable) {
            for (let index = 0; index < elements.length; index++) {
                if (tabIndexMap.has(elements[index].id)) {
                    elements[index].tabIndex = (tabIndexMap.get(elements[index].id) as number);
                }
            }
            tabIndexMap.clear();
        }
        else {
            for (let index = 0; index < elements.length; index++) {
                tabIndexMap.set(elements[index].id, elements[index].tabIndex);
                elements[index].tabIndex = -1;
            }
        }
    }
};

export const findParentFocusableElementsWithoutChildContainer = (elementId: string) => {
    const childContainer: HTMLElement | null = document.getElementById(elementId);
    if (!childContainer) {
        return null;
    }

    const parentContainer = childContainer.parentElement;
    if (!parentContainer) {
        return null;
    }

    const parentFocusableElements: HTMLElement[] | null = findAllFocusableElement(parentContainer);
    if (!parentFocusableElements) {
        return null;
    }

    for (let index = 0; index < parentFocusableElements.length; index++) {
        if (childContainer.contains(parentFocusableElements[index])) {
            parentFocusableElements.splice(index, 1);
            index--;
        }
    }

    return parentFocusableElements;
};

export const findAllFocusableElement = (parent: string | HTMLElement) => {
    const container = getElementBySelector(parent);
    if (container !== null) {
        return Array.prototype.slice.call(container.querySelectorAll("a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex=\"0\"]"));
    }
    return null;
};

export const preventFocusToMoveOutOfElement = (elementId: string) => {
    const container: HTMLElement | null = document.getElementById(elementId);
    if (!container) {
        return;
    }

    const focusableElements: HTMLElement[] | null = findAllFocusableElement(container);
    if (!focusableElements) {
        return;
    }

    const firstFocusableElement: HTMLElement = focusableElements[0];
    const lastFocusableElement: HTMLElement = focusableElements[focusableElements.length - 1];

    firstFocusableElement.onkeydown = (e: KeyboardEvent) => {
        if (e.shiftKey && e.key === KeyCodes.TAB) {
            e.preventDefault();
            lastFocusableElement?.focus();
        }
    };

    lastFocusableElement.onkeydown = (e: KeyboardEvent) => {
        if (!e.shiftKey && e.key === KeyCodes.TAB) {
            e.preventDefault();
            firstFocusableElement?.focus();
        }
    };
};

export const setFocusOnSendBox = () => {
    const sendBoxSelector = "textarea[data-id=\"webchat-sendbox-input\"]";
    setFocusOnElement(sendBoxSelector);
};

export const setFocusOnElement = (selector: string | HTMLElement) => {
    const element = getElementBySelector(selector);
    element?.focus();
};

export const escapeHtml = (inputString: string) => {
    const entityMap: {
        [key: string]: string,
    } = {
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;",
        "/": "&#x2F;"
    };

    return String(inputString).replace(/[<>"'/]/g, (s: string) => {
        return entityMap[s];
    });
};

export const getIconText = (text: string) => {
    if (text) {
        const initials = text.split(/\s/).reduce((response, word) => response += word.slice(0, 1), "");
        if (initials.length > 1) {
            return initials.substring(0, 2).toUpperCase();
        } else {
            return text.substring(0, 2).toUpperCase();
        }
    }
    return "";
};

export const getLocaleDirection = (localeLCID: string): string => {
    return (LocaleConstants.RTL_LOCALES.indexOf(localeLCID) === -1) ? "ltr" : "rtl";
};

export const changeLanguageCodeFormatForWebChat = (languageCode: string): string => {
    return languageCode.slice(0, -2) + languageCode.slice(-2).toUpperCase();
};

export const getTimestampHourMinute = (timestampStr: string) => {
    let yearFormat: "numeric" | undefined;
    let monthDayFormat: "2-digit" | undefined;
    const hourFormat = "numeric";
    const minuteFormat = "2-digit";
    const date = new Date(timestampStr);
    const now = new Date();

    if (isNaN(date.getTime())) {
        return "";
    }

    if (date.getFullYear() !== now.getFullYear()) {
        yearFormat = "numeric";
        monthDayFormat = "2-digit";
    }

    if (date.getMonth() !== now.getMonth() ||
        date.getDate() !== now.getDate()) {
        monthDayFormat = "2-digit";
    }

    return date.toLocaleTimeString(navigator.language, {
        year: yearFormat,
        month: monthDayFormat,
        day: monthDayFormat,
        hour: hourFormat,
        minute: minuteFormat
    });
};

export const parseAdaptiveCardPayload = (payload: string, requiredFieldMissingMessage: string) => {
    if (payload && payload !== "{}") {
        try {
            const parsedPayload = JSON.parse(payload.replace("*", "&#42;"));
            const body = parsedPayload.body;
            if (body) {
                //Parse ID field into available options and add required error messages
                for (const fields of body) {
                    if (fields.id && fields.id.includes(":")) {
                        const parsedId = JSON.parse(fields.id);
                        fields.id = parsedId.Id;
                        fields.isRequired = parsedId.IsRequired ?? false;
                        if (fields.isRequired) {
                            fields.errorMessage = requiredFieldMissingMessage.replace("{0}", parsedId.Name ?? "");
                        }
                    }
                }
            }
            return JSON.stringify(parsedPayload);
        } catch (ex) {
            throw new Error(`Adaptive card pase error: ${ex}`);
        }
    }
    return payload;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const extractPreChatSurveyResponseValues = (preChatSurvey: string, values: { index: number; label: any; id: any; value: string; }[]) => {
    if (preChatSurvey && preChatSurvey !== "{}" && values) {
        try {
            const parsedSurvey = JSON.parse(preChatSurvey);
            const body = parsedSurvey.body;
            const type = { "Type": Constants.InputSubmit };
            const computedValues = [];
            for (const val of values) {
                const index = val.index;
                const Id = body[index].id;
                computedValues[Id] = val.value;
            }
            const finalPayload = { ...type, ...computedValues };
            return finalPayload;
        } catch (ex) {
            throw new Error(`PreChatSurvey Response parse error: ${ex}`);
        }
    }

    return {};
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isNullOrUndefined = (obj: any) => {
    return (obj === null || obj === undefined);
};

export const isNullOrEmptyString = (s: string | null) => {
    return isNullOrUndefined(s) || s === "";
};

export const newGuid = () => {
    //RFC 4122 canonical representation Version-4 xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx where x is any hexadecimal digit and y is one of 8, 9, A, or B
    const guidPattern = Constants.GuidPattern;
    let newGuid = "";
    for (let i = 0; i < guidPattern.length; i++) {
        const randomString = Math.floor(Math.random() * Date.now());
        switch (guidPattern[i]) {
            case "x":
                newGuid += randomString.toString(16).substring(0, 4);
                break; //get 4 digit
            case "m":
                newGuid += randomString.toString(16).substring(0, 3);
                break; //Get 3 digit
            case "y":
                newGuid += (randomString & 0x3 | 0x8).toString(16);
                break; // To get only one of 8, 9, A, or B
            default:
                newGuid += guidPattern[i]; //Default "-" and "4"
        }
    }
    return newGuid;
};

export const createTimer = (): ITimer => {
    const timeStart = new Date().getTime();
    return {
        get milliSecondsElapsed() {
            const ms = (new Date().getTime() - timeStart);
            return ms;
        }
    };
};

// Returns the domain of the org
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getDomain = (hostValue: any): string => {
    for (let i = 0; i < AriaTelemetryConstants.lcwEUDomainNames.length; i++) {
        if (hostValue.endsWith(AriaTelemetryConstants.lcwEUDomainNames[i])) {
            return AriaTelemetryConstants.EU;
        }
    }
    return AriaTelemetryConstants.Public;
};

export const getWidgetCacheId = (orgId: string, widgetId: string, widgetInstanceId: string, popoutChat = false): string => {
    if (popoutChat) {
        widgetInstanceId = widgetInstanceId + Constants.PopoutCacheSuffix;
    }
    const widgetCacheId = `${widgetInstanceId}_${orgId}_${widgetId}`;
    return Md5.init(widgetCacheId);
};

export const getWidgetEndChatEventName = (orgId: string, widgetId: string, widgetInstanceId: string): string => {
    if (!isNullOrEmptyString(widgetInstanceId)) {
        return `${BroadcastEvent.ChatEnded}_${widgetInstanceId}_${orgId}_${widgetId}`;
    }
    return `${BroadcastEvent.ChatEnded}_${orgId}_${widgetId}`;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getStateFromCache = (widgetCacheId: string): any => {
    // Getting updated state from cache
    try {
        if (DataStoreManager.clientDataStore) {
            const widgetStateEventName = widgetCacheId;
            const widgetStateFromCache = DataStoreManager.clientDataStore?.getData(widgetStateEventName);
            const persistedState = widgetStateFromCache ? JSON.parse(widgetStateFromCache) : undefined;
            return persistedState;
        } else {
            return null;
        }
    }
    catch (error) {
        console.log(error);
        return null;
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isUndefinedOrEmpty = (object: any) => {
    if (object) {
        if (Object.keys(object).length === 0) {
            return true;
        }
        return false;
    } else {
        return true;
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const addDelayInMs = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

export const getBroadcastChannelName = (widgetId: string, widgetInstanceId: string): string => {
    return (widgetInstanceId && !isNullOrEmptyString(widgetInstanceId)) ?
        `${widgetInstanceId}_${widgetId}` : widgetId;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getWidgetCacheIdfromProps = (props: any, popoutChat = false): string => {
    const orgId = props?.chatSDK?.omnichannelConfig?.orgId;
    const widgetId = props?.chatSDK?.omnichannelConfig?.widgetId;
    let widgetInstanceId = props?.controlProps?.widgetInstanceId ?? "";

    if (props.useSessionStorage) {
        widgetInstanceId = widgetInstanceId + Constants.SessionCacheSuffix;
    }

    if (props?.controlProps?.hideStartChatButton || popoutChat === true) {
        popoutChat = true;
    }
    const widgetCacheId = getWidgetCacheId(orgId, widgetId, widgetInstanceId, popoutChat);
    return widgetCacheId;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const debounceLeading = (fn: any, ms = 3000) => {
    let timeoutId: ReturnType<typeof setTimeout> | null;
    return (...args: any[]) => { // eslint-disable-line @typescript-eslint/no-explicit-any

        if (!timeoutId) {
            fn.apply(this, args);
        }

        timeoutId = setTimeout(() => { timeoutId = null; }, ms);
    };
};
export const isThisSessionPopout = (href: string): boolean => {

    if (href?.includes("open-in-window=true") && !window?.location?.href?.includes("is-popout-mode=true")) {
        return true;
    }

    return false;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getConversationDetailsCall = async (chatSDK: any, liveChatContext: any = null) => {
    let conversationDetails: any = undefined; // eslint-disable-line @typescript-eslint/no-explicit-any
    const optionalParams: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any

    if (liveChatContext?.requestId && liveChatContext?.chatToken) {
        optionalParams.liveChatContext = liveChatContext;
    }

    try {
        TelemetryHelper.logSDKEvent(LogLevel.INFO, {
            Event: TelemetryEvent.GetConversationDetailsCallStarted,
            Description: "Conversation details call started"
        });
        conversationDetails = await chatSDK.getConversationDetails(optionalParams);
    } catch (error) {
        checkContactIdError(error);
        TelemetryHelper.logSDKEvent(LogLevel.ERROR, {
            Event: TelemetryEvent.GetConversationDetailsCallFailed,
            ExceptionDetails: {
                exception: `Get Conversation Details Call Failed : ${error}`
            }
        });
    }

    return conversationDetails;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const checkContactIdError = (e: any) => {
    if (e?.message === ChatSDKErrorName.AuthContactIdNotFoundFailure) {
        const contactIdNotFoundErrorEvent: ICustomEvent = {
            eventName: BroadcastEvent.ContactIdNotFound,
            payload: {
                error: e
            }
        };
        BroadcastService.postMessage(contactIdNotFoundErrorEvent);
    }
};

export const createFileAndDownload = (fileName: string, blobData: string, mimeType: string) => {
    const aElement = document.createElement("a");

    const blob = new Blob([blobData], {type: mimeType});
    const objectUrl = URL.createObjectURL(blob);

    aElement.setAttribute(HtmlAttributeNames.href, objectUrl);
    aElement.setAttribute(HtmlAttributeNames.download, fileName);
    aElement.setAttribute(HtmlAttributeNames.ariaHidden, "true");
    aElement.style.display = "none";

    document.body.appendChild(aElement);
    aElement.click();
    document.body.removeChild(aElement);
};

/**
 * 
 * Replace placeholders with format {0}..{n} , in a string with values
 * 
 * @param template String with placeholders to be replaced
 * @param values array of values to replace the placeholders
 * @returns formatted string with replaced values
 */
// use of any for values as array of any type is passed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const  formatTemplateString = (templateMessage : string, values : any) => {
    return templateMessage.replace(/{(\d+)}/g, (match, index) => {
        return typeof values[index] !== "undefined" ? values[index] : match;
    });
};

export const parseLowerCaseString = (property: string | boolean | undefined): string => {
    return String(property).toLowerCase();
};

export const setOcUserAgent = (chatSDK: any): void => { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (chatSDK.OCClient?.ocUserAgent && !chatSDK.OCClient?.ocUserAgent.join(" ").includes("omnichannel-chat-widget/")) {
        try {
            const version = require("../../../package.json").version; // eslint-disable-line @typescript-eslint/no-var-requires
            const userAgent = `omnichannel-chat-widget/${version}`;
            chatSDK.OCClient.ocUserAgent = [userAgent, ...chatSDK.OCClient.ocUserAgent];
        } catch (error) {
            console.warn(error);
        }
    }
};