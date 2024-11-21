import { ILiveChatWidgetProps } from "../interfaces/ILiveChatWidgetProps";

const overridePropsOnMockIfApplicable = (props: ILiveChatWidgetProps) => {
    
    if (props?.mock?.type && props?.mock?.type.toLowerCase() === "designer") {
        console.log("ELOPEZANAYA :: Overriding props for mock type designer");
        if (!props.webChatContainerProps) {
            props.webChatContainerProps = {};
        }

        if (!props.webChatContainerProps.webChatProps) {
            props.webChatContainerProps.webChatProps = {};
        }

        if (!props.webChatContainerProps.webChatStyles) {
            props.webChatContainerProps.webChatStyles = {};
        }

        if (!props.webChatContainerProps.webChatProps.overrideLocalizedStrings) {
            props.webChatContainerProps.webChatProps.overrideLocalizedStrings = {};
        }

        props.webChatContainerProps = {
            ...props.webChatContainerProps,
            webChatProps: {
                disabled: true,
                ...props.webChatContainerProps.webChatProps,
                overrideLocalizedStrings: {
                    TEXT_INPUT_PLACEHOLDER: "Send a message . . .",
                    ...props.webChatContainerProps.webChatProps.overrideLocalizedStrings
                }
            },
            webChatStyles: {
                hideUploadButton: false,
                sendBoxBackground: "rgb(243, 242, 241)",
                ...props.webChatContainerProps.webChatStyles
            }
        };
    }

    console.log("ELOPEZANAYA :: Props without change");
};

export default overridePropsOnMockIfApplicable;