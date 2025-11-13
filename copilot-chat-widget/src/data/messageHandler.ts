import { AMSManager } from "../AMSManager";
import { ACSMessage, ACSMessageLocal, AttachmentUpdateMessage, ChatSDKMessage } from "../types";
import { extractClientActivityId, isAttachmentMessage, timeout } from "../utils";
import React from "react";


export const fetchMessages = async (url: string | null, token: string | null) => {
    if (!url || !token) return;
    const fetchRes = await fetch(url, {
        headers: {
            authorization: `Bearer ${token}`
        }
    });
    const payload = await fetchRes.json();
    console.log("debugging: payload: ", payload);
    return convertACSMessages(payload.value);
}


export const convertACSMessages = (payloadArr: ACSMessage[]): ACSMessage[] => {
    // const map = payloadArr.map((val: ACSMessage) => {
    //     if (val.type === "text") {
    //         return {
    //             type: val.senderDisplayName === "Customer" ? "user" : "copilot",
    //             value: val.content.message
    //         }
    //     }
    // }).filter(val => !!val);
    const map = payloadArr.filter(val => val.type === "text").reverse()
    return map;
}

const outboundMessageTracker: Map<string, 
    {
        acsMessageLocal: ACSMessageLocal,
        timeoutId?: NodeJS.Timeout | undefined
    }
    >  = new Map();
//const failedMessages: Set<string>  = new Set();



export const constructOutboundPlainTextMessage = (_input: string) => {
        const ts = Date.now();
        const payload = `${!!_input ? _input : "random message generated"} : ${ts}`;
        const clientActivityId = `mock${ts}`;
        const outBoundMessage = {
            "content":  payload,
            // "createdOn": new Date().toISOString(),
            "timestamp": new Date(),
            "metadata": {
                "deliveryMode": "bridged",
                "tags": "ChannlId-lcw,FromCustomer,client_activity_id:" + clientActivityId,
                "clientActivityId": clientActivityId
            }
        } as ChatSDKMessage;

   
    return outBoundMessage;
}

export const addLocalMessage = (message: ChatSDKMessage, reloadMessages: () => void) => {
    let inAirMsg = convertOutboundMessageToACSLocalMessage(message);
    const clientActivityId = message.metadata.clientActivityId;
    const timeoutId = setTimeout(() => {
        const target = outboundMessageTracker.get(clientActivityId)?.acsMessageLocal;
        if (target) {
            target.sendingStatus = "failed";
            reloadMessages();
        }
    }, 5 * 1000);
    outboundMessageTracker.set(clientActivityId, { acsMessageLocal: inAirMsg, timeoutId: timeoutId});
    return inAirMsg;
}

export const convertOutboundMessageToACSLocalMessage = (acsOutboundMessage: ChatSDKMessage, status: "sending"|"failed" = "sending") => {
    const acsMessageLocal: ACSMessageLocal = {
        id: "",
        content: acsOutboundMessage.content,
        messageType: "UserMessage",
        timestamp: new Date(),
        sender: {
            id: "some raw Id",
            displayName: "Customer",
            type: 1
        },
        tags: [
            "public",
            `client_activity_id:${acsOutboundMessage.metadata.clientActivityId}`
        ],
        sendingStatus: status,
        clientActivityId: acsOutboundMessage.metadata.clientActivityId
    }
    return acsMessageLocal;
}



export const mergePolledMessagesWithOutboundMap = (messages: ACSMessageLocal[]) => {
    console.log("debugging: just before iterating: ", messages);
    messages.forEach((val) => {
        if (val.tags) {
            const clientActivityId = extractClientActivityId(val.tags);
            if (typeof clientActivityId === "string" && outboundMessageTracker.get(clientActivityId)?.acsMessageLocal.sendingStatus === "sending") {
                if (outboundMessageTracker.get(clientActivityId)?.timeoutId) {
                    clearTimeout(outboundMessageTracker.get(clientActivityId)?.timeoutId)
                }
                console.log("debugging: deleted sending message: ", val);
                outboundMessageTracker.delete(clientActivityId);
            }
    
            if (typeof clientActivityId === "string" && outboundMessageTracker.get(clientActivityId)?.acsMessageLocal.sendingStatus === "failed") {
                console.log("debugging: deleted failed message: ", val);
                outboundMessageTracker.delete(clientActivityId);
            }
        }
    });

    const clientActivityIdFromRawMessagesSet = new Set(messages.filter(val=>!!val.clientActivityId).map(val => val.clientActivityId)) as Set<String>;

    console.log("debugging: mergePolledMessagesWithOutboundMap: clientActivityIdFromRawMessagesSet: ", clientActivityIdFromRawMessagesSet, " outBoundMessage: ", outboundMessageTracker);
    outboundMessageTracker.forEach((val) => {
        if (val.acsMessageLocal.clientActivityId && !clientActivityIdFromRawMessagesSet.has(val.acsMessageLocal.clientActivityId)){
            console.log("debugging: mergePolledMessagesWithOutboundMap: pushed: ", val);
            messages.push(val.acsMessageLocal);
        }
    });
    console.log("debugging: just before sort: ", messages)
    return sortACSMessagesByCreatedOn(messages);
}

