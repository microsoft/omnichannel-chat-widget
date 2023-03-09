/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { BroadcastEvent } from "../../../../common/telemetry/TelemetryConstants";
import { IActivitySubscriber } from "./IActivitySubscriber";
import { ICustomEvent } from "@microsoft/omnichannel-chat-components/lib/types/interfaces/ICustomEvent";
import { ILiveChatWidgetContext } from "../../../../contexts/common/ILiveChatWidgetContext";
//import useChatContextStore from "../../../../hooks/useChatContextStore";
import { ILiveChatWidgetAction } from "../../../../contexts/common/ILiveChatWidgetAction";
import { Dispatch } from "react";
//import { LiveChatWidgetActionType } from "../../../../contexts/common/LiveChatWidgetActionType";
const supportedSignInCardContentTypes = ["application/vnd.microsoft.card.signin", "application/vnd.microsoft.card.oauth"];
const botOauthUrlRegex = /[\S]+.botframework.com\/api\/oauth\/signin\?signin=([\S]+)/;
const delay = (t: number | undefined) => new Promise(resolve => setTimeout(resolve, t));
const fetchBotAuthConfigRetries = 3;
const fetchBotAuthConfigRetryInterval = 1000;
let sasUrl;

const extractSignInId = (signInUrl: string) => {
    const result = botOauthUrlRegex.exec(signInUrl);
    if (result && result[1]) {
        return result[1];
    }

    return "";
};

const extractSasUrl = async (attachment: any) => {
    let sasUrl = undefined;
    if (attachment && attachment.content && attachment.content.tokenPostResource && attachment.content.tokenPostResource.sasUrl) {
        sasUrl = attachment.content.tokenPostResource.sasUrl;
    }

    if (!sasUrl) {
        const signInId = extractSignInId(attachment.content.buttons[0].value);
        const getTestUrlEndpoint = `https://token.botframework.com/api/sas/gettesturl?signInId=${signInId}`;

        try {
            const response = await (window as any).fetch(getTestUrlEndpoint);
            if (response.status === 200) {
                const responseJson = await response.json();
                sasUrl = responseJson.sasUrl;
            }
        } catch {
            sasUrl = undefined;
        }
    }

    console.log("ELOPEZANAYA - BotAuthActivitySubscriber: extractSasUrl : sasUrl =>  " + sasUrl);
    return sasUrl;
};
let response: boolean | undefined;

const fetchBotAuthConfig = async (retries: number): Promise<any> => {

    const event2: ICustomEvent = { eventName: "executeSigninCardCallbackRequest" };
    console.log("ELOPEZANAYA - BotAuthActivitySubscriber2: send event =>  " + JSON.stringify(event2));
    BroadcastService.postMessage(event2);

    BroadcastService.getMessageByEventName("executeSigninCardCallbackResponse")
        .subscribe((data) => {
            console.log("ELOPEZANAYA - BotAuthActivitySubscriber: received RESPONSE from broadcast service=>  " + JSON.stringify(data));
            response = data.payload?.response!==undefined?data.payload?.response:response;
            //dispatch({ type: LiveChatWidgetActionType.SET_SHOW_SIGNING_CARD, payload: response });
        });

    console.log("ELOPEZANAYA - BotAuthActivitySubscriber: response =>  " + response);

    if (response !== undefined) {
        console.log("ELOPEZANAYA response is done fetchBotAuthConfig  =>  " + response);
        //return response;
        return response;
    }

    if (retries === 1) { // Base Case
        console.log("ELOPEZANAYA - BotAuthActivitySubscriber: error thrown");
        throw new Error();
    }
    await delay(fetchBotAuthConfigRetryInterval);
    return await fetchBotAuthConfig(--retries);
};

export class BotAuthActivitySubscriber implements IActivitySubscriber {

    public observer: any;

    private signInCardSeen:Set<string>;

    constructor() {
        this.signInCardSeen = new Set();
    }

    public applicable(activity: any): boolean {
        return activity && activity.attachments && activity.attachments.length && activity.attachments[0] && supportedSignInCardContentTypes.indexOf(activity.attachments[0].contentType) >= 0;
    }


    public async apply(activity: any): Promise<any> {


        console.log("ELOPEZANAYA - BotAuthActivitySubscriber: init");
        this.observer.next(false); // Hides card

        const attachment = activity.attachments[0];
        const signInUrl = attachment.content.buttons[0].value;
        const signInId = extractSignInId(signInUrl);

        if (!signInId) {
            console.log("ELOPEZANAYA : BotAuthActivitySubscriber : signInId doesnt exist => ");
            return;
        }


        if (this.signInCardSeen.has(signInId)) { 
            console.log("ELOPEZANAYA : BotAuthActivitySubscriber : signInId already exist => " + signInId);
            // Prevents duplicate auth
            return;
        }

        this.signInCardSeen.add(signInId);
        const sasUrl = await extractSasUrl(attachment);

        const event: ICustomEvent = { eventName: BroadcastEvent.SigninCardReceived, payload: { sasUrl } };
        console.log("ELOPEZANAYA - BotAuthActivitySubscriber: send event =>  " + JSON.stringify(event));


        if (!sasUrl) {
            return activity;
        } else {

            BroadcastService.postMessage(event);
        }


        try {
            console.log("ELOPEZANAYA : response about to be fetched");
            const response = await fetchBotAuthConfig(fetchBotAuthConfigRetries);
            console.log("ELOPEZANAYA : response is try : response => " + response);

            if (response === false) {

                console.log("ELOPEZANAYA : response is false");
            } else {
                console.log("ELOPEZANAYA : response is true");

                return activity;
            }
        } catch {
            console.log("ELOPEZANAYA : response is error");
            if (this.signInCardSeen.has(signInId)) {    
                this.signInCardSeen.delete(signInId);

            }
            return activity;
        }

    }



    public async next(activity: any): Promise<any> {
        if (this.applicable(activity)) {
            return await this.apply(activity);
        }
        return activity;
    }


}