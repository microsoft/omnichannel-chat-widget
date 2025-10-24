/* eslint-disable @typescript-eslint/no-explicit-any */
import { IBotConnection } from "botframework-directlinejs";

//survey bot
const tokenEndpoint = "https://0b0381104cbee9c8960c2b3262a38b3.b.environment.api.preprod.powerplatform.com/powervirtualagents/botsbyschema/oc_survey_nps_erlitestsurveyb9c30nps/directline/token?api-version=2022-03-01-preview";

//simple deflection bot
// const tokenEndpoint = "https://0b0381104cbee9c8960c2b3262a38b3.b.environment.api.preprod.powerplatform.com/powervirtualagents/botsbyschema/crc36_erlitestagent1/directline/token?api-version=2022-03-01-preview";
let directLineUrl = null;
const defaultLoadScriptRetries = 3;
const maxBackoffSeconds = 60;
const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));
const loadScript = async (scriptUrl: string, callbackOnload: CallableFunction = () => void (0), callbackError: CallableFunction = () => void (0), retries = defaultLoadScriptRetries, attempt = 0): Promise<void> => {
    return new Promise(async (resolve, reject) => { // eslint-disable-line no-async-promise-executor
        const scriptElements = Array.from(document.getElementsByTagName("script"));
        const foundScriptElement = scriptElements.filter(scriptElement => scriptElement.src == scriptUrl);

        if (foundScriptElement.length) {
            await callbackOnload();
            return resolve();
        }

        const scriptElement = document.createElement("script");
        scriptElement.setAttribute("src", scriptUrl);
        scriptElement.setAttribute("type", "text/javascript");
        document.head.appendChild(scriptElement);

        scriptElement.addEventListener("load", async () => {
            await callbackOnload();
            resolve();
        });

        scriptElement.addEventListener("error", async () => {
            if (++attempt >= retries) {
                await callbackError();

                // Reference: https://developer.mozilla.org/en-US/docs/Web/API/Element/error_event
                return reject(new Error("Resource failed to load, or can't be used."));
            }

            scriptElement.remove();

            const exponentialBackoffWaitTime = Math.min((2 ** attempt) + Math.random(), maxBackoffSeconds) * 1000;
            await sleep(exponentialBackoffWaitTime);

            try {
                await loadScript(scriptUrl, callbackOnload, callbackError, retries, attempt);
            } catch (e) {
                reject(e);
            }
        });
    });
};

async function createDirectLineLocal(createDirectLine: any) {
    const response = await fetch(regionalChannelSettingsURL);
    const data = await response.json();
    directLineUrl = data.channelUrlsById.directline;
    if (!directLineUrl) {
        throw new Error("Failed to get DirectLine URL");
    }
    const conversationResponse = await fetch(tokenEndpoint);
    const conversationInfo = await conversationResponse.json();
    if (!conversationInfo.token) {
        throw new Error("Failed to get conversation token");
    }
    const directLine = createDirectLine({
        domain: `${directLineUrl}v3/directline`,
        token: conversationInfo.token,
    });

    return directLine;
}

export function directlineInitAction() {
    return ({ dispatch }: {dispatch: (payload: any) => void}) =>
        (next: any) =>
            (action: any) => {
                if (action.type === "DIRECT_LINE/CONNECT_FULFILLED") {
                    console.log("debugging: custom store invoked: ", action);
                    dispatch({
                        type: "DIRECT_LINE/POST_ACTIVITY",
                        meta: { method: "keyboard" },
                        payload: {
                            activity: {
                                channelData: { postBack: true, InvitationId: "abcd1122" },
                                name: "startConversation",
                                type: "event",
                                value: {
                                    InvitationId: "ccbbdd"
                                }
                            },
                        },
                    });

                    dispatch({
                        type: "WEB_CHAT/SEND_EVENT",
                        payload: {
                            name: "pvaSetContext",
                            value: {
                                InvitationId: "abcdfsef"
                            }
                        }
                    });
                }
                return next(action);
            };
}

function createCustomStore(createStore: any) {
    return createStore(
        {},
        ({ dispatch }: { dispatch: (action: any) => void }) =>
            (next: any) =>
                (action: any) => {
                    if (action.type === "DIRECT_LINE/CONNECT_FULFILLED") {
                        dispatch({
                            type: "DIRECT_LINE/POST_ACTIVITY",
                            meta: { method: "keyboard" },
                            payload: {
                                activity: {
                                    channelData: { postBack: true },
                                    name: "startConversation",
                                    type: "event",
                                },
                            },
                        });
                    }
                    return next(action);
                }
    );
}



const environmentEndPoint = tokenEndpoint.slice(
    0,
    tokenEndpoint.indexOf("/powervirtualagents")
);
const apiVersion = tokenEndpoint
    .slice(tokenEndpoint.indexOf("api-version"))
    .split("=")[1];
const regionalChannelSettingsURL = `${environmentEndPoint}/powervirtualagents/regionalchannelsettings?api-version=${apiVersion}`;

// async function initializeChat() {
//     try {
//         const response = await fetch(regionalChannelSettingsURL);
//         const data = await response.json();
//         directLineUrl = data.channelUrlsById.directline;
//         if (!directLineUrl) {
//             throw new Error("Failed to get DirectLine URL");
//         }
//         const conversationResponse = await fetch(tokenEndpoint);
//         const conversationInfo = await conversationResponse.json();
//         if (!conversationInfo.token) {
//             throw new Error("Failed to get conversation token");
//         }
//         const directLine = window.WebChat.createDirectLine({
//             domain: `${directLineUrl}v3/directline`,
//             token: conversationInfo.token,
//         });
//         webChatInstance = window.WebChat.renderWebChat(
//             {
//                 directLine,
//                 styleOptions,
//                 store: createCustomStore(),
//             },
//             document.getElementById("webchat")
//         );
//     } catch (err) {
//         console.error("Failed to initialize chat:", err);
//     }
// }

export class DirectLineConnection {
    private static connection: DirectLineConnection;
    private static directline: any;
    private static customStore: any;
    private constructor() {
        console.log("debugging: direction instance initiated");
        
    }

    public static getInstance() {
        if (!this.connection) {
            this.connection = new DirectLineConnection();
        }

        return this.connection;
    }

    

    public async getIBotConnection() {
        const webchatUrl = "https://cdn.botframework.com/botframework-webchat/4.18.0/webchat.js";
        const onSuccess = () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            console.log("debugging: webchat control lib: ", (window as any).WebChat);


        };
        const onFail = () => {
            console.log("debugging: load script error: ");
        };
        await  loadScript(webchatUrl, onSuccess, onFail);
        const {
            WebChat: {
                Components: { BasicWebChat, Composer },
                createDirectLine,
                createStore,
                hooks: { useFocus, useSendMessage }
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } = (window as any);
        await sleep(100);
        DirectLineConnection.directline = await createDirectLineLocal(createDirectLine);
        DirectLineConnection.customStore = createCustomStore(createStore);
        return {
            customDirectline: DirectLineConnection.directline,
            customStore: DirectLineConnection.customStore
        };
    }
}
