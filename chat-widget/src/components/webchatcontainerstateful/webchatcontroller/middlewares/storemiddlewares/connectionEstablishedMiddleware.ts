import { Constants } from "../../../../../common/Constants";
import { DirectLineSenderRole } from "../../enums/DirectLineSenderRole";
import { IWebChatAction } from "../../../interfaces/IWebChatAction";
// import { MessageTypes } from "../../enums/MessageType";
import { WebChatActionType } from "../../enums/WebChatActionType";

const createConnectionEstablishedMiddleware = (connectionEstablishedCallback: () => void) => () => (next: (action: IWebChatAction) => void) => (action: IWebChatAction) => {

    if (action?.type == WebChatActionType.DIRECT_LINE_CONNECT_FULFILLED) {
        connectionEstablishedCallback();
        
    }

    return next(action);
};

export default createConnectionEstablishedMiddleware;
