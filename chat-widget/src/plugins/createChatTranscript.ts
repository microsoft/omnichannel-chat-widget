/* eslint-disable no-useless-escape */

class TranscriptHTMLBuilder {
    private options: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    private pageTitle = "Customer Transcript";
    private attachmentMessage = "The following attachment was uploaded during the conversation: ";
    private networkOnlineMessage = "Connection restored. Please refresh the page";
    private networkOfflineMessage = "Network Error. Please make sure you are connected to the internet.";
    private transcriptBackgroundColor = "#FFF";
    private agentAvatarBackgroundColor = "#E8E8E8";
    private agentAvatarFontColor = "#000";
    private customerAvatarBackgroundColor = "#2266E3";
    private customerAvatarFontColor = "#FFF";

    constructor(options: any) {  // eslint-disable-line @typescript-eslint/no-explicit-any
        this.options = options;

        if (!this.options || !this.options.messages) {
            this.options.messages = [];
        }

        if (this.options?.pageTitle) {
            this.pageTitle = this.options.pageTitle;
        }

        if (this.options?.attachmentMessage) {
            this.attachmentMessage = this.options.attachmentMessage;
        }

        if (this.options?.networkOnlineMessage) {
            this.networkOnlineMessage = this.options.networkOnlineMessage;
        }

        if (this.options?.networkOfflineMessage) {
            this.networkOfflineMessage = this.options.networkOfflineMessage;
        }

        if (this.options?.transcriptBackgroundColor) {
            this.transcriptBackgroundColor = this.options.transcriptBackgroundColor;
        }

        if (this.options?.agentAvatarBackgroundColor) {
            this.agentAvatarBackgroundColor = this.options.agentAvatarBackgroundColor;
        }

        if (this.options?.agentAvatarFontColor) {
            this.agentAvatarFontColor = this.options.agentAvatarFontColor;
        }

        if (this.options?.customerAvatarBackgroundColor) {
            this.customerAvatarBackgroundColor = this.options.customerAvatarBackgroundColor;
        }

        if (this.options?.customerAvatarFontColor) {
            this.customerAvatarFontColor = this.options.customerAvatarFontColor;
        }
    }

    createTitleElement() {
        const htmlData = `<title> ${this.pageTitle} </title>`;
        return htmlData;
    }

    createExternalScriptElements() {
        const htmlData = `
            <script src="https://cdn.botframework.com/botframework-webchat/4.15.7/webchat.js"><\/script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/rxjs/7.8.0/rxjs.umd.min.js" integrity="sha512-v0/YVjBcbjLN6scjmmJN+h86koeB7JhY4/2YeyA5l+rTdtKLv0VbDBNJ32rxJpsaW1QGMd1Z16lsLOSGI38Rbg==" crossorigin="anonymous" referrerpolicy="no-referrer"><\/script>
            <script src="https://unpkg.com/react@18.2.0/umd/react.production.min.js"><\/script>
            <script src="https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js"><\/script>
        `;

        return htmlData;
    }

