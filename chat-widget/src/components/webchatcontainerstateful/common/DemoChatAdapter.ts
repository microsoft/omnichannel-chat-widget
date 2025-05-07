import "rxjs/add/operator/share";
import "rxjs/add/observable/of";
import { Message } from "botframework-directlinejs";
import { Observable } from "rxjs/Observable";
import MockAdapter from "./mockadapter";
import { customerUser, postBotMessageActivity, postBotAttachmentActivity, postBotTypingActivity, postEchoActivity, postSystemMessageActivity } from "./utils/chatAdapterUtils";
import { createHeroCardAttachment, createJpgFileAttachment, createSigninCardAttachment, createThumbnailCardAttachment } from "./utils/attachmentActivityUtils";
import MockBotCommand from "./MockBotCommand";
import MockBotCardCommandType from "./MockBotCardCommandType";

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
                    case activity.text === MockBotCommand.Help:
                        this.postBotCommandsActivity();
                        break;
                    case activity.text === MockBotCommand.SendSystemMessage:
                        postSystemMessageActivity(this.activityObserver, "Contoso has joined the chat.");
                        break;
                    case activity.text === MockBotCommand.SendTyping:
                        postBotTypingActivity(this.activityObserver);
                        break;
                    case activity.text === MockBotCommand.SendAttachment:
                        postBotAttachmentActivity(this.activityObserver, [createJpgFileAttachment()]);
                        break;
                    case activity.text === MockBotCommand.SendBotMessage:
                        postBotMessageActivity(this.activityObserver, "Hi, how can I help you?");
                        break;
                    case activity.text === `${MockBotCommand.Card} ${MockBotCardCommandType.Signin}`:
                        postBotAttachmentActivity(this.activityObserver, [createSigninCardAttachment()]);
                        break;
                    case activity.text === `${MockBotCommand.Card} ${MockBotCardCommandType.Hero}`:
                        postBotAttachmentActivity(this.activityObserver, [createHeroCardAttachment()]);
                        break;
                    case activity.text === `${MockBotCommand.Card} ${MockBotCardCommandType.Thumbnail}`:
                        postBotAttachmentActivity(this.activityObserver, [createThumbnailCardAttachment()]);
                        break;
                    case activity.text.startsWith(`${MockBotCommand.Bot} `):
                        postBotMessageActivity(this.activityObserver, activity.text.substring(5));
                        break;
                    case activity.text.startsWith(`${MockBotCommand.System} `):
                        postSystemMessageActivity(this.activityObserver, activity.text.substring(8));
                        break;
                }
            }
        }

        return Observable.of(activity.id || "");
    }
}