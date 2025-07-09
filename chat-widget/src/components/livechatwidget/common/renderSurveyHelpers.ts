import { Constants, ParticipantType, PostChatSurveyTelemetryMessage, SurveyProvider } from "../../../common/Constants";
import { LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";

import { ConversationState } from "../../../contexts/common/ConversationState";
import { Dispatch } from "react";
import { FacadeChatSDK } from "../../../common/facades/FacadeChatSDK";
import { ILiveChatWidgetAction } from "../../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../../contexts/common/ILiveChatWidgetContext";
import { ILiveChatWidgetProps } from "../interfaces/ILiveChatWidgetProps";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";
import { PostChatSurveyMode } from "../../postchatsurveypanestateful/enums/PostChatSurveyMode";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { addDelayInMs } from "../../../common/utils";
import { getPostChatSurveyConfig, isPostChatSurveyEnabled } from "./liveChatConfigUtils";

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
        console.log("ADAD getUserSurveyMode", postChatSurveyMode);
        dispatch({ type: LiveChatWidgetActionType.SET_SURVEY_MODE, payload: postChatSurveyMode });
        return;
    }

    if (participantType === ParticipantType.Bot) {
        postChatSurveyMode = getBotSurveyMode(props, state);
        console.log("ADAD getBotSurveyMode", postChatSurveyMode);
        dispatch({ type: LiveChatWidgetActionType.SET_SURVEY_MODE, payload: postChatSurveyMode });
        return;
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderSurvey = async (postChatContext: any, state: ILiveChatWidgetContext, dispatch: Dispatch<ILiveChatWidgetAction>) => {
    if (postChatSurveyMode === PostChatSurveyMode.Link) {
        setWidgetStateToInactive(dispatch);
        return;
    }
    if (postChatSurveyMode === PostChatSurveyMode.Embed) {
        // ADAD: modify embedMode flow, need to set WidgetState to inactive after survey is completed (after survey complete system message comes in)
        // await embedModePostChatWorkflow(postChatContext, dispatch);
        await embedModePostChatWorkflow(postChatContext, state, dispatch);
    }
};

// Function for embed mode postchat workflow which is essentially same for both customer and agent
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const embedModePostChatWorkflow = async (postChatContext: any, state: ILiveChatWidgetContext, dispatch: Dispatch<ILiveChatWidgetAction>) => {
    // const embedModePostChatWorkflow = async (postChatContext: any, dispatch: Dispatch<ILiveChatWidgetAction>) => {
    TelemetryHelper.logActionEvent(LogLevel.INFO, {
        Event: TelemetryEvent.EmbedModePostChatWorkflowStarted
    });
    if (postChatContext) {
        console.log("ADAD embedModePostChatWorkflow() isConversationalSurvey", state.appStates.isConversationalSurvey);
        console.log("ADAD embedModePostChatWorkflow() postChatContext", postChatContext);
        // ADAD TODO this is needed for when c2 ends chat, need to check if we show conversational vs normal embed, also CV vs MCS, FCB -> THIS IS OPEN QUESTION!!! maybe need to expose a new prop
        // unless, we rely on the system message that comes in after survey initiated to set isConversationalSurvey = true, thus entering this flow. need to "hold" cold and make it not async tho!
        // probably is doable since await endChat() happens before initiatePostChat()
        // with above, then we do not need isSeamlessSurveyFCBEnabled in the condition below
        // ADAD TODO test isSeamlessSurveyFCBEnabled removed, since we have processed additional in endChat.ts
        // actually... at this point postChatContext will have all our info: agent/bot survey mode, isConversationalSurveyEnabled, surveyProvider

        // // TODO remove:
        // // 6/19 - wait this is not needed since the value is in postChatContext already, so we can just use that
        // const inMemoryState = executeReducer(state, { type: LiveChatWidgetActionType.GET_IN_MEMORY_STATE, payload: null });
        // console.log("ADAD useEffect inMemoryState isConversationalSurveyEnabled: ", inMemoryState.appStates.isConversationalSurveyEnabled);
        // console.log("ADAD useEffect inMemoryState: ", inMemoryState);
        // const isConversationalSurveyEnabled = inMemoryState.appStates.isConversationalSurveyEnabled;
        
        // if (state.appStates.isConversationalSurvey || isSeamlessSurveyFCBEnabled) {
        if (postChatContext.isConversationalSurveyEnabled && postChatContext.surveyProvider === SurveyProvider.MicrosoftCopilotStudio) { // we already know it's embed mode
            console.log("ADAD embedModePostChatWorkflow() early return using postChatContext.isConversationalSurvey");
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Postchat });
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATIONAL_SURVEY_DISPLAY, payload: true });
            // ADAD TODO call SET_CONVERSATIONAL_SURVEY_DISPLAY here? actually it is already called during prepareEndChat(), check if that is the right location 
            // ADAD TODO override, yes call it here, so both PostChat + ConvSurvey state simultaneously!
            // ADAD TODO it's also called when system message comes in conversationEndMiddleware, check this too!
            return;
        }
        // // TODO remove:
        // if (state.appStates.isConversationalSurvey) {
        //     console.log("ADAD embedModePostChatWorkflow() early return NO conversational DISPATCH");

        //     // ADAD perhaps SET_CONVERSATIONAL_SURVEY_DISPLAY should be set to true here for the FCB enabled case?
        //     // dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATIONAL_SURVEY_DISPLAY, payload: true }); // ADAD should set this regardless since it can be FCB case
            
        //     // ADAD seems this is bug when uncommented, the chat widget is in a weird rendered state when agent ends chat; but we need this to control LCW state correctly! -> fixed
        //     dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Postchat });
        //     return;
        // }
        // ADAD (might be okay to leave since will skip entire embed flow if MCS)
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

    await renderSurvey(postchatContext, state, dispatch);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isPostChatEnabled = (props: ILiveChatWidgetProps, state: ILiveChatWidgetContext) => {
    const isPostChatEnabled = props.chatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_postconversationsurveyenable ?? state.domainStates.liveChatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_postconversationsurveyenable;
    return isPostChatEnabled === Constants.true;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getPostChatContext = async (facadeChatSDK: FacadeChatSDK, state: ILiveChatWidgetContext, dispatch: Dispatch<ILiveChatWidgetAction>) => {
    try {
        // const postChatEnabled = await isPostChatSurveyEnabled(facadeChatSDK);
        const postChatConfig = await getPostChatSurveyConfig(facadeChatSDK);
        console.log("ADAD postChatConfig getPostChatContext()", postChatConfig);
        const postChatEnabled = postChatConfig.postChatEnabled;
        if (postChatConfig.isConversationalSurveyEnabled) {
            console.log("ADAD setting isConversationSurveyEnabled to true");
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATIONAL_SURVEY_ENABLED, payload: true });
        }
        if (postChatEnabled) {
            if (state?.domainStates?.postChatContext === undefined) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const context: any = await facadeChatSDK.getPostChatSurveyContext();
                console.log("ADAD postChatSurveyContext facadeChatSDK when context == undefined", context);
                TelemetryHelper.logSDKEventToAllTelemetry(LogLevel.INFO, {
                    Event: TelemetryEvent.PostChatContextCallSucceed,
                    Description: PostChatSurveyTelemetryMessage.PostChatContextCallSucceed
                });

                // dispatch({ type: LiveChatWidgetActionType.SET_POST_CHAT_CONTEXT, payload: context });
                // return context;

                // Merge postChatConfig with postChatSurveyContext
                const mergedContext = {
                    ...context,
                    ...postChatConfig
                };

                console.log("ADAD mergedContext", mergedContext);

                dispatch({ type: LiveChatWidgetActionType.SET_POST_CHAT_CONTEXT, payload: mergedContext });
                return mergedContext;
            }
        }
    } catch (error) {
        TelemetryHelper.logSDKEventToAllTelemetry(LogLevel.ERROR, {
            Event: TelemetryEvent.PostChatContextCallFailed,
            Description: PostChatSurveyTelemetryMessage.PostChatContextCallFailed,
            ExceptionDetails: {
                exception: error
            }
        });
    }
};

// Function for link mode postchat workflow which is essentially same for both customer and agent
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setWidgetStateToInactive = async (dispatch: Dispatch<ILiveChatWidgetAction>) => {
    dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.InActive });
};

export { initiatePostChat, setWidgetStateToInactive, getPostChatContext, isPostChatEnabled as checkPostChatEnabled };