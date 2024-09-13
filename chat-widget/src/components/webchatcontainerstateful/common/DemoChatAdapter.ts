import "rxjs/add/operator/share";
import "rxjs/add/observable/of";
import { Message } from "botframework-directlinejs";
import { Observable } from "rxjs/Observable";
import MockAdapter from "./mockadapter";
import { customerUser, postBotMessageActivity, postBotAttachmentActivity, postBotTypingActivity, postEchoActivity, postSystemMessageActivity } from "./utils/chatAdapterUtils";

export class DemoChatAdapter extends MockAdapter {
    constructor() {
        super();

        setTimeout(() => {
            postSystemMessageActivity(this.activityObserver, "You're currently using a demo.", 0);
            postBotMessageActivity(this.activityObserver, "Type `/help` to learn more", undefined, 0); // send init message from bot
        }, 1000);
    }

    private postBotCommandsActivity(delay = 1000) {
        postBotAttachmentActivity(this.activityObserver, [{
            contentType: "application/vnd.microsoft.card.thumbnail",
            content: {
                buttons: [
                    {
                        title: "Send system message",
                        type: "imBack",
                        value: "send system message"
                    },
                    {
                        title: "Send typing",
                        type: "imBack",
                        value: "send typing"
                    },
                    {
                        title: "Send bot message",
                        type: "imBack",
                        value: "send bot message"
                    }
                ],
                title: "Commands"
            }
        }], delay);
    }

    public postActivity(activity: Message): Observable<string> {
        if (activity) {
            postEchoActivity(this.activityObserver, activity, customerUser);

            if (activity.text) {
                switch(true) {
                    case activity.text === "/help":
                        this.postBotCommandsActivity();
                        break;
                    case activity.text === "send system message":
                        postSystemMessageActivity(this.activityObserver, "Contoso has joined the chat.");
                        break;
                    case activity.text === "send typing":
                        postBotTypingActivity(this.activityObserver);
                        break;
                    case activity.text === "send attachment":
                        postBotAttachmentActivity(this.activityObserver, [{
                            contentType: "image/jpeg", 
                            name: "600x400.jpg", 
                            contentUrl: "https://raw.githubusercontent.com/microsoft/omnichannel-chat-sdk/e7e75d4ede351e1cf2e52f13860d2284848c4af0/playwright/public/images/600x400.jpg"}]);
                        break;
                    case activity.text === "send bot message":
                        postBotMessageActivity(this.activityObserver, "Hi, how can I help you?");
                        break;
                    case activity.text === "/card signin":
                        postBotAttachmentActivity(this.activityObserver, [{
                            contentType: "application/vnd.microsoft.card.signin",
                            content: {
                                text: "Please login",
                                buttons: [
                                    {
                                        type: "signin",
                                        title: "Signin",
                                        value: "https://login.live.com/"
                                    }
                                ]
                            }
                        }]);
                        break;
                    case activity.text === "/card hero":
                        postBotAttachmentActivity(this.activityObserver, [{
                            contentType: "application/vnd.microsoft.card.hero",
                            content: {
                                buttons: [
                                    {
                                        title: "Bellevue",
                                        type: "imBack",
                                        value: "Bellevue"
                                    },
                                    {
                                        title: "Redmond",
                                        type: "imBack",
                                        value: "Redmond"
                                    },
                                    {
                                        title: "Seattle",
                                        type: "imBack",
                                        value: "Seattle"
                                    }
                                ],
                                title: "Choose your location"
                            }
                        }]);
                        break;
                    case activity.text === "/card thumbnail":
                        postBotAttachmentActivity(this.activityObserver, [{
                            contentType: "application/vnd.microsoft.card.thumbnail",
                            content: {
                                title: "Microsoft",
                                subtitle: "Our mission is to empower every person and every organization on the planet to achieve more.",
                                text: "Microsoft creates platforms and tools powered by AI to deliver innovative solutions that meet the evolving needs of our customers. The technology company is committed to making AI available broadly and doing so responsibly, with a mission to empower every person and every organization on the planet to achieve more.",
                                images: [{
                                    alt: "Microsoft logo",
                                    url: "https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE1Mu3b?ver=5c31" // logo from https://microsoft.com
                                }],
                                buttons: [
                                    {
                                        title: "Learn more",
                                        type: "openUrl",
                                        value: "https://www.microsoft.com/"
                                    }
                                ]
                            }
                        }]);
                        break;
                    case activity.text.startsWith("/bot "):
                        postBotMessageActivity(this.activityObserver, activity.text.substring(5));
                        break;
                    case activity.text.startsWith("/system "):
                        postSystemMessageActivity(this.activityObserver, activity.text.substring(8));
                        break;
                }
            }
        }

        return Observable.of(activity.id || "");
    }
}