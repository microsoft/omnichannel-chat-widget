import { Dispatch } from "react";
import { Constants, ParticipantType } from "../../../common/Constants";
import { LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { addDelayInMs } from "../../../common/utils";
import { ConversationState } from "../../../contexts/common/ConversationState";
import { ILiveChatWidgetAction } from "../../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../../contexts/common/ILiveChatWidgetContext";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";
import { PostChatSurveyMode } from "../../postchatsurveypanestateful/enums/PostChatSurveyMode";
import { ILiveChatWidgetProps } from "../interfaces/ILiveChatWidgetProps";

let conversationDetails: any = undefined;
let postChatContext: any = undefined;
let postChatSurveyMode: any = undefined;

const getBotSurveyMode = (props: ILiveChatWidgetProps, state: ILiveChatWidgetContext) => {
    return (props.chatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_postconversationsurveybotsurveymode ??
        state.domainStates.liveChatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_postconversationsurveybotsurveymode);
};

const getUserSurveyMode = (props: ILiveChatWidgetProps, state: ILiveChatWidgetContext) => {
    return (props.chatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_postconversationsurveymode ??
        state.domainStates.liveChatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_postconversationsurveymode);
};

// Set Survey mode based on conversation ended by entity
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setSurveyMode = async (props: ILiveChatWidgetProps, participantType: string, state: ILiveChatWidgetContext, dispatch: Dispatch<ILiveChatWidgetAction>) => {
    // TODO: Check participant type when noone joined
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

const renderSurvey = async (state: ILiveChatWidgetContext, dispatch: Dispatch<ILiveChatWidgetAction>) => {
    if (postChatSurveyMode === PostChatSurveyMode.Link) {
        setWidgetStateToInactive(dispatch);
        return;
    }
    if (postChatSurveyMode === PostChatSurveyMode.Embed) {
        await embedModePostChatWorkflow(state, dispatch);
    }
};

// Function for embed mode postchat workflow which is essentially same for both customer and agent
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const embedModePostChatWorkflow = async (state: ILiveChatWidgetContext, dispatch: Dispatch<ILiveChatWidgetAction>) => {
    TelemetryHelper.logActionEvent(LogLevel.INFO, {
        Event: TelemetryEvent.EmbedModePostChatWorkflowStarted
    });
    if (state?.domainStates?.postChatContext) {
        dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.PostchatLoading });

        await addDelayInMs(Constants.PostChatLoadingDurationInMs);

        dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Postchat });
    } else {
        const error = `Conversation was Ended but App State was not set correctly: postChatContext = ${state.domainStates.postChatContext}`;
        TelemetryHelper.logActionEvent(LogLevel.ERROR, {
            Event: TelemetryEvent.AppStatesException,
            ExceptionDetails: {
                exception: error
            }
        });
        //throw new Error(error);
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const initiatePostChat = async (props: ILiveChatWidgetProps, conversationDetailsParam: any, postChatContextParam: any, state: ILiveChatWidgetContext, dispatch: Dispatch<ILiveChatWidgetAction>) => {
    console.log("starting postchat survey");
    conversationDetails = conversationDetailsParam;
    postChatContext = postChatContextParam;

    // Check if postchat can be rendered at first place - based on agent/bot joined conversation
    // ChatSDK should know this already
    if (conversationDetails?.canRenderPostChat?.toLowerCase() === Constants.false) {
        return;
    }

    // Start Postchat workflow: TODO:<DO I NEED THIS STATE>
    //dispatch({ type: LiveChatWidgetActionType.SET_POST_CHAT_WORKFLOW_IN_PROGRESS, payload: true });

    await setSurveyMode(props, conversationDetails?.participantType, state, dispatch);

    await renderSurvey(state, dispatch);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isPostChatEnabled = (props: ILiveChatWidgetProps, state: ILiveChatWidgetContext, dispatch: Dispatch<ILiveChatWidgetAction>) => {
    const isPostChatEnabled = props.chatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_postconversationsurveyenable ?? state.domainStates.liveChatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_postconversationsurveyenable;
    return isPostChatEnabled === Constants.true;
};

const getPostChatContext = async (chatSDK: any, state: ILiveChatWidgetContext, dispatch: Dispatch<ILiveChatWidgetAction>) => {
    try {
        if (state?.domainStates?.postChatContext === undefined) {
            const context: any = await chatSDK.getPostChatSurveyContext();
            TelemetryHelper.logSDKEvent(LogLevel.INFO, {
                Event: TelemetryEvent.PostChatContextCallSucceed,
                Description: "Postchat context call succeed."
            });
            console.log(`postchatcontext:${JSON.stringify(context)}`);
            dispatch({ type: LiveChatWidgetActionType.SET_POST_CHAT_CONTEXT, payload: context });
        }
    } catch (error) {
        TelemetryHelper.logSDKEvent(LogLevel.INFO, {
            Event: TelemetryEvent.PostChatContextCallFailed,
            Description: "Failed to get post chat context."
        });
    }
};

// Function for link mode postchat workflow which is essentially same for both customer and agent
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setWidgetStateToInactive = async (dispatch: Dispatch<ILiveChatWidgetAction>) => {
    dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.InActive });
};

export { initiatePostChat, setWidgetStateToInactive, getPostChatContext, isPostChatEnabled as checkPostChatEnabled };