export const mergeArrayUniqueBasedOnMessageId = (arr1: ACSMessageLocal[], arr2: ACSMessageLocal[]) => {
    const map = new Map<string | undefined, ACSMessageLocal>();
    //let attachmentUpdated = false;
    [...arr1, ...arr2].forEach(item => {
        // Use item.id as the unique key; if id is undefined, treat as unique
        if (item.id !== undefined) {
            console.log("debugging: updating id: ", item.id, " to item: ", item.blobUrl);
            map.set(item.id, item);
        }

    });
    //temp code
    // for (const msg of arr2) {
    //     const existingMapItem = map.get(msg.id);
    //     if (msg.blobUrl && existingMapItem && !existingMapItem.blobUrl) {
    //         attachmentUpdated = true;
    //         console.log("debugging: update existing map blob url for item: ", existingMapItem.id);
    //         existingMapItem.blobUrl = msg.blobUrl;
    //     }
    //     else {
    //         console.log("debugging: existing item: ", existingMapItem)
    //     }
    // }
    const result = Array.from(map.values());
    console.log("debugging: result of merge array: ", result);
    return {mergedMessage: result};
}


export const mergePolledMessagesWithAttachmentMapForLoadingMessages = (currentMessages: ACSMessageLocal[], attachmentMessageTracker: Map<string, string>) => {

    const res = currentMessages.map(val => {
        console.log("debugging: currentMessage: ", val, " attachment tracker: ", attachmentMessageTracker);
        if (val.id && attachmentMessageTracker && attachmentMessageTracker?.has?.(val.id)) {
            val.blobUrl = attachmentMessageTracker.get(val.id);
            console.log("debugging: updated message blob URL: ", val);
        }
        return val;
    });
    return res;
}


export const updateAttachmentBlobURL = (val: AttachmentUpdateMessage, attachmentMessageTracker: Map<string, string>) => {
    if (val.id) {
        attachmentMessageTracker.set(val.id, val.blobUrl);
    }
    else if (val.clientActivityId) {
        attachmentMessageTracker.set(val.clientActivityId, val.blobUrl);
    }
}

export const sendTextMessage = async (url: string, token: string, payload: {content: string, metadata: {
    deliveryMode: string;
    tags: string;
}}) => {
    let response = await fetch(url, {
        method: "POST",
        headers: {
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "accept": "application/json",
            "authorization": `Bearer ${token}`,
            "content-type": "application/json",
            "x-ms-client-request-id": "d8321b6d-2875-4da6-81f1-c3fee2b7fa1f"
        },
        body: JSON.stringify(payload)
    })
    let result = await response.json();
    console.log("debugging: send message result: ", result);
}

export function sortACSMessagesByCreatedOn(messages: ACSMessageLocal[]): ACSMessageLocal[] {
  return messages.slice().sort((a, b) => {
    if (!a.timestamp || !b.timestamp) return 0;
    const aTime = a.timestamp.getTime();
    const bTime = b.timestamp.getTime();
    return aTime - bTime;
  });
}

export const processInboundMessages = (acsMessages: ACSMessageLocal[], attachmentMessageTracker: Map<string, string>, setAttachmentMessageTracker: React.Dispatch<React.SetStateAction<Map<string, string>>>) => {
    console.log("debugging: triggered processInboundMessages...", acsMessages, " tracker: ", attachmentMessageTracker);
    for(let acsMessage of acsMessages) {
        if (acsMessage.id && isAttachmentMessage(acsMessage) && attachmentMessageTracker && !attachmentMessageTracker.has(acsMessage.id)) {
                void processAttachmentMessageOnload(acsMessage, setAttachmentMessageTracker);
        }
    }
}

// {
//     "id": "1758061248155",
//     "type": "text",
//     "sequenceId": "11",
//     "version": "1758061248155",
//     "content": {
//         "message": "",
//         "attachments": []
//     },
//     "senderDisplayName": "# Aurora User",
//     "createdOn": "2025-09-16T22:20:48Z",
//     "senderCommunicationIdentifier": {
//         "rawId": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6dbc-f924-45f7-3a3a0d004278",
//         "communicationUser": {
//             "id": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6dbc-f924-45f7-3a3a0d004278"
//         }
//     },
//     "metadata": {
//         "deliveryMode": "bridged",
//         "tags": "public,client_activity_id:9wd3ynnun6b",
//         "clientActivityId": "9wd3ynnun6b",
//         "amsReferences": "[\"0-wus-d10-919a11cacc15ca0a55357a5ee5a1a9b9\"]",
//         "amsMetadata": "[{\"contentType\":\"application/pdf\",\"fileName\":\"pdf.pdf\"}]",
//         "amsreferences": "[\"0-wus-d10-919a11cacc15ca0a55357a5ee5a1a9b9\"]"
//     }
// }

export const processAttachmentMessageOnload = async (acsMessage: ACSMessageLocal, setAttachmentMessageTracker: React.Dispatch<React.SetStateAction<Map<string, string>>> ) => {
    // const fileMetadata = {
    //     id: "0-wus-d10-919a11cacc15ca0a55357a5ee5a1a9b9",
    //     type: "application/pdf",
    //     name: "pdf.pdf"
    // };
    if (!acsMessage?.fileMetadata?.id) return;
    // const amsMetadata = tryParseJSON(acsMessage?.metadata?.amsMetadata);
    // const amsReferences = tryParseJSON(acsMessage?.metadata?.amsReferences);
    const fileMetadata = {
        id: acsMessage.fileMetadata?.id ?? "",
        type: acsMessage.fileMetadata?.type ?? "",
        name: acsMessage.fileMetadata?.name ?? ""
    }
    await timeout(2000);
    const blobUrl = await AMSManager.getBlobUrl(fileMetadata);
    console.log("debugging: blobURL generated: ", blobUrl);
    if (blobUrl) {
        // attachmentMessageTracker.set();
        // onCompleteCallback();
        setAttachmentMessageTracker(msgMap => {
            const newMap = new Map(msgMap);
            if (acsMessage.id) {
                newMap.set(acsMessage.id, blobUrl);
            }
            return newMap;
        })
    }
}
