/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { BroadcastEvent, LogLevel, TelemetryEvent } from "../../../../common/telemetry/TelemetryConstants";
import { IActivitySubscriber } from "./IActivitySubscriber";
import { ICustomEvent } from "@microsoft/omnichannel-chat-components/lib/types/interfaces/ICustomEvent";
import { TelemetryHelper } from "../../../../common/telemetry/TelemetryHelper";
import { IBotAuthActivitySubscriberOptionalParams } from "../../interfaces/IBotAuthActivitySubscriberOptionalParams";
import { TelemetryManager } from "../../../../common/telemetry/TelemetryManager";

const supportedSignInCardContentTypes = ["application/vnd.microsoft.card.signin", "application/vnd.microsoft.card.oauth"];
const botOauthUrlRegex = /[\S]+.botframework.com\/api\/oauth\/signin\?signin=([\S]+)/;

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

const fetchBotAuthConfig = async (retries: number, interval: number): Promise<boolean | undefined> => {
    TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
        Event: TelemetryEvent.SetBotAuthProviderFetchConfig
    });

    for (let attempt = 1; attempt <= retries; attempt++) {
        const result = await new Promise<boolean | undefined>((resolve) => {
            let finished = false;
            let sub: { unsubscribe: () => void } | undefined;

            const cleanup = () => {
                if (sub) {
                    try { sub.unsubscribe(); } catch { }
                    sub = undefined;
                }
            };

            const timeoutId = setTimeout(() => {
                if (finished) return;
                finished = true;
                cleanup();
                resolve(undefined);
            }, interval);

            sub = BroadcastService
                .getMessageByEventName(BroadcastEvent.BotAuthConfigResponse)
                .subscribe(data => {
                    if (finished) return;
                    finished = true;
                    clearTimeout(timeoutId);
                    cleanup();
                    resolve(data.payload?.response);
                });

            BroadcastService.postMessage({ eventName: BroadcastEvent.BotAuthConfigRequest });
        });

        if (result === true || result === false) {
            return result;
        }
        if (attempt === retries) {
            return undefined;
        }
    }
    return undefined;
};

export class BotAuthActivitySubscriber implements IActivitySubscriber {
    public observer: any;
    private signInCardSeen: Set<string>;
    private fetchBotAuthConfigRetries;
    private fetchBotAuthConfigRetryInterval;

    constructor(optionalParams: IBotAuthActivitySubscriberOptionalParams = {}) {
        this.signInCardSeen = new Set();
        this.fetchBotAuthConfigRetries = 3;
        this.fetchBotAuthConfigRetryInterval = 1000;

        if (optionalParams.fetchBotAuthConfigRetries) {
            this.fetchBotAuthConfigRetries = optionalParams.fetchBotAuthConfigRetries;
        }

        if (optionalParams.fetchBotAuthConfigRetryInterval) {
            this.fetchBotAuthConfigRetryInterval = optionalParams.fetchBotAuthConfigRetryInterval;
        }
    }

    public applicable(activity: any): boolean {
        return (activity?.attachments?.length > 0) && activity.attachments[0] && supportedSignInCardContentTypes.indexOf(activity.attachments[0].contentType) >= 0;
    }

    public async apply(activity: any): Promise<any> {
        this.observer.next(false); // Hides card
        const attachment = activity.attachments[0];
        const signInUrl = attachment.content.buttons[0].value;
        const signInId = extractSignInId(signInUrl);

        if (!signInId) {
            TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
                Event: TelemetryEvent.BotAuthActivityUndefinedSignInId
            });
            return activity;
        }

        if (this.signInCardSeen.has(signInId)) {
            // Prevents duplicate auth
            return;
        }

        this.signInCardSeen.add(signInId);
        const sasUrl = await extractSasUrl(attachment);
        const event: ICustomEvent = { eventName: BroadcastEvent.SigninCardReceived, payload: { sasUrl, conversationId: TelemetryManager.InternalTelemetryData?.conversationId } };

        if (!sasUrl) {
            TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
                Event: TelemetryEvent.BotAuthActivityEmptySasUrl,
                Description: "SaS Url is empty",
            });
            return activity;
        } else {
            BroadcastService.postMessage(event);
        }
        
        const configResponse = await fetchBotAuthConfig(this.fetchBotAuthConfigRetries, this.fetchBotAuthConfigRetryInterval);
        
        if (configResponse === false) {
            TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
                Event: TelemetryEvent.SetBotAuthProviderHideCard,
            });
            return; // keep hidden
        }
        
        if (configResponse === undefined) { 
            TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
                Event: TelemetryEvent.SetBotAuthProviderNotFound,
            });
            // Allow future attempt if config eventually appears
            if (this.signInCardSeen.has(signInId)) {
                this.signInCardSeen.delete(signInId);
            }
            return activity; // show card by returning activity
        }
        
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
            Event: TelemetryEvent.SetBotAuthProviderDisplayCard,
        });
        return activity;
    }

    public async next(activity: any): Promise<any> {
        if (this.applicable(activity)) {
            return await this.apply(activity);
        }
        return activity;
    }
}