import { BroadcastEvent } from "../common/telemetry/TelemetryConstants";
import { BroadcastService } from "@microsoft/omnichannel-chat-components";

let isABotConversation = false;
let isStarted = false;
let isEnded = false;
let startedTime = 0;
let endedTime = 0;

let elapsedTime = 0;
let firstMessageReceived = false;


const startTracking = () => {
    //ignore anything if tracking is already in progress
    if (isStarted) {
        console.log("LapTracker already started, ignoring startTracking call");
        return;
    }
    console.log("LapTracker :: startTracking: ", isStarted, isEnded);
    isStarted = true;
    isEnded = false;
    startedTime = new Date().getTime();
    console.log("LapTracker started at: ", startedTime);
};

const stopTracking = () => {
    //ignore anything if tracking is already stopped
    if (isEnded) {
        console.log("LapTracker already ended, ignoring stopTracking call");
        return;
    }
    isEnded = true;
    isStarted = false;
    endedTime = new Date().getTime();
    console.log("LOPEZ :: LapTracker ended at: ", endedTime);
    elapsedTime = endedTime - startedTime;
    console.log("LOPEZ :: :LapTracker elapsed time: ", elapsedTime);
};

export const registerLapMessageTracker = () => {

    console.log("LOPEZ :: LapTracker registered");

    BroadcastService.getMessageByEventName(BroadcastEvent.NewMessageReceived).subscribe(async (msg) => {
        const {  payload } = msg;
        console.log("LOPEZ :: NewMessageReceived::  LapTracker event received: ", payload);
        console.log("LOPEZ :: NewMessageReceived :: LapTracker event received:: msg ::: ", msg);

        /// until this moment, we dont know who joined, if an agent or a bot, 
        // so we need to check if the first message is from a bot or an agent ,
        if (firstMessageReceived === false) {
            firstMessageReceived = true;

            if (payload?.role === "bot") {

                isABotConversation = true;
                firstMessageReceived = true;
                console.log("LOPEZ :: NewMessageReceived ::: LapTracker event received: first message from bot: ", msg, isABotConversation, isStarted);
                return;
            }
        }

        console.log("LOPEZ :: NewMessageReceived:: LapTracker event received: afterGetCall: ", msg, isABotConversation, isStarted);
        // this is to clock only bot sessions that have started 
        if (isABotConversation && isStarted) {
            console.log("LapTracker :: NewMessageReceived :: stopTracking: ", msg);
            stopTracking();
        }
    });

    BroadcastService.getMessageByEventName(BroadcastEvent.NewMessageSent).subscribe(async msg => {
        console.log("LOPEZ ::NewMessageSent:: LapTracker event received: ", msg, isABotConversation, isStarted);
        // we wont be tracking until we are certain that the first message is from a bot
        // so we need to wait for the first message from the bot 

        if (isABotConversation && isStarted === false) {
            console.log("LapTracker :: NewMessageSent :: startTracking: ", msg);
            startTracking();
        }
    });
};