    createHeadElement() {
        const htmlData = `
            <head>
                ${this.createTitleElement()}
                ${this.createExternalScriptElements()}
                <script>
                    function shareObservable(observable) {
                        let observers = [];
                        let subscription;

                        return new Observable(observer => {
                            if (!subscription) {
                                subscription = observable.subscribe({
                                    complete() {
                                        observers.forEach(observer => observer.complete());
                                    },
                                    error(err) {
                                        observers.forEach(observer => observer.error(err));
                                    },
                                    next(value) {
                                        observers.forEach(observer => observer.next(value));
                                    }
                                });
                            }

                            observers.push(observer);

                            return () => {
                                observers = observers.filter(o => o !== observer);

                                if (!observers.length) {
                                    subscription.unsubscribe();
                                    subscription = null;
                                }
                            };
                        });
                    }
                <\/script>
                <script>
                    const messages = ${JSON.stringify(this.options.messages)};
                <\/script>
                <script>
                    class Translator {
                        static convertTranscriptMessageToActivity(message) {
                            const {created, isControlMessage, content, tags, from, attachments, amsMetadata, amsReferences} = message;
                            const activity = {
                                from: {
                                    role: 'bot'
                                },
                                type: 'message'
                            };

                            // Ignore control messages
                            if (isControlMessage) {
                                return false;
                            }

                            if (tags) {
                                const formattedTags = tags.split(',');

                                // Ignore system message
                                if (formattedTags.includes('system')) {
                                    return false;
                                }

                                // Ignore hidden message
                                if (formattedTags.includes('Hidden')) {
                                    return false;
                                }
                            }

                            // Add C1 user display name
                            if (from && from.user && from.user.displayName) {
                                activity.from.name = from.user.displayName;
                            }

                            // Add C2 user display name
                            if (from && from.application && from.application.displayName && from.application.displayName === 'Customer') {
                                activity.from = {
                                    role: 'user',
                                    name: from.application.displayName
                                };
                            }

                            // Attachments
                            if (amsReferences && amsMetadata) {
                                const metadata = JSON.parse(amsMetadata);
                                const { fileName } = metadata[0];
                                const text = \`${this.attachmentMessage}\${fileName}\`;

                                if (message.attachments && message.attachments.length > 0 && message.contentUrl) {
                                    activity.attachments = message.attachments;
                                    activity.attachments[0].contentUrl = message.contentUrl;
                                    activity.attachments[0].thumbnailUrl =  message.contentUrl;
                                };

                                return {
                                    ...activity,
                                    text,
                                    timestamp: created
                                }
                            }

                            // Message
                            if (content) {
                                // Adaptive card formatting
                                if (content.includes('"text"') && content.includes('"attachments"') && content.includes('"suggestedActions"')) {
                                    try {
                                        const partialActivity = JSON.parse(content);
                                        return {
                                            ...activity,
                                            ...partialActivity,
                                            timestamp: created
                                        };
                                    } catch {

                                    }
                                }
                            }

                            return {
                                ...activity,
                                text: content,
                                timestamp: created
                            };
                        }
                    }
                <\/script>
                <script>
                    class TranscriptAdapter {
                        constructor() {
                            this.connectionStatus$ = new window.rxjs.BehaviorSubject(0); // Uninitialized
                            this.activity$ = shareObservable(new Observable((observer) => {
                                this.activityObserver = observer;

                                this.connectionStatus$.next(1); // Connecting
                                this.connectionStatus$.next(2); // Online

                                // Retrieve messages
                                if (messages) {
                                    setTimeout(() => { // setTimeout is needed due to some WebChat issues
                                        messages.map((message) => {
                                            this.activityObserver.next({
                                                ...Translator.convertTranscriptMessageToActivity(message),
                                                type: 'message'
                                            });
                                        });
                                    }, 1);
                                }
                            }));
                        }
                    }
                <\/script>
                <style>
                    body {
                        margin: 0;
                    }

                    .message-name {
                        font-family: Segoe UI,SegoeUI,Helvetica Neue,Helvetica,Arial,sans-serif;
                        font-weight: 700;
                        font-size: 10px;
                    }

                    .message-timestamp {
                        font-family: Segoe UI,SegoeUI,Helvetica Neue,Helvetica,Arial,sans-serif;
                        font-weight: 500;
                        font-size: 10px;
                    }

                    .avatar {
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        text-align: center;
                    }

                    .avatar--bot {
                        background-color: ${this.agentAvatarBackgroundColor};
                    }

                    .avatar--user {
                        background-color: ${this.customerAvatarBackgroundColor};
                    }

                    .avatar > p {
                        font-weight: 600;
                        text-align: center;
                        line-height: 0.5;
                        font-family: "Segoe UI", Arial, sans-serif;
                    }

                    .avatar--bot > p {
                        color: ${this.agentAvatarFontColor};
                    }

                    .avatar--user > p {
                        color: ${this.customerAvatarFontColor};
                    }

                    .webchat__bubble__content>div.ms_lcw_webchat_adaptive_card {
                        background-color: #FFF;
                    }

                    div[class="ac-textBlock"]>p {
                        color: #000;
                    }
                <\/style>
            </head>
        `;

        return htmlData;
    }

