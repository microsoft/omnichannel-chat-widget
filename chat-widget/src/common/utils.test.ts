import "@testing-library/jest-dom/extend-expect";

import { changeLanguageCodeFormatForWebChat, escapeHtml, extractPreChatSurveyResponseValues, findParentFocusableElementsWithoutChildContainer, formatTemplateString, getBroadcastChannelName, getDomain, getIconText, getLocaleDirection, getTimestampHourMinute, getWidgetCacheId, getWidgetEndChatEventName, isNullOrEmptyString, isUndefinedOrEmpty, newGuid, parseAdaptiveCardPayload, parseLowerCaseString, setTabIndices } from "./utils";

import { AriaTelemetryConstants } from "./Constants";
import { Md5 } from "md5-typescript";
import { cleanup } from "@testing-library/react";

describe("utils unit test", () => {
    afterEach(() => {
        cleanup;
        jest.resetAllMocks();
    });

    it("Test setTabIndices", () => {
        const element1: HTMLElement = document.createElement("button") as HTMLElement;
        element1.id = "element1";
        element1.tabIndex = -1;
        const element2: HTMLElement = document.createElement("button") as HTMLElement;
        element2.id = "element2";
        element2.tabIndex = -1;
        const elementsArr1: HTMLElement[] | null = [element1, element2];
        const tabIndexMap1: Map<string, number> = new Map<string, number>();
        tabIndexMap1.set(element1.id, 0);
        tabIndexMap1.set(element2.id, 0);
        const shouldBeFocusable1 = true;

        setTabIndices(elementsArr1, tabIndexMap1, shouldBeFocusable1);
        expect(element1.tabIndex).toBe(0);
        expect(element2.tabIndex).toBe(0);
        expect(tabIndexMap1.size).toBe(0);

        const element3: HTMLElement = document.createElement("button") as HTMLElement;
        element3.id = "element3";
        element3.tabIndex = 0;
        const element4: HTMLElement = document.createElement("button") as HTMLElement;
        element4.id = "element4";
        element4.tabIndex = 0;
        const elementsArr2: HTMLElement[] | null = [element3, element4];
        const tabIndexMap2: Map<string, number> = new Map<string, number>();
        const shouldBeFocusable2 = false;

        setTabIndices(elementsArr2, tabIndexMap2, shouldBeFocusable2);
        expect(element3.tabIndex).toBe(-1);
        expect(element4.tabIndex).toBe(-1);
        expect(tabIndexMap2.size).toBe(2);
    });

    it("Test findParentFocusableElementsWithoutChildContainer", () => {
        document.body.innerHTML =
            "<div id=\"parent\">" +
            "  <button id=\"child1\" />" +
            "  <button id=\"child2\" />" +
            "  <div id=\"child3\">" +
            "       <div id=\"child4\" />" +
            "   </div>" +
            "</div>";

        const elementId1 = "child5";
        const result1 = findParentFocusableElementsWithoutChildContainer(elementId1);
        expect(result1).toBe(null);

        const elementId2 = "child4";
        const result2 = findParentFocusableElementsWithoutChildContainer(elementId2);
        expect(result2?.length).toBe(0);

        const elementId3 = "child1";
        const result3 = findParentFocusableElementsWithoutChildContainer(elementId3);
        expect(result3?.length).toBe(1);

    });

    it("Test getIconText", () => {
        const string1 = "Test String";
        const result1 = getIconText(string1);
        expect(result1).toBe("TS");

        const string2 = "test extra String";
        const result2 = getIconText(string2);
        expect(result2).toBe("TE");

        const string3 = "";
        const result3 = getIconText(string3);
        expect(result3).toBe("");

        const string4 = "Testing";
        const result4 = getIconText(string4);
        expect(result4).toBe("TE");

        const string5 = "t";
        const result5 = getIconText(string5);
        expect(result5).toBe("T");

        const string6 = "测试";
        const result6 = getIconText(string6);
        expect(result6).toBe("测试");
    });

    it("Test escapeHtml", () => {
        const testString = "<div>Hello<div/>";
        const escapedHtml = "&lt;div&gt;Hello&lt;div&#x2F;&gt;";

        const result = escapeHtml(testString);

        expect(result).toBe(escapedHtml);
    });

    it("Test getLocaleDirection method", function () {

        // Act
        const resultRTL = getLocaleDirection("1025");

        // Assert
        expect(resultRTL).toEqual("rtl");

        // Act
        const resultLTR = getLocaleDirection("2122");

        // Assert
        expect(resultLTR).toEqual("ltr");
    });

    it("Test changeLanguageCodeFormatForWebChat method", function () {

        // Act
        const result1 = changeLanguageCodeFormatForWebChat("ar-ar");

        // Assert
        expect(result1).toEqual("ar-AR");

        // Act
        const result2 = changeLanguageCodeFormatForWebChat("");

        // Assert
        expect(result2).toEqual("");

        // Act
        const result3 = changeLanguageCodeFormatForWebChat("ar");

        // Assert
        expect(result3).toEqual("AR");
    });

    it("Test getTimestampHourMinute method", () => {
        let locale = "ru-RU";
        Object.defineProperty(navigator, "language", {
            get: () => locale
        });

        const now = new Date();

        let date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 2, 3, 4);
        let time = date.toISOString();
        let result = getTimestampHourMinute(time);
        let equalResult = date.toLocaleTimeString(navigator.language, { hour: "numeric", minute: "2-digit" });
        expect(result).toBe(equalResult);

        locale = "zh-CN";

        date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 3, 4);
        time = date.toISOString();
        equalResult = date.toLocaleTimeString(navigator.language, { hour: "numeric", minute: "2-digit" });
        result = getTimestampHourMinute(time);
        expect(result).toBe(equalResult);

        date = new Date(now.getFullYear(), now.getMonth(), now.getDate() === 10 ? 11 : 10, 15, 3, 4);
        time = date.toISOString();
        equalResult = date.toLocaleTimeString(navigator.language, { month: "2-digit", day: "2-digit", hour: "numeric", minute: "2-digit" });
        result = getTimestampHourMinute(time);
        expect(result).toBe(equalResult);

        date = new Date(now.getFullYear(), now.getMonth() === 10 ? 11 : 10, now.getDate(), 15, 3, 4);
        time = date.toISOString();
        equalResult = date.toLocaleTimeString(navigator.language, { month: "2-digit", day: "2-digit", hour: "numeric", minute: "2-digit" });
        result = getTimestampHourMinute(time);
        expect(result).toBe(equalResult);

        date = new Date(1998, 11, 10, 15, 3, 4);
        time = date.toISOString();
        equalResult = date.toLocaleTimeString(navigator.language, { year: "numeric", month: "2-digit", day: "2-digit", hour: "numeric", minute: "2-digit" });
        result = getTimestampHourMinute(time);
        expect(result).toBe(equalResult);

        time = "20:38";
        result = getTimestampHourMinute(time);
        expect(result).toBe("");

        time = "2020-02-04T20:38:01.340ZZ";
        result = getTimestampHourMinute(time);
        expect(result).toBe("");
    });

    it("Test parse adaptiveCardPayload", () => {
        const string1 = "{\"type\":\"AdaptiveCard\",\"version\":\"1.1\",\"body\":[{\"type\":\"TextBlock\",\"weight\":\"bolder\",\"text\":\"Pleaseanswerbelowquestions.\"},{\"type\":\"TextBlock\",\"text\":\"*PleaseEnterName\",\"wrap\":true},{\"type\":\"Input.Text\",\"id\":\"{\\\"Id\\\":\\\"33828761-9e8b-ec11-93b0-00224824654f\\\",\\\"Name\\\":\\\"Name\\\",\\\"IsOption\\\":false,\\\"Order\\\":1,\\\"IsRequired\\\":true,\\\"QuestionText\\\":\\\"PleaseEnterName\\\"}\",\"maxLength\":100},{\"type\":\"TextBlock\",\"text\":\"Comments\",\"wrap\":true},{\"type\":\"Input.Text\",\"id\":\"{\\\"Id\\\":\\\"5624f385-9e8b-ec11-93b0-00224824654f\\\",\\\"Name\\\":\\\"Comments\\\",\\\"IsOption\\\":false,\\\"Order\\\":2,\\\"IsRequired\\\":false,\\\"QuestionText\\\":\\\"Comments\\\"}\",\"isMultiline\":true,\"maxLength\":250},{\"type\":\"Input.Toggle\",\"id\":\"{\\\"Id\\\":\\\"63a42fb5-9e8b-ec11-93b0-00224824654f\\\",\\\"Name\\\":\\\"Consent\\\",\\\"IsOption\\\":false,\\\"Order\\\":3,\\\"IsRequired\\\":true,\\\"QuestionText\\\":\\\"AgreetoTermsandConditions\\\"}\",\"title\":\"*AgreetoTermsandConditions\",\"valueOn\":\"True\",\"valueOff\":\"False\",\"value\":\"false\"},{\"type\":\"TextBlock\",\"isSubtle\":true,\"text\":\"Fieldsmarkedwith*aremandatory.\",\"wrap\":true}],\"actions\":[{\"type\":\"Action.Submit\",\"data\":{\"Type\":\"InputSubmit\"},\"title\":\"Submit\"}]}";
        const result1 = parseAdaptiveCardPayload(string1, "{0} field is required");
        expect(result1).toBe("{\"type\":\"AdaptiveCard\",\"version\":\"1.1\",\"body\":[{\"type\":\"TextBlock\",\"weight\":\"bolder\",\"text\":\"Pleaseanswerbelowquestions.\"},{\"type\":\"TextBlock\",\"text\":\"&#42;PleaseEnterName\",\"wrap\":true},{\"type\":\"Input.Text\",\"id\":\"33828761-9e8b-ec11-93b0-00224824654f\",\"maxLength\":100,\"isRequired\":true,\"errorMessage\":\"Name field is required\"},{\"type\":\"TextBlock\",\"text\":\"Comments\",\"wrap\":true},{\"type\":\"Input.Text\",\"id\":\"5624f385-9e8b-ec11-93b0-00224824654f\",\"isMultiline\":true,\"maxLength\":250,\"isRequired\":false},{\"type\":\"Input.Toggle\",\"id\":\"63a42fb5-9e8b-ec11-93b0-00224824654f\",\"title\":\"*AgreetoTermsandConditions\",\"valueOn\":\"True\",\"valueOff\":\"False\",\"value\":\"false\",\"isRequired\":true,\"errorMessage\":\"Consent field is required\"},{\"type\":\"TextBlock\",\"isSubtle\":true,\"text\":\"Fieldsmarkedwith*aremandatory.\",\"wrap\":true}],\"actions\":[{\"type\":\"Action.Submit\",\"data\":{\"Type\":\"InputSubmit\"},\"title\":\"Submit\"}]}");

        const string2 = "{\"$schema\":\"http://adaptivecards.io/schemas/adaptive-card.json\",\"type\":\"AdaptiveCard\",\"version\":\"1.1\",\"body\":[{\"type\":\"TextBlock\",\"weight\":\"bolder\",\"text\":\"Please answer below questions.\"},{\"type\":\"Input.Text\",\"id\":\"1e5e4e7a-8f0b-ec11-b6e6-000d3a305d38\",\"label\":\"name pls?\",\"maxLength\":100,\"isRequired\":true,\"errorMessage\":\"Name is required\"},{\"type\":\"Input.Text\",\"id\":\"7f8f5d6d-995e-ec11-8f8f-000d3a31376e\",\"label\":\"multi\\nmulti\\nmulti\",\"style\":\"text\",\"isMultiline\":true,\"maxLength\":250},{\"type\":\"Input.ChoiceSet\",\"id\":\"e4bdf7cb-995e-ec11-8f8f-000d3a31376e\",\"label\":\"options\",\"isMultiSelect\":false,\"value\":\"1\",\"style\":\"compact\",\"choices\":[{\"title\":\"one\",\"value\":\"1\"},{\"title\":\"two\",\"value\":\"2\"},{\"title\":\"three\",\"value\":\"3\"}]},{\"type\":\"Input.Toggle\",\"id\":\"b26011d2-995e-ec11-8f8f-000d3a31376e\",\"title\":\"consent\",\"valueOn\":\"True\",\"valueOff\":\"False\",\"value\":\"false\"},{\"type\":\"TextBlock\",\"isSubtle\":true,\"text\":\"Fields marked with * are mandatory.\",\"wrap\":true}],\"actions\":[{\"type\":\"Action.Submit\",\"title\":\"Submit\",\"data\":{\"Type\":\"InputSubmit\"}}]}";
        const result2 = parseAdaptiveCardPayload(string2, "{0} field is required");
        expect(result2).toBe("{\"$schema\":\"http://adaptivecards.io/schemas/adaptive-card.json\",\"type\":\"AdaptiveCard\",\"version\":\"1.1\",\"body\":[{\"type\":\"TextBlock\",\"weight\":\"bolder\",\"text\":\"Please answer below questions.\"},{\"type\":\"Input.Text\",\"id\":\"1e5e4e7a-8f0b-ec11-b6e6-000d3a305d38\",\"label\":\"name pls?\",\"maxLength\":100,\"isRequired\":true,\"errorMessage\":\"Name is required\"},{\"type\":\"Input.Text\",\"id\":\"7f8f5d6d-995e-ec11-8f8f-000d3a31376e\",\"label\":\"multi\\nmulti\\nmulti\",\"style\":\"text\",\"isMultiline\":true,\"maxLength\":250},{\"type\":\"Input.ChoiceSet\",\"id\":\"e4bdf7cb-995e-ec11-8f8f-000d3a31376e\",\"label\":\"options\",\"isMultiSelect\":false,\"value\":\"1\",\"style\":\"compact\",\"choices\":[{\"title\":\"one\",\"value\":\"1\"},{\"title\":\"two\",\"value\":\"2\"},{\"title\":\"three\",\"value\":\"3\"}]},{\"type\":\"Input.Toggle\",\"id\":\"b26011d2-995e-ec11-8f8f-000d3a31376e\",\"title\":\"consent\",\"valueOn\":\"True\",\"valueOff\":\"False\",\"value\":\"false\"},{\"type\":\"TextBlock\",\"isSubtle\":true,\"text\":\"Fields marked with &#42; are mandatory.\",\"wrap\":true}],\"actions\":[{\"type\":\"Action.Submit\",\"title\":\"Submit\",\"data\":{\"Type\":\"InputSubmit\"}}]}");

        const string3 = "{}";
        const result3 = parseAdaptiveCardPayload(string3, "{0} field is required");
        expect(result3).toBe("{}");

        const string4 = "";
        const result4 = parseAdaptiveCardPayload(string4, "{0} field is required");
        expect(result4).toBe("");
    });

    it("Test Extract PreChat Responses", () => {
        const string1 = "{\"type\":\"AdaptiveCard\",\"version\":\"1.1\",\"body\":[{\"type\":\"TextBlock\",\"weight\":\"bolder\",\"text\":\"Pleaseanswerbelowquestions.\"},{\"type\":\"TextBlock\",\"text\":\"*PleaseEnterName\",\"wrap\":true},{\"type\":\"Input.Text\",\"id\":\"{\\\"Id\\\":\\\"33828761-9e8b-ec11-93b0-00224824654f\\\",\\\"Name\\\":\\\"Name\\\",\\\"IsOption\\\":false,\\\"Order\\\":1,\\\"IsRequired\\\":true,\\\"QuestionText\\\":\\\"PleaseEnterName\\\"}\",\"maxLength\":100},{\"type\":\"TextBlock\",\"text\":\"Comments\",\"wrap\":true},{\"type\":\"Input.Text\",\"id\":\"{\\\"Id\\\":\\\"5624f385-9e8b-ec11-93b0-00224824654f\\\",\\\"Name\\\":\\\"Comments\\\",\\\"IsOption\\\":false,\\\"Order\\\":2,\\\"IsRequired\\\":false,\\\"QuestionText\\\":\\\"Comments\\\"}\",\"isMultiline\":true,\"maxLength\":250},{\"type\":\"TextBlock\",\"text\":\"Options\",\"wrap\":true},{\"type\":\"Input.ChoiceSet\",\"id\":\"{\\\"Id\\\":\\\"0b5d9408-10b1-ec11-983f-0022481e6d27\\\",\\\"Name\\\":\\\"Options\\\",\\\"IsOption\\\":true,\\\"Order\\\":3,\\\"IsRequired\\\":false,\\\"QuestionText\\\":\\\"Options\\\"}\",\"value\":\"{\\\"Id\\\":\\\"135d9408-10b1-ec11-983f-0022481e6d27\\\",\\\"Value\\\":\\\"Option2\\\"}\",\"style\":\"compact\",\"isMultiSelect\":false,\"choices\":[{\"title\":\"Option2\",\"value\":\"{\\\"Id\\\":\\\"135d9408-10b1-ec11-983f-0022481e6d27\\\",\\\"Value\\\":\\\"Option2\\\"}\"},{\"title\":\"Option3\",\"value\":\"{\\\"Id\\\":\\\"145d9408-10b1-ec11-983f-0022481e6d27\\\",\\\"Value\\\":\\\"Option3\\\"}\"},{\"title\":\"Option1\",\"value\":\"{\\\"Id\\\":\\\"125d9408-10b1-ec11-983f-0022481e6d27\\\",\\\"Value\\\":\\\"Option1\\\"}\"}]},{\"type\":\"Input.Toggle\",\"id\":\"{\\\"Id\\\":\\\"63a42fb5-9e8b-ec11-93b0-00224824654f\\\",\\\"Name\\\":\\\"Consent\\\",\\\"IsOption\\\":false,\\\"Order\\\":4,\\\"IsRequired\\\":true,\\\"QuestionText\\\":\\\"AgreetoTermsandConditions\\\"}\",\"title\":\"*AgreetoTermsandConditions\",\"valueOn\":\"True\",\"valueOff\":\"False\",\"value\":\"false\"},{\"type\":\"TextBlock\",\"isSubtle\":true,\"text\":\"Fieldsmarkedwith*aremandatory.\",\"wrap\":true}],\"actions\":[{\"type\":\"Action.Submit\",\"data\":{\"Type\":\"InputSubmit\"},\"title\":\"Submit\"}]}";
        const string2 = "[{\"index\":2,\"id\":\"33828761-9e8b-ec11-93b0-00224824654f\",\"value\":\"Blah\"},{\"index\":4,\"id\":\"5624f385-9e8b-ec11-93b0-00224824654f\",\"value\":\"BlahBlahBlah\"},{\"index\":6,\"id\":\"0b5d9408-10b1-ec11-983f-0022481e6d27\",\"value\":\"{\\\"Id\\\":\\\"135d9408-10b1-ec11-983f-0022481e6d27\\\",\\\"Value\\\":\\\"Option2\\\"}\"},{\"index\":7,\"id\":\"63a42fb5-9e8b-ec11-93b0-00224824654f\",\"value\":\"True\"}]";
        const result1 = extractPreChatSurveyResponseValues(string1, JSON.parse(string2));
        expect(JSON.stringify(result1)).toBe("{\"Type\":\"InputSubmit\",\"{\\\"Id\\\":\\\"33828761-9e8b-ec11-93b0-00224824654f\\\",\\\"Name\\\":\\\"Name\\\",\\\"IsOption\\\":false,\\\"Order\\\":1,\\\"IsRequired\\\":true,\\\"QuestionText\\\":\\\"PleaseEnterName\\\"}\":\"Blah\",\"{\\\"Id\\\":\\\"5624f385-9e8b-ec11-93b0-00224824654f\\\",\\\"Name\\\":\\\"Comments\\\",\\\"IsOption\\\":false,\\\"Order\\\":2,\\\"IsRequired\\\":false,\\\"QuestionText\\\":\\\"Comments\\\"}\":\"BlahBlahBlah\",\"{\\\"Id\\\":\\\"0b5d9408-10b1-ec11-983f-0022481e6d27\\\",\\\"Name\\\":\\\"Options\\\",\\\"IsOption\\\":true,\\\"Order\\\":3,\\\"IsRequired\\\":false,\\\"QuestionText\\\":\\\"Options\\\"}\":\"{\\\"Id\\\":\\\"135d9408-10b1-ec11-983f-0022481e6d27\\\",\\\"Value\\\":\\\"Option2\\\"}\",\"{\\\"Id\\\":\\\"63a42fb5-9e8b-ec11-93b0-00224824654f\\\",\\\"Name\\\":\\\"Consent\\\",\\\"IsOption\\\":false,\\\"Order\\\":4,\\\"IsRequired\\\":true,\\\"QuestionText\\\":\\\"AgreetoTermsandConditions\\\"}\":\"True\"}");

        const string3 = "{}";
        const result2 = extractPreChatSurveyResponseValues(string3, JSON.parse(string3));
        expect(JSON.stringify(result2)).toBe("{}");

        const string5 = "";
        const result3 = extractPreChatSurveyResponseValues(string5, JSON.parse(string3));
        expect(JSON.stringify(result3)).toBe("{}");
    });

    it("Test newGuid", () => {
        const stringGuid = newGuid();
        expect(stringGuid[8]).toBe("-");
        expect(stringGuid[14]).toBe("4");
        expect(stringGuid[13]).toBe("-");
        expect(stringGuid[18]).toBe("-");
        expect(stringGuid[23]).toBe("-");
        expect(stringGuid.length).toBe(36);
    });

    it("Test isNullOrEmptyString", () => {
        const resultTrue = isNullOrEmptyString("");
        expect(resultTrue).toBe(true);

        const resultFalse = isNullOrEmptyString("teststring");
        expect(resultFalse).toBe(false);
    });

    it("Test isNullOrUndefined", () => {
        const resultTrue = isNullOrEmptyString(null);
        expect(resultTrue).toBe(true);

        const resultFalse = isNullOrEmptyString("test");
        expect(resultFalse).toBe(false);
    });

    it("Test getDomain", () => {
        let resultTrue = getDomain("https://uniqueorgname.crm4.omnichannelengagementhub.com");
        expect(resultTrue).toBe(AriaTelemetryConstants.EU);

        resultTrue = getDomain("https://uniqueorgname.crm12.omnichannelengagementhub.com");
        expect(resultTrue).toBe(AriaTelemetryConstants.EU);

        const resultFalse = getDomain("https://uniqueorgname.crm10.omnichannelengagementhub.com");
        expect(resultFalse).toBe(AriaTelemetryConstants.Public);
    });

    it("Test getWidgetCacheId", () => {
        const testString = "ChatWidgetStateChanged_orgid_widgetid";
        const md5HashtestString = Md5.init(testString);
        const resultHashString = getWidgetCacheId("orgid", "widgetid","ChatWidgetStateChanged");
        expect(md5HashtestString).toBe(resultHashString);
    });

    it("Test getWidgetEndChatEventName", () => {
        const testString = "ChatEnded_orgid_widgetid";
        const resultString = getWidgetEndChatEventName("orgid", "widgetid","");
        expect(resultString).toBe(testString);

        const testString1 = "ChatEnded_instance1_orgid_widgetid";
        const resultString1 = getWidgetEndChatEventName("orgid", "widgetid","instance1");
        expect(resultString1).toBe(testString1);
    });

    it("Test isUndefinedOrEmpty", () => {
        const testobject = undefined;
        const testResult = isUndefinedOrEmpty(testobject);
        expect(testResult).toBe(true);

        const testobject1 = {};
        const testResult1 = isUndefinedOrEmpty(testobject1);
        expect(testResult1).toBe(true);

        const testobject2 = { "test": "value" };
        const testResult2 = isUndefinedOrEmpty(testobject2);
        expect(testResult2).toBe(false);
    });

    it("Test getBroadcastChannelName", () => {
        const testChannelName = "instance_widgetid";
        const testResult = getBroadcastChannelName("widgetid", "instance");
        expect(testResult).toBe(testChannelName);

        const testChannelName1 = "widgetid";
        const testResult1 = getBroadcastChannelName("widgetid","");
        expect(testResult1).toBe(testChannelName1);
    });

    it("should return the same string when no placeholders are present", () => {
        const templateMessage = "Hello, world!";
        const values = [];
        expect(formatTemplateString(templateMessage, values)).toEqual(templateMessage);
    });

    it("should replace placeholders with corresponding values", () => {
        const templateMessage = "Hello, {0}! You are {1} years old.";
        const values = ["Alice", 30];
        expect(formatTemplateString(templateMessage, values)).toEqual("Hello, Alice! You are 30 years old.");
    });

    it("should ignore placeholders with undefined values", () => {
        const templateMessage = "Hello, {0}! You are {1} years old.";
        const values = ["Alice"];
        expect(formatTemplateString(templateMessage, values)).toEqual("Hello, Alice! You are {1} years old.");
    });

    it("should ignore extra values", () => {
        const templateMessage = "Hello, {0}!";
        const values = ["Alice", 30];
        expect(formatTemplateString(templateMessage, values)).toEqual("Hello, Alice!");
    });

    it("should replace multiple occurrences of the same placeholder", () => {
        const templateMessage = "Hello, {0}! You are {1} years old. {0}, how are you?";
        const values = ["Alice", 30];
        expect(formatTemplateString(templateMessage, values)).toEqual("Hello, Alice! You are 30 years old. Alice, how are you?");
    });

    it("should replace placeholders with empty string values", () => {
        const templateMessage = "Hello, {0}! You are {1} years old.";
        const values = ["Alice", ""];
        expect(formatTemplateString(templateMessage, values)).toEqual("Hello, Alice! You are  years old.");
    });

    it("should parse 'True' string value to lower case string", () => {
        const property = "True";
        expect(parseLowerCaseString(property)).toEqual("true");
    });

    it("should parse 'true' string value to lower case string", () => {
        const property = "true";
        expect(parseLowerCaseString(property)).toEqual("true");
    });

    it("should parse true boolean value to lower case string", () => {
        const property = true;
        expect(parseLowerCaseString(property)).toEqual("true");
    });

    it("should parse 'False' string value to lower case string", () => {
        const property = "False";
        expect(parseLowerCaseString(property)).toEqual("false");
    });

    it("should parse 'false' string value to lower case string", () => {
        const property = "false";
        expect(parseLowerCaseString(property)).toEqual("false");
    });

    it("should parse false boolean value to lower case string", () => {
        const property = false;
        expect(parseLowerCaseString(property)).toEqual("false");
    });
});