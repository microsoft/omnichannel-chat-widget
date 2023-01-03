import { IStackStyles, Stack } from "@fluentui/react";

import { IPostChatSurveyPaneProps } from "./interfaces/IPostChatSurveyPaneProps";
import React from "react";
import { defaultPostChatSurveyPaneControlProps } from "./common/defaultProps/defaultPostChatSurveyPaneControlProps";
import { defaultPostChatSurveyPaneGeneralStyles } from "./common/defaultProps/defaultStyles/defaultPostChatSurveyPaneGeneralStyles";
import { getValidatedURL } from "../../common/utils";

function PostChatSurveyPane(props: IPostChatSurveyPaneProps) {

    const elementId = props.controlProps?.id ?? defaultPostChatSurveyPaneControlProps.id;
    const inputUrl = props.controlProps?.surveyURL ?? defaultPostChatSurveyPaneControlProps.surveyURL;

    const containerStyles: IStackStyles = {
        root: Object.assign({}, defaultPostChatSurveyPaneGeneralStyles, props.styleProps?.generalStyleProps)
    };

    const iframeStyles: React.CSSProperties = {
        height: "100vh",
        width: "100%",
        display: "block",
        maxHeight: "100%"
    };

    return (
        <>
            <Stack
                id={elementId}
                tabIndex={-1}
                styles={containerStyles}
                role={props.controlProps?.role}>
                <iframe 
                    id={elementId + "-Iframe"}
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    src={getValidatedURL(inputUrl!)}
                    title={props.controlProps?.title ?? defaultPostChatSurveyPaneControlProps.title}
                    style={iframeStyles}
                    frameBorder="0"/>
            </Stack>
        </>
    );
}

export default PostChatSurveyPane;

