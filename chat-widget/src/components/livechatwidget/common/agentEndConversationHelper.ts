import { Dispatch } from "react";
import { LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { ConversationEndEntity } from "../../../contexts/common/ConversationEndEntity";
import { ILiveChatWidgetAction } from "../../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../../contexts/common/ILiveChatWidgetContext";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";
import { ILiveChatWidgetProps } from "../interfaces/ILiveChatWidgetProps";
import { checkPostChatEnabled } from "./setPostChatContextAndLoadSurvey";

const handleAgentEndConversation = (props: ILiveChatWidgetProps, state: ILiveChatWidgetContext, dispatch: Dispatch<ILiveChatWidgetAction>) => {
    const isPostChatEnabled = checkPostChatEnabled(props, state);
    if (isPostChatEnabled) {
        if (!state.appStates.postChatWorkflowInProgress) {
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_ENDED_BY, payload: ConversationEndEntity.Agent });
            TelemetryHelper.logActionEvent(LogLevel.INFO, {
                Event: TelemetryEvent.ConversationEndedByAgent,
                Description: "Conversation is ended from agent side"
            });              
        }
    } else {
        dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_ENDED_BY, payload: ConversationEndEntity.Agent });
        TelemetryHelper.logActionEvent(LogLevel.INFO, {
            Event: TelemetryEvent.ConversationEndedByAgent,
            Description: "Conversation is ended from agent side"
        });               
    }
};

export { handleAgentEndConversation };