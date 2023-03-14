import { BroadcastEvent, LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";

import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { ConversationState } from "../../../contexts/common/ConversationState";
import { Dispatch } from "react";
import { ICustomEvent } from "@microsoft/omnichannel-chat-components/lib/types/interfaces/ICustomEvent";
import { ILiveChatWidgetAction } from "../../../contexts/common/ILiveChatWidgetAction";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { ILiveChatWidgetContext } from "../../../contexts/common/ILiveChatWidgetContext";
import { Constants } from "../../../common/Constants";
import { endChat } from "./endChat";
import { ILiveChatWidgetProps } from "../interfaces/ILiveChatWidgetProps";
import { PostChatSurveyMode } from "../../postchatsurveypanestateful/enums/PostChatSurveyMode";
import { addDelayInMs } from "../../../common/utils";
import { NotificationHandler } from "../../webchatcontainerstateful/webchatcontroller/notification/NotificationHandler";
import { NotificationScenarios } from "../../webchatcontainerstateful/webchatcontroller/enums/NotificationScenarios";
import { ConversationEndEntity } from "../../../contexts/common/ConversationEndEntity";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setPostChatContextAndLoadSurvey = async (chatSDK: any, dispatch: Dispatch<ILiveChatWidgetAction>, persistedChat?: boolean) => {
    try {
        if (!persistedChat) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const context: any = await chatSDK.getPostChatSurveyContext();
            TelemetryHelper.logSDKEvent(LogLevel.INFO, {
                Event: TelemetryEvent.PostChatContextCallSucceed,
                Description: "Postchat context call succeed."
            });
            dispatch({ type: LiveChatWidgetActionType.SET_POST_CHAT_CONTEXT, payload: context });
        }
    } catch (ex) {
        TelemetryHelper.logSDKEvent(LogLevel.ERROR, {
            Event: TelemetryEvent.PostChatContextCallFailed,
            ExceptionDetails: {
                exception: ex
            }
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    BroadcastService.getMessageByEventName("LoadPostChatSurvey").subscribe((msg: ICustomEvent) => {
        dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Postchat });
    });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const checkPostChatEnabled = (props: ILiveChatWidgetProps, state: ILiveChatWidgetContext) => {
    const isPostChatEnabled = props.chatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_postconversationsurveyenable ?? state.domainStates.liveChatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_postconversationsurveyenable;
    return isPostChatEnabled === Constants.true;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const initiatePostChat = async (props: ILiveChatWidgetProps, chatSDK: any, setAdapter: any, setWebChatStyles: any, dispatch: Dispatch<ILiveChatWidgetAction>, adapter: any, state: ILiveChatWidgetContext) => {
    // Check if Postchat already in progress and handle case where chat is ended by customer
    if (state.appStates.postChatWorkflowInProgress && state.appStates.conversationEndedBy === ConversationEndEntity.Customer) {
        await endChat(props, chatSDK, setAdapter, setWebChatStyles, dispatch, adapter, false, false, true);
    }

    // Conversation Details call required by customer as well as agent 
    const conversationDetails = await getConversationDetailsCall(chatSDK);
    // Start Postchat workflow
    dispatch({ type: LiveChatWidgetActionType.SET_POST_CHAT_WORKFLOW_IN_PROGRESS, payload: true });

    // Below logic checks if chat is ended by customer or agent or bot and handles them separately
    if (conversationDetails?.participantType === Constants.userParticipantTypeTag) {
        if (state.appStates.conversationEndedBy === ConversationEndEntity.Customer) {
            await postChatInitiatedByCustomer(props, chatSDK, setAdapter, setWebChatStyles, dispatch, adapter, state, conversationDetails, false);
        } else if (state.appStates.conversationEndedBy === ConversationEndEntity.Agent) {
            await postChatInitiatedByAgent(props, chatSDK, setAdapter, setWebChatStyles, dispatch, adapter, state);
        } else {
            TelemetryHelper.logActionEvent(LogLevel.ERROR, {
                Event: TelemetryEvent.AppStatesException,
                ExceptionDetails: {
                    exception: `ConversationDetails was not set correctly: conversationDetails = ${JSON.stringify(conversationDetails)}`
                }
            });
            // Ending chat because something went wrong
            await endChat(props, chatSDK, setAdapter, setWebChatStyles, dispatch, adapter, false, false, true);
        }
    } else if (conversationDetails?.participantType === Constants.botParticipantTypeTag) {
        if (state.appStates.conversationEndedBy === ConversationEndEntity.Customer) {
            await postChatInitiatedByCustomer(props, chatSDK, setAdapter, setWebChatStyles, dispatch, adapter, state, conversationDetails, true);
        } else if (state.appStates.conversationEndedBy === ConversationEndEntity.Agent) {
            await postChatInitiatedByBot(props, chatSDK, setAdapter, setWebChatStyles, dispatch, adapter, state);
        } else {
            TelemetryHelper.logActionEvent(LogLevel.ERROR, {
                Event: TelemetryEvent.AppStatesException,
                ExceptionDetails: {
                    exception: `ConversationDetails was not set correctly: conversationDetails = ${JSON.stringify(conversationDetails)}`
                }
            });
            // Ending chat because something went wrong
            await endChat(props, chatSDK, setAdapter, setWebChatStyles, dispatch, adapter, false, false, true);
        }       
    } else {
        TelemetryHelper.logActionEvent(LogLevel.ERROR, {
            Event: TelemetryEvent.AppStatesException,
            ExceptionDetails: {
                exception: `Conversation was Ended but App State was not set correctly: conversationEndedBy = ${state.appStates.conversationEndedBy}`
            }
        });
        // Ending chat because something went wrong
        await endChat(props, chatSDK, setAdapter, setWebChatStyles, dispatch, adapter, false, false, true);
    }
};

// Function for link mode postchat workflow which is essentially same for both customer and agent
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const linkModePostChatWorkflow = (props: any, dispatch: Dispatch<ILiveChatWidgetAction>, setWebChatStyles: any) => {
    TelemetryHelper.logActionEvent(LogLevel.INFO, {
        Event: TelemetryEvent.LinkModePostChatWorkflowStarted
    });
    dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.InActive });

    // Disable SendBox
    if (props?.webChatContainerProps?.renderingMiddlewareProps?.hideSendboxOnConversationEnd !== false) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setWebChatStyles((styles: any) => { return { ...styles, hideSendBox: true }; });
    }
};

