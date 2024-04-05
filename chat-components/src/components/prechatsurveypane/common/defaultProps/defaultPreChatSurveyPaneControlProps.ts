import { IPreChatSurveyPaneControlProps } from "../../interfaces/IPreChatSurveyPaneControlProps";
import { Ids } from "../../../../common/Constants";

export const defaultPreChatSurveyPaneControlProps: IPreChatSurveyPaneControlProps = {
    id: Ids.DefaultPreChatSurveyPaneId,
    dir: "auto",
    role: "form",
    hidePreChatSurveyPane: false,
    adaptiveCardHostConfig: "{\"fontFamily\":\"Segoe UI, Helvetica Neue, sans-serif\",\"containerStyles\":{\"default\":{\"foregroundColors\":{\"default\":{\"default\":\"#000000\"}},\"backgroundColor\":\"#FFFFFF\"}},\"actions\":{\"actionsOrientation\":\"Vertical\",\"actionAlignment\":\"stretch\"}}",
    payload: "{\"$schema\":\"http://adaptivecards.io/schemas/adaptive-card.json\",\"type\":\"AdaptiveCard\",\"version\":\"1.1\",\"body\":[{\"type\":\"TextBlock\",\"weight\":\"bolder\",\"text\":\"Please answer below questions.\"},{\"type\":\"Input.Text\",\"id\":\"1e5e4e7a-8f0b-ec11-b6e6-000d3a305d38\",\"label\":\"name pls?\",\"maxLength\":100,\"isRequired\":true,\"errorMessage\":\"Name is required\"},{\"type\":\"Input.Text\",\"id\":\"7f8f5d6d-995e-ec11-8f8f-000d3a31376e\",\"label\":\"multi\\nmulti\\nmulti\",\"style\":\"text\",\"isMultiline\":true,\"maxLength\":250},{\"type\":\"Input.ChoiceSet\",\"id\":\"e4bdf7cb-995e-ec11-8f8f-000d3a31376e\",\"label\":\"options\",\"isMultiSelect\":false,\"value\":\"1\",\"style\":\"compact\",\"choices\":[{\"title\":\"one\",\"value\":\"1\"},{\"title\":\"two\",\"value\":\"2\"},{\"title\":\"three\",\"value\":\"3\"}]},{\"type\":\"Input.Toggle\",\"id\":\"b26011d2-995e-ec11-8f8f-000d3a31376e\",\"title\":\"consent\",\"valueOn\":\"True\",\"valueOff\":\"False\",\"value\":\"false\"},{\"type\":\"TextBlock\",\"isSubtle\":true,\"text\":\"Fields marked with * are mandatory.\",\"wrap\":true}],\"actions\":[{\"type\":\"Action.Submit\",\"title\":\"Submit\",\"data\":{\"Type\":\"InputSubmit\"}}]}",
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSubmit: function (values) {
        console.log("on submit");
    }
};