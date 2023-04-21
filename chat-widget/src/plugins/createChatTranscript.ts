class TranscriptHTMLBuilder {
    private options: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    constructor(options: any) {  // eslint-disable-line @typescript-eslint/no-explicit-any
        this.options = options;
    }

    createHeadElement() {
        const htmlData = `
            <head>
                <title> Chat Transcript </title>
                <script src="https://cdn.botframework.com/botframework-webchat/4.15.7/webchat.js"><\/script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/rxjs/7.8.0/rxjs.umd.min.js" integrity="sha512-v0/YVjBcbjLN6scjmmJN+h86koeB7JhY4/2YeyA5l+rTdtKLv0VbDBNJ32rxJpsaW1QGMd1Z16lsLOSGI38Rbg==" crossorigin="anonymous" referrerpolicy="no-referrer"><\/script>
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
                    const sampleMessages = [
                        'one',
                        'two',
                        'three',
                        'four',
                        'five'
                    ];
                <\/script>
                <script>
                    const messages = ${JSON.stringify(this.options.messages)};
                <\/script>
                <script>
                    class TranscriptAdapter {
                        constructor() {
                            this.connectionStatus$ = new window.rxjs.BehaviorSubject(0); // Unitialized
                            this.activity$ = shareObservable(new Observable((observer) => {
                                this.activityObserver = observer;

                                this.connectionStatus$.next(1); // Connecting
                                this.connectionStatus$.next(2); // Online

                                // Retrieve messages
                                if (sampleMessages) {
                                    setTimeout(() => { // setTimeout is needed due to some WebChat issues
                                        sampleMessages.map((message) => {
                                            this.activityObserver.next({
                                                from: {
                                                    role: 'user'
                                                },
                                                text: message,
                                                type: 'message',
                                            });
                                        });
                                    }, 1);
                                }

                                if (messages) {
                                    setTimeout(() => { // setTimeout is needed due to some WebChat issues
                                        console.log(messages);
                                    }, 1);
                                }
                            }));
                        }
                    }
                <\/script>
            </head>
        `;

        return htmlData;
    }

    createBodyElement() {
        const htmlData = `
            <body>
                <div id="transcript"></div>
                <script>
                    const adapter = new TranscriptAdapter();
                    const styleOptions = {
                        hideSendBox: true
                    };

                    window.WebChat.renderWebChat({
                        directLine: adapter,
                        styleOptions
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

const createChatTranscript = (transcript: string) => {
    console.log("[createChatTranscript]");
    const messages = JSON.parse(transcript);
    console.log(messages);

    const options = {
        messages
    };

    const htmlBuilder = new TranscriptHTMLBuilder(options);
    const text = htmlBuilder.createHTML();
    download("transcript.html", text);
};

export default createChatTranscript;