// Function for embed mode postchat workflow which is essentially same for both customer and agent
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const embedModePostChatWorkflow = async (props: any, chatSDK: any, setAdapter: any, setWebChatStyles: any, dispatch: Dispatch<ILiveChatWidgetAction>, adapter: any, state: ILiveChatWidgetContext) => {
    TelemetryHelper.logActionEvent(LogLevel.INFO, {
        Event: TelemetryEvent.EmbedModePostChatWorkflowStarted
    });
    if (state.domainStates.postChatContext) {
        dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.PostchatLoading });
        await addDelayInMs(Constants.PostChatLoadingDurationInMs);

        const loadPostChatEvent: ICustomEvent = {
            eventName: BroadcastEvent.LoadPostChatSurvey,
        };
        BroadcastService.postMessage(loadPostChatEvent);
    } else {
        TelemetryHelper.logActionEvent(LogLevel.ERROR, {
            Event: TelemetryEvent.AppStatesException,
            ExceptionDetails: {
                exception: `Conversation was Ended but App State was not set correctly: postChatContext = ${state.domainStates.postChatContext}`
            }
        });
        // End chat call since postchat context was not set correctly
        await endChat(props, chatSDK, setAdapter, setWebChatStyles, dispatch, adapter, false, false, true);
    }
};

// Function will handle only postchat cases initiated by customer
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const postChatInitiatedByCustomer = async (props: any, chatSDK: any, setAdapter: any, setWebChatStyles: any, dispatch: Dispatch<ILiveChatWidgetAction>, adapter: any, state: ILiveChatWidgetContext, conversationDetails: any, shouldUseBotSetting: boolean) => {
    let postChatSurveyMode = "";
    if (shouldUseBotSetting) {
        postChatSurveyMode = props.chatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_postconversationsurveybotsurveymode ?? state.domainStates.liveChatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_postconversationsurveybotsurveymode;
    } else {
        postChatSurveyMode = props.chatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_postconversationsurveymode ?? state.domainStates.liveChatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_postconversationsurveymode;
    }
    // Check if agent has joined conversation
    if (conversationDetails?.canRenderPostChat === Constants.truePascal) {
        TelemetryHelper.logActionEvent(LogLevel.INFO, {
            Event: TelemetryEvent.PostChatWorkflowFromCustomer,
            Description: "PostChat Workflow was started by customer"
        });
        const chatSession = await chatSDK?.getCurrentLiveChatContext();
        if (chatSession) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (chatSDK as any).chatToken = chatSession.chatToken ?? {};
            chatSDK.requestId = chatSession.requestId;
        }
        // End chat call to end chatsdk but not close chat, only if chat ended by customer
        await endChat(props, chatSDK, setAdapter, setWebChatStyles, dispatch, adapter, false, true, false);
        if (postChatSurveyMode === PostChatSurveyMode.Embed) {
            await embedModePostChatWorkflow(props, chatSDK, setAdapter, setWebChatStyles, dispatch, adapter, state);
        } else if (postChatSurveyMode === PostChatSurveyMode.Link) {
            linkModePostChatWorkflow(props, dispatch, setWebChatStyles);
        } else {
            TelemetryHelper.logActionEvent(LogLevel.ERROR, {
                Event: TelemetryEvent.AppStatesException,
                ExceptionDetails: {
                    exception: `Conversation was Ended but App State was not set correctly: msdyn_postconversationsurveymode = ${postChatSurveyMode}`
                }
            });
            // Ending chat because something went wrong
            await endChat(props, chatSDK, setAdapter, setWebChatStyles, dispatch, adapter, false, false, true);
        }
    } else {
        // Agent did not join chat so end chat normally
        await endChat(props, chatSDK, setAdapter, setWebChatStyles, dispatch, adapter, false, false, true);
    }
};

