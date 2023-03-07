import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { BroadcastEvent } from "../../../../common/telemetry/TelemetryConstants";
import { getStateFromCache } from "../../../../common/utils";
import { IActivitySubscriber } from "./IActivitySubscriber";
import { ICustomEvent } from "@microsoft/omnichannel-chat-components/lib/types/interfaces/ICustomEvent";
const supportedSignInCardContentTypes = ["application/vnd.microsoft.card.signin", "application/vnd.microsoft.card.oauth"];
const botOauthUrlRegex = /[\S]+.botframework.com\/api\/oauth\/signin\?signin=([\S]+)/;
const delay = (t: number | undefined) => new Promise(resolve => setTimeout(resolve, t));
const fetchBotAuthConfigRetries = 3;
const fetchBotAuthConfigRetryInterval = 1000;

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fetchBotAuthConfig = async (retries: number) => {

    console.log("ELOPEZANAYA - fetchBotAuthConfig");
    /* if (Loader.botAuthTokenProvider) {
        let displayCard = undefined;
       

        await Loader.botAuthTokenProvider(async (botAuthConfig: { show: any; }) => {
            const { show } = botAuthConfig;
            displayCard = show;
        });

        return displayCard;
    } else {
        if (retries === 1) { // Base Case
            throw new Error();
        }

        await delay(fetchBotAuthConfigRetryInterval);
        return await fetchBotAuthConfig(--retries);
    }*/
};

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
export class BotAuthActivitySubscriber implements IActivitySubscriber {

    public observer: any;

    private signInCardSeen: Set<string> | undefined;

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

        const event  : ICustomEvent ={ eventName : BroadcastEvent.SigninCardReceived};

        BroadcastService.postMessage(event);
        
        if (this.signInCardSeen === undefined || this.signInCardSeen.has(signInId)) { // Prevents duplicate auth
            return;
        }

        this.signInCardSeen.add(signInId);

        const sasUrl = await extractSasUrl(attachment);

        if (!sasUrl) {

            return activity;
        }

        /*

        try {
            const response = await fetchBotAuthConfig(fetchBotAuthConfigRetries);

           if (response === false) {

            } else {
                return activity;
            }
        } catch {

        }*/


    }



    public async next(activity: any): Promise<any> {
        if (this.applicable(activity)) {
            return await this.apply(activity);
        }
        return activity;
    };


}