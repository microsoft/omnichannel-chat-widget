/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { BroadcastEvent, LogLevel, TelemetryEvent } from "../../../../common/telemetry/TelemetryConstants";
import { IActivitySubscriber } from "./IActivitySubscriber";
import { ICustomEvent } from "@microsoft/omnichannel-chat-components/lib/types/interfaces/ICustomEvent";
import { TelemetryHelper } from "../../../../common/telemetry/TelemetryHelper";
const supportedSignInCardContentTypes = ["application/vnd.microsoft.card.signin", "application/vnd.microsoft.card.oauth"];
const botOauthUrlRegex = /[\S]+.botframework.com\/api\/oauth\/signin\?signin=([\S]+)/;
const delay = (t: number | undefined) => new Promise(resolve => setTimeout(resolve, t));
const fetchBotAuthConfigRetries = 3;
const fetchBotAuthConfigRetryInterval = 1000;
let response: boolean | undefined;

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
    return sasUrl;
};


const fetchBotAuthConfig = async (retries: number): Promise<any> => {

    TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
        Event: TelemetryEvent.SetBotAuthProviderFetchConfig,
    });

    const executeSigningCardRequest: ICustomEvent = { eventName: "executeSigninCardCallbackRequest" };
    BroadcastService.postMessage(executeSigningCardRequest);
    const sh = BroadcastService.getMessageByEventName("executeSigninCardCallbackResponse")
        .subscribe((data) => {
            response = data.payload?.response !== undefined ? data.payload?.response : response;
            sh.unsubscribe();
        });

    if (response !== undefined) {
        //return response;
        return response;
    }

    if (retries === 1) { // Base Case
        throw new Error();
    }
    await delay(fetchBotAuthConfigRetryInterval);
    return await fetchBotAuthConfig(--retries);
};

export class BotAuthActivitySubscriber implements IActivitySubscriber {

    public observer: any;

    private signInCardSeen: Set<string>;

    constructor() {
        this.signInCardSeen = new Set();
    }

    public applicable(activity: any): boolean {
        return activity && activity.attachments && activity.attachments.length && activity.attachments[0] && supportedSignInCardContentTypes.indexOf(activity.attachments[0].contentType) >= 0;
    }


    public async apply(activity: any): Promise<any> {
        this.observer.next(false); // Hides card
        const attachment = activity.attachments[0];
        const signInUrl = attachment.content.buttons[0].value;
        const signInId = extractSignInId(signInUrl);

        if (!signInId) {
            return;
        }

        if (this.signInCardSeen.has(signInId)) {
            // Prevents duplicate auth
            return;
        }

        this.signInCardSeen.add(signInId);
        const sasUrl = await extractSasUrl(attachment);
        const event: ICustomEvent = { eventName: BroadcastEvent.SigninCardReceived, payload: { sasUrl } };

        if (!sasUrl) {
            TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
                Event: TelemetryEvent.BotAuthActivityEmptySasUrl,
                Description: "SaS Url is empty",
            });
            return activity;
        } else {
            BroadcastService.postMessage(event);
        }
        try {
            const response = await fetchBotAuthConfig(fetchBotAuthConfigRetries);
            if (response === false) {
                TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
                    Event: TelemetryEvent.SetBotAuthProviderHideCard,
                });
            } else {
                TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
                    Event: TelemetryEvent.SetBotAuthProviderDisplayCard,
                });
                return activity;
            }
        } catch {
            TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
                Event: TelemetryEvent.SetBotAuthProviderNotFound,
            });
            //this is to ensure listener continues waiting for response
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