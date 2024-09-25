import "rxjs/add/operator/share";
import "rxjs/add/observable/of";
import { Message } from "botframework-directlinejs";
import { Observable } from "rxjs/Observable";
import MockAdapter from "./mockadapter";
import { customerUser, postBotMessageActivity, postBotAttachmentActivity, postBotTypingActivity, postEchoActivity, postSystemMessageActivity } from "./utils/chatAdapterUtils";
import { createHeroCardAttachment, createJpgFileAttachment, createSigninCardAttachment, createThumbnailCardAttachment } from "./utils/attachmentActivityUtils";

enum MockBotCommands {
    Bot = "/bot",
    Card = "/card",
    Help = "/help",
    SendAttachment = "send attachment",
    SendBotMessage = "send bot message",
    SendSystemMessage = "send system message",
    SendTyping = "send typing",
    System = "/system"
};

enum MockBotCardCommandType {
    Hero = "hero",
    Signin = "signin",
    Thumbnail = "thumbnail"
};

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
                    case activity.text === MockBotCommands.Help:
                        this.postBotCommandsActivity();
                        break;
                    case activity.text === MockBotCommands.SendSystemMessage:
                        postSystemMessageActivity(this.activityObserver, "Contoso has joined the chat.");
                        break;
                    case activity.text === MockBotCommands.SendTyping:
                        postBotTypingActivity(this.activityObserver);
                        break;
                    case activity.text === MockBotCommands.SendAttachment:
                        postBotAttachmentActivity(this.activityObserver, [createJpgFileAttachment()]);
                        break;
                    case activity.text === MockBotCommands.SendBotMessage:
                        postBotMessageActivity(this.activityObserver, "Hi, how can I help you?");
                        break;
                    case activity.text === `${MockBotCommands.Card} ${MockBotCardCommandType.Signin}`:
                        postBotAttachmentActivity(this.activityObserver, [createSigninCardAttachment()]);
                        break;
                    case activity.text === `${MockBotCommands.Card} ${MockBotCardCommandType.Hero}`:
                        postBotAttachmentActivity(this.activityObserver, [createHeroCardAttachment()]);
                        break;
                    case activity.text === `${MockBotCommands.Card} ${MockBotCardCommandType.Thumbnail}`:
                        postBotAttachmentActivity(this.activityObserver, [createThumbnailCardAttachment()]);
                        break;
                    case activity.text.startsWith(`${MockBotCommands.Bot} `):
                        postBotMessageActivity(this.activityObserver, activity.text.substring(5));
                        break;
                    case activity.text.startsWith(`${MockBotCommands.System} `):
                        postSystemMessageActivity(this.activityObserver, activity.text.substring(8));
                        break;
                }
            }
        }

        return Observable.of(activity.id || "");
    }
}