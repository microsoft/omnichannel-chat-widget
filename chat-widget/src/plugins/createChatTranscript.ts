/* eslint-disable no-useless-escape */

import { FacadeChatSDK } from "../common/facades/FacadeChatSDK";
import TranscriptHtmlScripts from "../components/footerstateful/downloadtranscriptstateful/interfaces/TranscriptHtmlScripts";
import { createFileAndDownload } from "../common/utils";
import defaultLibraryScripts from "../components/footerstateful/downloadtranscriptstateful/common/defaultLibraryScripts";
import DOMPurify from "dompurify";

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
    private customerDisplayName = "";
    private disableMarkdownMessageFormatting = false;
    private disableNewLineMarkdownSupport = false;
    private externalScripts: TranscriptHtmlScripts = {};

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

        if (this.options?.customerDisplayName) {
            this.customerDisplayName = this.options.customerDisplayName;
        }

        if (this.options?.disableMarkdownMessageFormatting) {
            this.disableMarkdownMessageFormatting = this.options.disableMarkdownMessageFormatting;
        }

        if (this.options?.disableNewLineMarkdownSupport) {
            this.disableNewLineMarkdownSupport = this.options.disableNewLineMarkdownSupport;
        }

        if (this.options?.externalScripts) {
            this.externalScripts = this.options.externalScripts;
        }
    }

    createMetaElement() {
        const htmlData = `
            <meta charset="UTF-8">
        `;

        return htmlData;
    }
    createTitleElement() {
        const htmlData = `<title> ${this.pageTitle} </title>`;
        return htmlData;
    }

    createScriptElement(src: string, integrity: string | undefined = undefined, crossOrigin: string | undefined = undefined, referrerPolicy: string | undefined = undefined) {
        return `<script src="${src}" ${integrity ? `integrity="${integrity}"`: ""} ${crossOrigin ? `crossorigin="${crossOrigin}"`: ""} ${referrerPolicy ? `referrerpolicy="${referrerPolicy}"`: ""}><\/script>`;
    }

    createWebChatScriptElement() {
        return this.externalScripts?.botframeworkWebChat?.src?
            this.createScriptElement(this.externalScripts?.botframeworkWebChat?.src as string, this.externalScripts?.botframeworkWebChat?.integrity, this.externalScripts?.botframeworkWebChat?.crossOrigin, this.externalScripts?.botframeworkWebChat?.referrerPolicy):
            this.createScriptElement(defaultLibraryScripts.botframeworkWebChat.src);
    }

    createRxJsScriptElement() {
        return this.externalScripts?.rxJs?.src?
            this.createScriptElement(this.externalScripts?.rxJs?.src as string, this.externalScripts?.rxJs?.integrity, this.externalScripts?.rxJs?.crossOrigin, this.externalScripts?.rxJs?.referrerPolicy):
            this.createScriptElement(defaultLibraryScripts.rxJs.src, defaultLibraryScripts.rxJs.integrity, defaultLibraryScripts.rxJs.crossOrigin, defaultLibraryScripts.rxJs.referrerPolicy);
    }

    createReactScriptElement() {
        return this.externalScripts?.react?.src?
            this.createScriptElement(this.externalScripts?.react?.src as string, this.externalScripts?.react?.integrity, this.externalScripts?.react?.crossOrigin, this.externalScripts?.react?.referrerPolicy):
            this.createScriptElement(defaultLibraryScripts.react.src);
    }

    createReactDomScriptElement() {
        return this.externalScripts?.reactDom?.src?
            this.createScriptElement(this.externalScripts?.reactDom?.src as string, this.externalScripts?.reactDom?.integrity, this.externalScripts?.reactDom?.crossOrigin, this.externalScripts?.reactDom?.referrerPolicy):
            this.createScriptElement(this.externalScripts?.reactDom?.src ?? defaultLibraryScripts.reactDom.src);
    }

    createMarkdownItScriptElement() {
        return this.externalScripts?.markdownIt?.src?
            this.createScriptElement(this.externalScripts?.markdownIt?.src as string, this.externalScripts?.markdownIt?.integrity, this.externalScripts?.markdownIt?.crossOrigin, this.externalScripts?.markdownIt?.referrerPolicy):
            this.createScriptElement(defaultLibraryScripts.markdownIt.src, defaultLibraryScripts.markdownIt.integrity, defaultLibraryScripts.markdownIt.crossOrigin);
    }

    createExternalScriptElements() {
        const webChatScript = this.createWebChatScriptElement();
        const rxJsScript = this.createRxJsScriptElement();
        const reactScript = this.createReactScriptElement();
        const reactDomScript = this.createReactDomScriptElement();
        const markdownItScript = this.createMarkdownItScriptElement();

        const htmlData = `
            ${webChatScript}
            ${rxJsScript}
            ${reactScript}
            ${reactDomScript}
            ${markdownItScript}
        `;

        return htmlData;
    }

    createHeadElement() {
        const htmlData = `
            <head>
                ${this.createMetaElement()}
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
                    const disableMarkdownMessageFormatting = ${this.disableMarkdownMessageFormatting};
                    const disableNewLineMarkdownSupport = ${this.disableNewLineMarkdownSupport};
                <\/script>
                <script>
                    class Translator {
                        static convertTranscriptMessageToActivity(message) {
                            const {created, OriginalMessageId, id, isControlMessage, content, tags, from, attachments, amsMetadata, amsReferences, amsreferences} = message;
                            
                            //it's required to convert the id to a number, otherwise the webchat will not render the messages in the correct order
                            // if the OrginalMessageId is not present, we can use the id as the sequence id, which is always present.
                            
                            const webchatSequenceId = Translator.convertStringValueToInt(OriginalMessageId) || Translator.convertStringValueToInt(id);
                            
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
                            if ((amsReferences || amsreferences) && amsMetadata) {
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
                                    timestamp: created,
                                    channelData: { 
                                        "webchat:sequence-id": webchatSequenceId
                                    }
                                }
                            }

                            // Message
                            if (content) {
                                // Adaptive card formatting
                                if (content.includes('"attachments"') || content.includes('"suggestedActions"')) {
                                    try {
                                        const partialActivity = JSON.parse(content);
                                        return {
                                            ...activity,
                                            ...partialActivity,
                                            timestamp: created,
                                            channelData: { 
                                                "webchat:sequence-id": webchatSequenceId
                                            }
                                        };
                                    } catch {

                                    }
                                }
                            }

                            return {
                                ...activity,
                                text: content,
                                timestamp: created,
                                channelData: { 
                                    "webchat:sequence-id": webchatSequenceId
                                }
                            };
                        }
                        
                        static convertStringValueToInt(value) {
                            if (typeof value !== "string" || value === "") {
                                return undefined;
                            }

                            const result = parseInt(value);
                            return isNaN(result) ? undefined : result;
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

                    div[class="ac-textBlock"] {
                        color: #000 !important;
                    }

                    .ms_lcw_webchat_received_message a:link, .ms_lcw_webchat_received_message a:visited, .ms_lcw_webchat_received_message a:hover, .ms_lcw_webchat_received_message a:active {
                        color: #FFF;
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

                    document.addEventListener("copy", (event) => {
                        const clonedSelectedContent = window.getSelection().getRangeAt(0).cloneContents();
                        const copiedContent = document.createElement("div");
                        copiedContent.appendChild(clonedSelectedContent);
        
                        event.clipboardData.setData("text/plain", getAllText(copiedContent));
                        event.preventDefault();
                    });


                    getAllText = (element) => {
                        let plainText = "";
                        Array.from(element.childNodes).forEach((node) => {
                            // ignore aria-hidden elements and keyboard help text
                            const ariaHiddenAttr = node.attributes ? node.attributes.getNamedItem("aria-hidden") : null;
                            if ((ariaHiddenAttr && ariaHiddenAttr.value === "true") || node.classList && node.classList.contains("webchat__keyboard-help")) {
                                return;
                            }
                         
                            // get all texts inside activity body, including message, translated message, attachment name, adaptive card content, status footer, etc.
                            if (node.classList && node.classList.contains("webchat__basic-transcript__activity-body")) {
                                plainText += this.processTranscriptActivityNode(node);
                                return;
                            }
                            if (node.nodeType === Node.TEXT_NODE) {
                                plainText += node.textContent + '\\n';
                            } else {
                                plainText += this.getAllText(node);
                            }
                        });
                        return plainText;
                    }

                    processTranscriptActivityNode = (node) => {
                        const divs = node.getElementsByTagName("div");
                        let plainText = "";
                
                        if (divs && divs.length > 1 && divs[1]) {                           
                            const messageRow = node.querySelector(".webchat__stacked-layout__message-row[aria-roledescription='message']");
                            const author = node.querySelector(".message-name");
                            const attachmentRow = node.querySelector(".webchat__stacked-layout__attachment-row[aria-roledescription='attachment']");
                        
                            if (messageRow) {
                                let message = messageRow.getElementsByClassName("webchat__text-content__markdown");
                                
                                if (message.length === 0) {
                                    message = messageRow.getElementsByClassName("markdown");                                    
                                }

                                if (message.length > 0) {
                                    plainText += author.textContent + '\\n' + message[0].textContent + '\\n';
                                }
                            }  else if (attachmentRow) {
                                const attachment = attachmentRow.getElementsByClassName("webchat__fileContent__fileName");
                                const adaptiveCard = this.getAdaptiveCardContent(attachmentRow.querySelector(".ac-container.ac-adaptiveCard"));
                               
                                plainText += attachment && attachment.length > 0 ? author.textContent +'\\n' + attachment[0].textContent +'\\n': author.textContent +'\\n' + adaptiveCard +'\\n';
                            }
                
                            const statusElements = node.getElementsByClassName("webchat__stacked-layout__status");
                            if (statusElements.length > 0) {
                                const timestampelement = statusElements[0].querySelector(".message-timestamp");
                                plainText += timestampelement ? timestampelement.textContent+'\\n\\n' : '\\n';
                            }
                        }
                
                        return plainText;
                    }

                    getAdaptiveCardContent = (node) => {
                        if (!node) {
                            return undefined;
                        }

                        let plainText = "";
                        const rows = node.querySelectorAll(".ac-textBlock p");
                        rows.forEach((row) => {
                            plainText += row.textContent+ '\\n';
                        });

                        return plainText;
                    }

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

                    const activityMiddleware = () => (next) => (...args) => {
                        const [card] = args;

                        if (card.activity) {
                            if (card.activity.from && card.activity.from.role === "channel") {
                                return () => false;
                            }

                            // Incoming text message
                            if (card.activity.text && card.activity.from && card.activity.from.role !== "user") {
                                return (...renderArgs) => (React.createElement(
                                    'div',
                                    {className: 'ms_lcw_webchat_received_message'},
                                    next(...args)(...renderArgs)
                                ))
                            }
                        }

                        return next(...args);
                    };

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
                        let displayName = getIconText(activity.from.name);
                        let customerDisplayName = '${this.customerDisplayName}';

                        if (fromUser && customerDisplayName) {
                            displayName = customerDisplayName;
                        }

                        const avatarElement = React.createElement(
                            "div",
                            {className: fromUser? "avatar avatar--user": "avatar avatar--bot"},
                            React.createElement(
                                "p",
                                null,
                                \`\${displayName}\`
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

                    const createMarkdown = (disableMarkdownMessageFormatting, disableNewLineMarkdownSupport) => {
                        let markdown;
                        if (!disableMarkdownMessageFormatting) {
                            markdown = new window.markdownit(
                                "default",
                                {
                                    html: true,
                                    linkify: true,
                                    breaks: (!disableNewLineMarkdownSupport)
                                }
                            );
                        } else {
                            markdown = new window.markdownit(
                                "zero",
                                {
                                    html: true,
                                    linkify: true,
                                    breaks: (!disableNewLineMarkdownSupport)
                                }
                            );

                            markdown.enable([
                                "entity",
                                "linkify",
                                "html_block",
                                "html_inline",
                                "newline"
                            ]);
                        }

                        return markdown;
                    };

                    const markdown = createMarkdown(disableMarkdownMessageFormatting, disableNewLineMarkdownSupport);
                    const renderMarkdown = (text) => {
                        const render = disableNewLineMarkdownSupport? markdown.renderInline.bind(markdown): markdown.render.bind(markdown);
                        text = render(text);
                        return text;
                    };

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
                        activityMiddleware,
                        activityStatusMiddleware,
                        avatarMiddleware,
                        attachmentMiddleware,
                        renderMarkdown
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

const createChatTranscript = async (transcript: string, facadeChatSDK: FacadeChatSDK, renderAttachments = false, transcriptOptions: any = {}) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const transcriptMessages = JSON.parse(transcript);

    const convertBlobToBase64 = async (blob: Blob) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    };

    let messages = transcriptMessages.filter((message: { content: string; }) => {
        message.content = DOMPurify.sanitize(message.content);
        return message;
    });

    if (renderAttachments) {
        messages = await Promise.all(transcriptMessages.map(async (message: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
            const { amsReferences = message.amsreferences, amsMetadata } = message;
            if (amsReferences && amsMetadata) {
                const references = JSON.parse(amsReferences);
                const metadata = JSON.parse(amsMetadata);
                const fileMetadata = {
                    id: references[0],
                    type: metadata[0].contentType
                };

                const blob = await facadeChatSDK.downloadFileAttachment(fileMetadata);
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
    createFileAndDownload(fileName, text, "text/html");
};

export default createChatTranscript;