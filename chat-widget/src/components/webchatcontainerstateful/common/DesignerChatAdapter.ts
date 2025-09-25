import { customerUser, postAgentAttachmentActivity, postAgentMessageActivity, postAgentSuggestedActionsActivity, postBotMessageActivity, postEchoActivity, postSystemMessageActivity } from "./utils/chatAdapterUtils";

import { Message } from "botframework-directlinejs";
import MockAdapter from "./mockadapter";
import { Observable } from "rxjs/Observable";

export class DesignerChatAdapter extends MockAdapter {
    public messages?: Message[];
    constructor(messages?: Message[]) {
        super();

        this.messages = messages;
        if (this.messages) {
            if (this.messages.length > 0) {
                setTimeout(() => {
                    this.messages?.forEach((msg, index) => {
                        this.processMessage(msg, index);
                    });
                }, 1000); // Initial 1 second delay to ensure activityObserver is ready
            }
        } else {
            // Default hardcoded flow
            setTimeout(() => {
                postBotMessageActivity(this.activityObserver, "Thank you for contacting us! How can I help you today?", undefined, 0);
                postBotMessageActivity(this.activityObserver, "Please accept terms and conditions to proceed. Visit the link for terms and conditions <a href=\"\">here</a>.", undefined, 0);
                this.postUserActivity("I need to change my address.", 0);
                postBotMessageActivity(this.activityObserver, "Okay, let me connect you with a live agent.", undefined, 100);
                postSystemMessageActivity(this.activityObserver, "John has joined the chat", 100);
                postAgentMessageActivity(this.activityObserver, "I'd be happy to help you update your account.", undefined, 100);
                this.postUserActivity("I have trouble visiting the signin page <a href=\"\">signin</a>.", 0);
            }, 1000);
        }
    }

    private processMessage(msg: Message, index: number) {
        if (msg.text) {
            if (msg.suggestedActions) {
                postAgentSuggestedActionsActivity(this.activityObserver, msg.text, msg.suggestedActions, index * 100);
            } else {
                postBotMessageActivity(this.activityObserver, msg.text, undefined, index * 100);
            }
        }
        if (msg.attachments && msg.attachments.length > 0) {
            postAgentAttachmentActivity(this.activityObserver, msg.attachments, index * 100, msg.attachmentLayout);
        }
    }

    private postUserActivity(text: string, delay = 1000) {
        setTimeout(() => {
            postEchoActivity(this.activityObserver, {
                text,
                from: {
                    ...customerUser
                },
                type: "message"
            }, customerUser, 0);
        }, delay);
    }

    public postActivity(activity: Message): Observable<string> {
        if (activity) {
            postEchoActivity(this.activityObserver, activity, customerUser);
        }

        return Observable.of(activity.id || "");
    }
}