    createBodyElement() {
        const htmlData = `
            <body>
                <script>
                    if (!navigator.onLine) {
                        const offlineText = \`${this.networkOfflineMessage}\`;
                        document.body.innerHTML = offlineText;
                    }

                    window.addEventListener("online", () => {
                        document.body.innerHTML = \`${this.networkOnlineMessage} <button onclick="window.location.reload()"> Refresh </button>\`;
                    });
                <\/script>
                <div id="transcript"></div>
                <script>
                    const getIconText = (text) => {
                        if (text) {
                            const initials = text.split(/\\s/).reduce((response, word) => response += word.slice(0, 1), '');
                            if (initials.length > 1) {
                                return initials.substring(0, 2).toUpperCase();
                            } else {
                                return text.substring(0, 2).toUpperCase();
                            }
                        }

                        return "";
                    }

                    const activityStatusMiddleware = () => (next) => (...args) => {
                        const [card] = args;
                        const {activity} = card;

                        if (activity) {
                            const {from, timestamp} = activity;

                            const nameElement = React.createElement(
                                'span',
                                {className: 'message-name'},
                                from.name
                            );

                            const formattedDate = new Date(timestamp);
                            const formattedTimeString = formattedDate.toLocaleTimeString("en-us", { year: "numeric", month:"numeric", day:"numeric", hour: "2-digit", minute: "2-digit"});

                            const timestampElement = React.createElement(
                                'span',
                                {className: 'message-timestamp'},
                                formattedTimeString
                            );

                            return from.name && timestamp && React.createElement('span', null, nameElement, ' - ', timestampElement)
                        }

                        return next(...args);
                    };

                    const avatarMiddleware = () => (next) => (...args) => {
                        const [card] = args;
                        const {fromUser, activity} = card;
                        const initials = getIconText(activity.from.name);

                        const avatarElement = React.createElement(
                            "div",
                            {className: fromUser? "avatar avatar--user": "avatar avatar--bot"},
                            React.createElement(
                                "p",
                                null,
                                \`\${initials}\`
                            )
                        );

                        return avatarElement;
                    }

                    const attachmentMiddleware = () => (next) => (...args) => {
                        const [card] = args;
                        const {activity} = card;

                        if (activity) {
                            const { activity: { attachments }, attachment } = card;

                            // No attachment
                            if (!attachments || !attachments.length || !attachment) {
                                return next(...args);
                            }

                            let { content, contentType } = attachment || { content: "", contentType: "" };

                            // Adaptive card
                            if (contentType.startsWith("application/vnd.microsoft.card")) {
                                const adaptiveCardElement = React.createElement(
                                    "div",
                                    {className: 'ms_lcw_webchat_adaptive_card'},
                                    next(...args)
                                );

                                return adaptiveCardElement;
                            }
                        }

                        return next(...args);
                    }

                    const adapter = new TranscriptAdapter();
                    const styleOptions = {
                        hideSendBox: true,
                        backgroundColor: '${this.transcriptBackgroundColor}',
                        bubbleBackground: '${this.agentAvatarBackgroundColor}',
                        bubbleTextColor: '${this.agentAvatarFontColor}',
                        bubbleBorderRadius: 12,
                        bubbleNubSize: 1,
                        bubbleFromUserBackground: '${this.customerAvatarBackgroundColor}',
                        bubbleFromUserTextColor: '${this.customerAvatarFontColor}',
                        bubbleFromUserBorderRadius: 12,
                        bubbleFromUserNubSize: 1,
                        botAvatarInitials: 'C1',
                        userAvatarInitials: 'C2'
                    };

                    window.WebChat.renderWebChat({
                        directLine: adapter,
                        styleOptions,
                        activityStatusMiddleware,
                        avatarMiddleware,
                        attachmentMiddleware
                    },
                    document.getElementById('transcript'));
                <\/script>
            </body>
        `;

        return htmlData;
    }

    createHTML() {
        const htmlData = `
            <html>
                ${this.createHeadElement()}
                ${this.createBodyElement()}
            </html>
        `;

        return htmlData;
    }
}

const download = (fileName: string, htmlData: string) => {
    const aElement = document.createElement("a");

    const blob = new Blob([htmlData], {type: "text/html"});
    const objectUrl = URL.createObjectURL(blob);

    aElement.setAttribute("href", objectUrl);
    aElement.setAttribute("download", fileName);
    aElement.style.display = "none";

    document.body.appendChild(aElement);
    aElement.click();
    document.body.removeChild(aElement);
};

const createChatTranscript = async (transcript: string, chatSDK: any, renderAttachments = false, transcriptOptions: any = {}) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const transcriptMessages = JSON.parse(transcript);

    const convertBlobToBase64 = async (blob: Blob) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    };

    let messages = transcriptMessages;

    if (renderAttachments) {
        messages = await Promise.all(transcriptMessages.map(async (message: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
            const {amsReferences, amsMetadata } = message;
            if (amsReferences && amsMetadata) {
                const references = JSON.parse(amsReferences);
                const metadata = JSON.parse(amsMetadata);
                const fileMetadata = {
                    id: references[0],
                    type: metadata[0].contentType
                };

                const blob = await chatSDK.downloadFileAttachment(fileMetadata);
                const base64 = await convertBlobToBase64(blob);
                message.contentUrl = base64;
            }

            return message;
        }));
    }

    const options = {
        ...transcriptOptions,
        messages
    };

    const htmlBuilder = new TranscriptHTMLBuilder(options);
    const text = htmlBuilder.createHTML();

    const fileName = `${transcriptOptions.fileName || "transcript"}.html`;
    download(fileName, text);
};

export default createChatTranscript;