// Function will handle only postchat cases initiated by agent
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const postChatInitiatedByAgent = async (props: any, chatSDK: any, setAdapter: any, setWebChatStyles: any, dispatch: Dispatch<ILiveChatWidgetAction>, adapter: any, state: ILiveChatWidgetContext) => {
    const postChatSurveyMode = props.chatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_postconversationsurveymode ?? state.domainStates.liveChatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_postconversationsurveymode;
    TelemetryHelper.logActionEvent(LogLevel.INFO, {
        Event: TelemetryEvent.PostChatWorkflowFromAgent,
        Description: "PostChat Workflow was started by agent"
    });
    if (postChatSurveyMode === PostChatSurveyMode.Embed) {
        await embedModePostChatWorkflow(props, chatSDK, setAdapter, setWebChatStyles, dispatch, adapter, state);
    } else if (postChatSurveyMode === PostChatSurveyMode.Link) {
        linkModePostChatWorkflow(props, dispatch, setWebChatStyles);
    } else {
        TelemetryHelper.logActionEvent(LogLevel.ERROR, {
            Event: TelemetryEvent.AppStatesException,
            ExceptionDetails: {
                exception: `Conversation was Ended but App State was not set correctly: msdyn_postconversationsurveymode = ${postChatSurveyMode}`
            }
        });
        // Ending chat because something went wrong
        await endChat(props, chatSDK, setAdapter, setWebChatStyles, dispatch, adapter, false, false, true);
    }
};

// Function will handle only postchat cases initiated by bot
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const postChatInitiatedByBot = async (props: any, chatSDK: any, setAdapter: any, setWebChatStyles: any, dispatch: Dispatch<ILiveChatWidgetAction>, adapter: any, state: ILiveChatWidgetContext) => {
    const postChatSurveyMode = props.chatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_postconversationsurveybotsurveymode ?? state.domainStates.liveChatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_postconversationsurveybotsurveymode;
    TelemetryHelper.logActionEvent(LogLevel.INFO, {
        Event: TelemetryEvent.PostChatWorkflowFromBot,
        Description: "PostChat Workflow was started by bot"
    });
    if (postChatSurveyMode === PostChatSurveyMode.Embed) {
        await embedModePostChatWorkflow(props, chatSDK, setAdapter, setWebChatStyles, dispatch, adapter, state);
    } else if (postChatSurveyMode === PostChatSurveyMode.Link) {
        linkModePostChatWorkflow(props, dispatch, setWebChatStyles);
    } else {
        TelemetryHelper.logActionEvent(LogLevel.ERROR, {
            Event: TelemetryEvent.AppStatesException,
            ExceptionDetails: {
                exception: `Conversation was Ended but App State was not set correctly: msdyn_postconversationsurveymode = ${postChatSurveyMode}`
            }
        });
        // Ending chat because something went wrong
        await endChat(props, chatSDK, setAdapter, setWebChatStyles, dispatch, adapter, false, false, true);
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getConversationDetailsCall = async (chatSDK: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let conversationDetails: any = undefined;
    try {
        conversationDetails = await chatSDK.getConversationDetails();
    } catch (error) {
        TelemetryHelper.logSDKEvent(LogLevel.ERROR, {
            Event: TelemetryEvent.GetConversationDetailsCallFailed,
            ExceptionDetails: {
                exception: `Get Conversation Details Call Failed : ${error}`
            }
        });
        NotificationHandler.notifyError(NotificationScenarios.Connection, "Get Conversation Details Call Failed: " + error);
    }

    return conversationDetails;
};

export { setPostChatContextAndLoadSurvey, checkPostChatEnabled, initiatePostChat };