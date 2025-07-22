/******
 * CallActionMiddleware
 * 
 * Intercepts custom call actions and handles tel: URL navigation
 ******/

import { IWebChatAction } from "../../../interfaces/IWebChatAction";
import { WebChatActionType } from "../../enums/WebChatActionType";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
const createCallActionMiddleware = () => () => (next: any) => (action: IWebChatAction) => {
    
    // Intercept incoming activities to modify suggested actions with call type
    if (action.type === WebChatActionType.DIRECT_LINE_INCOMING_ACTIVITY) {
        const activity = action.payload?.activity;
        
        // Check if activity has suggested actions with call type
        if (activity?.suggestedActions?.actions) {
            console.log("Processing incoming activity with suggested actions:", activity.suggestedActions.actions);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            activity.suggestedActions.actions = activity.suggestedActions.actions.map((suggestedAction: any) => {
                if (suggestedAction.type === "call") {
                    console.log("Processing call suggested action:", suggestedAction);
                    
                    // Convert call action to openUrl with encoded tel URL
                    const telUrl = suggestedAction.value;
                    // const encodedTelUrl = btoa(telUrl); // Base64 encode

                    const convertedAction = {
                        ...suggestedAction,
                        type: "openUrl",
                        value: `tel:${telUrl}`
                    };
                    console.log("Converted call to openUrl:", convertedAction);
                    
                    return convertedAction;
                }
                return suggestedAction;
            });
        }
    }

    return next(action);
};

export default createCallActionMiddleware;
