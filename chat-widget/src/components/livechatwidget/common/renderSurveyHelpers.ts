import { Dispatch } from "react";
import { Constants, ParticipantType, PostChatSurveyTelemetryMessage } from "../../../common/Constants";
import { LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { addDelayInMs } from "../../../common/utils";
import { ConversationState } from "../../../contexts/common/ConversationState";
import { ILiveChatWidgetAction } from "../../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../../contexts/common/ILiveChatWidgetContext";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";
import { PostChatSurveyMode } from "../../postchatsurveypanestateful/enums/PostChatSurveyMode";
import { ILiveChatWidgetProps } from "../interfaces/ILiveChatWidgetProps";
import { isPostChatSurveyEnabled } from "./liveChatConfigUtils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let conversationDetails: any = undefined;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let postChatSurveyMode: any = undefined;

const getBotSurveyMode = (props: ILiveChatWidgetProps, state: ILiveChatWidgetContext) => {
    return (props.chatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_postconversationsurveybotsurveymode ??
        state.domainStates.liveChatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_postconversationsurveybotsurveymode);
};

const getUserSurveyMode = (props: ILiveChatWidgetProps, state: ILiveChatWidgetContext) => {
    if (!props.chatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_postconversationsurveymode) {
        return state?.domainStates?.liveChatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_postconversationsurveymode ?? PostChatSurveyMode.Embed;
    }
    return props.chatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_postconversationsurveymode;
};

// Set Survey mode based on conversation ended by entity
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setSurveyMode = async (props: ILiveChatWidgetProps, participantType: string, state: ILiveChatWidgetContext, dispatch: Dispatch<ILiveChatWidgetAction>) => {
    if (participantType === ParticipantType.User) {
        postChatSurveyMode = getUserSurveyMode(props, state);
        dispatch({ type: LiveChatWidgetActionType.SET_SURVEY_MODE, payload: postChatSurveyMode });
        return;
    }

    if (participantType === ParticipantType.Bot) {
        postChatSurveyMode = getBotSurveyMode(props, state);
        dispatch({ type: LiveChatWidgetActionType.SET_SURVEY_MODE, payload: postChatSurveyMode });
        return;
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderSurvey = async (postChatContext: any, dispatch: Dispatch<ILiveChatWidgetAction>) => {
    if (postChatSurveyMode === PostChatSurveyMode.Link) {
        setWidgetStateToInactive(dispatch);
        return;
    }
    if (postChatSurveyMode === PostChatSurveyMode.Embed) {
        await embedModePostChatWorkflow(postChatContext, dispatch);
    }
};

// Function for embed mode postchat workflow which is essentially same for both customer and agent
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const embedModePostChatWorkflow = async (postChatContext: any, dispatch: Dispatch<ILiveChatWidgetAction>) => {
    TelemetryHelper.logActionEvent(LogLevel.INFO, {
        Event: TelemetryEvent.EmbedModePostChatWorkflowStarted
    });
    if (postChatContext) {
        dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.PostchatLoading });

        await addDelayInMs(Constants.PostChatLoadingDurationInMs);

        dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Postchat });
    } else {
        const error = `Conversation was Ended but App State was not set correctly: postChatContext = ${postChatContext}`;
        TelemetryHelper.logActionEvent(LogLevel.ERROR, {
            Event: TelemetryEvent.AppStatesException,
            ExceptionDetails: {
                exception: error
            }
        });
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const initiatePostChat = async (props: ILiveChatWidgetProps, conversationDetailsParam: any, state: ILiveChatWidgetContext, dispatch: Dispatch<ILiveChatWidgetAction>, postchatContext: any) => {
    conversationDetails = conversationDetailsParam;
    const participantType = conversationDetails?.participantType ?? postchatContext.participantType;
    await setSurveyMode(props, participantType, state, dispatch);

    await renderSurvey(postchatContext, dispatch);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isPostChatEnabled = (props: ILiveChatWidgetProps, state: ILiveChatWidgetContext) => {
    const isPostChatEnabled = props.chatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_postconversationsurveyenable ?? state.domainStates.liveChatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_postconversationsurveyenable;
    return isPostChatEnabled === Constants.true;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getPostChatContext = async (chatSDK: any, state: ILiveChatWidgetContext, dispatch: Dispatch<ILiveChatWidgetAction>) => {
    try {
        const postChatEnabled = await isPostChatSurveyEnabled(chatSDK);
        if (postChatEnabled) {
            if (state?.domainStates?.postChatContext === undefined) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const context: any = await chatSDK.getPostChatSurveyContext();
                TelemetryHelper.logSDKEvent(LogLevel.INFO, {
                    Event: TelemetryEvent.PostChatContextCallSucceed,
                    Description: PostChatSurveyTelemetryMessage.PostChatContextCallSucceed
                });
                dispatch({ type: LiveChatWidgetActionType.SET_POST_CHAT_CONTEXT, payload: context });
                return context;
            }
        }
    } catch (error) {
        TelemetryHelper.logSDKEvent(LogLevel.ERROR, {
            Event: TelemetryEvent.PostChatContextCallFailed,
            Description: PostChatSurveyTelemetryMessage.PostChatContextCallFailed
        });
    }
};

// Function for link mode postchat workflow which is essentially same for both customer and agent
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setWidgetStateToInactive = async (dispatch: Dispatch<ILiveChatWidgetAction>) => {
    dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.InActive });
};

export { initiatePostChat, setWidgetStateToInactive, getPostChatContext, isPostChatEnabled as checkPostChatEnabled };